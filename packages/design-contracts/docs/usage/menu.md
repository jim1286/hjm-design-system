# Menu 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Dropdown 판정](../dropdown.md), [Popover 경계](../popover.md), recipe `menuRecipe`(`src/component-recipes.ts`)

## 언제 쓰나

트리거 버튼을 누르면 뜨는 **항목 목록**에 쓴다. 더보기(⋯) 행동, 정렬 기준 고르기,
보기 옵션 켜고 끄기처럼 안정적인 id를 가진 action·단일 선택·다중 선택 목록이 여기에 속한다.
트리거·떠 있는 표면·항목 목록을 Menu 하나가 소유하므로 별도 Dropdown은 없다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 목록이 아닌 임의 콘텐츠(작은 폼, 링크 섞인 본문) | [Popover](popover.md) (Web) |
| 우클릭·키보드 메뉴 키로 포인터 위치에서 여는 메뉴 | [ContextMenu](context-menu.md) |
| 데스크톱 앱의 파일·편집·보기 가로 막대 | [Menubar](menubar.md) (Web) |
| 폼 값 하나를 고르는 입력 | [Select](select.md), [Combobox](combobox.md) |
| 하단에서 올라오는 큰 선택 화면 | [Sheet](sheet.md) |
| 명령 검색 | [CommandPalette](command-palette.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Menu` | `@hjmds/react`, `/overlays` | `@hjmds/react-native`, `/navigation`, `/top-bar` | 기본 |
| `MorphingMenu` | `/menu-morph` | 없음 | action 전용 morph 표현(optional peer `bloom-menu` 0.1.0 필요) |

## 최소 사용 예

```tsx
// Web
import { IconButton } from "@hjmds/react/actions";
import { Menu } from "@hjmds/react/overlays";

<Menu
  label={t("post.more")}
  trigger={<IconButton label={t("post.more")}>⋯</IconButton>}
  items={[
    { id: "edit", label: t("post.edit") },
    { id: "delete", label: t("post.delete"), tone: "danger" },
  ]}
  onActionAfterDismiss={(id) => handle(id)}
/>
```

```tsx
// Native
import { Menu } from "@hjmds/react-native/navigation";

<Menu
  triggerLabel={t("post.more")}
  dismissLabel={t("common.close")}
  items={[
    { id: "edit", label: t("post.edit") },
    { id: "delete", label: t("post.delete"), tone: "danger" },
  ]}
  onActionAfterDismiss={(id) => handle(id)}
/>
```

## 축과 기본값

- 항목 공급은 `items` 또는 `sections` 중 정확히 하나(Native는 `source`도 가능). 섹션마다 `label` 또는 `accessibilityLabel`이 필요하다.
- 항목 `tone`: `neutral`(기본) · `danger`. `density`: `comfortable`(recipe 기본) · `compact`. Web은 생략하면 Provider density를 따른다.
- `asyncState`: `idle`(기본) · `loading` · `loadingMore` · `empty` · `error` + 지역화 `message`.
- Web `align`: `start`(기본) · `end`, RTL에서 자동 반전.

## 꼭 지킬 것

- 항목 id는 비어 있지 않고 유일해야 하며, 활성 항목이 하나 이상 있어야 한다. 어기면 렌더 중 던진다.
- Web에서 `label`이 문자열이 아닌 항목은 typeahead용 `textValue`를 준다. 없으면 던진다.
- 다른 모달·시트·화면 이동을 여는 action은 `onActionAfterDismiss`로 실행한다. 이 콜백은 메뉴가 실제로 닫힌 뒤(Native는 Modal teardown 뒤)에만 실행되므로 두 표면이 겹치지 않는다.
- 항목 문구·아이콘(제품 소유)은 i18n 키와 제품 아이콘으로 넣고, 색은 `tone`으로만 바꾼다.
- `MorphingMenu`는 action 전용이다. 선택·async가 필요하면 `Menu`를 쓴다. reduce-motion·RTL에서는 스스로 `Menu`로 돌아간다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 트리거 | `trigger`(element 필수), `label`은 메뉴 이름 | `triggerLabel` 필수, `trigger`/`renderTrigger` 선택 |
| 닫기 버튼 이름 | 없음 | `dismissLabel` 필수 |
| 선택 | `selectionMode="single"\|"multiple"` + `value`/`onValueChange` | `selection={{ mode, selectedKey(s), onSelectionChange }}` |
| 선택 후 실행 | 없음 | `onSelectionAfterDismiss` |
| 상태 | `disabled` | `disabled`, `readOnly`(+`readOnlyLabel`), `busy`, `onRetry`/`retryLabel` |
| 표면 | 트리거에 붙는 portal(`portalContainer`) | `Modal` |
| 항목 label | `ReactNode`(+`textValue`) | `string` |
| 배치 | `className` | `style`(바깥 View, 배치용만) |
