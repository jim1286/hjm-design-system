# Tree 사용 지침

적용: `@hjmds/react` 1.12.1(Native 없음) · 검토일: 2026-10-06 ·
계약: [Tree](../tree.md), 체크 집계 [TreeSelect](../tree-select.md), recipe `treeRecipe`(`src/tree.ts`)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Tree` | `@hjmds/react`, `/tree` | 없음 | 기본 |

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

Native renderer는 없다.

## 축과 기본값

- 펼침: `expandedKeys`+`onExpandedKeysChange` 또는 `defaultExpandedKeys`(기본 빈 집합).
  사라졌거나 자식이 없는 노드의 펼침 키는 버려진다.
- 선택 `selection`: `mode` `none` · `single` · `multiple`. 생략하면 선택이 없다.
  `single`에서 `disallowEmptySelection`을 주면 같은 노드를 다시 눌러도 해제되지 않는다.
- 체크: `checkedStates`(노드별 `true`·`false`·`"mixed"`)와 `onCheckedToggle`을 함께 주면 행 클릭·Enter·Space가
  선택 대신 체크가 된다. 집계는 `resolveTreeCheckedStates`, 토글은 `toggleTreeCheckedSelection`으로 계산한다.
- `asyncState`: `idle`(기본) · `loading` · `loadingMore` · `empty` · `error`, 마지막 넷은 `message` 필수.
- `renderToggle`: 펼침 표시 글리프를 제품이 그린다(장식). 없으면 `▸`/`▾`.

## 꼭 지킬 것

- `label`과 `composeAccessibleName`은 필수다. 깊이·위치·펼침을 읽는 순서는 제품 i18n이 정한다.
- 노드의 `textValue`는 필수이고 typeahead 대상이다. `children`은 없거나 하나 이상이다(빈 배열 금지).
  id는 트리 전체에서 유일해야 한다.
- 행 안에 버튼·링크를 넣지 않는다. 노드 하나가 유일한 포커스 대상이다(roving tab stop).
- 꾸밈 수단은 `className`뿐이다. 들여쓰기·행 모양은 recipe가 소유한다.

## 함정

- `selection`의 `defaultSelectedKey`/`defaultSelectedKeys`는 내부 상태로 보관되지 않는다. 렌더마다 그 값을
  다시 읽으므로 눌러도 표시가 바뀌지 않는다. 선택은 `selectedKey`/`selectedKeys` 제어형으로 쓴다.
- `checkedStates`만 주고 `onCheckedToggle`을 빼면 체크 표시는 보이지만 클릭은 선택·펼침으로 동작한다.
