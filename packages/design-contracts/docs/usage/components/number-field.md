# NumberField

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [NumberField](../../number-field.md), [DurationField](../../compound-controls.md#durationfield), `src/number-field.ts`(`numberFieldRecipe`)
- 스토리북: `배포/컴포넌트/입력/숫자 입력`, `배포/컴포넌트/입력/소요 시간 입력`

## 언제 쓰나

범위가 정해진 **정확한 수 하나**를 입력받을 때 쓴다. 예약 인원, 수량, 글자 수 제한처럼
“이 숫자 그대로”가 중요한 입력이다. 직접 타이핑과 한 단계씩 증감하는 버튼을 함께 제공한다.
경과 시간(정수 초)은 NumberField 세 개를 합성한 `DurationField`를 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 대략적인 값을 끌어서 고름 | [Slider](slider.md) |
| 전화번호·우편번호·카드번호처럼 숫자로 된 문자열 | [Field](field.md)의 TextField |
| 인증번호 | [OtpField](otp-field.md) |
| 시각(몇 시 몇 분)·날짜 | [DatePicker](date-picker.md) |
| 수치를 보여 주기만 함 | [Statistic](statistic.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `NumberField` | 기본 | `@hjmds/react`, `/forms`, `/number-field` | `@hjmds/react-native`, `/inputs`, `/number-field` |
| `DurationField` | 시·분·초 세 칸 합성(optional-extension, 추가 peer 없음) | `/duration-field` | `/duration-field` |

## 최소 사용 예

```tsx
// Web
import { NumberField } from "@hjmds/react/number-field";

<NumberField
  label={t("booking.guests")}
  min={1}
  max={10}
  value={guests}
  onValueChange={setGuests}
  decrementLabel={t("booking.guests.decrease")}
  incrementLabel={t("booking.guests.increase")}
/>
```

```tsx
// Native
import { NumberField } from "@hjmds/react-native/number-field";

<NumberField
  label={t("booking.guests")}
  min={1}
  max={10}
  value={guests}
  onValueChange={setGuests}
  decrementLabel={t("booking.guests.decrease")}
  incrementLabel={t("booking.guests.increase")}
/>
```

```tsx
// Web — DurationField(Native도 같은 props, import는 `@hjmds/react-native/duration-field`). value는 정수 초
import { DurationField } from "@hjmds/react/duration-field";

const increaseKey = { hours: "timer.increase.hours", minutes: "timer.increase.minutes", seconds: "timer.increase.seconds" } as const;
const decreaseKey = { hours: "timer.decrease.hours", minutes: "timer.decrease.minutes", seconds: "timer.decrease.seconds" } as const;

<DurationField
  value={seconds}
  max={3 * 3600}
  onValueChange={setSeconds}
  labels={{
    label: t("timer.duration"), hours: t("unit.hours"), minutes: t("unit.minutes"), seconds: t("unit.seconds"),
    increment: (unit) => t(increaseKey[unit]), decrement: (unit) => t(decreaseKey[unit]),
  }}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` · `defaultValue` | `number \| null` | `null` | `null`은 아직 입력하지 않은 상태 |
| `onValueChange` | `(value: number \| null) => void` | — | blur 확정·증감 때 호출. 지운 채 확정하면 `null` |
| `min` · `max` | 숫자 | 필수 | |
| `step` | 양수 | 1 | |
| `size` | `medium` · `large` | `medium` | |
| `decrementLabel` · `incrementLabel` | 문자열 | 필수 | 증감 버튼의 접근성 이름 |
| `getValueText` | `(value: number) => string` | — | 보조기기용 값 문구(단위·통화 등). 편집 문자열은 바꾸지 않는다 |
| `inputMode` | `decimal` · `numeric` · `text` | 자동 | 생략하면 `min < 0`이면 `text`, 정수 step이면 `numeric`, 아니면 `decimal` |
| `layoutStyle` | 배치 전용 style 객체 | — | 필드 전체 배치. Web `style`은 안쪽 input에 붙는다 |
| `value`(DurationField) | 정수 초 | 필수 | 제어형만 |
| `onValueChange`(DurationField) | `(seconds: number) => void` | 필수 | 단위 하나를 바꿔도 합친 초로 넘긴다(범위로 clamp) |
| `labels`(DurationField) | `{ label, hours, minutes, seconds, increment: (unit) => string, decrement: (unit) => string }` | 필수 | `unit`은 `"hours" \| "minutes" \| "seconds"`. 키는 위 예처럼 상수 표로 고른다 |
| `min`(DurationField) | 정수 초 | 0 | |
| `max`(DurationField) | 정수 초 | 필수 | 1시간 미만이면 시 칸이 비활성 |

타이핑은 blur에서 clamp·step snap으로 확정되고, 증감 버튼과 ↑/↓는 즉시 확정된다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 높이 `medium` 44(`fieldFrameContract.minHeight`) · `large` 52(`control.buttonHeight.large`). 증감 버튼 각 44×44(`control.minTouchTarget`) | `numberFieldRecipe.sizes`, `.hjm-number-field__stepper` |
| 간격 | 라벨·입력·설명·오류 사이 `spacing.xs` 8. 값 좌우 `medium` 16(`spacing.md`) · `large` 20(`spacing.lg`). 버튼과 값은 1px 구분선. DurationField 칸 사이 `spacing.md` 16, 라벨과 칸 사이 `spacing.sm` 12 | `formSupportContract.gap`, `.hjm-number-field__input`, `duration-field.tsx` |
| 순서·정렬 | `[−] [  값  ] [+]`: 감소가 시작 쪽, 증가가 끝 쪽(RTL 반전). 값은 가운데 정렬·고정폭 숫자. DurationField는 시 → 분 → 초 | `.hjm-number-field__*`, `duration-field.tsx` |
| 고정·스크롤 | 폼 안에서 다른 Field와 같은 열. 폭은 부모를 따르고, 짧은 값이면 `layoutStyle`/`className`으로 폭을 줄여 라벨 아래에 둔다 | — |
| 좁은 폭·큰 글자 | DurationField는 줄바꿈된다(Web 칸 최소 `10ch`, Native 칸 기준 폭 `spacing.xxxl` × 3 × 글자 배율) | `duration-field.tsx`(Web·Native) |

## 꼭 지킬 것

- `decrementLabel`·`incrementLabel`은 필수이며 i18n 키로 넣는다. 화면에 보이지 않아도 접근성 이름이다.
- 단위·통화·소수 자릿수 표시는 만들지 않는다. 보조기기용 문구가 필요하면 `getValueText`로 제품이 포맷한다.
- 제어형과 비제어형을 렌더 사이에 바꾸지 않는다(`value`를 넣었다 뺐다 하면 던진다).
- `min ≥ max`, `step ≤ 0`, 범위 밖 `value`는 던진다. DurationField도 범위 밖·정수 아닌 초를 던진다.
- 색·높이를 덮지 않는다. 배치는 `layoutStyle`로 한다. Native `inputStyle`·`containerStyle`은 deprecated(개발 모드 경고, 다음 major 제거) — 높이·글꼴은 `size`, 배치는 `layoutStyle`.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 역할 | `spinbutton`, `type="text"` | 입력 + 증감 button, accessibility action |
| label·description·error 타입 | `ReactNode` | `string` |
| 추가 이름 | 없음 | `accessibilityLabel`, `accessibilityHint` |
| 클래스·스타일 | `className`, `inputClassName`, `layoutStyle`(필드 전체). `style`은 안쪽 input | `layoutStyle`(필드 전체). `inputStyle`·`containerStyle`은 deprecated |
| DurationField 배치 | `className`, `layoutStyle`(fieldset) | `layoutStyle`(미게시(1.12.1 이후), 1.12.1은 감싸는 View) |
