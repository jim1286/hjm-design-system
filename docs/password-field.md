# PasswordField contract

## 문제

비밀번호를 입력하면서 필요할 때만 값을 눈으로 확인한다. Ant Design `Input.Password`와
`direct` crosswalk를 따르되, 이 저장소에서는 `Input`이 `Field`/`TextArea`/`SearchField`/
`PasswordField`/`OtpField`로 이미 분해돼 있다(`decomposed`).

## Field 프레임을 재사용한다

`Field`는 이미 stable이고, `NumberField`가 방금 같은 판단을 내렸다(`src/number-field.ts`) —
새 필드 프레임을 만들지 않고 `fieldFrameContract`/`formSupportContract`(둘 다
`src/component-contracts.ts`)를 그대로 가져다 쓴다. PasswordField는 `value`/
`onValueChange`도 새로 정의하지 않는다 — 비밀번호의 값은 그냥 문자열이고, Field의 값과
다른 어떤 것도 아니다(NumberField가 파싱된 숫자를 다뤄야 해서 자기 값 타입을 가진 것과
다른 지점). 그래서 이 모듈이 계약하는 새 문제는 정확히 하나, **가림 토글**뿐이다.

## 토글의 접근 가능한 이름: 상태가 아니라 행동

**판정.** 토글의 이름은 "지금 비밀번호가 보이는가/숨겨져 있는가"(현재 상태)가 아니라
**누르면 무슨 일이 일어나는가**(다음 행동)를 말한다 — 접힘일 때 "비밀번호 보이기",
펼침일 때 "비밀번호 숨기기".

**근거.**

1. 이 컨트롤은 `aria-pressed`가 있는 진짜 토글 버튼이 아니라 평범한 버튼이다(눌렀다 뗀
   자국이 남는 게 아니라 그때그때 동작만 일어난다). `aria-pressed` 없이 상태만 말하는
   이름("비밀번호 숨겨짐")을 쓰면 사용자가 "그래서 눌러서 뭐가 되는가"를 추론해야 한다.
2. 실제 참조 구현들(브라우저 내장 비밀번호 보기, 비밀번호 관리자, 접근성 가이드가 이
   패턴을 설명할 때)이 일관되게 행동형 문구("Show password"/"Hide password")를 쓴다 —
   상태형 문구를 쓰는 참조 구현을 찾지 못했다.
3. 이 저장소에 이미 있는 비슷한 자리도 행동/다음 상태 쪽이다 — `LoadMore`의 트리거
   라벨은 "지금 안 불러와짐"이 아니라 "더 보기"(누르면 할 일)를 말하고,
   `play`/`pause`처럼 서로 다른 아이콘 이름이 지금 상태가 아니라 누르면 일어날 동작을
   가리킨다(`semanticIconNames`).

**타입으로 강제한 지점.** `PasswordToggleAccessibleNameInfo`는 `revealed`가 아니라
`willReveal`(= `!revealed`)을 담아 제품에 넘긴다. 필드 이름을 "현재 상태"로 지어
어차피 뒤집어야 하는 계산을 제품 composer 안에 숨기지 않고, 호출부(`resolvePasswordFieldDescriptor`)에서
미리 뒤집어 건넨다 — Steps/Timeline/Carousel/Tree가 이미 하는 "제품이 어순·조사를
조립하되 계산은 HJM이 미리 한다"는 원칙과 같다. 아이콘도 같은 논리로
`concealed → visibility`(누르면 보임), `revealed → visibilityOff`(누르면 숨김)로 매칭했다
— 이름과 아이콘이 서로 다른 근거로 다른 결론에 도달하지 않는다.

## 값은 절대 바뀌지 않는다

`resolvePasswordFieldDescriptor`는 값을 파라미터로도 받지 않는다 — 받을 수 없으니
바꿀 수도 없다. `passwordFieldBehavior.controlled`는 `value`/`onValueChange`와 `revealed`/
`onRevealedChange`를 **서로 다른 두 triplet**으로 나열한다(같은 자리 하나로 합치지
않는다) — Carousel의 `currentKey`(정체성)와 `position`(발화)을 분리한 것과 같은 이유로,
"토글이 표시 방식만 바꾼다"는 것을 상태 축 자체로 증명한다.

## 자동완성 힌트: 계약은 만들지만 값은 제품이 정한다

`autofillHint: "current" | "new"`는 필수 필드다. HJM이 로그인 화면인지 가입/비밀번호
변경 화면인지 판단할 방법이 없고, 잘못 추측하면(로그인 화면에 "새 비밀번호" 힌트를
주는 식) 브라우저/OS의 자동완성 제안을 실제로 망가뜨린다 — 그래서 제품이 명시적으로
결정해서 넘긴다. 반면 각 플랫폼의 **정확한 속성 이름**(Web `autocomplete` 토큰, iOS
`textContentType`, Android autofill 힌트)은 여기서 문자열로 고정하지 않는다 — 이 값들은
RN 버전에 따라 이름이 바뀐 적이 있고, 이 패키지는 런타임 의존성이 없어 그 사실을
검증할 방법이 없다(`docs/architecture.md`의 "런타임 의존성 금지" 원칙). 렌더러가 자기
플랫폼의 현재 API로 `current`/`new` 두 값 중 하나를 골라 번역한다 — Icon의 semantic
name → 실제 글리프 번역과 같은 경계다.

## 강도 표시(strength meter)는 넣지 않는다

비밀번호 강도 판정은 보안 정책이고, 정책은 제품(또는 서버)마다 다르며 일반화된 "이
정도면 강하다" 계산을 이 패키지가 갖고 있을 이유가 없다. 강도를 보여주고 싶은 제품은
Field가 이미 가진 `description`/`hint` 슬롯에 자기 문구를 채우면 된다 — 새 상태 축이
필요 없다.

## HJM 기본값

- `frame`/`support`는 `fieldFrameContract`/`formSupportContract` 그대로.
- toggle 자리는 SearchField의 clear 버튼과 같은 자리·같은 hit target
  (`control.minTouchTarget`)을 쓴다 — 필드 안에 있는 보조 버튼이라는 점에서 같은 문제다.

## 플랫폼 번역

- Web: `<input type={webInputType}>`(`text`/`password`) — `resolvePasswordFieldDescriptor`가
  `revealed`로부터 유도한다. 토글은 SearchField의 clear 버튼처럼 필드 뒤에 오는 별도
  tab stop이다(architecture.md의 "선택 행 안에 또 다른 button을 넣지 않는다"는 규칙은
  선택 목록 행에 대한 것이고, Field의 trailing action에는 이미 SearchField가 선례로
  적용된다).
- Native: `secureTextEntry={nativeSecureTextEntry}`(= `!revealed`).

## 공개한 축 / 배제한 축

| 축 | 상태 |
| --- | --- |
| `revealed`(controlled) | 공개 |
| `autofillHint`(필수 입력) | 공개 — 값은 제품, 플랫폼 번역표는 문서로만(코드로 단정하지 않음) |
| `value`/`onValueChange` | Field 재사용, 새로 정의 안 함 |
| 강도 표시 | **배제** — 보안 정책은 제품 몫 |

## 검증 화면

아직 없음. `planned → beta` 승격은 실제 제품 vertical slice 이후 리드가 진행한다.
