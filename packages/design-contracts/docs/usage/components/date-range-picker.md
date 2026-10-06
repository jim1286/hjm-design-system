# DateRangePicker

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [DateRange](../../date-range.md), 격자는 [Calendar](../../calendar.md), 규칙 함수 `src/date-range.ts`
- 스토리북: `배포/컴포넌트/입력/기간 선택`

## 언제 쓰나

시작~끝 날짜 **구간**을 고를 때 쓴다(통계 기간, 예약, 검색 필터). 필드 트리거나 오버레이 없이 달력 격자를
그 자리에 펼쳐 둔다. 클릭 규칙은 계약이 정한다: 비었거나 완성된 구간에서 누르면 새로 시작하고,
고르는 중에 시작보다 앞선 날을 누르면 두 값을 바꿔 담는다([표](../../date-range.md)).

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 날짜 하나 | [DatePicker](date-picker.md) |
| 달력을 보여 주기만 하거나 날짜 하나를 인라인으로 고름 | [Calendar](calendar.md) |
| 접힌 필드에서 눌러 여는 구간 선택 | 없음. 필요하면 [Sheet](sheet.md)·[Popover](popover.md) 안에 제품이 합성한다 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `DateRangePicker` | 기본 | `@hjmds/react`, `/date-range` | `@hjmds/react-native`, `/date-range` |

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
  composeAccessibleName={({ date, isToday }) =>
    t(isToday ? "calendar.cell.today" : "calendar.cell.default", { date: formatDate(date) })}
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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` / `defaultValue` | `{ start: string \| null, end: string \| null }`(ISO `YYYY-MM-DD`) | `{ start: null, end: null }` | 제어 또는 비제어 중 하나. `start`만 있는 상태가 "고르는 중"이다. 별도 플래그는 없다 |
| `onValueChange` | `(value: DateRangeValue) => void` | — | 누를 때마다 다음 구간(`{ start, end }`)을 알린다 |
| `descriptor` | `{ grid, monthLabel, focusedMonth \| defaultFocusedMonth, onFocusedMonthChange? }` | — (필수) | Calendar descriptor에서 선택 필드를 뺀 모양 |
| `descriptor.onFocusedMonthChange` | `(month: string, reason: "previous" \| "next" \| "jump") => void` | — | 없으면 이동 버튼이 비활성 |
| `composeAccessibleName` | `(info: { date, isToday, isSelected, disabled, content? }) => string` | — (필수) | 구간 접미사는 컴포넌트가 붙인다 |
| `rangeLabels` | `{ start: string, end: string, between: string }` | — (필수) | 셀 이름 뒤에 붙는 구간 위치 접미사 |
| `previousMonth` · `nextMonth` | `{ month: string, label: string }` | — | 없으면 이동 버튼이 없다 |
| `renderCellContent` | `(date: string) => ReactNode` | — | 날짜 아래 보조 표시 |
| Web `layoutStyle` | 배치 전용 style | — | 루트 배치 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 날짜 셀은 `medium` `control.minTouchTarget` 44, `large` `glyph.xxl` 44로 같고 7열이다. Web 격자는 최소 폭 7×44 = 308을 잡는다. 월 이동 버튼 44 | `src/calendar.ts`(`calendarRecipe`), `packages/react/src/styles.css` `.hjm-calendar*` |
| 간격 | 월 머리 안 간격·세로 간격 `spacing.xs` 8. Native 구간 점은 날짜 아래 `spacing.xxs` 4, 점 지름 구간 안 4·시작·끝 6. 스토리는 격자 아래 문구를 `Stack gap="md"`(16)로 띄운다 | `packages/react-native/src/date-range.tsx`, `showcase/web/src/patterns/DateRange.stories.tsx` |
| 순서·정렬 | 오버레이 없이 본문(폼·필터 영역·[Section](section.md)) 안에 격자를 펼쳐 둔다. 위에서 월 머리(이전 · 월 이름 · 다음) → 요일 → 날짜 격자. 선택 결과 문구와 제출 버튼은 격자 **아래**에 둔다(스토리는 `role="status"` 문구). 제출 버튼은 `isCompleteDateRange(value)`가 참일 때만 활성이다 | 같은 파일 |
| 고정·스크롤 | 본문과 함께 스크롤한다(오버레이 없음) | — |
| 좁은 폭·큰 글자 | Web 격자 최소 폭 308보다 좁은 컨테이너에 두지 않는다 | `packages/react/src/styles.css` `.hjm-calendar__grid` |

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
| 배치 | `layoutStyle`(그 밖에 `className`) | 없음(감싸는 View로 배치) |

## 함정

- `renderCellContent`는 Calendar와 달리 셀 객체가 아니라 날짜 문자열(`date`)만 받는다.
- `previousMonth`/`nextMonth`를 넘겨도 `descriptor.onFocusedMonthChange`가 없으면 이동 버튼이 비활성이다.
