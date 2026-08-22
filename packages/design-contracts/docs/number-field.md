# NumberField contract

**문제.** 사용자가 정확한 수 하나를 정한다 — 타율 계산기의 타수, 예약 인원, 코멘트
글자 수 제한처럼 "이 숫자 그대로"가 중요한 입력이다. 대략적인 감으로 고르는 Slider와는
반대 극단의 문제다.

**일반화한 계약.** min/max/step/value의 판정은 Slider와 `src/number-field.ts`의
`validateNumericRangeConfig`/`clampToRange`/`snapToStep`을 공유한다. 두 컴포넌트가 각자
다른 반올림·경계 규칙을 갖게 되면 같은 "범위 있는 수"라는 개념이 두 이름으로 갈라지기
때문이다. NumberField 쪽 전용 판단은 값이 `number | null`이라는 점뿐이다 — `null`은
아직 아무 값도 입력하지 않은 상태이며 `min`을 포함한 어떤 실수 값과도 다르다.

- `value: number | null`, `min`, `max`, `step?`(기본 1).
- validator는 min≥max, step≤0, step이 min–max 폭보다 큰 조합, 범위 밖 value를 던진다.
  경계값(`value === min` 또는 `max`)과 `value === null`은 허용해야 하는 입력이라 먼저
  통과 시험한다.
- stepper 방향 disabled는 `resolveNumberFieldStepperState`가 계산한다: 현재 값이 `min`이면
  decrement, `max`이면 increment가 disabled. `value === null`일 때는 아직 경계에
  닿지 않았으므로 두 방향 모두 disabled가 아니다.
- `stepNumberFieldValue`는 empty에서 누르면 increment는 `min`, decrement는 `max`로
  이동한다 — 어느 방향으로 처음 눌러도 그 방향이 향하는 경계에 착지한다.
- step grid의 소수 정밀도는 `step`만이 아니라 기준점 `min`까지 함께 사용한다. 예를 들어
  `min=0.05, step=0.1`의 유효한 순서는 `0.05, 0.15, 0.25…`이며 `0.15`를 `0.2`로
  반올림하지 않는다.
- 표시 문자열(단위, 소수 자릿수, 통화 기호 등)은 만들지 않는다. 제품이 포맷한 문자열을
  받는 Statistic과 같은 원칙이다.
- Web/RN renderer의 편집 중 문자열은 `parseNumberFieldInput`으로 같은 판정을 받는다.
  빈 문자열은 `null`, `-`/`1e` 같은 미완성 draft는 `undefined`이고, blur/submit에서만
  `commitNumberFieldInput`이 clamp와 step snap을 적용한다. 따라서 controlled 숫자 모델에
  미완성 문자열을 밀어 넣지 않으면서도 사용자의 단일 행 편집을 중간에 방해하지 않는다.
- 증감 action은 `stepNumberFieldInput`으로 draft를 직접 판정한다. off-grid draft에서 먼저
  nearest snap을 한 뒤 다시 한 step을 더하지 않고, 요청 방향의 바로 다음 유효 경계로
  이동한다(`4.26`, step `0.5`의 increment는 `4.5`, decrement는 `4.0`).
- `resolveNumberFieldInputStepperState`도 같은 draft를 사용한다. committed 값이 max여도 사용자가
  더 작은 draft를 편집 중이면 increment 버튼을 활성화하여 visible value, keyboard, 버튼과
  Native accessibility action의 capability가 서로 모순되지 않게 한다.

**HJM 기본값.** Field의 `fieldFrameContract`/`formSupportContract`를 그대로 재사용한다
(`numberFieldRecipe.frame`, `.support`). 새 프레임을 만들면 Field와 높이·radius·invalid
border가 갈린다. stepper 버튼은 44-unit target(`control.minTouchTarget`)을 유지하고
disabled는 opacity만으로 표현하지 않는다 — 버튼 자체가 눌리지 않는 상태(no press
feedback)와 짝지어 판단할 수 있는 대상이라 색만으로 말하지 않는다.

held-repeat(꾹 눌러 연속 증가)는 이번 계약에 넣지 않는다. 실제 제품에서 측정된 수요가
없고, 지금 넣으면 반복 속도·가속 곡선을 검증 없이 추측해야 한다. 한 번 누름 = 한 번
step만 공개한다.

**플랫폼 번역.**

- Web: role `spinbutton`, keyboard `Tab`(진입/이탈), `ArrowUp`/`ArrowDown`(step). 타이핑
  자체는 native text input 동작이라 별도 키를 등록하지 않는다.
  locale-neutral draft와 브라우저 단일 행 편집을 지키기 위해 `type="text"`를 사용하므로
  무효인 HTML `min`/`max`/`step` attribute에는 기대지 않는다. 범위는 `aria-valuemin`/
  `aria-valuemax`와 공통 resolver가 집행한다. stepper는 `tabIndex=-1`인 보조 action이다.
  입력 하나만 Tab 순서에 두고 Arrow 키로 같은 기능을 제공하되, pointer와 voice control은
  제품이 주입한 이름의 증감 버튼을 직접 활성화할 수 있다.
- React Native: `text` role(입력)과 `button` role(stepper) 조합, `disabled` state,
  `focus`/`setText`/`increment`/`decrement` action. RN에는 `spinbutton` 동등물이 없어
  두 역할의 조합으로 번역한다.
- `validation`(valid/invalid) 축은 NumberField에만 공개한다 — 범위 자체의 유효성과는
  독립적인, 제품이 매기는 별도 판정(예: "홀수만 허용")이기 때문이다. Slider는 이 축을
  갖지 않는다.

**검증 화면.** 아직 실제 제품 vertical slice가 없다 — catalog는 `planned`으로 남고,
`beta` 승격은 로드맵의 gate(실제 화면 검증)를 통과한 뒤 리드가 진행한다.

**명시적 범위 밖.** 기본 parser는 ASCII 부호·10진수·exponent만 받는 locale-neutral
grammar다. 통화 기호, 단위 suffix, grouping separator, 아라비아/한 숫자 체계, locale별
decimal separator의 자동 parse/format은 지원한다고 주장하지 않는다. 그런 요구는 향후
양방향 parse/format adapter 계약과 IME·locale fixture를 함께 추가한 뒤 확장한다.
Composition 중 문자열은 draft에만 남지만, 비-ASCII 숫자 IME의 parsing·caret 보존을
검증했다는 claim도 하지 않는다.

**참고한 공개 기준.** WAI-ARIA APG의
[Spinbutton pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/)에서 입력을
단일 Tab stop으로 두고 ArrowUp/ArrowDown을 기본 조정 키로 삼았다. Adobe React Aria의
[useNumberField](https://react-spectrum.adobe.com/react-aria/useNumberField.html)에서
부분 문자열을 numeric model과 분리하고 blur에서 commit하는 판단을 참고했지만, 그
라이브러리의 locale/currency parse나 held-repeat까지 구현했다고 주장하지 않는다.
Native의 증감 action은 React Native 공식
[Accessibility actions](https://reactnative.dev/docs/accessibility#accessibility-actions)
API로 번역한다.
