# Form contract

검토일: 2026-10-05

## 문제

antd `Form`은 레이아웃과 상태 관리 라이브러리를 겸합니다(`useForm`, `dependencies`,
`validateTrigger`, `Form.List`...). HJM에는 런타임이 없으므로 그 표면을 옮길 수 없고,
옮기려는 시도 자체가 잘못입니다. 실제로 반복되는 사용자 문제는 두 가지뿐입니다.

1. 여러 `Field`를 한 화면에 쌓을 때 라벨·필드·도움말·오류 사이의 리듬이 화면마다
   제각각이 된다.
2. 제출은 항상 같은 모양의 실패를 만든다 — 두 번 눌러 두 번 전송되거나, 실패 메시지가
   어느 필드 것인지 폼 전체 것인지 헷갈리거나, 실패 후 포커스가 아무 데도 가지 않는다.

## 일반화한 계약

Form은 **필드들 사이의 리듬**과 **제출 세션**만 소유합니다. 그 외에는 모두 제품(React
Hook Form 등)이 소유합니다.

### Field와의 경계

`Field`는 이미 한 필드의 프레임(background/border/상태별 border, label-to-control
gap, control-to-support-text gap)을 `fieldRecipe`로 소유합니다. `Form`은 그 프레임을
다시 정의하지 않고, 프레임이 끝난 뒤 **다음 필드까지의 세로 간격**만 `formRecipe`로
정의합니다. 한 필드 내부의 리듬을 바꾸고 싶다면 그것은 Field의 변경이지 Form의
prop이 아닙니다.

Native 한 줄 입력의 최소 높이는 실제 입력의 글자 배율과 line height, recipe padding,
border를 함께 포함한다. 2026-10-05 번뚝 폴더 이름 입력에서 OS 최대 글자는 커졌지만
고정 프레임은 그대로여서 글자가 넘쳤다(BT-QA-020). `TextField`와 `SearchField`가 공유하는
renderer에서 프레임을 키우며, 제품에서 글자를 제한하거나 Form에 별도 높이를 주지 않는다.
OS 배율·명시적 Provider 배율·입력의 `allowFontScaling`/`maxFontSizeMultiplier`를 같은
방식으로 반영하고, 일반 배율로 돌아오면 높이도 돌아온다. 옆의 제품 버튼이 입력 폭을
좁히면 제품이 행을 세로로 재배치한다. Web은 CSS 폰트·레이아웃 경계를 사용하므로
Native의 OS 배율 계산을 추가하지 않는다. 공개 API는 바뀌지 않는다.

iOS multiline 입력은 글자 배율을 바꿔도 기존 attributed 본문이 이전 크기에 남는 host 제약을 갖는다.
2026-10-05 번뚝 TextArea에서 일반↔최대 전환 후 재진입해야만 본문 크기가 바뀌었다(BT-QA-025).
Native renderer는 실제 배율이 바뀔 때 iOS multiline native editor만 교체하고 상위 draft state와
forwarded ref, 현재 focus/selection을 보존한다. 스타일 변경만으로는 기존 attributed 본문을
갱신하지 못하며, field 전체 교체는 제품 초안을 버리므로 사용하지 않는다. Android·일반 한 줄
입력은 이 교체 경로를 사용하지 않는다. Web은 브라우저 폰트 layout을 유지하며 공개 API는 같다.

### 제출 세션

`AlertDialog`가 이미 `idle → busy → error/closing → closed` 세션을 갖고 있습니다.
Form은 같은 문제(중복 실행 차단, 실패 후 재시도, 정확히 한 번의 정산)를 같은 모양으로
풀되, 한 가지 실제 차이를 반영합니다 — AlertDialog의 side effect는 한 번 확인하고
닫히는 것이 목적이지만, Form은 대개 화면에 계속 남아 여러 번 다시 제출됩니다(수정 →
재시도, 또는 설정 화면을 나중에 다시 저장). 그래서 `succeeded`/`failed`는
AlertDialog의 `closed`처럼 종결 상태가 아니라 **쉬는 상태**입니다 — 둘 다에서 다시
`submit()`을 부를 수 있습니다.

```text
idle ──submit──→ submitting ──resolve──→ succeeded ──submit──→ submitting …
                      │                                              ↑
                      └──reject──→ failed ───────submit(retry)───────┘
submitting 중에는 submit()이 즉시 blocked를 반환하고 onSubmit을 다시 부르지 않는다.
dispose()가 submitting 중 호출되면 그 attempt는 interrupted로 한 번만 정산된다.
```

