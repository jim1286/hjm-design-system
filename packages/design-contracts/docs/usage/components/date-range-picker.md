# DateRangePicker

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-28
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
| 오버레이에서 고르고 적용 버튼으로 확정 | [Sheet](sheet.md) 안에 합성하고 `footer`에 `BottomCTA`를 둔다. 본문 안에서 접어 두기만 하면 `collapsible`을 쓴다 |

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
| `maxRange` | `{ years?, months?, days? } \| null` | `{ years: 1 }` | 끝을 포함한 최대 길이. 달력 단위라 윤년을 낀 1월 1일~12월 31일도 1년이다. 고르는 중 범위 밖 날은 비활성, `null`이면 제한 없음. 넘는 `value`를 넘기면 `RangeError` |
| `previousMonth` · `nextMonth` | `{ month: string, label: string }` | — | 없으면 이동 버튼이 없다 |
| `renderCellContent` | `(date: string) => ReactNode` | — | 날짜 아래 보조 표시. 넘길 때만 행에 보조 줄이 생긴다 |
| `summary` | `{ startLabel, endLabel, placeholder, formatDate(date) }` | — | 격자 위 시작일·종료일 칸. 지금 고르는 쪽(`resolveDateRangeActiveEdge`: 비었으면 시작, 고르는 중이면 끝, 완성되면 없음)을 테두리로 표시한다. 문구는 i18n, 날짜 형식은 제품 소유 |
| `presets` | `{ id, label, length: { days } \| { months } \| { all: true } }[]` | — | 요약 아래 단일 선택 Chip 줄. `days`·`months`는 `grid.todayDate`로 끝나고 `all`은 빈 구간(날짜 제한 없음)이다(`resolveDateRangePreset`). 값이 그 구간과 같을 때만 선택으로 보인다. 누르면 끝 달로 `onFocusedMonthChange(month, "jump")`를 요청한다(`all` 제외). 기간 필터의 표준 칩은 `dateRangeRecipe.presets.standard`(1일·1주일·1개월·3개월·전체)이고 문구는 제품 i18n이다 |
| `collapsible` | `{ expanded?, defaultExpanded?, onExpandedChange? }` | 없음(늘 펼침) | 주면 격자만 `summary` 뒤로 접고 `presets`는 계속 보인다. `summary`가 필수이고(없으면 `TypeError`) 그 줄이 펼침 버튼(`aria-expanded`·Native `expanded` 상태, 끝에 아래/위 화살표)이 된다. 접힌 채 시작하고(`defaultExpanded` 기본 `false`), 프리셋을 누르거나 날짜 탭으로 구간이 완성되면 다시 접는다(`resolveDateRangeExpandedAfterSelection`) |
| Web `layoutStyle` | 배치 전용 style | — | 루트 배치 |

## 배치

