# DataTable 사용 지침

적용: `@hjmds/react` 1.12.1(Web 전용) · 검토일: 2026-10-06 ·
계약: [DataTable](../data-table.md), `src/data-table.ts`(`dataTableRecipe`, `getNextDataTableSortState`)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `DataTable` | `@hjmds/react`, `/data-table` | 없음 | 정렬·행 선택·비동기 상태를 갖는 표 |
| `Table` | `@hjmds/react`, `/display` | 없음 | 행 객체와 `cell` 렌더러를 받는 단순 표 |

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
    sortColumn: (header) => t("orders.sortBy", { header }),
  }}
  sortState={sort}
  onSortChange={setSort}
  selection={{ mode: "multiple", selectedKeys: selected, onSelectionChange: setSelected }}
  asyncState={loading ? { status: "loading", message: t("orders.loading") } : { status: "idle" }}
  footer={pagination /* 제품이 합성한 Pagination 요소 */}
/>
```

Native 사용 예는 없다. Native renderer가 없다.

## 축과 기본값

- `sortCycle`: `three-state`(기본, 오름차순 → 내림차순 → 정렬 없음) · `two-state`.
- `density`: `regular` · `compact`. 지정하지 않으면 Provider 밀도를 따른다(`comfortable` → `regular`).
- 열: `align`은 `start`(기본) · `center` · `end`, `sortable` 기본 `false`, `width`는 양수 px 힌트.
- `selection.mode`: `none` · `single` · `multiple`. `asyncState` 기본 `{ status: "idle" }`.

## 꼭 지킬 것

- 열 `id`·행 `id`는 비어 있지 않고 중복이 없어야 한다. 열은 하나 이상. 어기면 렌더 중 `TypeError`가 난다.
- `sortState`는 `sortable: true`인 열만 가리킨다. 아니면 `TypeError`.
- `labels`의 모든 문구는 i18n 키로 만든다. `selectRow`는 행 `id`를 받으므로 사람이 읽을 이름으로 바꿔 돌려준다.
- 받은 `onSortChange` 값으로 행을 재정렬하는 일은 제품이 한다(로컬 배열이든 서버 쿼리든).
- 페이지네이션·더 보기는 `footer`에 [Pagination](pagination.md)·[LoadMore](load-more.md)로 합성한다.
- 시각 override 수단은 `className`뿐이다. 행 hover·선택 색을 덮지 않는다.

## 함정

- `selection`과 `sortState`는 사실상 controlled다. 컴포넌트에 내부 state가 없어 `defaultSelectedKeys`·
  `defaultSelectedKey`만 주면 눌러도 표시가 바뀌지 않는다. 값과 `onSelectionChange`를 함께 넘긴다.
- `asyncState`의 `message`는 표 위에 `status`/`alert`로 나오지만 표는 그대로 그려진다. 빈 상태 화면이
  따로 필요하면 [EmptyState](empty-state.md)로 표를 대신 그린다.
- `Table`의 `onSortChange`는 `null`을 받지 못해 항상 two-state로 돈다. `emptyState`는 필수 prop이다.
