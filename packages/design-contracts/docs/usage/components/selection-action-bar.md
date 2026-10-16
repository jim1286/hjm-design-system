# SelectionActionBar

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [목록 편집과 복구 계약](../../collection-editing.md), `src/collection-editing.ts`의 `snapshotSelection`·`assertDistinctIds`, 양 renderer `src/collection-editing.tsx`
- 스토리북: `배포/구성/선택과 필터/선택 항목 묶음 작업`

## 언제 쓰나

목록에서 여러 항목을 고른 뒤 보관·삭제 같은 같은 행동을 한 번에 실행하고, 방금 확정된 작업만 되돌릴 때 쓴다.
선택 개수 요약, 묶음 행동 버튼, 선택 해제, 작업별 복구 버튼을 한 묶음으로 보여 준다. 실행 시점의 선택은 고정된 사본으로 넘긴다.
묶음 사용 기준은 [목록 편집과 복구](../compositions/collection-editing.md), 복구 흐름은 [보관과 실행 취소](../compositions/action-recovery-undo.md)다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 항목 하나의 행동 | 행 안 [Button](button.md)·[SwipeActions](swipe-actions.md) |
| 선택 항목 검토와 수정 | [ListRow](list-row.md) 목록 + 제품 확인 흐름 |
| 실행 직후 일시 안내 | [Toast](toast.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `SelectionActionBar` | 선택 요약·묶음 행동·해제·복구 | `@hjmds/react/collection-editing` | `@hjmds/react-native/collection-editing` |

루트 barrel에는 없다. `SelectionAction` 타입은 `@hjmds/design-contracts/collection-editing`에 있다.

## 최소 사용 예

```tsx
// Web
import { SelectionActionBar } from "@hjmds/react/collection-editing";

<SelectionActionBar selectedIds={selected} selectionLabel={count => t("selection.count", { count })}
  clearLabel={t("selection.clear")} onClear={() => setSelected([])}
  actions={[{ id: "archive", label: t("selection.archive") }]} errorLabel={t("selection.failed")}
  onAction={async (actionId, ids) => { await archive(ids); setSelected([]); setLastArchived(ids); }}
  {...(lastArchived ? { recovery: { label: t("selection.undo", { count: lastArchived.length }), onUndo: () => restore(lastArchived) } } : {})} />
```

```tsx
// Native
import { SelectionActionBar } from "@hjmds/react-native/collection-editing";

<SelectionActionBar selectedIds={selected} selectionLabel={count => t("selection.count", { count })}
  clearLabel={t("selection.clear")} onClear={() => setSelected([])}
  actions={actions} errorLabel={t("selection.failed")} onAction={runConfirmed} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `selectedIds` | `string[]` | 필수 | 비어 있거나 겹치는 id는 `TypeError` |
| `selectionLabel` | `(count) => string` | 필수 | 요약 문구이자 Web group 이름 |
| `clearLabel` / `onClear` | `string` / `() => void` | 필수 | 선택 해제 |
| `actions` | `{ id, label, destructive? }[]` | 필수 | `destructive`면 `tone="danger"`, 아니면 `secondary`. id 중복은 `TypeError` |
| `onAction` | `(actionId, selectedIds) => void \| Promise<void>` | 필수 | 실행 시점 선택의 고정 사본을 받는다. reject하면 실패 표시 |
| `errorLabel` | `string` | 필수 | 실패 문구 |
| `recovery` | `{ label, onUndo() }` | 없음 | 제품이 확정한 그 작업만 되돌리는 버튼 |
| `disabled` | `boolean` | `false` | 모든 행동 잠금 |

선택이 없고 `recovery`도 없으며 진행·실패 상태가 아니면 아무것도 렌더하지 않는다(`null`).

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Button 기본 크기 | 양 renderer `SelectionActionBar` |
| 간격 | 요약·버튼 줄·실패 문구 사이 `Stack gap="sm"`(12), 버튼 사이 `sm` | 같은 구현 |
| 순서·정렬 | 선택 개수 요약 → [묶음 행동…] [선택 해제](ghost) [복구](ghost) → 실패 문구(가운데) | 렌더 순서 |
| 고정·스크롤 | 자체 고정 없음. 대상 목록 바로 아래 또는 제품 footer 슬롯에 둔다 | [목록 편집과 복구](../compositions/collection-editing.md) |
| 좁은 폭·큰 글자 | 버튼 줄은 `wrap`으로 다음 줄로 넘어간다 | `Stack axis="inline" wrap` |

## 꼭 지킬 것

- `recovery.onUndo`는 방금 확정된 작업만 되돌린다. 컬렉션 전체를 이전 상태로 복원하지 않는다.
- 성공 뒤 선택 해제·목록 갱신·복구 대상 보관은 제품이 한다. 이 구성은 선택을 바꾸지 않는다.
- 위험 행동은 `destructive: true`로 표시하고, 필요한 확인 대화상자는 제품이 `onAction` 안에서 연다.

## 상태와 상호작용

실행한 버튼만 로딩이 되고 다른 행동과 선택 해제는 잠긴다. 선택이 0개면 묶음 행동과 해제가 비활성이다(복구는 남는다).
요약은 Web `role="status"`, Native `accessibilityLiveRegion="polite"`로 개수 변화를 알린다. 실패 문구는 Web `role="alert"`, Native assertive live region(iOS는 `announceForAccessibility`)이다.
