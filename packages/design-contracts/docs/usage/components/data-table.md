# DataTable

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [DataTable](../../data-table.md), `src/data-table.ts`(`dataTableRecipe`, `getNextDataTableSortState`)
- 스토리북: `배포/컴포넌트/데이터 표시/데이터 표`

## 언제 쓰나

여러 행의 데이터를 열로 맞춰 훑고, 열 기준으로 정렬하거나 행을 골라 일괄 작업할 때 쓴다(Web).
정렬·필터 실행, 페이지 나누기는 제품이 소유한다. DataTable은 다음 정렬 상태와 선택 상태만 판정한다.
선택·정렬이 없는 단순 표는 companion `Table`을 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 한 대상의 속성(이름–값) 나열 | [DescriptionList](description-list.md) |
| 행 하나가 하나의 항목인 목록, 모바일 화면 | [List](list.md), [ListRow](list-row.md) |
| 아주 긴 목록의 가상 스크롤 | [VirtualList](virtual-list.md) |
| 행 확장(상세 펼침) | [Accordion](accordion.md)·[Collapsible](collapsible.md)을 행 안에 합성 |
| Native 화면 | Native renderer 없음 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `DataTable` | 기본 — 정렬·행 선택·비동기 상태를 갖는 표 | `@hjmds/react`, `/data-table` | 없음 |
| `Table` | 동반 — 행 객체와 `cell` 렌더러를 받는 단순 표 | `@hjmds/react`, `/display` | 없음 |

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

Native: 없음. Native renderer가 없다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `columns` | `{ id, header: string, align?, sortable?, width? }[]` | — (필수, 하나 이상) | `id`는 비어 있지 않고 중복 없음 |
| `rows` | `{ id, disabled? }[]` | — (필수) | 셀 내용은 `renderCell`이 그린다 |
| `renderCell` | `(rowId: RowKey, columnId: ColumnKey) => ReactNode` | — (필수) | 행·열 id로 셀을 그린다 |
| `labels` | `{ table: string; selectAll: string; selectRow: (rowId: string) => string; sortColumn: (header: string, direction: DataTableSortState) => string }` | — (필수) | 모든 문구는 i18n 키 |
| `sortState` | `{ columnId, direction: "ascending" \| "descending" } \| null` | `null` | 제어 전용(내부 상태 없음) |
| `onSortChange` | `(next: DataTableSortState<ColumnKey>) => void` | — | 다음 정렬 상태(`null` = 정렬 없음)를 알린다. 재정렬은 제품이 한다 |
| `sortCycle` | `three-state` · `two-state` | `three-state` | `three-state`는 오름차순 → 내림차순 → 정렬 없음 |
| `selection` | `{ mode: "none" }` · `{ mode: "single", selectedKey: Key \| null, onSelectionChange: (key: Key \| null) => void, disallowEmptySelection? }` · `{ mode: "multiple", selectedKeys: ReadonlySet<Key>, onSelectionChange: (keys: ReadonlySet<Key>) => void }` | 없음(선택 열 없음) | 제어(`selectedKey(s)`) 대신 `defaultSelectedKey(s)`를 주면 비제어로 내부 상태가 유지된다 |
| `asyncState` | `{ status: "idle" }` · `{ status: "loading" \| "loadingMore" \| "empty" \| "error", message: string }` | `{ status: "idle" }` | `error`는 `role="alert"`, 나머지는 `role="status"`로 표 위에 나온다 |
| `density` | `regular` · `compact` | Provider 밀도 | 지정하지 않으면 Provider 밀도를 따른다(`comfortable` → `regular`) |
| 열 `align` | `start` · `center` · `end` | `start` | 머리 칸과 본문 칸 모두에 적용 |
| 열 `sortable` | `boolean` | `false` | — |
| 열 `width` | 양수 px | — | 힌트 |
| `footer` | `ReactNode` | — | 표 아래 합성 영역 |
| `layoutStyle` | 배치 전용 style(여백·폭·grid 위치) | — | 루트 wrapper에 붙는다. 시각 키는 받지 않는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 본문 폭을 채운다(표 `inline-size: 100%`). 선택 열 폭 `control.minTouchTarget` 44, 정렬 버튼·체크 상자 터치 영역 44 | `packages/react/src/styles.css` `.hjm-data-table*`, `src/data-table.ts` |
| 간격 | 루트 세로 간격 `spacing.sm` 12. 셀 여백(`dataTableRecipe.density`): `regular` 세로 `spacing.sm` 12 · 가로 `spacing.md` 16, `compact` 세로 `spacing.xs` 8 · 가로 `spacing.sm` 12. `footer` 간격 `spacing.sm` 12 | `packages/react/src/styles.css` |
| 순서·정렬 | 위에서 [상태 메시지] → 표 → [footer]. 선택 열은 맨 앞. 숫자·금액 열은 `align: "end"`로 끝 정렬하고 머리 행 정렬도 열 `align`을 따른다. 셀은 위 정렬. `footer`는 한 줄 flex(`space-between`, 넘치면 줄바꿈)이며 요약을 앞에, [Pagination](pagination.md)을 끝에 둔다 | `packages/react/src/data-table.tsx` |
| 고정·스크롤 | 가로 스크롤 컨테이너는 그리지 않는다. 긴 글자는 줄바꿈한다 | `packages/react/src/styles.css` |
| 좁은 폭·큰 글자 | 좁은 폭(모바일)에서 열이 많으면 표를 줄이지 말고 [List](list.md)로 바꾼다 | — |

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
- 받은 `onSortChange` 값으로 행을 재정렬하는 일은 제품이 한다(로컬 배열이든 서버 쿼리든).
- 페이지네이션·더 보기는 `footer`에 [Pagination](pagination.md)·[LoadMore](load-more.md)로 합성한다.
- 배치는 `layoutStyle`, 시각 override는 `className`으로만 한다. 행 hover·선택 색을 덮지 않는다.

## 함정

- `sortState`는 제어 전용이다. 내부 상태가 없어 `sortState` 없이 `onSortChange`만 주면 머리 칸 화살표가 바뀌지 않는다.
  선택은 2026-10-06부터 `defaultSelectedKey(s)` 비제어도 내부 상태로 유지된다(이전에는 표시가 바뀌지 않았다).
- 현재 `labels.sortColumn`의 두 번째 인자는 그 열의 방향이 아니라 표 전체의 `sortState`다(정렬되지 않은 열도 다른 열의
  상태를 받는다). 열의 현재 방향을 이름에 넣으려면 제품이 `header`로 열을 찾아 `columnId`와 비교한다.
- `asyncState`의 `message`는 표 위에 `status`/`alert`로 나오지만 표는 그대로 그려진다. 빈 상태 화면이
  따로 필요하면 [EmptyState](empty-state.md)로 표를 대신 그린다.
- `Table`의 `onSortChange`는 `null`을 받지 못해 항상 two-state로 돈다. `emptyState`는 필수 prop이다.
- 미게시(1.12.1 이후) 변경: 1.12.1까지 Web `regular` 셀은 사방 `spacing.sm` 12였다. 열 폭을 그 값으로 맞춘 화면은 가로 16에서 다시 확인한다.
