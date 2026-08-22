# Slider contract

**문제.** 사용자가 범위 안에서 값 하나를 대략적으로, 연속 조작으로 고른다 — 만족도
점수, 필터 강도처럼 "정확히 몇" 보다 "이 근처"가 중요한 입력이다. 정확한 수를 타이핑하는
NumberField와는 반대 극단의 문제이며, 둘 다 같은 min/max/step 판정을 공유한다
([[number-field]] 참고, `validateNumericRangeConfig`/`clampToRange`/`snapToStep`은
`src/number-field.ts`에 있고 이 모듈이 그대로 import한다).

**일반화한 계약.**

- `label`(필수, 접근성 이름), `value`, `min`, `max`, `step?`(기본 1),
  `valueText?`(제품이 포맷한 현재 값 문자열, 예 "75점", ".357").
- Slider는 항상 값을 갖는다 — `empty` 상태가 없다. NumberField와 달리 "아직 정하지
  않음"을 표현할 필요가 실사용처에 없었고, 대략적인 선택이라는 상호작용 자체가 항상
  현재 위치를 전제하기 때문이다.
- `range`(두 손잡이로 구간을 고르는 모드)는 이번 계약에 넣지 않는다. 실제로 이 범위
  선택이 필요한 화면이 아직 없고, 값 하나짜리 controlled 축과 값 두 개짜리 controlled
  축을 동시에 설계하면 검증되지 않은 API를 먼저 얹는 셈이 된다.
- `resolveSliderFillFraction`은 트랙 채움 비율(0..1)만 계산한다 — 표시 문자열은 만들지
  않는다. `valueText`도 컴포넌트가 생성하지 않고 그대로 전달만 한다.
- 제품이 공급한 controlled/default 값은 범위 안이라면 step grid 밖이어도 그대로 표시한다.
  사용자 입력만 `resolveSliderValue`에서 min-origin step으로 snap하며, span이 step으로
  나누어떨어지지 않아도 정확한 `min`/`max` 끝점은 항상 보존한다.
- `getSliderStepTarget`이 모든 키보드/RN step intent(`increment`/`decrement`/
  `increment-page`/`decrement-page`/`first`/`last`)를 하나의 함수로 판정해, 방향키든
  Page키든 Home/End든 stepper와 같은 snap·clamp 규칙을 탄다.
- drag/input 중에는 `onValueChange`, pointer release·keyboard keyup·Native adjustable
  action 완료에는 `onValueChangeEnd`를 보낸다. React Aria와 Chakra의 change/change-end
  분리를 따르며, commit callback을 매 move마다 중복 호출하지 않는다.
- `resolveSliderValueFromOffset`은 실제 track offset을 값으로 바꾼 뒤 Web input과 같은
  `resolveSliderValue`를 사용한다. RTL은 물리 track만 반전하며 increment/decrement의 논리
  의미는 바꾸지 않는다.

**HJM 기본값.** 트랙 4px, thumb 지름 20px이지만 hit target은 44-unit
(`control.minTouchTarget`)을 유지한다 — 보이는 손잡이가 작아도 누르는 영역은 작지
않다. 채움 색(`trackFilled`)과 미채움 색은 각각 `content.brand`/`surface.sunken`이고,
값은 색만으로 말하지 않는다 — 접근성 발화가 항상 `valueText`(또는 raw value)를
동반한다. `dragged`는 `interaction` 축의 값으로 다루며 `pressed`와 시각적으로 구분한다.

**플랫폼 번역.**

- Web: role `slider`, keyboard `ArrowLeft/Right`(방향 무관 1 step), `ArrowUp/Down`(보조),
  `Home`/`End`(min/max로 이동), `PageUp`/`PageDown`(step × 10, `sliderBehaviorDefaults.
  pageMultiplier`). 스크린 리더 발화 순서는 라벨 → 현재 값(`valueText` 있으면 그 문자열,
  없으면 raw 숫자) → 범위(min/max)이며 이는 `aria-label`/`aria-valuetext`/
  `aria-valuemin`/`aria-valuemax`가 native하게 만드는 순서를 그대로 쓴다 — 컴포넌트가
  별도 문구를 조립하지 않는다.
  숨은 native range의 HTML `step`은 `any`로 둬 브라우저가 off-grid controlled 값이나
  non-divisible `max`를 렌더 전에 바꾸지 못하게 한다. 실제 public `step` 판정은 input,
  Arrow/Page/Home/End 모두 shared resolver가 수행한다.
- React Native: role `adjustable`, `accessibilityValue={{min, max, now, text}}`가 같은
  라벨→값→범위 순서를 만든다. action은 `increment`/`decrement` 둘뿐이다 — RN
  `adjustable`은 페이지 단위 이동 개념이 없어 Web의 PageUp/PageDown을 그대로 옮기지
  않는다. drag 중 `disabled=true`로 전환되면 그 시점의 마지막 값을 한 번 commit하고
  active gesture를 종료하며, 이후 stale move/release는 무시한다.
- Web/RN 모두 controlled `value` 또는 uncontrolled `defaultValue`를 받으며 둘 다 없으면
  `min`에서 시작한다. mounted component가 두 mode 사이를 전환하는 것은 허용하지 않는다.
- `validation`(valid/invalid) 축은 공개하지 않는다 — 그 축은 NumberField 전용이다
  ([[number-field]]). Slider의 값은 범위 안에 있으면 항상 유효하다.

**검증 화면.** 아직 실제 제품 vertical slice가 없다 — catalog는 `planned`으로 남고,
`beta` 승격은 로드맵의 gate(실제 화면 검증)를 통과한 뒤 리드가 진행한다.

**초기 renderer 범위 밖.** range/multi-thumb, vertical orientation, marks/ticks, tooltip,
non-linear scale, drag acceleration은 실제 제품 요구 전까지 추가하지 않는다. Web은
`step="any"` native `input[type="range"]`를 44px interaction layer로 사용하고 public step은
shared resolver로 적용한다. Native는 core responder system만 사용해 외부 slider/native
module dependency를 만들지 않는다.

**참고 구현과 기준.** WAI-ARIA APG
[Slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)의 role/value/key contract,
Adobe React Aria [Slider](https://react-spectrum.adobe.com/Slider)의 continuous change와
change-end 분리 및 min-origin step, Chakra UI
[Slider](https://chakra-ui.com/docs/components/slider)의 hidden native input·controlled/
uncontrolled·`onValueChangeEnd`, MUI
[Slider](https://mui.com/material-ui/react-slider/)의 명시적 accessible label/value text를
참고했다. Native action은 React Native 공식
[Accessibility actions](https://reactnative.dev/docs/accessibility#accessibility-actions)의
`adjustable` + `increment`/`decrement` 조합으로 번역한다.
