# Slider

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Slider](../../slider.md), `src/slider.ts`(`sliderRecipe`)
- 스토리북: `배포/컴포넌트/입력/슬라이더`, `배포/컴포넌트/입력/별점`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Slider` | 기본 | `@hjmds/react`, `/forms`, `/slider` | `@hjmds/react-native`, `/inputs`, `/slider` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` · `min` · `max` | 문구 · 숫자 | — | 필수 |
| `step` | 숫자 | `1` | 사용자 입력의 snap 단위 |
| `value` · `defaultValue` | 숫자 | `min` | controlled 또는 uncontrolled. 마운트 뒤 두 방식 사이를 바꾸면 Web은 `Error`를 던진다 |
| `onValueChange` | `(value: number) => void` | — | 드래그·입력 중 매번 |
| `onValueChangeEnd` | `(value: number) => void` | — | 놓았을 때·키를 뗐을 때·Native 접근성 action 뒤 한 번. 저장·요청은 여기서 한다 |
| `getValueText` | `(value: number) => string` | 숫자 그대로 | 보이는 값과 접근성 값 문자열 |
| `incrementLabel` · `decrementLabel`(Native) | 문자열 | 필수 | 접근성 action 이름 |
| `disabled` | `boolean` | `false` | — |
| `layoutStyle` | 배치 전용 style 객체 | — | 루트 배치 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 가로 폭을 채운다. 트랙 줄은 터치 높이 `control.minTouchTarget` 44 안에 두께 4 트랙과 지름 20 thumb을 세로 중앙에 그린다 | `sliderRecipe.sizes.medium`, `.hjm-slider__control` |
| 간격 | 머리 줄과 트랙 줄 사이 `sliderRecipe.header.trackGap`(`spacing.xs`) 8, 라벨–값 사이 `header.gap`(`spacing.md`) 16(두 플랫폼). 여러 Slider를 쌓을 때는 Field와 같은 세로 간격(예: [Stack](stack.md) `spacing.md` 16) | `sliderRecipe.header`, `.hjm-slider`, `.hjm-slider__header`, Native `Slider` |
| 순서·정렬 | 위 [라벨 ……… 값] 머리 줄(라벨 시작 쪽, 값 끝 쪽, `label` 크기·tabular 숫자), 아래 트랙. Web은 트랙 양 끝을 thumb 반지름 10만큼 들여 thumb이 컨테이너 밖으로 나가지 않는다 | `.hjm-slider__header`, `.hjm-slider__interactive` |
| 고정·스크롤 | 폼·설정·필터 패널 안, 세로 스크롤 안에 두어도 된다. Native는 가로 제스처가 확인될 때만 값이 바뀐다 | Native `Slider`(PanResponder) |
| 좁은 폭·큰 글자 | Web은 긴 라벨이 줄을 바꾸고 값은 줄지 않는다(`flex: 0 0 auto`). 트랙 터치 높이는 44 그대로 | `.hjm-slider__label`, `.hjm-slider__value` |

```text
┌──────────────────────────────────────┐
│ t("filter.intensity")         60%    │ ← 머리 줄
│                                      │ ↕ spacing.xs 8
│ ━━━━━━━━━━━━━━━━━━●──────────────── │ ← 터치 높이 44, 트랙 4, thumb 20
└──────────────────────────────────────┘
```

## 꼭 지킬 것

- `label`·`getValueText`·(Native) `incrementLabel`/`decrementLabel`은 i18n 문구로 준다. 단위·형식은 제품 소유다.
- 사용자 입력만 step으로 snap된다. 제품이 준 `value`가 범위 안이면 step 밖이어도 그대로 그린다.
- 색·트랙 두께·thumb 크기는 HJM 소유다. 배치는 `layoutStyle`로 한다. Web `style`/`className`/`inputClassName`은 배치용으로만 쓰고,
  Native `containerStyle`/`controlStyle`은 deprecated(개발 모드 경고, 다음 major 제거)다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 접근성 | `input type="range"`, `aria-valuetext` | role `adjustable`, `accessibilityValue` |
| 키 조작 | 방향키·Home/End·PageUp/PageDown(step×10) | `increment`/`decrement` action만(페이지 이동 없음) |
| 필수 추가 문구 | 없음 | `incrementLabel`, `decrementLabel` |
| 스타일 슬롯 | `layoutStyle`, `style`(루트), `className`, `inputClassName` | `layoutStyle`. `containerStyle`·`controlStyle`은 deprecated(`style` prop 없음) |
| 의존성 | 없음 | 없음(PanResponder 사용) |

## 함정

- Native는 세로 스크롤 안에서 트랙을 스치기만 해도 값이 바뀌지 않도록, 가로 방향이 확인될 때까지 부모 스크롤에 제스처를 양보한다.
  세로로 시작한 제스처는 값 변경도 `onValueChangeEnd`도 없다.
- Native에서 드래그 중 `disabled`가 되면 마지막 값을 한 번 commit하고 제스처를 끝낸다.
