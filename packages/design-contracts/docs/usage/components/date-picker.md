# DatePicker

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [DatePicker](../../date-picker.md), 격자는 [Calendar](../../calendar.md), recipe `datePickerRecipe`(`src/date-picker.ts`)
- 스토리북: `배포/컴포넌트/입력/날짜 선택`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `DatePicker` | 기본 | `@hjmds/react`, `/date-picker`, `/forms` | `@hjmds/react-native`, `/date-picker`, `/inputs` |

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
  composeAccessibleName={({ date, isToday, isSelected }) =>
    t(isSelected ? "calendar.cell.selected" : isToday ? "calendar.cell.today" : "calendar.cell.default", { date: formatDate(date) })}
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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `size` | `medium` · `large` | `medium` | — |
| `descriptor.grid` | `{ cells: { date?, outsideFocusedMonth?, disabled?, content? }[], weekdayLabels: [7개 string], todayDate: string }` | — (필수) | `cells`는 7의 배수, 행 우선 |
| `descriptor.label` · `accessibilityLabel` | `string` | — | 둘 중 하나는 필수 |
| `descriptor.placeholder` · `displayValue` | `string` · `string \| null` | — (필수) | 트리거 문구. `displayValue`는 제품이 포맷한다 |
| `descriptor.open` / `defaultOpen` / `onOpenChange` | `boolean` · `(open: boolean, reason: "trigger" \| "keyboard" \| "selection" \| "clear" \| "escape" \| "outside" \| "blur" \| "programmatic") => void` | 비제어 닫힘 | 제어(`open`+`onOpenChange`) 또는 비제어 한 쌍 |
| `descriptor.selectedDate` / `defaultSelectedDate` / `onSelectionChange` | ISO `YYYY-MM-DD` \| `null` · `(date: string \| null, reason: "activate" \| "clear") => void` | — | 제어 또는 비제어 한 쌍만 쓴다. 지우기는 `null`, `"clear"` |
| `descriptor.focusedMonth` / `defaultFocusedMonth` / `onFocusedMonthChange` | `YYYY-MM` · `(month: string, reason: "previous" \| "next" \| "jump") => void` | — | 표시 달. 제어 또는 비제어 한 쌍만 쓴다 |
| `descriptor.disabled` · `readOnly` | `boolean` | `false` | 트리거를 열지 않고 모든 날짜 셀을 비활성으로 그린다. `disabled`는 라벨과 트리거 줄을 `fieldRecipe.disabledOpacity`(0.6)로 흐리고 도움말·오류는 그대로 둔다([Field](field.md)) |
| `descriptor.invalid` · `error` | `boolean` · 오류 문구(Web `ReactNode`, Native `string`) | — | 둘 중 하나가 있으면 오류 테두리 |
| `monthLabel` | `string` | — (필수) | 제품이 포맷한 달 제목 |
| `composeAccessibleName` | `(info: { date, isToday, isSelected, disabled, content? }) => string` | — (필수) | 셀 이름 |
| `previousMonth` · `nextMonth` | `{ month: string, label: string }` | — | 없으면 이동 버튼이 없다 |
| `renderCellContent` | `(cell: ResolvedCalendarDateCell) => ReactNode` | — | 날짜 아래 보조 표시 |
| Web `onNavigateBeyondGrid` | `(detail: { date, intent, overflow: "before" \| "after" }, focusDate: (date: string) => void) => void` | — | 키보드가 격자 밖으로 나갈 때 |
| Native `safeAreaInsets` | Sheet `safeAreaInsets` | Provider 값 | — |
| `layoutStyle` | 배치 전용 style | — | 루트 배치. Native `style`은 deprecated |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 트리거 높이: `medium` 44 · `large` 52(`datePickerRecipe.sizes`, 두 플랫폼), 좌우 여백 16 · 20. 2026-10-06까지 렌더 값이 Web 44·56, Native 48·56이었다(1.12.1 이후 미게시). 지우기 버튼 44×44. Web 팝오버 폭 `min(22.5rem, 100vw − 2rem)`(최대 360). 날짜 셀 44, 7열 | `datePickerRecipe.sizes`, `packages/react/src/styles.css` `.hjm-date-picker*`, `packages/react-native/src/date-picker.tsx`, `src/calendar.ts` |
| 간격 | 라벨·트리거·설명·오류 사이 Web `spacing.xs` 8, Native 6(렌더러 고정값). 트리거 가로 여백 `medium` `spacing.md` 16, `large` `spacing.lg` 20. 팝오버는 트리거 아래 `spacing.xs` 8, 안쪽 여백 `spacing.sm` 12 | 같은 파일 |
| 순서·정렬 | 폼 안에서 다른 필드와 같은 폭으로 세로로 쌓는다. 위에서 라벨 → 트리거 → 설명 → 오류. 지우기 버튼(값이 있을 때)은 Web은 트리거 안 끝에 겹치고(트리거가 끝 여백 3rem을 비움), Native는 트리거 바깥 끝에 최소 터치 영역으로 붙는다. Web 팝오버는 시작 쪽 정렬 | `packages/react/src/styles.css`, `packages/react-native/src/date-picker.tsx` |
| 고정·스크롤 | Web 팝오버는 필드에 붙어 층 800에 뜬다. Native 달력은 화면 아래에서 올라오는 [Sheet](sheet.md)이며 하단 안전 영역은 Provider `safeAreaInsets`를 쓴다 | 같은 파일 |
| 좁은 폭·큰 글자 | Web 팝오버 폭은 뷰포트 − 2rem까지 줄어든다 | `packages/react/src/styles.css` `.hjm-date-picker__popover` |

