# Sidebar

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-23
- 근거: [Sidebar](../../sidebar.md), `src/sidebar.ts`(`sidebarRecipe`, `validateSidebarDescriptor`)
- 스토리북: `배포/컴포넌트/탐색/사이드바`, `배포/컴포넌트/탐색/사이드바 전환`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Sidebar` | 기본 | `@hjmds/react`, `/sidebar` | — |
| `SidebarLinkRenderProps` · `SidebarSize` | 타입 — `renderLink` 인자, 폭 단계 | `@hjmds/react`, `/sidebar` | — |

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

Next.js App Router 같은 client router에서는 `renderLink`로 항목 링크를 넘긴다(개발 소스·미게시). 함수 prop이라
Sidebar를 그리는 제품 컴포넌트는 Client Component여야 한다(현재 경로로 `currentId`를 고르는 셸이 보통 이미 그렇다).

```tsx
// Web (Next.js App Router, "use client" 파일)
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@hjmds/react/sidebar";
import type { SidebarItemDescriptor } from "@hjmds/design-contracts/components/sidebar";

export function ProductNav({ items }: { items: readonly SidebarItemDescriptor<RouteId>[] }) {
  const pathname = usePathname();
  return (
    <Sidebar
      size="compact"
      descriptor={{ accessibilityLabel: t("web.nav"), currentId: routeIdOf(pathname), groups: [{ id: "main", items }] }}
      renderLink={(props) => <NextLink {...props} />}
      renderIcon={(item) => <NavGlyph id={item.id} />}
    />
  );
}
```

Native: 없음. 폰은 BottomNavigation, 태블릿 split view는 navigator가 맡는다.

## 축과 기본값

타입 `SidebarDescriptor`는 `@hjmds/design-contracts/components/sidebar`에 있다.

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor` | `{ accessibilityLabel: string; currentId: Id \| null; groups: readonly { id, label?, items }[] }` | 필수 | 그룹 `label`이 없으면 구분선만 있는 묶음 |
| 항목 | `{ id, label: string, destination?: { kind: "internal" \| "external"; href: string }, badgeCount?: number, disabled? }` | — | `destination`이 없으면 `href` 없는 `<a>`(아래 함정) |
| `collapsed` · `defaultCollapsed` | `boolean` | `false` | 접힘 폭 72, 펼침은 `size` |
| `size` | `regular` 260 · `compact` 220 | `regular` | 펼친 폭 단계(`sidebarRecipe.sizes`). 그룹 없이 짧은 라벨 3~5개인 셸 rail은 `compact`. 개발 소스·미게시 |
| `onCollapsedChange` | `(collapsed: boolean) => void` | — | 접기 버튼을 누를 때 |
| `collapseLabels` | `{ collapse: string; expand: string }` | — | 줄 때만 접기 버튼을 그린다 |
| `appearance` | `standard` · `bounce` · `hook` · `proximity` | `standard` | 장식만 바뀌고 링크 영역·키보드 순서는 같다. provider의 동작 줄이기에서는 움직임이 꺼지고, provider가 없으면 움직임 없이 그린다 |
| `onNavigate` | `(id: Id) => void` | — | 항목을 누를 때 알림. 이동은 `href` 또는 `renderLink`의 router가 한다 |
| `renderLink` | `(props: SidebarLinkRenderProps) => ReactElement` | 일반 `<a>` | client router 어댑터. props(`href`·`className`·`aria-current`·접힘 `aria-label`·`onClick`·`children` 등)를 모두 자기 링크에 펼친다. 비활성·`destination` 없는 항목은 어댑터를 거치지 않는다. `BottomNavigation.renderLink`와 같은 계약. 개발 소스·미게시 |
| `renderIcon` | `(item) => ReactNode` | — | 접힌 레일에 필수 |
| `renderBadge` | `(count: number, item) => ReactNode` | 숫자 배지 | — |
| `header` | `ReactNode` | — | 그룹 위 제품 칸(브랜드 표식·주 행동). 2026-10-30 다에리·번뚝 데스크탑 셸이 HJM 밖에 따로 그리던 자리 |
| `footer` | `ReactNode` | — | 맨 아래에 붙는 제품 칸(설정·언어). 그룹이 짧아도 바닥에 선다(위 경계선 1px) |
| `className` · `layoutStyle` | 문자열 · 배치 전용 style 객체 | — | 루트 배치만. 폭·색은 recipe 소유 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭 단계: 펼침 `regular` 260 · `compact` 220, 접힘 72. 높이는 부모를 채운다(`min-block-size: 100%`). 항목 최소 높이 44(`control.minTouchTarget`), radius `radius.md` 12. 접기 버튼 44×44 | `sidebarRecipe.sizes`·`widths`·`itemMinHeight`·`itemRadius`, `.hjm-sidebar__toggle` |
| 간격 | 안쪽 위아래 `spacing.sm` 12 · 좌우 `spacing.xs` 8. 그룹 사이 `spacing.md` 16, 항목 사이 `spacing.xxs` 4. 항목 좌우 `spacing.sm` 12, 아이콘·라벨·배지 사이 `spacing.sm` 12. 그룹 제목 좌우 `spacing.sm` 12 · 위아래 `spacing.xxs` 4 | `sidebarRecipe`, `collectionItemContract` |
| 순서·정렬 | 앱 셸 시작 쪽(LTR 왼쪽) 세로 열. 셸의 열 배치·반응형 전환은 [Layout](layout.md)이 맡는다. 접기 버튼(`collapseLabels`를 줄 때만)이 맨 위 끝 쪽, 그 아래 그룹. 항목은 [아이콘][라벨][배지], 라벨이 남은 폭을 채운다. 끝 쪽 경계선 1px | `.hjm-sidebar`, `src/sidebar.tsx` |
| 고정·스크롤 | 항목이 넘치면 Sidebar 자체가 스크롤된다(`overflow: auto`) | `.hjm-sidebar` |
| 좁은 폭·큰 글자 | 긴 라벨·그룹 제목은 폭을 늘리지 않고 줄을 바꾼다. 큰 글자에서도 폭은 그대로, 항목 높이가 늘어난다. 접힘은 라벨·그룹 제목을 숨기고 아이콘 가운데(좌우 `spacing.xxs` 4), 배지는 아이콘 위 끝 쪽에 겹친다 | `.hjm-sidebar[data-collapsed]` |

