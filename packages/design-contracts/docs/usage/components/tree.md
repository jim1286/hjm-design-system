# Tree

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Tree](../../tree.md), 체크 집계 [TreeSelect](../../tree-select.md), `src/tree.ts`(`treeRecipe`)
- 스토리북: `배포/컴포넌트/데이터 표시/트리 목록`

## 언제 쓰나

깊이가 정해지지 않은 계층 데이터를 펼치고 접으며 탐색하고, 그 안에서 하나 또는 여럿을 고를 때
쓴다. 폴더 구조, 조직도, 카테고리 트리가 여기에 속한다. 노드마다 체크(부모 집계 포함)도 할 수 있다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 단계가 고정된 2단(구역 → 항목) 목록 | [List](list.md), [Menu](menu.md) |
| 접고 펴는 내용 구역 | [Accordion](accordion.md), [Collapsible](collapsible.md) |
| 평평한 목록의 다중 체크 | [CheckboxGroup](checkbox-group.md) |
| 두 목록 사이 이동 | [TransferList](transfer-list.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Tree` | 기본 | `@hjmds/react`, `/tree` | — |

노드 타입은 `@hjmds/design-contracts/components/tree`, 체크 helper(`resolveTreeCheckedStates`,
`toggleTreeCheckedSelection`)는 `@hjmds/design-contracts/components/tree-select`에 있다.

## 최소 사용 예

```tsx
// Web
import { Tree } from "@hjmds/react/tree";

<Tree
  label={t("files.tree")}
  nodes={[{ id: "docs", label: t("files.docs"), textValue: "docs", children: [
    { id: "readme", label: "README", textValue: "README" },
  ] }]}
  composeAccessibleName={({ depth, position, siblingCount, label, hasChildren, expanded }) =>
    t("files.node", { depth, position, siblingCount, label, state: hasChildren ? (expanded ? "open" : "closed") : "leaf" })}
  expandedKeys={expanded}
  onExpandedKeysChange={setExpanded}
  selection={{ mode: "single", selectedKey: selected, onSelectionChange: setSelected }}
/>
```

Native: 없음.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `nodes` | `readonly { id, label, textValue, description?, disabled?, children? }[]` | — (필수) | `children`은 없거나 하나 이상 |
| `composeAccessibleName` | `(info: { depth, position, siblingCount, label, hasChildren, expanded }) => string` | — (필수) | `depth`·`position`은 1부터 |
| `expandedKeys` + `onExpandedKeysChange` | `ReadonlySet<Id>`, `(keys: ReadonlySet<Id>) => void` | — | 제어 펼침. 사라졌거나 자식이 없는 노드의 펼침 키는 버려진다 |
| `defaultExpandedKeys` | `ReadonlySet<Id>` | 빈 집합 | 비제어 펼침 |
| `selection` | `{ mode: "none" }` · `{ mode: "single", selectedKey \| defaultSelectedKey, onSelectionChange?: (key: Id \| null) => void, disallowEmptySelection? }` · `{ mode: "multiple", selectedKeys \| defaultSelectedKeys, onSelectionChange?: (keys: ReadonlySet<Id>) => void }` | 생략하면 선택 없음 | `selectedKey(s)`를 주면 제어(이때 `onSelectionChange` 필수), `defaultSelectedKey(s)`만 주면 비제어로 내부 상태에 보관된다. `single`에서 `disallowEmptySelection`을 주면 같은 노드를 다시 눌러도 해제되지 않는다 |
| `checkedStates` + `onCheckedToggle` | `ReadonlyMap<Id, true \| false \| "mixed">`, `(id: Id) => void` | — | 함께 주면 행 클릭·Enter·Space가 선택 대신 체크. 집계는 `resolveTreeCheckedStates`, 토글은 `toggleTreeCheckedSelection` |
| `asyncState` | `{ status: "idle" }` 또는 `{ status: "loading" \| "loadingMore" \| "empty" \| "error", message: string }` | `{ status: "idle" }` | `idle` 밖의 상태는 `message` 필수 |
| `renderToggle` | `(state: { expanded: boolean }) => ReactNode` | `▸`/`▾` | 펼침 표시 글리프를 제품이 그린다(장식) |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 루트 배치 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 행 최소 높이 `control.minTouchTarget` 44 | `treeRecipe.node`(`collectionItemContract`), `.hjm-tree__node` |
| 간격 | 들여쓰기는 깊이 1단계마다 `spacing.lg` 20씩 늘어난다(최상위 0) | `treeRecipe.indentPerLevel`, `.hjm-tree__indent` |
| 순서·정렬 | 행은 위→아래 한 열. 행 안 순서는 들여쓰기 → 펼침 표시 → (체크) → 라벨·설명 | `react/src/tree.tsx` |
| 고정·스크롤 | 넓은 Web 화면의 옆 열(파일 트리·카테고리 탐색)이나 본문 패널에 둔다. 트리 자체는 높이 상한·스크롤이 없어 담는 열·패널이 세로 스크롤을 맡는다. 폭을 사용자가 바꾸게 하려면 [Splitter](splitter.md) 한쪽에 넣는다 | `.hjm-tree` |
| 좁은 폭·큰 글자 | 깊은 트리는 좁은 폭에서 라벨 폭이 줄어 줄바꿈된다. 깊이가 깊고 폭이 좁은 화면이면 단계별 목록 이동을 검토한다 | `.hjm-tree__label`(overflow-wrap) |

## 꼭 지킬 것

- `label`과 `composeAccessibleName`은 필수다. 깊이·위치·펼침을 읽는 순서는 제품 i18n이 정한다.
- 노드의 `textValue`는 필수이고 typeahead 대상이다. `children`은 없거나 하나 이상이다(빈 배열 금지).
  id는 트리 전체에서 유일해야 한다.
- 행 안에 버튼·링크를 넣지 않는다. 노드 하나가 유일한 포커스 대상이다(roving tab stop).
- 배치는 `layoutStyle`로 한다. `className`으로 들여쓰기·행 모양을 덮지 않는다(recipe 소유).

## 함정

- 비제어 선택(`defaultSelectedKey(s)`)은 첫 렌더의 값만 쓴다. 나중에 default 값을 바꿔도 표시가 따라가지 않는다.
  외부에서 선택을 바꿔야 하면 `selectedKey(s)` 제어형으로 쓴다(제어형은 `null`도 제어 값이다).
- `checkedStates`만 주고 `onCheckedToggle`을 빼면 체크 표시는 보이지만 클릭은 선택·펼침으로 동작한다.