- `submit(values)`는 매 호출마다 자신의 반환 Promise를 **정확히 한 번** 정산합니다.
  같은 attempt가 실제 handler 성공/실패로 정산되거나, `dispose()`로 `interrupted`로
  정산되거나 — 둘 중 하나만 일어납니다.
- `submitting` 중의 모든 `submit()` 호출은 handler를 다시 부르지 않고
  `{ outcome: "blocked", reason: "already-submitting" }`을 돌려줍니다.
- `reset()`은 `succeeded`/`failed`처럼 쉬는 상태에서만 `idle`로 되돌리며,
  `submitting` 중에는 아무것도 바꾸지 않고 `false`를 돌려줍니다(경합 방지).
- Form은 값을 들고 있지 않습니다. `submit(values)`가 호출될 때마다 그 순간의 값을
  전달받을 뿐이며, 언제 제출을 시작해도 되는지(dirty/valid 여부)는 제품이 판단합니다.

### 오류 소유권

- **필드 오류**는 각 Field의 `validation`(`valid`/`invalid`) 축이 소유합니다. Form은
  그 오류 문자열을 복제해서 다시 들지 않습니다.
- **form-level 오류**(서버 거부, 네트워크)만 Form의 `failed` phase가 `message: string`
  하나로 소유합니다. `FormSubmitOutcome`의 `failed` variant에는 필드별 매핑이 타입
  수준에서 아예 존재하지 않습니다 — 같은 사실을 두 곳이 말하게 되는 경로를 원천적으로
  막습니다.
- form-level 오류는 기존 Notice `tone="danger"` 계약으로 렌더링합니다. `formRecipe`는
  그 배치 위치(`fields` 다음, `actions` 이전)만 고정하고 색을 다시 선언하지 않습니다.

### 접근성 — 실패 후 포커스

제출 실패는 두 경로 중 하나입니다.

1. **클라이언트 검증 실패** — 제품의 검증 라이브러리가 애초에 `onSubmit`을 부르지
   않고 필드별 오류만 남깁니다. Form은 검증을 실행하지 않으므로 어느 필드가 첫
   오류인지 스스로 알 수 없습니다. 대신 제품이 자신의 필드 렌더 순서와 현재 무효
   필드 id 집합을 넘기면, `resolveFirstInvalidFieldFocusTarget`이 **렌더 순서상
   가장 먼저인 무효 필드**를 하나로 정합니다. 이 답을 정하는 규칙만 공용이고, 포커스
   이동 자체(Web `.focus()`, RN accessibility focus)는 renderer가 실행합니다.
2. **제출 실패**(서버 거부, 네트워크) — 특정 필드가 없으므로 포커스는 form-level
   오류 슬롯으로 가고, `formBehaviorDefaults.errorAnnouncementPriority`가
   `"high"`(Toast가 이미 쓰는 `normal | high` 어휘 재사용)로 assertive 발표를
   요구합니다.

이 두 경로는 항상 상호 배타적입니다 — 클라이언트 검증이 막았다면 `onSubmit`은 아예
불리지 않으므로 Form의 `failed` phase도 생기지 않습니다.

## HJM 기본값

- `formDefaults.density = "comfortable"` — `fieldGap`은 comfortable(`spacing.lg`)이
  compact(`spacing.sm`)보다 넓습니다.
- anatomy는 `["root", "field", "formError", "actions"]` 순서로 고정이며 prop으로 바꿀
  수 없습니다 — 로드맵의 "모든 조합을 열어두지 않는다" 원칙을 그대로 따릅니다.
- `errorAnnouncementPriority = "high"`.

## 플랫폼 번역

- Web: 실패 시 첫 무효 필드에 `.focus()`, form-level 오류는 `role="alert"` 또는
  동등한 `aria-live="assertive"` 영역으로 발표. `submitting` 중에는 제출 버튼과 모든
  필드가 `aria-disabled`/`disabled`로 재입력을 막습니다(값은 그대로 보존).
- React Native: 실패 시 첫 무효 필드로 accessibility focus 이동, form-level 오류는
  live-region 동등물(`AccessibilityInfo.announceForAccessibility` 또는 동등 API)로
  발표. `submitting` 중에는 제출 버튼이 `accessibilityState.busy`를 얻습니다.

