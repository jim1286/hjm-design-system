# DataTable

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-14
- 근거: [DataTable](../../data-table.md), `src/data-table.ts`(`dataTableRecipe`, `getNextDataTableSortState`, `sortDataTableRows`, `splitPinnedDataTableColumns`, `resolveDataTableHeaderBands`, `resolveDataTableBody`, `percentileRank`, `percentileHeat`, `dataTableFamilyRecipe`, `resolveLineScore`, `resolveMatrix`, `resolveComparisonRow`)
- 스토리북: `배포/컴포넌트/데이터 표시/데이터 표`, `배포/컴포넌트/데이터 표시/라인스코어`, `배포/컴포넌트/데이터 표시/대전표`, `배포/컴포넌트/데이터 표시/비교 표`

## 언제 쓰나

여러 행의 데이터를 열로 맞춰 훑고, 열 기준으로 정렬하거나 행을 골라 일괄 작업할 때 쓴다.
DataTable은 다음 정렬 상태와 선택 상태만 판정하고 행을 재배열하지 않는다. 로컬 배열 정렬은 계약의 선택형 helper
`sortDataTableRows`로, 서버 정렬·필터·페이지 나누기는 제품이 한다. 선택·정렬이 없는 단순 Web 표는 companion `Table`을 쓴다.
Native renderer(기록 표: 고정 열 + 가로 스크롤)는 2026-10-14 추가분이며 미게시(1.20.0 이후)다.
Native의 열 `width`는 최소 너비다. 제목(정렬 화살표 포함)과 문자열·숫자 셀을 실제 폰트로 측정해
전체 내용이 보이는 너비를 확보하며, 화면보다 넓으면 고정 열 옆으로 가로 스크롤한다.
2026-10-17 오늘야구에서 긴 지표명과 통산 이닝이 말줄임된 문제를 수정한 동작이며 미게시다.
제품이 JSX로 그리는 셀은 해당 내용에 필요한 최소 `width`를 공급한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 한 대상의 속성(이름–값) 나열 | [DescriptionList](description-list.md) |
| 행 하나가 하나의 항목인 목록(열 비교가 아님) | [List](list.md), [ListRow](list-row.md) |
| 값의 흐름·비교를 그림으로 읽기 | [Chart](chart.md) |
| 아주 긴 목록의 가상 스크롤 | [VirtualList](virtual-list.md) |
| 행 확장(상세 펼침) | [Accordion](accordion.md)·[Collapsible](collapsible.md)을 행 안에 합성 |
| Native에서 여러 행 체크 선택·일괄 작업 | Native는 행 하나 강조(`onRowPress`·`selectedRowId`)만 있다. [List](list.md)의 선택을 쓴다 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `DataTable` | 기본 — 정렬·행 선택·비동기 상태를 갖는 표 | `@hjmds/react`, `/data-table` | `@hjmds/react-native/data-table` |
| `Table` | 동반 — 행 객체와 `cell` 렌더러를 받는 단순 표 | `@hjmds/react`, `/display` | 없음 |
| `LineScore` | 동반 — 회별 점수 + 합계 열(9회 채움·연장 확장·진행 중 회 강조) | `@hjmds/react/data-table` | `@hjmds/react-native/data-table` |
| `MatrixTable` | 동반 — 같은 id 목록의 행×열 교차표(상대 전적), 대각선은 빈 칸 | `@hjmds/react/data-table` | `@hjmds/react-native/data-table` |
| `ComparisonTable` | 동반 — 두 대상의 지표를 행마다 값 + 막대로 비교 | `@hjmds/react/data-table` | `@hjmds/react-native/data-table` |

정렬 helper(`getNextDataTableSortState`·`dataTableFirstSortDirection`·`toDataTableSortValue`·`compareDataTableValues`·
`sortDataTableRows`·`splitPinnedDataTableColumns`)는 `@hjmds/design-contracts/components/data-table`에서 가져온다.

## 최소 사용 예

