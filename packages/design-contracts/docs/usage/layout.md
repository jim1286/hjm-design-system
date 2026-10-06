# Layout 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Layout](../layout.md), recipe `layoutRecipe`(`src/layout.ts`)

## 언제 쓰나

앱의 상시 골격(header · sidebar · main · footer)을 한 번 세울 때 쓴다. Web은 실제 landmark
(`header`·`nav`/`aside`·`main`·`footer`)와 skip link를 만들고, Native는 같은 순서의 영역만 만든다.
Layout은 영역이 **있다는 사실**만 알고 그 안의 내용과 상태는 모른다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 한 화면의 제목·상태·하단 영역 | [ScreenLayout](screen-layout.md) |
| 헤더 막대의 내용 | [TopBar](top-bar.md) (header 슬롯에 넣는다) |
| 하단 탭 내비게이션 | [BottomNavigation](bottom-navigation.md) (footer 슬롯에 넣는다) |
| 사이드 내비게이션 내용 | [Sidebar](sidebar.md) (sidebar 슬롯에 넣는다) |
| 여닫는 패널의 열림 상태 | [SidePanel](side-panel.md) (`renderOverlay`에서 합성) |
| main 안의 배치 | [Stack](stack.md), [Grid](grid.md), [Container](container.md) |
| 사이드바 크기 조절 | [Splitter](splitter.md) |
| 본문 바로가기 링크만 | [SkipNav](skip-nav.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Layout` | `@hjmds/react`, `/layout` | `@hjmds/react-native`, `/primitives` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Layout } from "@hjmds/react/layout";

<Layout
  header={<TopBar /* ... */ />}
  skipLinkLabel={t("a11y.skipToContent")}
  sidebar={{ role: "navigation", mode: "persistent", label: t("nav.main"), children: <Sidebar /* ... */ /> }}
>
  {page}
</Layout>
```

```tsx
// Native
import { Layout } from "@hjmds/react-native/primitives";

<Layout footer={<BottomNavigation /* ... */ />}>
  {screen}
</Layout>
```

## 축과 기본값

- `sidebar.role`: `navigation`(주 내비게이션) · `complementary`(보조 콘텐츠). 내용의 의미다.
- `sidebar.mode`: `persistent`(항상 보임) · `overlay`(여닫음). 표시 방식이며 role과 독립이다.
- `overlay`는 `renderOverlay(sidebarLandmark)`가 필수다. 열림·닫힘은 그 안의 SidePanel 등이 소유한다.
- Web persistent 사이드바 폭은 recipe 280. main 최대 폭·좌우 여백은 foundations의 `contentMaxWidth`·`pagePadding.regular`.
- Web skip link는 키보드 포커스가 닿을 때만 보인다.

## 꼭 지킬 것

- Web에서 `header`나 `sidebar`가 있으면 `skipLinkLabel`(현지화)이 필수다. 없으면 `TypeError`.
- 화면마다 Layout을 다시 세우지 않는다. `main` landmark는 하나여야 한다.
- 어느 화면 폭에서 persistent↔overlay를 바꿀지는 제품이 정한다. Layout은 전환 규칙을 갖지 않는다.
- 사이드바 내용·헤더 내용·푸터 내용은 각 컴포넌트가 소유한다. Layout에 상태를 다시 만들지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 영역 의미 | 실제 landmark role | 없음(순서만, 사이드바는 `accessibilityLabel`) |
| skip link | 렌더링(`skipLinkLabel`, `skipLinkProps`) | 없음 |
| 영역 props | `headerProps`·`mainProps`·`footerProps`, `sidebar.landmarkProps`/`landmarkRef`, `mainId` | `headerProps`·`mainProps`·`footerProps`, `sidebar.containerProps` |
| persistent 사이드바 배치 | 셸 grid 안 옆 칸 | header 아래·main 위 세로 순서 |

## 함정

- [계약 문서](../layout.md)는 Native `skipLinkLabel`이 deprecated로 남아 있다고 적지만 1.12.1 Native `LayoutProps`에는 없다.
- Native persistent 사이드바는 옆으로 놓이지 않고 세로로 쌓인다. 넓은 화면 2단 배치가 필요하면 제품이 main 안에서 구성한다.