```text
펼침 260                    접힘 72
┌──────────────────┐        ┌──────┐
│             [«]  │ ← 접기 │ [»]  │
│ 작업  (그룹 제목) │        │      │
│ ▣ 주문        3  │ ← 44   │ ▣³   │
│ ▣ 보고서         │        │ ▣    │
│ ↕ (넘치면 스크롤)│        │      │
└──────────────────┘        └──────┘
```

## 꼭 지킬 것

- 그룹·항목이 비었거나 id가 비거나 중복이거나, `badgeCount`가 음수·소수이거나, `currentId`가 항목에 없으면
  렌더 중 `TypeError`/`RangeError`를 던진다. 라우트 → `currentId` 대응은 제품이 유지한다.
- 현재 위치는 `currentId`(→ `aria-current="page"`)로만 표시한다. 활성 색을 `className`으로 칠하지 않는다.
- 접기를 쓰면 `renderIcon`을 반드시 준다. 접힌 레일은 라벨을 숨기므로 아이콘이 없으면 쓸 수 없다.
- 라벨·그룹 제목·`collapseLabels`는 i18n 키로 넣는다. 긴 문구는 자르지 않고 줄바꿈된다.
- 아이콘·배지 그림은 제품 소유, 폭·높이·간격·색은 `sidebarRecipe` 소유다.

## 함정

- `renderLink` 없이 항목은 `href`가 있는 일반 `<a>`이고 클릭 시 기본 이동을 막지 않는다. `onNavigate`는 알림 콜백이지
  이동을 대신하지 않는다. client router 전환(Next.js 등)은 `renderLink`로 연결하고, `onNavigate`에서
  `preventDefault`로 이동을 가로채지 않는다.
- 어댑터가 props 일부만 넘기면 현재 위치·접힘 이름·비활성 차단이 빠진다. `{...props}`를 그대로 펼친다.
- `destination`을 빼면 `href` 없는 `<a>`가 되어 키보드 초점을 받지 못한다. 이동 항목에는 `destination`을 둔다.

### 프로필 모서리·제목 소비

2026-10-07 소비 감사에서 Web 항목의 숫자 recipe 모서리가 프로필을 우회했다. 기존 `radius.md` 역할을 가까운 Provider의 CSS 변수로 읽고 변수 없는 독립 사용은 recipe 12를 유지한다. 레일 폭·링크·현재 위치·접기·초점과 Web 전용 범위는 바꾸지 않는다.

프로필 연결은 1.16.0 변경이며, 기본 배포 계약과 실제 Native 기기 검증은 구분한다.