```text
Web                                  Native
라벨                                  라벨
┌──────────────────────────[×]┐      ┌───────────────────────┐[×]
│ ▣ 2026-10-06                │      │ ▣ 2026-10-06          │
└─────────────────────────────┘      └───────────────────────┘
  ↓ spacing.xs 8                     ┌ Sheet ─────────────────┐
┌ 팝오버 (최대 360) ───────────┐     │ 제목(라벨)         [닫기]│
│ ‹   2026년 10월   ›          │     │ ‹   2026년 10월   ›     │
│ 일 월 화 수 목 금 토          │     │ 7×N 날짜 격자           │
│ 7×N 날짜 격자(셀 44)         │     │ ─ 안전 영역 ─           │
└──────────────────────────────┘     └─────────────────────────┘
```

## 꼭 지킬 것

- `label` 또는 `accessibilityLabel` 중 하나, 비어 있지 않은 `placeholder`가 필수다. 어기면 `TypeError`.
- 모든 문구(라벨·placeholder·`clearLabel`·`closeLabel`·월 이동 라벨·셀 이름)는 i18n 키로 만든다.
  셀 이름(`composeAccessibleName`)의 어순·문법은 제품이 소유한다.
- 달을 넘기면 제품이 새 달의 `cells`와 `monthLabel`을 다시 만들어 넘긴다. 달을 바꿔도 선택값은 바뀌지 않는다.
- 배치는 `layoutStyle`로 한다(Web·Native). 트리거 색·높이를 덮지 않는다. Native `style`은 deprecated — `layoutStyle` 또는 `size`로 옮긴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 달력이 뜨는 곳 | 필드에 붙은 팝오버(뷰포트 안으로 밀고 공간이 없으면 위로 뒤집음) | `Sheet` |
| `description`·`error` | `ReactNode` | `string` |
| 격자 밖 이동 알림 `onNavigateBeyondGrid` | 있음 | 없음 |
| 하단 안전 영역 `safeAreaInsets` | 없음 | 있음(기본은 Provider 값) |
| 배치 | `layoutStyle`(그 밖에 `className`) | `layoutStyle`(`style`은 deprecated) |

## 함정

- `previousMonth`/`nextMonth`를 넘겨도 `descriptor.onFocusedMonthChange`가 없으면 두 renderer 모두 이동 버튼이 비활성이다.
- 예시의 Native 호출처럼 `previousMonth`/`nextMonth`를 빼면 이동 버튼 자체가 없다. 여러 달을 오가야 하면 넘긴다.
- 1.12.1 이하를 쓰는 화면은 트리거 높이가 recipe(`medium` 44 · `large` 52)와 달랐다(Web 44·56, Native 48·56). 다음 릴리스로 올리면 Native `medium`은 4, `large`는 두 플랫폼 모두 4 낮아지므로 그 높이로 맞춘 고정 높이 계산을 다시 본다.