2026-10-25 개편(Spint 기간 시트 사용자 지적): 구간이 날짜 아래 점으로만 보여 이어져 보이지 않았고, 점 줄 때문에
모든 행이 라벨 한 줄만큼 높아졌다. 오늘 테두리와 단일 선택 원이 섞여 시작·끝도 구분되지 않았다. Material 3·Airbnb
기간 선택을 모티브로 두 끝은 같은 채운 원, 사이는 날짜 원 높이의 띠 하나로 잇고, 띠는 주(행)가 시작·끝나는 곳에서
둥글게 닫는다. 기간 설정 안내 문장과 결과 문장은 `summary`의 시작일·종료일 칸이 대신한다(지금 무엇을 고르는지 강조).
월 이동은 `calendarRecipe.header.navIcon` 화살표 아이콘이다(이전 텍스트 ‹ ›는 약 8pt로 보였다).

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 날짜 셀은 `medium` `control.minTouchTarget` 44, `large` `glyph.xxl` 44로 같고 7열이다. Web 격자는 최소 폭 7×44 = 308을 잡는다. 월 이동 버튼 44 | `src/calendar.ts`(`calendarRecipe`), `packages/react/src/styles.css` `.hjm-calendar*` |
| 간격 | 월 머리 안 간격·세로 간격 `spacing.xs` 8. `summary`·`presets`·격자 사이 `spacing.md` 16, 칩 사이 `spacing.xs` 8, 두 칸 사이 `spacing.xs` 8, 칸 안쪽 8×12, 칸 라벨·값 사이 4 | `dateRangeRecipe` |
| 색 | 띠 `primary` 15% tint(두 끝과 같은 브랜드색. 처음 쓴 `surfaceSelected`는 기본 팔레트에서 #f0f1f3 회색이라 구간이 거의 보이지 않았다), 두 끝 Calendar 선택 원(`action.brand`). 칸 바탕 `surface.sunken`, 다음에 고를 칸 테두리 2 `action.brand`, 빈 값 `content.tertiary` | `dateRangeRecipe` |
| 순서·정렬 | 오버레이 없이 본문(폼·필터 영역·[Section](section.md)) 안에 격자를 펼쳐 둔다. 위에서 `summary`(시작일 · 종료일) → `presets` 칩 줄 → 월 머리(이전 · 월 이름 · 다음) → 요일 → 날짜 격자. 제출 행동은 격자 **아래**에 둔다. 시트에서는 `footer`에 `BottomCTA` [보조(전체 날짜 등)][주(적용)] 한 줄로 두고 시트 높이는 `auto`로 맞춘다. `summary`를 쓰면 별도 안내·결과 문장을 두지 않는다. 제출 버튼은 `isCompleteDateRange(value)`가 참일 때만 활성이다 | 같은 파일 |
| 고정·스크롤 | 본문과 함께 스크롤한다(오버레이 없음) | — |
| 접기 | `collapsible`이면 요약 두 칸 뒤에 화살표 열(`dateRangeRecipe.toggle`: 아이콘 `glyph.sm` 20, 칸과 간격 `spacing.xs` 8)이 붙고 요약 줄 전체가 버튼이다. 접히면 요약과 프리셋 칩 줄만 남고 격자는 그리지 않는다. 검색 필드가 있으면 그 아래에 요약 → 칩 → (펼쳤을 때) 격자 순서로 둔다 | `dateRangeRecipe.toggle`, `.hjm-date-range__summary[data-toggle]` |
| 좁은 폭·큰 글자 | Web 격자 최소 폭 308보다 좁은 컨테이너에 두지 않는다 | `packages/react/src/styles.css` `.hjm-calendar__grid` |

## 꼭 지킬 것

- 제출 버튼은 `isCompleteDateRange(value)`(`@hjmds/design-contracts/components/date-range`)가 참일 때만 연다.
- `end`만 있거나 `end`가 `start`보다 앞선 값을 넘기면 `TypeError`/`RangeError`가 난다.
- `rangeLabels`와 셀 이름(`composeAccessibleName`)은 i18n 키로 만든다. 구간 위치 접미사는 컴포넌트가
  셀 이름 뒤에 `, `로 붙인다.
- 달을 넘기면 제품이 새 달의 `cells`와 `monthLabel`을 다시 만들어 넘긴다.
- 필터처럼 고른 기간을 바로 반영하는 자리에서는 `collapsible`과 표준 프리셋(1일·1주일·1개월·3개월·전체)을 쓰고,
  빈 값(전체)을 기본으로 둔다. [전체·오늘·기간 지정] 같은 별도 탭을 위에 겹쳐 두지 않는다. 프리셋과 같은 선택을 두 번 한다.
  2026-10-28 사용자 요청: 다에리 만난 동물 필터에서 기간을 고른 뒤에도 달력이 늘 펼쳐져 목록을 밀어냈고, 탭과 프리셋이 겹쳤다.
- 적용 버튼이 있는 시트에서는 `all` 칩 대신 `BottomCTA` 보조 행동(전체 날짜)을 둔다. 적용 버튼은 완성된 구간에서만 켜진다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구간 표시 | 두 끝 채운 원 + 띠(`data-selected`·`data-range-band`), 마우스 hover로 끝 미리보기 | 두 끝 채운 원 + 띠, 셀 이름 |
| 배치 | `layoutStyle`(그 밖에 `className`) | 없음(감싸는 View로 배치) |

## 함정

- `renderCellContent`는 Calendar와 달리 셀 객체가 아니라 날짜 문자열(`date`)만 받는다.
- `previousMonth`/`nextMonth`를 넘겨도 `descriptor.onFocusedMonthChange`가 없으면 이동 버튼이 비활성이다.
