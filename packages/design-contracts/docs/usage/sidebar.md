# Sidebar 사용 지침

적용: `@hjmds/react` 1.12.1 (Web 전용) · 검토일: 2026-10-06 ·
계약: [Sidebar](../sidebar.md), recipe `sidebarRecipe`·검증 `validateSidebarDescriptor`(`src/sidebar.ts`)

## 언제 쓰나

데스크톱 Web의 세로 내비게이션에 쓴다. 관리자 화면, 문서, 작업 도구처럼 넓은 화면 왼쪽에
그룹이 있는 긴 목적지 목록을 두고, 필요하면 아이콘 레일로 접는다. 항목은 링크다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 모바일·Native의 3~5개 최상위 목적지 | [BottomNavigation](bottom-navigation.md) |
| 앱 셸의 자리(폭·순서·반응형) | [Layout](layout.md) — Sidebar는 그 자리에 넣는 내용 |
| 열고 닫는 보조 패널(필터·상세) | [SidePanel](side-panel.md) |
| 상단 가로 메뉴 | [Menubar](menubar.md), [TopBar](top-bar.md) |
| 같은 화면 안 패널 전환 | [Tabs](tabs.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Sidebar` | `@hjmds/react`, `/sidebar` | 없음 | 기본 |

## 최소 사용 예

```tsx
// Web
import { Sidebar } from "@hjmds/react/sidebar";

<Sidebar
  descriptor={{
    accessibilityLabel: t("nav.main"),
    currentId: currentRouteId,
    groups: [
      { id: "work", label: t("nav.group.work"), items: [
        { id: "orders", label: t("nav.orders"), destination: { kind: "internal", href: "/orders" }, badgeCount: pending },
        { id: "reports", label: t("nav.reports"), destination: { kind: "internal", href: "/reports" } },
      ] },
    ],
  }}
  collapseLabels={{ collapse: t("nav.collapse"), expand: t("nav.expand") }}
  renderIcon={(item) => <NavGlyph id={item.id} />}
/>
```

Native 사용 예는 없다. 폰은 BottomNavigation, 태블릿 split view는 navigator가 맡는다.

## 축과 기본값

- `descriptor`(필수): `accessibilityLabel`, `currentId`(`null` 가능), `groups[{ id, label?, items[{ id, label, destination?, badgeCount?, disabled? }] }]`.
- `collapsed`/`defaultCollapsed`(기본 `false`)/`onCollapsedChange`. 접기 버튼은 `collapseLabels`를 줄 때만 그린다.
  접힘 폭 72, 펼침 260.
- `appearance`: `standard`(기본) · `bounce` · `hook` · `proximity`. 장식만 바뀌고 링크 영역·키보드 순서는 같다.
  provider의 동작 줄이기에서는 움직임이 꺼지고, provider가 없으면 움직임 없이 그린다.
- `renderIcon(item)`, `renderBadge(count, item)`(기본은 숫자), `onNavigate(id)`, `className`.

## 꼭 지킬 것

- 그룹·항목이 비었거나 id가 비거나 중복이거나, `badgeCount`가 음수·소수이거나, `currentId`가 항목에 없으면
  렌더 중 `TypeError`/`RangeError`를 던진다. 라우트 → `currentId` 대응은 제품이 유지한다.
- 현재 위치는 `currentId`(→ `aria-current="page"`)로만 표시한다. 활성 색을 `className`으로 칠하지 않는다.
- 접기를 쓰면 `renderIcon`을 반드시 준다. 접힌 레일은 라벨을 숨기므로 아이콘이 없으면 쓸 수 없다.
- 라벨·그룹 제목·`collapseLabels`는 i18n 키로 넣는다. 긴 문구는 자르지 않고 줄바꿈된다.
- 아이콘·배지 그림은 제품 소유, 폭·높이·간격·색은 `sidebarRecipe` 소유다.

## 함정

- 항목은 `href`가 있는 일반 `<a>`이고 클릭 시 기본 이동을 막지 않는다. `onNavigate`는 알림 콜백이지
  이동을 대신하지 않는다. client router 전환(Next.js 등)이 필요하면 제품 셸에서 동작을 확인한다.
- `destination`을 빼면 `href` 없는 `<a>`가 되어 키보드 초점을 받지 못한다. 이동 항목에는 `destination`을 둔다.
