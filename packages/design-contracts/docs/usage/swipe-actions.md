# SwipeActions 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
분류: 별도 보조 기능(supplemental), 계약 함수 `validateActions`·`RowAction`(`components/interaction-adapters`)

## 언제 쓰나

목록 행 하나에 붙은 **삭제·보관 같은 행 단위 행동**을, Native에서는 행을 밀어 드러내고 Web에서는
행 아래 버튼으로 바로 보여 줄 때 쓴다. 스와이프 전용 기능은 없다. 같은 행동이 항상 다른 경로로도 열린다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 행을 눌러 상세로 이동, 설정 행 | [ListRow](list-row.md), [List](list.md) |
| 행 행동이 많거나 메뉴로 묶어야 함 | [Menu](menu.md), [ContextMenu](context-menu.md) |
| 순서 바꾸기 | [SortableCollection](sortable-collection.md) |
| 되돌릴 수 없는 삭제의 최종 확인 | 행동 처리 안에서 [AlertDialog](alert-dialog.md) |
| 시트·화면 닫기 스와이프 | [Sheet](sheet.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `SwipeActions` | `/swipe-actions` | `/swipe-actions` | supplemental |

granular subpath로만 import 된다. Native는 `react-native-gesture-handler/ReanimatedSwipeable`을 import 하므로
optional peer `react-native-gesture-handler` 2.32.0과 Reanimated(`react-native-reanimated` ^4.5.1,
`react-native-worklets` ^0.10.1)를 앱에 설치하고 앱 루트의 GestureHandlerRootView·Reanimated 설정을 갖춰야 한다
([optional adapters](../optional-adapters.md)의 설치 절). Web은 추가 peer가 없다.

## 최소 사용 예

```tsx
// Web
import { SwipeActions } from "@hjmds/react/swipe-actions";

<SwipeActions
  label={t("inbox.rowActions", { title: item.title })}
  actions={[{ id: "archive", label: t("inbox.archive") }, { id: "delete", label: t("inbox.delete"), intent: "danger" }]}
  onAction={(id) => handleRowAction(item.id, id)}
  onError={showErrorToast}
>
  <InboxRow item={item} />
</SwipeActions>
```

```tsx
// Native — 목록 전체가 openRowId 하나를 공유한다
import { SwipeActions } from "@hjmds/react-native/swipe-actions";

<SwipeActions
  rowId={item.id}
  openRowId={openRowId}
  onOpenRowChange={setOpenRowId}
  label={t("inbox.rowActions", { title: item.title })}
  actionsLabel={t("inbox.showActions")}
  actions={rowActions}
  onAction={(id) => handleRowAction(item.id, id)}
  onError={showErrorToast}
>
  <InboxRow item={item} />
</SwipeActions>
```

## 축과 기본값

- `actions`: `{ id, label, intent?: "default" | "danger", disabled? }`. `id`는 고유하고 `label`은 비어 있으면 안 된다(`TypeError`).
  `danger`는 `danger` 버튼, 나머지는 `ghost` 버튼으로 그린다.
- `busy`: 모든 행동을 막는다. 처리 중에는 두 번째 행동을 받지 않는다(`onAction`이 끝날 때까지).
- `onAction`이 던지거나 reject 하면 `onError`로 넘긴다.

## 꼭 지킬 것

- 행동 label·행 label은 i18n 키로 넣는다. 어떤 행동을 두는지는 제품이 정한다.
- Native는 `openRowId`/`onOpenRowChange`를 목록 단위 상태로 두어 한 번에 한 행만 열리게 한다.
- `actionsLabel` 버튼은 스와이프를 쓰지 못하는 사용자의 경로다. 숨기거나 빼지 않는다.
- 스타일·`layoutStyle` prop은 없다. 행 모양은 `children`이 소유한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 표시 방식 | 행 아래 버튼을 항상 표시(`role="group"`) | 스와이프로 드러냄 + `actionsLabel` 버튼으로 펼침 |
| 필수 prop | `label`·`actions`·`onAction`·`onError` | 더해 `rowId`·`openRowId`·`onOpenRowChange`·`actionsLabel` |
| reduced motion | 해당 없음 | 스와이프를 끄고 버튼을 펼쳐 보여 줌 |
| RTL | 해당 없음 | 행동을 왼쪽에서 드러냄 |
| 백그라운드 전환 | 해당 없음 | 열린 행을 닫음 |

## 함정

- FlashList처럼 행 뷰를 재활용하는 목록에서도 `rowId`가 바뀌면 진행 중 표시와 펼친 메뉴가 초기화된다.
  `rowId`는 데이터의 안정된 id로 넘긴다.
