# DateRangePicker 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [DateRange](../date-range.md), 격자는 [Calendar](../calendar.md), 규칙 함수 `src/date-range.ts`

## 언제 쓰나

시작~끝 날짜 **구간**을 고를 때 쓴다(통계 기간, 예약, 검색 필터). 필드 트리거나 오버레이 없이 달력 격자를
그 자리에 펼쳐 둔다. 클릭 규칙은 계약이 정한다: 비었거나 완성된 구간에서 누르면 새로 시작하고,
고르는 중에 시작보다 앞선 날을 누르면 두 값을 바꿔 담는다([표](../date-range.md)).

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 날짜 하나 | [DatePicker](date-picker.md) |
| 달력을 보여 주기만 하거나 날짜 하나를 인라인으로 고름 | [Calendar](calendar.md) |
| 접힌 필드에서 눌러 여는 구간 선택 | 없음. 필요하면 [Sheet](sheet.md)·[Popover](popover.md) 안에 제품이 합성한다 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `DateRangePicker` | `@hjmds/react`, `/date-range` | `@hjmds/react-native`, `/date-range` | 기본 |

## 최소 사용 예

격자 `cells`·`weekdayLabels`·`todayDate`와 `monthLabel`은 제품이 자기 시계·로캘로 만든다.

```tsx
// Web
import { DateRangePicker } from "@hjmds/react/date-range";

<DateRangePicker
  descriptor={{
    grid: { cells, weekdayLabels, todayDate },
    monthLabel: formatMonth(month),
    focusedMonth: month,
    onFocusedMonthChange: (next) => setMonth(next),
  }}
  value={range}
  onValueChange={setRange}
  previousMonth={{ month: prevMonthOf(month), label: t("calendar.previousMonth") }}
  nextMonth={{ month: nextMonthOf(month), label: t("calendar.nextMonth") }}
  composeAccessibleName={({ date, isToday }) => t("calendar.cellName", { date, isToday })}
  rangeLabels={{ start: t("range.start"), end: t("range.end"), between: t("range.between") }}
/>
```

```tsx
// Native
import { DateRangePicker } from "@hjmds/react-native/date-range";

<DateRangePicker
  descriptor={descriptor /* Web과 같은 모양 */}
  value={range}
  onValueChange={setRange}
  composeAccessibleName={composeCellName}
  rangeLabels={{ start: t("range.start"), end: t("range.end"), between: t("range.between") }}
/>
```

## 축과 기본값

- 값은 `{ start, end }`(ISO `YYYY-MM-DD` 또는 `null`)이고 기본은 `{ start: null, end: null }`이다.
  `start`만 있는 상태가 "고르는 중"이다. 별도 플래그는 없다.
- `value`/`onValueChange`(controlled) 또는 `defaultValue`(uncontrolled) 중 하나를 쓴다.
- 표시 달은 `descriptor.focusedMonth`/`defaultFocusedMonth`/`onFocusedMonthChange`로 다룬다.

## 꼭 지킬 것

- 제출 버튼은 `isCompleteDateRange(value)`(`@hjmds/design-contracts/components/date-range`)가 참일 때만 연다.
- `end`만 있거나 `end`가 `start`보다 앞선 값을 넘기면 `TypeError`/`RangeError`가 난다.
- `rangeLabels`와 셀 이름(`composeAccessibleName`)은 i18n 키로 만든다. 구간 위치 접미사는 컴포넌트가
  셀 이름 뒤에 `, `로 붙인다.
- 달을 넘기면 제품이 새 달의 `cells`와 `monthLabel`을 다시 만들어 넘긴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구간 표시 | 셀 `data-range` band, 마우스 hover로 끝 미리보기 | 날짜 아래 점(고르는 중에는 반투명)과 셀 이름 |
| 배치 | `className` | 없음(감싸는 View로 배치) |

## 함정

- `renderCellContent`는 Calendar와 달리 셀 객체가 아니라 날짜 문자열(`date`)만 받는다.
- `previousMonth`/`nextMonth`를 넘겨도 `descriptor.onFocusedMonthChange`가 없으면 이동 버튼이 비활성이다.
