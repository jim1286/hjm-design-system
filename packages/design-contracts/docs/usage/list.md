# List 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `listRecipe`(`src/component-recipes.ts`), TaskList 계약: [Task list](../task-list.md)

## 언제 쓰나

이미 다 불러온, 개수가 많지 않은 행들을 이름 있는 목록 하나로 묶을 때 쓴다. List는 목록 의미
(`role="list"`)와 행 사이 구분선·묶음 배경만 소유하고, 각 행의 모양은 안에 넣는 [ListRow](list-row.md)가 정한다.
체크로 완료를 표시하는 할 일 목록은 `TaskList`를 쓴다.

**목록 계열 고르기**

| 화면 형태 | 쓸 것 |
| --- | --- |
| 수십 개 이하의 행을 한 번에 그림(설정, 계정 메뉴, 검색 결과 한 페이지) | `List` + `ListRow` |
| 행 한 줄의 제목·설명·앞뒤 슬롯 | [ListRow](list-row.md) |
| 높이가 고정된 행 수백~수천 개를 창 안에서 스크롤 | [VirtualList](virtual-list.md) |
| 이어지는 목록의 다음 페이지 요청 footer | [LoadMore](load-more.md) (List·VirtualList 아래에 둔다) |

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 행이 많아 한 번에 그리면 느림 | [VirtualList](virtual-list.md) |
| 열이 있는 표 | [DataTable](data-table.md) |
| 높이가 다른 카드 격자 | [Masonry](masonry.md), [Grid](grid.md) |
| 이름·값 쌍 나열 | [DescriptionList](description-list.md) |
| 여러 항목을 골라 확정 | [CheckboxGroup](checkbox-group.md) |
| 순서 바꾸기 | [SortableCollection](sortable-collection.md) |
| 시간순 사건 | [Timeline](timeline.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `List` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` | 기본 |
| `TaskList` | `/task-list` | `/task-list` | 완료 체크 목록(optional) |

`TaskList`는 granular subpath로만 import 된다. 추가 peer는 없다. 순서 바꾸기를 합성하면 SortableCollection의 peer가 필요하다.

## 최소 사용 예

```tsx
// Web
import { List, ListRow } from "@hjmds/react/display";

<List label={t("settings.account")} appearance="grouped">
  <ListRow key="email" title={t("settings.email")} description={email} href="/settings/email" />
  <ListRow key="logout" title={t("settings.logout")} onClick={logout} />
</List>
```

```tsx
// Native
import { TaskList } from "@hjmds/react-native/task-list";

<TaskList label={t("todo.today")} items={tasks}
  onCompletedChange={(id, completed) => saveTask(id, completed)}
  emptyContent={<Text tone="muted">{t("todo.empty")}</Text>} />
```

## 축과 기본값

- `label`(필수, 현지화): 목록의 접근성 이름. 비면 `TypeError`.
- `separator`: `indented`(기본, leading 슬롯 폭만큼 들여씀) · `full` · `none`.
- `appearance`: `plain`(기본) · `grouped`(배경과 둥근 모서리로 한 덩어리).
- TaskList: `items`는 `id`·`label`·`completed`·선택 `description`·`disabled`. `disabled`는 전체 체크박스를 끈다.
  `renderCollection({ items, renderItem })`로 SortableCollection을 합성할 수 있다.

## 꼭 지킬 것

- 자식 하나가 행 하나다. 자식마다 안정된 `key`를 준다(없으면 순서 index로 key를 만든다).
- 구분선을 행에 직접 그리지 않는다. `separator`로 정한다.
- TaskList는 체크해도 순서를 바꾸거나 지우지 않는다. 저장·실패·되돌리기는 제품이 `onCompletedChange`에서 처리한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구조 | `role="list"` + 자식마다 `role="listitem"` | `accessibilityRole="list"` |
| 구분선 | CSS(`data-separator`) | 행 사이 1px `View` |
| 배치 | `style`/`className`(HTML 속성) | `style` |
