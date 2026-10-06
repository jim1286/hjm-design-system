# DatePicker 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [DatePicker](../date-picker.md), 격자는 [Calendar](../calendar.md), recipe `datePickerRecipe`(`src/date-picker.ts`)

## 언제 쓰나

폼·필터 자리에서 날짜 **하나**를 고를 때 쓴다(생년월일, 방문일, 시작일 필터). 평소에는 필드 트리거만
보이고, 누르면 Web은 필드에 붙은 팝오버, Native는 [Sheet](sheet.md) 안에 같은 달력 격자를 연다.
날짜를 고르거나 지우면 닫히고 트리거로 포커스가 돌아간다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 시작~끝 기간 | [DateRangePicker](date-range-picker.md) |
| 달력을 화면에 늘 펼쳐 둠 | [Calendar](calendar.md) |
| 날짜를 키보드로 타이핑 | 지원하지 않는다(트리거로만 연다) |
| 날짜가 아닌 목록에서 하나 고름 | [Select](select.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `DatePicker` | `@hjmds/react`, `/date-picker`, `/forms` | `@hjmds/react-native`, `/date-picker`, `/inputs` | 기본 |

## 최소 사용 예

격자 `cells`(7의 배수, 행 우선)·`weekdayLabels`·`todayDate`는 제품이 자기 시계와 로캘로 만든다.
DatePicker는 날짜를 포맷하지 않으므로 `displayValue`도 제품이 만든다.

```tsx
// Web
import { DatePicker } from "@hjmds/react/date-picker";

<DatePicker
  descriptor={{
    grid: { cells, weekdayLabels, todayDate },
    label: t("visit.date"),
    placeholder: t("visit.datePlaceholder"),
    displayValue: visitDate === null ? null : formatDate(visitDate),
    selectedDate: visitDate,
    onSelectionChange: (date) => setVisitDate(date),
    focusedMonth: month,
    onFocusedMonthChange: (next) => setMonth(next),
  }}
  monthLabel={formatMonth(month)}
  previousMonth={{ month: prevMonthOf(month), label: t("calendar.previousMonth") }}
  nextMonth={{ month: nextMonthOf(month), label: t("calendar.nextMonth") }}
  composeAccessibleName={({ date, isToday, isSelected }) => t("calendar.cellName", { date, isToday, isSelected })}
  clearLabel={t("visit.clearDate")}
  closeLabel={t("calendar.close")}
/>
```

```tsx
// Native
import { DatePicker } from "@hjmds/react-native/date-picker";

<DatePicker
  descriptor={/* Web과 같은 descriptor */ descriptor}
  monthLabel={formatMonth(month)}
  composeAccessibleName={composeCellName}
  clearLabel={t("visit.clearDate")}
  closeLabel={t("calendar.close")}
/>
```

## 축과 기본값

- `size`: `medium`(기본) · `large`.
- 열림(`open`/`defaultOpen`/`onOpenChange`), 선택(`selectedDate`/`defaultSelectedDate`/`onSelectionChange`),
  표시 달(`focusedMonth`/`defaultFocusedMonth`/`onFocusedMonthChange`)은 각각 controlled 또는 uncontrolled 한 쌍만 쓴다.
- `disabled`·`readOnly`면 트리거를 열지 않고 모든 날짜 셀을 비활성으로 그린다. `invalid` 또는 `error`가 있으면 오류 테두리.
- 날짜는 ISO `YYYY-MM-DD`, 달은 `YYYY-MM` 문자열이다.

## 꼭 지킬 것

- `label` 또는 `accessibilityLabel` 중 하나, 비어 있지 않은 `placeholder`가 필수다. 어기면 `TypeError`.
- 모든 문구(라벨·placeholder·`clearLabel`·`closeLabel`·월 이동 라벨·셀 이름)는 i18n 키로 만든다.
  셀 이름(`composeAccessibleName`)의 어순·문법은 제품이 소유한다.
- 달을 넘기면 제품이 새 달의 `cells`와 `monthLabel`을 다시 만들어 넘긴다. 달을 바꿔도 선택값은 바뀌지 않는다.
- 배치는 Web `className`, Native `style`로 한다. 트리거 색·높이를 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 달력이 뜨는 곳 | 필드에 붙은 팝오버(뷰포트 안으로 밀고 공간이 없으면 위로 뒤집음) | `Sheet` |
| `description`·`error` | `ReactNode` | `string` |
| 격자 밖 이동 알림 `onNavigateBeyondGrid` | 있음 | 없음 |
| 하단 안전 영역 `safeAreaInsets` | 없음 | 있음(기본은 Provider 값) |
| 배치 | `className` | `style` |

## 함정

- `previousMonth`/`nextMonth`를 넘겨도 `descriptor.onFocusedMonthChange`가 없으면 두 renderer 모두 이동 버튼이 비활성이다.
- 예시의 Native 호출처럼 `previousMonth`/`nextMonth`를 빼면 이동 버튼 자체가 없다. 여러 달을 오가야 하면 넘긴다.
