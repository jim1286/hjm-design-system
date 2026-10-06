# Slider 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Slider](../slider.md), recipe `sliderRecipe`

## 언제 쓰나

범위 안에서 값 하나를 대략적으로, 연속 조작으로 고를 때 쓴다. 만족도 점수, 필터 강도,
음량처럼 "정확히 몇"보다 "이 근처"가 중요한 입력이다. 항상 값을 가지며 비어 있는 상태가 없다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 정확한 수를 입력하거나 "아직 정하지 않음"이 필요 | [NumberField](number-field.md) |
| 몇 개의 이름 있는 선택지 중 하나 | [SegmentedControl](segmented-control.md), [RadioGroup](radio-group.md) |
| 켜기/끄기 | [Switch](switch.md) |
| 두 손잡이로 구간 고르기 | 없음(계약이 `range`를 넣지 않았다) |
| Web에서 두 패널의 경계 크기 조절 | [Splitter](splitter.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Slider` | `@hjmds/react`, `/forms`, `/slider` | `@hjmds/react-native`, `/inputs`, `/slider` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Slider } from "@hjmds/react/slider";

<Slider
  label={t("filter.intensity")}
  min={0}
  max={100}
  step={5}
  value={intensity}
  onValueChange={setIntensity}
  onValueChangeEnd={saveIntensity}
  getValueText={(v) => t("filter.percent", { value: v })}
/>
```

```tsx
// Native
import { Slider } from "@hjmds/react-native/slider";

<Slider
  label={t("filter.intensity")}
  min={0}
  max={100}
  step={5}
  value={intensity}
  onValueChange={setIntensity}
  onValueChangeEnd={saveIntensity}
  getValueText={(v) => t("filter.percent", { value: v })}
  incrementLabel={t("filter.increase")}
  decrementLabel={t("filter.decrease")}
/>
```

## 축과 기본값

- `label`·`min`·`max`는 필수다. `step` 기본은 1이다.
- `value`(controlled) 또는 `defaultValue`(uncontrolled). 둘 다 없으면 `min`에서 시작한다.
  마운트 뒤 두 방식 사이를 바꾸면 Web은 `Error`를 던진다.
- `onValueChange`는 드래그·입력 중 매번, `onValueChangeEnd`는 놓았을 때·키를 뗐을 때·Native 접근성 action 뒤 한 번 온다.
  저장·요청은 `onValueChangeEnd`에서 한다.
- `getValueText`로 보이는 값과 접근성 값 문자열을 제품이 만든다. 없으면 숫자를 그대로 쓴다.
- `disabled` 기본 `false`.

## 꼭 지킬 것

- `label`·`getValueText`·(Native) `incrementLabel`/`decrementLabel`은 i18n 문구로 준다. 단위·형식은 제품 소유다.
- 사용자 입력만 step으로 snap된다. 제품이 준 `value`가 범위 안이면 step 밖이어도 그대로 그린다.
- 색·트랙 두께·thumb 크기는 HJM 소유다. Web `style`/`className`/`inputClassName`, Native `containerStyle`/`controlStyle`은 배치용으로만 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 접근성 | `input type="range"`, `aria-valuetext` | role `adjustable`, `accessibilityValue` |
| 키 조작 | 방향키·Home/End·PageUp/PageDown(step×10) | `increment`/`decrement` action만(페이지 이동 없음) |
| 필수 추가 문구 | 없음 | `incrementLabel`, `decrementLabel` |
| 스타일 슬롯 | `style`, `className`, `inputClassName` | `containerStyle`, `controlStyle`(`style` prop 없음) |
| 의존성 | 없음 | 없음(PanResponder 사용) |

## 함정

- Native는 세로 스크롤 안에서 트랙을 스치기만 해도 값이 바뀌지 않도록, 가로 방향이 확인될 때까지 부모 스크롤에 제스처를 양보한다.
  세로로 시작한 제스처는 값 변경도 `onValueChangeEnd`도 없다.
- Native에서 드래그 중 `disabled`가 되면 마지막 값을 한 번 commit하고 제스처를 끝낸다.
