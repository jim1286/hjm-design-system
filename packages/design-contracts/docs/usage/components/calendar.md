# Calendar

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Calendar](../../calendar.md), recipe `calendarRecipe`(`src/calendar.ts`)
- 스토리북: `배포/컴포넌트/데이터 표시/달력`

## 언제 쓰나

화면에 항상 펼쳐진 한 달 격자에서 날짜 하나를 고를 때 쓴다. 날짜마다 점·개수 같은 짧은
제품 콘텐츠를 붙일 수 있다. 월 계산·로케일·오늘 날짜는 제품이 만들어 넘긴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 필드를 눌러 열고 고른 뒤 닫힘 | [DatePicker](date-picker.md) (같은 Calendar를 담는다) |
| 시작·끝 기간 | [DateRangePicker](date-range-picker.md) (Calendar에 range 없음) |
| 시간 순 사건 목록 | [Timeline](timeline.md) |
| 기간별 활동량 격자 | [ActivityHeatmap](activity-heatmap.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Calendar` | 기본 | `@hjmds/react`, `/calendar` | `@hjmds/react-native`, `/calendar` |

## 최소 사용 예

```tsx
// Web
import { Calendar } from "@hjmds/react/calendar";

<Calendar
  descriptor={{
    grid: { cells, weekdayLabels, todayDate },
    monthLabel: formatMonth(month),
    focusedMonth: month, onFocusedMonthChange: setMonth,
    selectedDate: date, onSelectionChange: setDate,
  }}
  previousMonth={{ month: prevMonthKey, label: t("calendar.previousMonth") }}
  nextMonth={{ month: nextMonthKey, label: t("calendar.nextMonth") }}
  composeAccessibleName={({ date, isToday }) => formatDayName(date, isToday)}
  onNavigateBeyondGrid={({ overflow }, focusDate) => { const next = shiftMonth(overflow); setMonth(next.month); focusDate(next.date); }}
/>
```

```tsx
// Native
import { Calendar } from "@hjmds/react-native/calendar";

<Calendar
  descriptor={descriptor}
  previousMonth={{ month: prevMonthKey, label: t("calendar.previousMonth") }}
  nextMonth={{ month: nextMonthKey, label: t("calendar.nextMonth") }}
  composeAccessibleName={composeName}
  renderCellContent={(cell) => cell.content ? <Dot /> : null}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor.grid.cells` | `readonly { date?: string; outsideFocusedMonth?: boolean; disabled?: boolean; content?: Content }[]`, 7열 row-major, 길이 7의 배수 | 필수 | `date`(ISO `YYYY-MM-DD`)가 없는 셀은 빈칸이다. 중복 날짜는 거부한다 |
| `descriptor.grid.weekdayLabels` · `grid.todayDate` · `monthLabel` | 요일 7개 튜플 · ISO 날짜 · 문자열 | 필수 | 제품이 현지화한 값. HJM은 `Date.now()`를 부르지 않는다 |
| `descriptor.selectedDate` + `onSelectionChange` · `defaultSelectedDate` | `string \| null`, `(date: string \| null) => void` | 비제어 `null` | 제어(`selectedDate`와 `onSelectionChange` 둘 다 필수)·비제어 중 하나만 타입이 허용한다. 단일 날짜만 |
| `descriptor.focusedMonth` + `onFocusedMonthChange` · `defaultFocusedMonth` | ISO 월(`YYYY-MM`), `(month: string, reason: "previous" \| "next" \| "jump") => void` | — | 실제 `grid`·`monthLabel` 교체는 제품이 한다. `onFocusedMonthChange`가 없으면 월 버튼이 비활성이다 |
| `previousMonth` · `nextMonth` | `{ month: string; label: string }` | — | 없으면 그 자리 버튼이 없다. 빈 `label`은 `TypeError` |
| `composeAccessibleName` | `(info: { date: string; isToday: boolean; isSelected: boolean; disabled: boolean; content?: Content }) => string` | 필수 | 날짜 칸의 접근성 이름 |
| `renderCellContent` | `(cell: ResolvedCalendarDateCell<Content>) => ReactNode` | — | `cell`은 셀 descriptor에 `date`·`row`·`column`·`isToday`·`isSelected`·`selectable`·`accessibleName`이 더해진 값. 결과는 접근성에서 숨는다 |
| Web `onNavigateBeyondGrid` | `(detail: { date: string; intent: "next-day" \| "previous-day" \| "next-week" \| "previous-week" \| "first-of-week" \| "last-of-week"; overflow: "before" \| "after" }, focusDate: (date: string) => void) => void` | — | 방향키가 격자 밖으로 나갈 때. 제품이 다음 달 grid를 넘긴 뒤 `focusDate`를 부른다 |
| `size` | `medium` · `large` | `medium` | — |
| `ref` | `{ focusDate(date: string): void }` | — | 날짜에 초점을 요청한다 |
| Web `autoFocus` | `boolean` | `false` | — |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. Native도 같은 배치 슬롯을 받는다 |

## 배치

Native `renderCellContent` 최소 높이는 Provider의 `tokens.typography.label.lineHeight × textScale`다. 날짜의 원형 geometry와 선택 계약은 별도다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 날짜 칸 44(`medium` `control.minTouchTarget`, `large` `glyph.xxl` 44 — large는 글자만 `bodyLarge`로 커진다). 격자 최소 폭 7 × 44 = 308. 월 이동 버튼 44 원(`control.buttonHeight.medium`). 셀 `content`는 날짜 아래 label 한 줄 높이 | `calendarRecipe.sizes`·`header.navButton`, `.hjm-calendar__grid` |
| 간격 | 머리↔격자, 머리 안 `spacing.xs` 8. 요일 줄 위아래 `spacing.xs` 8. 날짜↔`content` `spacing.xxs` 4. Web 격자 바깥 `spacing.xxs` 4 | `calendarRecipe.header.gap`, `.hjm-calendar*` |
| 순서·정렬 | 위→아래 [이전 월][월 제목(가운데, title)][다음 월] → 요일 줄 → 주 단위 7열. 화면 본문에 인라인으로 두며 팝업·시트를 열지 않는다 | `.hjm-calendar__header`, `calendarRecipe` 주석(`shared`) |
| 고정·스크롤 | 폭이 308보다 좁으면 격자가 가로 스크롤한다(Web `.hjm-calendar__viewport` `overflow-x: auto`, Native `ScrollView horizontal`) | `.hjm-calendar__viewport`, `react-native/src/calendar.tsx` |
| 좁은 폭·큰 글자 | 칸 크기는 고정이고 월 제목·요일·`content`가 줄바꿈된다(`overflow-wrap: anywhere`). 큰 글자로 칸이 넘치면 가로 스크롤 | `.hjm-calendar__header strong`, `.hjm-calendar__content` |

```text
┌──────────────────────────────┐
│ [‹]      2026년 10월     [›] │ ← 머리(44 버튼, 가운데 제목)
│ 월  화  수  목  금  토  일    │ ← 요일(label, muted)
│ (1) (2) (3) (4) (5) (6) (7)  │ ← 44 칸 × 7
│  ·       ·                   │ ← content(선택)
│ …                            │
└──────────────────────────────┘
```

## 꼭 지킬 것

- `composeAccessibleName`이 날짜·오늘·비활성·제품 콘텐츠의 의미를 모두 문장으로 만든다. `renderCellContent`는 접근성에서 숨는다.
- `renderCellContent`에 버튼·입력을 넣지 않는다. 장식 콘텐츠만 넣는다.
- 월 이동 label, 요일, 월 제목은 i18n 키·제품 로케일 포맷으로 넣는다.
- 비활성 날짜는 `disabled`로 표시한다. 초점은 가지만 선택되지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 키보드 격자 탐색 | 방향키·Home/End, roving tabindex | 없음(월 버튼으로 이동) |
| 격자 밖 이동 | `onNavigateBeyondGrid` | 없음 |
| `autoFocus` | 있음(기본 `false`) | 없음 |
| `className`·`layoutStyle` | 있음 | `layoutStyle` 지원, `className` 없음 |
| 날짜 셀 역할 | `gridcell` + `aria-selected` | `button` + `accessibilityState.selected` |
| 좁은 폭 | 격자 영역 가로 스크롤 | 격자를 가로 `ScrollView`로 감쌈 |
| `focusDate` | DOM 초점 | 접근성 초점(RN Web은 DOM 초점) |

## 함정

- Web에서 `onNavigateBeyondGrid`를 연결하지 않으면 방향키가 월 경계에서 멈춘다. 연속 키보드 탐색이 필요하면 반드시 연결한다.
