# List

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: recipe `listRecipe`(`src/component-recipes.ts`), TaskList 계약: [Task list](../../task-list.md)
- 스토리북: `배포/컴포넌트/데이터 표시/목록` · `배포/컴포넌트/입력/할 일 목록`

## 언제 쓰나

이미 다 불러온, 개수가 많지 않은 행들을 이름 있는 목록 하나로 묶을 때 쓴다. List는 목록 의미
(`role="list"`)와 행 사이 구분선·묶음 배경만 소유하고, 각 행의 모양은 안에 넣는 [ListRow](list-row.md)가 정한다.
체크로 완료를 표시하는 할 일 목록은 `TaskList`를 쓴다.

### 목록 계열 고르기

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `List` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |
| `TaskList` | 확장 — 완료 체크 목록(optional) | `/task-list` | `/task-list` |

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
import { Text } from "@hjmds/react-native/primitives";

<TaskList label={t("todo.today")} items={tasks}
  onCompletedChange={(id, completed) => saveTask(id, completed)}
  emptyContent={<Text tone="muted">{t("todo.empty")}</Text>} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | 현지화 문자열(필수) | — | 목록의 접근성 이름. 비면 `TypeError` |
| `separator` | `indented` · `full` · `none` | `indented` | `indented`는 leading 슬롯 폭만큼 들여씀 |
| `appearance` | `plain` · `grouped` | `plain` | `grouped`는 배경과 둥근 모서리로 한 덩어리 |
| `layoutStyle` | 배치 key만 | — | 목록 루트 배치. Native `style`은 **deprecated**(1.13, 개발 모드 1회 경고, 다음 major 제거) — `layoutStyle`, 모양은 `appearance`·`separator` |
| TaskList `items` | `readonly TaskItem[]` — `{ id, label, completed, description?, disabled? }` | — | `id`·`label`이 비거나 `id`가 중복되거나 `completed`가 boolean이 아니면 `TypeError` |
| TaskList `onCompletedChange` | `(id: string, completed: boolean) => void` | — | 필수. 체크 하나마다 한 번. 목록 순서·저장은 제품이 정한다 |
| TaskList `disabled` | `true` · `false` | `false` | 전체 체크박스를 끈다 |
| TaskList `renderItemAction` | `({ item, disabled }) => ReactNode` | — | 체크 아래 별도 행동. disabled는 전체/항목 잠금의 합이며 제품 버튼에 전달한다. 간격 spacing.sm 12, 체크 안에 중첩하지 않음 |
| TaskList `emptyContent` | ReactNode | — | `items`가 비면 `List` 안에 그린다 |
| TaskList `renderCollection` | `(context: { items, renderItem: (item: TaskItem) => ReactNode }) => ReactNode` | — | SortableCollection을 합성할 수 있다. 이때 목록 루트는 제품이 그린다 |
| TaskList `layoutStyle`(Web) | 배치 key만 | — | List 루트 배치. `renderCollection`을 쓰면 무시되고 제품 루트를 배치한다. Native TaskList는 `layoutStyle`이 없다 |

- List 자체에는 이벤트 콜백이 없다. 행의 누름은 각 [ListRow](list-row.md)가 받는다.

## 배치

Native `grouped` 프레임은 Provider의 `tokens.radius.lg`를 읽는다. plain 목록과 separator 의미는 변하지 않는다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 화면 본문 폭을 채우는 세로 묶음이다. `grouped`는 배경 `--hjm-color-bg`와 모서리 `radius.lg` 16으로 한 덩어리가 된다 | `design-contracts/src/foundations.ts`(`radius`), `react/src/styles.css`(`.hjm-list`) |
| 간격 | 행 사이 간격은 없고 구분선 1px(`--hjm-color-border`)만 들어간다. `indented` 구분선의 시작 들여쓰기: 52(leading 40 + `spacing.sm` 12, `listRecipe.separators.indented`, 두 플랫폼). 끝 쪽은 둘 다 0. 덩어리 바깥 여백·섹션 사이 간격은 감싸는 Stack이 준다(페이지 좌우 여백은 `layout.pagePadding`, 섹션 간격은 `layout.sectionGap` = `spacing.xl` 24) | `design-contracts/src/component-recipes.ts`(`listRecipe`), `design-contracts/src/foundations.ts`(`layout`), `react/src/styles.css`(`.hjm-list`), `react-native/src/data-display.tsx`(List) |
| 순서·정렬 | 다음 페이지 요청은 목록 바로 아래에 [LoadMore](load-more.md)를 둔다 | — |
| 고정·스크롤 | List 자체는 스크롤하지 않는다. 화면 스크롤 안에 둔다 | `react-native/src/data-display.tsx`(List) |
| 좁은 폭·큰 글자 | — | — |

```text
┌─ List grouped (radius.lg 16, --hjm-color-bg) ─────────┐
│ ListRow                                          │
│      ──────────────────────────────────────────  │ ← indented 구분선(시작 들여씀)
│ ListRow                                          │
│      ──────────────────────────────────────────  │
│ ListRow                                          │
└──────────────────────────────────────────────────┘
[ LoadMore ]
```

## 꼭 지킬 것

- 자식 하나가 행 하나다. 자식마다 안정된 `key`를 준다(없으면 순서 index로 key를 만든다).
- 구분선을 행에 직접 그리지 않는다. `separator`로 정한다.
- TaskList는 체크해도 순서를 바꾸거나 지우지 않는다. 저장·실패·되돌리기는 제품이 `onCompletedChange`에서 처리한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구조 | `role="list"` + 자식마다 `role="listitem"` | `accessibilityRole="list"` |
| 구분선 | CSS(`data-separator`) | 행 사이 1px `View` |
| 배치 | `layoutStyle`(+ `className`) | `layoutStyle`(`style`은 deprecated) |

2026-10-07 Utilverse 항목 삭제 채택을 위해 `renderItemAction`을 추가했다. 체크와 삭제의 초점·누름을 분리하고 큰 글자 라벨 폭을 보존하도록 행동을 다음 줄에 둔다. `renderCollection`의 `renderItem`에도 포함된다. 삭제 저장·실패·되돌리기는 제품이 처리한다.

항목 삭제 뒤에는 제품이 다음 항목의 독립 행동(없으면 이전 항목, 목록이 비면 후속 행동)으로 초점을 복구한다. Web Showcase는 ref와 커밋 후 focus 예시를 제공한다. Native 접근성 초점 검증은 아직 남아 있다.
