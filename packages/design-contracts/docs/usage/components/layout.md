# Layout

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Layout](../../layout.md), recipe `layoutRecipe`(`src/layout.ts`)
- 스토리북: `배포/컴포넌트/레이아웃/화면 기본 구조`

## 언제 쓰나

앱의 상시 골격(header · sidebar · main · footer)을 한 번 세울 때 쓴다. Web은 실제 landmark
(`header`·`nav`/`aside`·`main`·`footer`)와 skip link를 만들고, Native는 같은 순서의 영역만 만든다.
Layout은 영역이 **있다는 사실**만 알고 그 안의 내용과 상태는 모른다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 헤더 막대의 내용 | [TopBar](top-bar.md) (header 슬롯에 넣는다) |
| 하단 탭 내비게이션 | [BottomNavigation](bottom-navigation.md) (footer 슬롯에 넣는다) |
| 사이드 내비게이션 내용 | [Sidebar](sidebar.md) (sidebar 슬롯에 넣는다) |
| 여닫는 패널의 열림 상태 | [SidePanel](side-panel.md) (`renderOverlay`에서 합성) |
| main 안의 배치 | [Stack](stack.md), [Grid](grid.md), [Container](container.md) |
| 사이드바 크기 조절 | [Splitter](splitter.md) |
| 본문 바로가기 링크만 | [SkipNav](skip-nav.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Layout` | 기본 | `@hjmds/react`, `/layout` | `@hjmds/react-native`, `/primitives` |

## 최소 사용 예

```tsx
// Web
import { Layout } from "@hjmds/react/layout";

<Layout
  header={topBar /* 제품이 만든 TopBar 요소 */}
  skipLinkLabel={t("a11y.skipToContent")}
  sidebar={{ role: "navigation", mode: "persistent", label: t("nav.main"), children: sidebarNav /* Sidebar 요소 */ }}
>
  {page}
</Layout>
```

```tsx
// Native
import { Layout } from "@hjmds/react-native/primitives";

<Layout footer={bottomNavigation /* 제품이 만든 BottomNavigation 요소 */}>
  {screen}
</Layout>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `sidebar.role` | `navigation` · `complementary` | — | `navigation`(주 내비게이션) · `complementary`(보조 콘텐츠). 내용의 의미다 |
| `sidebar.mode` | `persistent` · `overlay` | — | `persistent`(항상 보임) · `overlay`(여닫음). 표시 방식이며 role과 독립이다 |
| `sidebar.renderOverlay` | Web `(sidebarLandmark: ReactElement) => ReactNode` · Native `(sidebar: ReactNode) => ReactNode` | — | `mode: "overlay"`에서만, 그리고 필수다. 받은 landmark(사이드바 영역)를 SidePanel 등 안에 넣어 돌려준다. 열림·닫힘은 그 SidePanel이 소유한다 |
| `sidebar` 모양 | `{ role, mode, label, children, renderOverlay? }` + Web `landmarkProps`·`landmarkRef`, Native `containerProps` | — | `label`은 현지화 문자열 |
| `skipLinkLabel`(Web) | 현지화 문자열 | — | Web skip link는 키보드 포커스가 닿을 때만 보인다 |
| `mainId`(Web) | 공백 없는 문자열 | 자동 생성 | 비거나 공백이 있으면 `TypeError` |
| `layoutStyle`(Web) | 배치 key만 | — | 루트 배치. Native는 `layoutStyle`이 없고 `style`(layout primitive, 1.13 deprecated 제외 대상)만 받는다 |

- 이벤트 콜백은 없다. 사이드바 열림 상태는 `renderOverlay` 안의 SidePanel `open`·`onOpenChange`가 소유한다.

- Web persistent 사이드바 폭은 recipe 280. main 최대 폭·좌우 여백은 foundations의 `contentMaxWidth`·`pagePadding.regular`.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Web: persistent 사이드바 칸 폭 280(`layoutRecipe.sidebar.width`), main 최대 폭 1200(`layout.contentMaxWidth`). Native: 루트·main은 `flex: 1`이고 여백·폭 제한은 없다 | `design-contracts/src/layout.ts`(`layoutRecipe`), `react/src/layout.tsx`, `react-native/src/primitives.tsx`(Layout) |
| 간격 | Web: main 좌우 여백 `spacing.lg` 20(`layout.pagePadding.regular`). skip link는 화면 왼쪽 위에서 `spacing.sm` 12 떨어진다 | `design-contracts/src/foundations.ts`(`layout`), `react/src/styles.css`(`.hjm-layout__skip-link`) |
| 순서·정렬 | Web: 루트는 grid다. header·footer는 전체 폭, persistent 사이드바는 왼쪽(RTL에서는 오른쪽) 칸, main은 나머지 칸에서 가운데 정렬된다. Native: header → (persistent 사이드바) → main → footer 순서로 세로로 쌓인다 | `react/src/styles.css`(`.hjm-layout`), `react-native/src/primitives.tsx`(Layout) |
| 고정·스크롤 | 스크롤은 main 안의 내용이 소유한다. header·footer는 main 바깥이라 스크롤되지 않는다. Web skip link는 화면에 고정되고 키보드 포커스 때만 내려온다. overlay 사이드바는 그리드 칸을 차지하지 않고 `renderOverlay`의 SidePanel이 위를 덮는다 | `react/src/styles.css`(`.hjm-layout`), `react/src/layout.tsx` |
| 좁은 폭·큰 글자 | — | — |

```text
Web (persistent sidebar)                         Native
┌──────────────────────────────────────────┐     ┌──────────────────┐
│ header(TopBar) — 전체 폭                   │     │ header(TopBar)    │ ← 고정
├────────────┬─────────────────────────────┤     ├──────────────────┤
│ sidebar    │   main(최대 1200, 좌우 20)    │     │ main (flex 1)     │ ← 스크롤은 내용이 소유
│ 280        │                             │     │                  │
│            │                             │     ├──────────────────┤
├────────────┴─────────────────────────────┤     │ footer(BottomNav) │ ← 고정
│ footer — 전체 폭                           │     └──────────────────┘
└──────────────────────────────────────────┘
```

## 꼭 지킬 것

- Web에서 `header`나 `sidebar`가 있으면 `skipLinkLabel`(현지화)이 필수다. 없으면 `TypeError`.
- 화면마다 Layout을 다시 세우지 않는다. `main` landmark는 하나여야 한다.
- 어느 화면 폭에서 persistent↔overlay를 바꿀지는 제품이 정한다. Layout은 전환 규칙을 갖지 않는다.
- 사이드바 내용·헤더 내용·푸터 내용은 각 컴포넌트가 소유한다. Layout에 상태를 다시 만들지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 영역 의미 | 실제 landmark role | 없음(순서만, 사이드바는 `accessibilityLabel`) |
| skip link | 렌더링(`skipLinkLabel`, `skipLinkProps`) | — |
| 영역 props | `headerProps`·`mainProps`·`footerProps`, `sidebar.landmarkProps`/`landmarkRef`, `mainId` | `headerProps`·`mainProps`·`footerProps`, `sidebar.containerProps` |
| persistent 사이드바 배치 | 셸 grid 안 옆 칸 | header 아래·main 위 세로 순서 |

## 함정

- [계약 문서](../../layout.md)는 Native `skipLinkLabel`이 deprecated로 남아 있다고 적지만 1.12.1 Native `LayoutProps`에는 없다.
- Native persistent 사이드바는 옆으로 놓이지 않고 세로로 쌓인다. 넓은 화면 2단 배치가 필요하면 제품이 main 안에서 구성한다.
