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
- `getSliderStepTarget`이 모든 키보드/RN step intent(`increment`/`decrement`/
  `increment-page`/`decrement-page`/`first`/`last`)를 하나의 함수로 판정해, 방향키든
  Page키든 Home/End든 stepper와 같은 snap·clamp 규칙을 탄다.

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
- React Native: role `adjustable`, `accessibilityValue={{min, max, now, text}}`가 같은
  라벨→값→범위 순서를 만든다. action은 `increment`/`decrement` 둘뿐이다 — RN
  `adjustable`은 페이지 단위 이동 개념이 없어 Web의 PageUp/PageDown을 그대로 옮기지
  않는다.
- `validation`(valid/invalid) 축은 공개하지 않는다 — 그 축은 NumberField 전용이다
  ([[number-field]]). Slider의 값은 범위 안에 있으면 항상 유효하다.

**검증 화면.** 아직 실제 제품 vertical slice가 없다 — catalog는 `planned`으로 남고,
`beta` 승격은 로드맵의 gate(실제 화면 검증)를 통과한 뒤 리드가 진행한다.
