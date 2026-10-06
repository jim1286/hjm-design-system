# Calendar 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Calendar](../calendar.md), recipe `calendarRecipe`(`src/calendar.ts`)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Calendar` | `@hjmds/react`, `/calendar` | `@hjmds/react-native`, `/calendar` | 기본 |

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

- `grid.cells`: 7열 row-major, 길이는 7의 배수. `date`(ISO `YYYY-MM-DD`)가 없는 셀은 빈칸이다. 중복 날짜는 거부한다.
  셀마다 `outsideFocusedMonth`·`disabled`·`content`를 줄 수 있다.
- `grid.weekdayLabels`(정확히 7개)·`todayDate`·`monthLabel`은 제품이 현지화한 값이다. HJM은 `Date.now()`를 부르지 않는다.
- 선택: `selectedDate`+`onSelectionChange`(controlled) 또는 `defaultSelectedDate`. 단일 날짜만.
- 표시 월: `focusedMonth`+`onFocusedMonthChange`(controlled) 또는 `defaultFocusedMonth`. 실제 `grid`·`monthLabel` 교체는 제품이 한다.
  `onFocusedMonthChange`가 없으면 월 버튼이 비활성이다.
- `size`: `medium`(기본) · `large`. `ref.focusDate(date)`로 날짜에 초점을 요청한다.

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
| `className` | 있음 | 없음(`style`도 없음) |
| 날짜 셀 역할 | `gridcell` + `aria-selected` | `button` + `accessibilityState.selected` |
| 좁은 폭 | 격자 영역 가로 스크롤 | 격자를 가로 `ScrollView`로 감쌈 |
| `focusDate` | DOM 초점 | 접근성 초점(RN Web은 DOM 초점) |

## 함정

- Web에서 `onNavigateBeyondGrid`를 연결하지 않으면 방향키가 월 경계에서 멈춘다. 연속 키보드 탐색이 필요하면 반드시 연결한다.