Native 소비자는 제품 검증 결과로 `resolveFirstInvalidFieldFocusTarget`을 호출해
선택한 입력의 ref를 `Form.firstInvalidFieldRef`에 전달합니다. ref가 있으면 제출 버튼은
`TextInput.focus()`와 `AccessibilityInfo.setAccessibilityFocus()`를 실행하고 `onSubmit`을
호출하지 않습니다. ref가 없으면 기존 제출 경로를 따릅니다. Form은 필드 순서·오류 상태를
등록하거나 추론하지 않습니다.

## 검증 화면

Form은 surface별 상태를 갖습니다. Web은 실제 Chromium 입력·Enter 제출, 비동기 중복 제출 방지,
필드·form 오류 semantics와 긴 자식 콘텐츠·환경 matrix 검증을 통과해 stable입니다. Native는
현재 값 입력·제출·busy 상태와, 제품이 선택한 첫 무효 필드로 Native 키보드 및 accessibility
focus를 전달하는 host-action 회귀까지 검증합니다. 테스트는 React Native host 동작을 확인하며,
실기기 VoiceOver/TalkBack 경험은 별도 검증 근거로 기록해야 합니다.

BurnTok Web의 `apps/web/src/app/ideas/page.tsx`는 2필드 생성 흐름에서 제품 소유 검증과 첫 오류
필드 focus를 연결한 소비 사례입니다.

- `apps/web/src/lib/form-contract.ts`: `formRecipe` 간격, `createFormSubmitSession`,
  `resolveFirstInvalidFieldFocusTarget`을 제품 validation과 React lifecycle에 연결합니다.
- `apps/web/src/app/ideas/page.tsx`: 첫 invalid control에 실제 `.focus()`를 실행하고,
  field error와 `role="alert"` form-level error를 분리하며 submitting 중 중복 제출을
  canonical session으로 차단합니다.
- `apps/web/src/components/ui/AppTextField.tsx`: input/textarea ref를 실제 control까지
  전달해 focus 계약이 설명에 그치지 않게 합니다.

제품 채택 수는 stable blocker가 아닙니다. 실기기 VoiceOver/TalkBack 확인은 제품 QA 범위이며,
HJM renderer의 Native action 회귀와 사용 가능한 자동 검증을 기준으로 surface 성숙도를 평가합니다.

## 공개하지 않기로 한 것

- **값 상태 관리** — 어떤 필드가 무엇을 담고 있는지, dirty/touched 여부는 전부 제품
  또는 React Hook Form이 소유합니다. Form은 `submit(values)`의 인자로만 값을
  받습니다.
- **필드 등록·의존성·조건부 필드** — antd의 `Form.Item name`/`dependencies`에 해당하는
  개념이 없습니다. 어떤 필드가 렌더되는지는 제품의 React 트리가 결정합니다.
- **validateTrigger 정책** — 언제 검증을 실행할지(`onChange`/`onBlur`/`onSubmit`)는
  전적으로 제품의 검증 라이브러리 설정입니다.
- **`Form.List`(반복 필드 그룹)** — 배열 형태의 반복 입력은 별도 문제이며, 현재 어떤
  실제 화면도 요구하지 않아 임의로 데이터 모델을 만들지 않습니다.
- **라벨 위치 변형(수평/inline 레이아웃)** — `Field`가 라벨-위·컨트롤-아래 하나의
  문법만 지원하므로 Form도 antd의 `layout="horizontal"`에 해당하는 변형을 추가하지
  않습니다. 필요해지면 그것은 먼저 `Field`의 새 변형이어야 합니다.
- **actions(제출/취소 버튼) 레이아웃** — 버튼 간격·정렬은 기존 Button/Stack의 몫입니다.
  Stack이 아직 실제 사용 사례 전까지 `planned` 이상으로 승격하지 않은 것과 같은
  이유로, Form도 actions 슬롯의 위치만 고정하고 그 안의 레이아웃 토큰은 만들지
  않습니다.

### TextArea의 입력창 안 행동

2026-10-05 사진/메시지 작성에서 별도 TextArea 구현이 생기지 않도록 Web/Native `TextArea.trailing`
슬롯을 추가했다. 자동 높이·IME·값 변경 계약은 그대로이며, 입력 필드와 아이콘 버튼의 접근성 이름은
각각 제공한다. 메시지에서는 `MessageComposer.sendIcon`이 이 슬롯을 합성한다.