```tsx
// Web
import { DataTable } from "@hjmds/react/data-table";

<DataTable
  columns={[
    { id: "name", header: t("orders.col.name"), sortable: true },
    { id: "total", header: t("orders.col.total"), align: "end" },
  ]}
  rows={orders.map((order) => ({ id: order.id }))}
  renderCell={(rowId, columnId) => cellFor(rowId, columnId)}
  labels={{
    table: t("orders.table"),
    selectAll: t("orders.selectAll"),
    selectRow: (rowId) => t("orders.selectRow", { name: nameOf(rowId) }),
    // 두 번째 인자는 이 열이 아니라 표 전체의 정렬 상태다(함정 참조).
    sortColumn: (header) => t("orders.sortBy", { header }),
  }}
  sortState={sort}
  onSortChange={setSort}
  selection={{ mode: "multiple", selectedKeys: selected, onSelectionChange: setSelected }}
  asyncState={loading ? { status: "loading", message: t("orders.loading") } : { status: "idle" }}
  footer={pagination /* 제품이 합성한 Pagination 요소 */}
/>
```

```tsx
// Native
import { useState } from "react";
import { DataTable } from "@hjmds/react-native/data-table";
import {
  sortDataTableRows,
  toDataTableSortValue,
  type DataTableSortState,
} from "@hjmds/design-contracts/components/data-table";

const columns = [
  { id: "name", header: t("record.col.player"), pinned: "start" as const },
  { id: "avg", header: t("record.col.avg"), align: "end" as const, sortable: true, sortDescFirst: true },
  { id: "era", header: t("record.col.era"), align: "end" as const, sortable: true },
];
const [sort, setSort] = useState<DataTableSortState<string>>({ columnId: "avg", direction: "descending" });
// 표시 문자열("0.340", "—")에서 정렬 키를 만들고, 빈 값은 방향과 상관없이 마지막이다.
const sorted = sortDataTableRows(players, sort, (player, columnId) => toDataTableSortValue(player.cells[columnId]));

<DataTable
  columns={columns}
  rows={sorted.map((player) => ({ id: player.id }))}
  renderCell={(rowId, columnId) => cellText(rowId, columnId)}
  labels={{ table: t("record.table"), sortColumn: (header) => t("record.sortBy", { header }) }}
  sortState={sort}
  onSortChange={setSort}
  onRowPress={(rowId) => openPlayer(rowId)}
  summaryRow={(columnId) => totalText(columnId)}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `columns` | `{ id, header: string, align?, sortable?, width?, sortDescFirst?, pinned? }[]` | — (필수, 하나 이상) | `id`는 비어 있지 않고 중복 없음 |
| `rows` | `{ id, disabled? }[]` | — (필수) | 셀 내용은 `renderCell`이 그린다 |
| `renderCell` | `(rowId: RowKey, columnId: ColumnKey) => ReactNode` | — (필수) | 행·열 id로 셀을 그린다 |
| `labels` | `{ table: string; selectAll: string; selectRow: (rowId: string) => string; sortColumn: (header: string, direction: DataTableSortState) => string }` | — (필수) | 모든 문구는 i18n 키. Native는 `table`·`sortColumn`만 받는다 |
| `sortState` | `{ columnId, direction: "ascending" \| "descending" } \| null` | `null` | 제어 전용(내부 상태 없음) |
| `onSortChange` | `(next: DataTableSortState<ColumnKey>) => void` | — | 다음 정렬 상태(`null` = 정렬 없음)를 알린다. 재정렬은 제품이 한다 |
| `sortCycle` | `three-state` · `two-state` | `three-state` | `three-state`는 첫 방향 → 반대 방향 → 정렬 없음. 첫 방향은 열 `sortDescFirst`가 정한다(기본 오름차순) |
| `selection` | `{ mode: "none" }` · `{ mode: "single", selectedKey: Key \| null, onSelectionChange: (key: Key \| null) => void, disallowEmptySelection? }` · `{ mode: "multiple", selectedKeys: ReadonlySet<Key>, onSelectionChange: (keys: ReadonlySet<Key>) => void }` | 없음(선택 열 없음) | Web만. 제어(`selectedKey(s)`) 대신 `defaultSelectedKey(s)`를 주면 비제어로 내부 상태가 유지된다 |
| `asyncState` | `{ status: "idle" }` · `{ status: "loading" \| "loadingMore" \| "empty" \| "error", message: string }` | `{ status: "idle" }` | `error`는 `role="alert"`, 나머지는 `role="status"`로 표 위에 나온다 |
| `density` | `regular` · `compact` | Provider 밀도 | 지정하지 않으면 Provider 밀도를 따른다(`comfortable` → `regular`) |
| 열 `align` | `start` · `center` · `end` | `start` | 머리 칸과 본문 칸 모두에 적용 |
| 열 `sortable` | `boolean` | `false` | — |
| 열 `width` | 양수 px | — | 힌트 |
| 열 `sortDescFirst` | `boolean` | `false` | 첫 누름이 내림차순(높은 값 먼저). 낮을수록 좋은 열(평균자책점·순위)은 끈다. 미게시(1.20.0 이후) |
| 열 `pinned` | `"start"` | — | 가로 스크롤 중에도 보이는 열. 시작 쪽에서 끊기지 않고 이어진 열만 고정된다. 미게시(1.20.0 이후) |
| `summaryRow` | `(columnId: ColumnKey) => ReactNode` | — | 표 끝 합계·평균 행(Web `tfoot`). 값 계산·문구는 제품. 미게시(1.20.0 이후) |
| `onRowPress`(Native) | `(rowId: RowKey) => void` | — | 행 누름. 미게시(1.20.0 이후) |
| `selectedRowId`(Native) | `RowKey \| null` | — | 강조할 행 하나. 미게시(1.20.0 이후) |
| `emptyLabel`(Native) | `string` | — | 본문 상태 문구(제품 문구) |
| `footer` | `ReactNode` | — | 표 아래 합성 영역 |
| `columnGroups` | `{ id, header: string, columns: ColumnKey[] }[]` | — | 잎 머리글 위 묶음 머리글(타격 \| 주루). 묶음 열은 이어져야 하고, 묶이지 않은 열은 빈 칸. Web은 `scope="colgroup"`. 미게시(1.20.0 이후) |
| `rowGroups` | `{ id, label: string, rows: RowKey[] }[]` | — | 행 묶음(선발 / 교체). 묶음마다 이름 행이 먼저 나오고, 묶이지 않은 행은 맨 앞. Web은 묶음마다 `tbody` + `scope="rowgroup"`. 미게시(1.20.0 이후) |
| 행 `depth` | `0`–`3` | `0` | 하위 행 들여쓰기. 첫 열에 `dataTableFamilyRecipe.depthIndent`(16) × depth |
| `cellStyle` | `(rowId, columnId) => { tone?, heat? } \| null` | — | 셀 강조. `tone`: `leader` · `positive` · `negative` · `muted`, `heat`: `{ side: "high" \| "low", strength: 1 \| 2 \| 3 }`(백분위 색). 판정은 제품(`percentileRank`·`percentileHeat`). 미게시(1.20.0 이후) |
| `heatColors` | `{ high: string; low: string }` | 높음 `danger` 빨강 · 낮음 `info` 파랑 | heat 기준색. 칠할 때 `heatAlpha`(0.14·0.26·0.42)를 곱한다 |
| `maxBodyHeight` | 양수 px | — | 높이 제한. 머리글은 고정되고 본문만 세로 스크롤 |
| `layoutStyle` | 배치 전용 style(여백·폭·grid 위치) | — | 루트 wrapper에 붙는다. 시각 키는 받지 않는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 본문 폭을 채운다(표 `inline-size: 100%`). 선택 열 폭 `control.minTouchTarget` 44, 정렬 버튼·체크 상자 터치 영역 44 | `packages/react/src/styles.css` `.hjm-data-table*`, `src/data-table.ts` |
| 간격 | 루트 세로 간격 `spacing.sm` 12. 셀 여백(`dataTableRecipe.density`): `regular` 세로 `spacing.sm` 12 · 가로 `spacing.md` 16, `compact` 세로 `spacing.xs` 8 · 가로 `spacing.sm` 12. `footer` 간격 `spacing.sm` 12 | `packages/react/src/styles.css` |
| 순서·정렬 | 위에서 [상태 메시지] → 표 → [footer]. 선택 열은 맨 앞. 숫자·금액 열은 `align: "end"`로 끝 정렬하고 머리 행 정렬도 열 `align`을 따른다. 셀은 위 정렬. `footer`는 한 줄 flex(`space-between`, 넘치면 줄바꿈)이며 요약을 앞에, [Pagination](pagination.md)을 끝에 둔다 | `packages/react/src/data-table.tsx` |
| 고정·스크롤 | `maxBodyHeight`를 주면 Web은 스크롤 상자(`max-block-size`, `overflow: auto`) 안에서 `thead`를 `sticky`로, Native는 머리글을 본문 밖에 두고 본문만 세로 `ScrollView`에 넣는다. 그 밖의 Web 표는 가로 스크롤 컨테이너를 그리지 않고 긴 글자를 줄바꿈한다. `pinned: "start"` 열은 `position: sticky`로 시작 쪽에 붙는다. Native는 고정 열을 제자리에 두고 나머지 열을 가로 `ScrollView`에 넣으며 스크롤 가장자리에 흐림을 둔다 | `packages/react/src/styles.css`, `react-native/src/data-table.tsx`, `splitPinnedDataTableColumns` |
| 좁은 폭·큰 글자 | 열 비교가 목적인 기록 표는 열을 빼지 말고 이름 열을 `pinned: "start"`로 고정해 가로 스크롤로 보존한다. 행 하나가 하나의 항목이면 [List](list.md)로 바꾼다 | [계약](../../data-table.md#정렬-helper와-native-renderer--2026-10-14) |

```text
┌ DataTable ───────────────────────────────────────┐
│ 불러오는 중…(asyncState 메시지, status/alert)     │
│ ☐ │ 이름 ▲             │ 상태     │       합계 │ ← 머리 행
│ ☐ │ …                  │ …        │     12,000 │
├────────────────────────────────────────────────────┤
│ 3개 선택됨               [‹ 1 2 3 ›] Pagination   │ ← footer
└────────────────────────────────────────────────────┘
```

## 꼭 지킬 것

- 열 `id`·행 `id`는 비어 있지 않고 중복이 없어야 한다. 열은 하나 이상. 어기면 렌더 중 `TypeError`가 난다.
- `sortState`는 `sortable: true`인 열만 가리킨다. 아니면 `TypeError`.
- `labels`의 모든 문구는 i18n 키로 만든다. `selectRow`는 행 `id`를 받으므로 사람이 읽을 이름으로 바꿔 돌려준다.
- 받은 `onSortChange` 값으로 행을 재정렬하는 일은 제품이 한다. 로컬 배열은 `sortDataTableRows`를 쓰고 같은 규칙(숫자 해석·빈 값
  마지막·안정 정렬)을 제품 코드에 다시 만들지 않는다. 서버 정렬은 쿼리로 넘긴다.
- `sortDescFirst` 열은 제품이 `onSortChange` 밖에서 첫 상태를 만들 때도 `dataTableFirstSortDirection(column)`을 쓴다.
- 페이지네이션·더 보기는 `footer`에 [Pagination](pagination.md)·[LoadMore](load-more.md)로 합성한다.
- 배치는 `layoutStyle`, 시각 override는 `className`으로만 한다. 행 hover·선택 색을 덮지 않는다.
- 백분위 색은 같은 열 안의 비교다. `percentileRank(value, 열 전체 값, { lowerIsBetter })`로 열마다 따로 구하고, 낮을수록 좋은
  지표(평균자책·도루자)는 `lowerIsBetter`를 켠다. 색만으로 뜻을 전하지 않는다 — 셀 글자는 그대로 값이다.
- `LineScore`·`MatrixTable`·`ComparisonTable`은 `accessibilityLabel`(Web은 `aria-label`)이 필수다. 문구는 i18n 키로 만든다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 행 선택 | `selection`(checkbox·radio 열, 전체 선택 tri-state) | `onRowPress` + `selectedRowId` 행 하나 강조. 선택 열 없음 |
| 넓은 표 | 표가 폭을 채우고 긴 글자는 줄바꿈, `pinned` 열은 sticky | `pinned` 열 고정 + 나머지 가로 `ScrollView`, 가장자리 흐림 |
| 요약 행 | `summaryRow` → `tfoot` | `summaryRow` → 본문 아래 행 |
| 접근성 | `role="table"`, 머리 칸 안 정렬 버튼 + `aria-sort` | 정렬 머리 칸 `button`, 머리 행 `header`, 선택 행 `selected` |
| companion | `Table` | 없음 |
| 묶음 머리글·행 묶음 | 머리 행 하나 더(`colgroup`) · 묶음마다 `tbody` + `rowgroup` 머리 칸 | 머리 띠 · 묶음 이름 행(`header`) |
| 높이 제한 | 스크롤 상자 + `thead` sticky | 머리글 분리 + 본문 세로 `ScrollView` |
| `LineScore`·`MatrixTable` | `<table>`, 진행 중 회 머리 칸 `aria-current="true"`, 대각선 칸 `aria-hidden` | 팀 행마다 합계를 읽는 접근성 이름, 셀 단위 이름 |
| `ComparisonTable` | `section` + `role="list"`, 행마다 화면 읽기 문장 하나 | 행마다 접근성 이름 하나 |

## 함정

- `sortState`는 제어 전용이다. 내부 상태가 없어 `sortState` 없이 `onSortChange`만 주면 머리 칸 화살표가 바뀌지 않는다.
  선택은 2026-10-06부터 `defaultSelectedKey(s)` 비제어도 내부 상태로 유지된다(이전에는 표시가 바뀌지 않았다).
- 현재 `labels.sortColumn`의 두 번째 인자는 그 열의 방향이 아니라 표 전체의 `sortState`다(정렬되지 않은 열도 다른 열의
  상태를 받는다). 열의 현재 방향을 이름에 넣으려면 제품이 `header`로 열을 찾아 `columnId`와 비교한다.
- `asyncState`의 `message`는 표 위에 `status`/`alert`로 나오지만 표는 그대로 그려진다. 빈 상태 화면이
  따로 필요하면 [EmptyState](empty-state.md)로 표를 대신 그린다.
- `Table`의 `onSortChange`는 `null`을 받지 못해 항상 two-state로 돈다. `emptyState`는 필수 prop이다.
- 1.13.0 변경: 1.12.1까지 Web `regular` 셀은 사방 `spacing.sm` 12였다. 열 폭을 그 값으로 맞춘 화면은 가로 16에서 다시 확인한다.
- `pinned: "start"`는 맨 앞부터 이어진 열에만 적용된다. 가운데 열에 주면 무시된다(`splitPinnedDataTableColumns`).
- `toDataTableSortValue`는 글자가 둘 이상이면 문자열로 본다. "7승0무3패"는 문자열 정렬이 되므로 승수로 정렬하려면
  `getValue`에서 숫자를 직접 돌려준다.
- 2026-10-14 작성 시점에 Native renderer와 Native Storybook 등록은 구현 중이다. Native 행은 renderer가 들어온 뒤 실제 Props와 다시 대조한다.
- `cellStyle`은 셀마다 호출된다. 백분위 표본(열 전체 값)은 함수 밖에서 한 번 만들어 두고 셀에서는 조회만 한다.
- `columnGroups`의 묶음은 고정 열 경계를 넘지 않게 나눈다. Web은 묶음 안 열이 모두 고정일 때만 묶음 머리 칸도 고정된다.

### ComparisonTable 중복 머리글

2026-10-14 야잘알 비교 화면에서 상단 선택 카드의 선수·시즌이 표에 반복되어 읽는 흐름을 끊었다. Web/Native의 `showSideNames={false}`로 시각 머리글만 숨긴다(기본 `true`). `sides`는 계속 전달하며 각 행의 접근성 이름에는 양쪽 이름과 수치를 보존한다. 상단에서 양쪽 대상을 식별할 수 있을 때만 사용한다. 행 여백과 막대 간격을 넓히고 지표·비우세 수치의 대비를 유지해 기록을 구분한다.
