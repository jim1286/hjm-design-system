# Menubar 사용 지침

적용: `@hjmds/react` 1.12.1 (Native 없음) · 검토일: 2026-10-06 ·
계약: [Menubar](../menubar.md)

## 언제 쓰나

데스크톱 Web 앱 상단에 항상 같은 자리에 있는 가로 메뉴 막대(파일·편집·보기)에 쓴다.
막대 전체가 tab stop 하나이고, 한 번에 메뉴 하나만 열리며, 열린 상태에서 ←/→로 옆 메뉴로 넘어간다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 버튼 하나에 붙는 action 목록 | [Menu](menu.md) |
| 포인터 위치에서 여는 메뉴 | [ContextMenu](context-menu.md) |
| 화면(페이지)을 바꾸는 상단 탐색 | [Tabs](tabs.md), [TopBar](top-bar.md) |
| 모바일·Native 앱 | 없음. 앱 바는 OS 소유이고 Native renderer가 없다 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Menubar` | `@hjmds/react`, `/menubar` | 없음 | 기본 |

## 최소 사용 예

```tsx
// Web
import { Menubar } from "@hjmds/react/menubar";

<Menubar
  descriptor={{
    accessibilityLabel: t("editor.menubar"),
    menus: [
      { id: "file", label: t("menu.file"), items: [
        { id: "save", label: t("menu.save"), textValue: t("menu.save"), shortcut: "⌘S" },
      ] },
      { id: "edit", label: t("menu.edit"), items: [
        { id: "undo", label: t("menu.undo"), textValue: t("menu.undo") },
      ] },
    ],
  }}
  onAction={(itemId, menuId) => run(menuId, itemId)}
/>
```

Native 예는 없다(renderer 없음).

## 축과 기본값

- 열린 메뉴: `openMenuId`/`onOpenMenuIdChange`(제어) 또는 `defaultOpenMenuId`(기본 `null`, 닫힘).
- 메뉴 `disabled`는 키보드 이동에서 건너뛴다. 항목은 Menu와 같은 `MenuItemDescriptor`(`tone`, `shortcut`, `disabled`)다.

## 꼭 지킬 것

- `descriptor.accessibilityLabel`, 각 메뉴 `id`·`label`은 비어 있으면 안 되고, 메뉴마다 항목이 하나 이상 있어야 한다. 어기면 던진다.
- 항목 `textValue`는 계약 타입상 필수다. 지역화한 문구를 그대로 넣는다.
- 메뉴 구성과 단축키 문구는 제품 소유다. 단축키 자체의 키 바인딩은 Menubar가 등록하지 않으므로 제품이 따로 연결한다.
- `className`은 배치에만 쓴다. 색·높이를 덮지 않는다.
