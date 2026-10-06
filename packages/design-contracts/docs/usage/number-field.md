# NumberField 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [NumberField](../number-field.md), [DurationField](../compound-controls.md#durationfield)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `NumberField` | `@hjmds/react`, `/forms`, `/number-field` | `@hjmds/react-native`, `/inputs`, `/number-field` | 기본 |
| `DurationField` | `/duration-field` | `/duration-field` | 시·분·초 세 칸 합성(optional-extension, 추가 peer 없음) |

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
// DurationField (Web/Native 같은 props) — value는 정수 초
import { DurationField } from "@hjmds/react/duration-field";

<DurationField
  value={seconds}
  max={3 * 3600}
  onValueChange={setSeconds}
  labels={{
    label: t("timer.duration"), hours: t("unit.hours"), minutes: t("unit.minutes"), seconds: t("unit.seconds"),
    increment: (unit) => t(`timer.increase.${unit}`), decrement: (unit) => t(`timer.decrease.${unit}`),
  }}
/>
```

## 축과 기본값

- 값은 `number | null`이다. `null`은 아직 입력하지 않은 상태다(`defaultValue` 기본 `null`).
- `min`·`max` 필수, `step` 기본 1. `size`: `medium`(기본) · `large`.
- 타이핑은 blur에서 clamp·step snap으로 확정되고, 증감 버튼과 ↑/↓는 즉시 확정된다.
- `inputMode`를 생략하면 `min < 0`이면 `text`, 정수 step이면 `numeric`, 아니면 `decimal`이다.
- DurationField: `min` 기본 0, `max` 필수. `max`가 1시간 미만이면 시 칸이 비활성이다.

## 꼭 지킬 것

- `decrementLabel`·`incrementLabel`은 필수이며 i18n 키로 넣는다. 화면에 보이지 않아도 접근성 이름이다.
- 단위·통화·소수 자릿수 표시는 만들지 않는다. 보조기기용 문구가 필요하면 `getValueText`로 제품이 포맷한다.
- 제어형과 비제어형을 렌더 사이에 바꾸지 않는다(`value`를 넣었다 뺐다 하면 던진다).
- `min ≥ max`, `step ≤ 0`, 범위 밖 `value`는 던진다. DurationField도 범위 밖·정수 아닌 초를 던진다.
- 색·높이를 덮지 않는다. Native `inputStyle`·`containerStyle`은 배치 외에 쓰지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 역할 | `spinbutton`, `type="text"` | 입력 + 증감 button, accessibility action |
| label·description·error 타입 | `ReactNode` | `string` |
| 추가 이름 | 없음 | `accessibilityLabel`, `accessibilityHint` |
| 클래스·스타일 | `className`, `inputClassName` | `inputStyle`, `containerStyle` |
| DurationField 배치 | `className`(fieldset) | 없음 |
