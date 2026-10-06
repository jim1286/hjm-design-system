# CommandPalette 사용 지침

적용: `@hjmds/react` 1.12.1(Web 전용) · 검토일: 2026-10-06 ·
계약: [CommandPalette contract](../command-palette.md), recipe `commandPaletteRecipe`(`src/command-palette.ts`)

## 언제 쓰나

⌘K 스타일로 앱 전체의 **행동**을 검색해 실행하는 모달에 쓴다. 결과는 값이 아니라 행동이며, 실행하면
팔레트는 항상 닫힌다. 최근 항목·명령·검색 결과를 `sections`로 한 목록에 섞을 수 있다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 검색해서 값을 고르고 필드에 남김 | [Combobox](combobox.md) |
| 버튼에 붙은 행동 목록 | [Menu](menu.md) |
| 우클릭·길게 누르기 메뉴 | [ContextMenu](context-menu.md) |
| 화면 안의 검색 입력 | [SearchField](search-field.md), [SearchScreen](search-screen.md) |
| 확인·입력이 필요한 모달 | [Dialog](dialog.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `CommandPalette` | `@hjmds/react`, `/command-palette` | 없음 | 기본 |

Native renderer는 없다(계약이 Web 전용 모달로 정의한다).

## 최소 사용 예

```tsx
// Web
import { CommandPalette } from "@hjmds/react/command-palette";

<CommandPalette
  descriptor={{ accessibilityLabel: t("palette.label"), searchPlaceholder: t("palette.placeholder") }}
  source={{ sections: [
    { id: "recent", label: t("palette.recent"), items: recentItems },
    { id: "commands", label: t("palette.commands"), items: filterCommands(commands, query) },
  ] }}
  query={query}
  onQueryChange={setQuery}
  onActivate={runCommand}
  onActivateAfterDismiss={id => { if (id === "new-post") openComposerDialog(); }}
  open={open}
  onOpenChange={next => { setOpen(next); if (!next) setQuery(""); }}
/>
```

항목은 `{ id, label, textValue, description?, shortcut?, disabled?, tone? }`이다. 항목의 label·description·shortcut과
섹션 label은 제품 i18n에서 만든다.

## 축과 기본값

- 열림: controlled(`open` + `onOpenChange`) 또는 uncontrolled(`defaultOpen`, 기본 `false`). `trigger`(element)를 주면
  그 요소가 팔레트를 열고(`reason: "trigger"`), 닫힌 뒤 포커스 복귀 대상이 된다.
- `dismissPolicy`: `dismissible`·`outsideDismiss`·`escapeDismiss` 모두 기본 `true`. 실행(`activation`)으로 닫히는
  것은 어떤 정책으로도 막을 수 없다.
- `onOpenChange`의 `details.reason`: `trigger` · `outside` · `escape` · `activation` 등.
- `queryState.asyncState`: `idle`(기본) · `loading` · `loadingMore` · `empty` · `error`, 각 상태의 지역화 `message`를
  목록 위에 한 번 알린다(`error`는 alert, 나머지는 status).
- 크기: 최대 폭 560px, 최대 높이 420px(recipe). `renderLeading(id)`로 행 앞 아이콘을 넣는다.

## 꼭 지킬 것

- `descriptor`의 두 문구는 필수이고 빈 문자열이면 `TypeError`가 난다.
- **renderer는 `query`로 `source`를 거르지 않는다.** 필터링·정렬·서버 검색은 제품이 해서 결과 `source`를 넘기고,
  결과가 없을 때는 `queryState.asyncState`에 `{ status: "empty", message }`를 준다. 빈 목록만 넘기면 아무 안내도 없다.
- 전역 단축키(⌘K)와 그 범위는 제품이 정하고 바인딩한다. HJM은 키를 듣지 않는다.
- 다른 오버레이를 여는 명령은 `onActivateAfterDismiss`에서 연다. `onActivate`에서 열면 두 모달이 겹친다.
- 배치 prop은 `className`뿐이다. 색·크기를 덮지 않는다.

## 함정

- 질의가 바뀌거나 `source`가 바뀌면 활성 행이 첫 활성 항목으로 돌아간다. `source`를 렌더마다 새로 만들면 마우스로
  옮긴 활성 행이 계속 초기화되므로 `useMemo`로 고정한다.
- 닫을 때 `query`를 지우는 것은 제품 몫이다. 비우지 않으면 다음에 열 때 이전 검색어가 남는다.
