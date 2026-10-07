# TopBar

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [화면 제목과 마지막 행동](../../screen-chrome.md), [NavigationBar](../../navigation-bar.md), `src/component-recipes.ts`(`topBarRecipe`)
- 스토리북: `배포/컴포넌트/탐색/상단 탐색 막대`, `배포/컴포넌트/탐색/검색·메뉴가 있는 상단 바`, `배포/컴포넌트/탐색/내비게이션 바`

## 언제 쓰나

화면 맨 위에 붙는 **크롬**에 쓴다. 뒤로가기·닫기(`leading`), 짧은 화면 이름(`title`), 소수의 행동
(`actions`/`trailing`)을 담는다. 스크롤과 무관한 자리이며 safe area 위쪽 여백을 처리한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 본문 첫 블록의 제목·설명(스크롤과 함께 움직임) | [Top](top.md) |
| 최상위 route 전환 탭 | [BottomNavigation](bottom-navigation.md) |
| 웹 사이드 탐색 | [Sidebar](sidebar.md) |
| 화면 하단 주 행동 | [BottomCTA](bottom-cta.md) |
| 행동이 많아 줄에 다 안 들어감 | 하나만 남기고 [Menu](menu.md)로 묶는다 |

Top과 TopBar의 구분: TopBar는 고정 크롬(이동·화면 이름·액션), [Top](top.md)은 그 아래 본문의 첫 제목이다.
브랜드·탐색 항목·검색/계정이 여러 개 들어가는 사이트 헤더는 TopBar가 아니라 `NavigationBar`다.

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `TopBar` | 기본 | `@hjmds/react`, `/top-bar` | `@hjmds/react-native`, `/navigation`, `/top-bar` |
| `TopBarAction` | 동반(아이콘 위 짧은 라벨 행동) | — | `@hjmds/react-native`, `/navigation`, `/top-bar` |
| `NavigationBar` | 확장(사이트 탐색 다중 슬롯 조합) | `/navigation-bar` | `/navigation-bar` |

## 최소 사용 예

```tsx
// Web
import { IconButton } from "@hjmds/react/actions";
import { TopBar } from "@hjmds/react/top-bar";

<TopBar
  title={t("settings.title")}
  leading={<IconButton label={t("common.back")} onClick={goBack}><BackIcon /></IconButton>}
/>
```

```tsx
// Native
import { TopBar, TopBarAction } from "@hjmds/react-native/top-bar";

<TopBar
  title={t("settings.title")}
  safeAreaTop={insets.top}
  leading={
    <TopBarAction label={t("common.back")} labelVisibility="accessibility-only" onPress={goBack}>
      <BackIcon />
    </TopBarAction>
  }
  actions={<TopBarAction label={t("common.save")} onPress={save}><SaveIcon /></TopBarAction>}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `centered` | `boolean` | `true` | 남은 제목 영역 안에서의 정렬이며 좌우 열을 같은 폭으로 맞추지 않는다 |
| `safeAreaTop` | 0 이상 유한수 | 0 | Web은 `env(safe-area-inset-top)`과 큰 값을 쓴다 |
| `headingLevel` | 1~6 | 1 | Web만. 페이지 구조에 맞춘다 |
| `onTitleClick`(Web) | `(event: MouseEvent<HTMLButtonElement>) => void` | — | 제목을 버튼으로 만든다 |
| `onTitlePress`(Native) | `(event: GestureResponderEvent) => void` | — | 제목을 버튼으로 만든다 |
| `titleLeading` | `ReactNode` | — | 제목 앞 작은 시각 요소 |
| `leading` / `actions`(별칭 `trailing`) | `ReactNode` | — | 둘 중 한 이름만 쓴다 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 루트 배치. Web·Native 모두 |
| Native `style`·`leadingStyle`·`titleStyle`·`trailingStyle` | `StyleProp` | — | deprecated — `layoutStyle` 또는 `centered`. 개발 모드에서 한 번 경고하고 다음 major에서 제거된다 |
| `TopBarAction` `intent` | `button` · `link` | `button` | `button`은 `onPress: (event) => void`, `link`는 `destination` + `onNavigate?: (destination: LinkDestination) => void \| Promise<void>` 또는 `renderLink` |
| `TopBarAction` `labelVisibility` | `visible` · `accessibility-only` | `visible` | — |
| `TopBarAction` `layoutStyle` | `HjmCompositionStyleProp` | — | `style`·`labelStyle`은 deprecated |
| `NavigationBar` | `label`·`brand`·`children` 필수, `actions` 선택 | — | Web만 `layoutStyle`도 받는다 |

## 배치

NavigationBar의 Native 프레임 모서리는 Provider의 `tokens.radius.xl`을 읽는다. 기존 불투명 semantic 표면과 목적지·행동 슬롯을 유지한다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 최소 높이 `control.buttonHeight.large` 52 + 위쪽 안전 영역. Web은 `max(env(safe-area-inset-top), safeAreaTop)`을 위 여백으로, Native는 `safeAreaTop`을 `paddingTop`과 `minHeight`(52 + `safeAreaTop`)에 더한다. 좌우 열 최소 폭 `control.minTouchTarget` 44, Native `TopBarAction` 최소 44×44 | `topBarRecipe.minHeight`·`sideMinWidth`·`action`, `.hjm-top-bar` |
| 간격 | 좌우 여백 `spacing.md` 16, 슬롯 사이·슬롯 안 행동 사이 `spacing.xs` 8. `TopBarAction` 아이콘–라벨 `spacing.xxs` 4, 좌우 여백 4. 배경 `canvas` | `topBarRecipe.paddingHorizontal`·`gap`·`action` |
| 순서·정렬 | 세 열: `leading`(뒤로·닫기) · 제목 · `actions`(끝 정렬). `centered`(기본)는 남은 제목 영역 안에서만 가운데 정렬. 행동은 1~2개만 끝 열에, 넘치면 하나만 남기고 [Menu](menu.md)로 묶는다. 주 행동(저장·완료)은 끝 열의 마지막 | `.hjm-top-bar` grid, Native `TopBar` |
| 고정·스크롤 | 화면 맨 위, 스크롤 영역 **밖**에 둔다. TopBar 자체는 `position: sticky`/고정을 걸지 않으므로 화면 골격이 그 아래에 스크롤 영역을 둬야 고정된다. 바로 아래 본문 첫 블록은 [Top](top.md) | `.hjm-top-bar`(position 없음) |
| 좁은 폭·큰 글자 | 글자 배율 ≥ `largeTextThreshold` 1.6: Web은 첫 행 leading·행동, 둘째 행 제목(시작 정렬, 위아래 `spacing.xs` 8). Native는 첫 행 leading+제목, 둘째 행 행동(끝 정렬, 줄바꿈 허용) | `.hjm-top-bar[data-large-text]`, `react-native/src/navigation.tsx` `TopBar` |

```text
기본                                   큰 글자 Web               큰 글자 Native
┌──────────── safe area ───────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│ [<]        화면 이름       [⋯][✓]│   │ [<]           [⋯][✓] │   │ [<] 화면 이름        │
└──────────────────────────────────┘   │ 화면 이름            │   │          [⋯][✓]      │
  leading 44+  title(1fr)  actions 44+ └──────────────────────┘   └──────────────────────┘
───────────── 아래부터 스크롤 영역 ─────────────
```

## 꼭 지킬 것

- `actions`와 `trailing`은 같은 슬롯의 두 이름이다. 둘을 함께 주면 `TypeError`다.
- `title` 없이 `titleLeading`·`onTitleClick`/`onTitlePress`·`titleAccessibilityLabel`을 주면 `TypeError`다.
- 이동은 슬롯 안의 Link(Native는 `intent="link"`)로, 제목 클릭은 실제 버튼으로 표현한다.
- 화면 이름·행동 라벨은 i18n 키로, 아이콘은 제품 소유다. 높이·간격·제목 색은 recipe가 정한다.
  배치는 `layoutStyle`로만 하고 Native의 deprecated 슬롯 스타일로 덮지 않는다.
- 큰 글자에서 Native는 슬롯 구조를 다시 만들어 슬롯 안 로컬 상태·포커스가 초기화될 수 있다.
  유지할 상태는 TopBar 밖에 둔다.
- `NavigationBar`는 `label`(빈 문자열이면 throw)·`brand`·`children` 필수, `actions` 선택이다.
  메뉴·검색 동작은 그 안의 [Menu](menu.md)·[SearchField](search-field.md)가 소유한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 루트 | `div`(Dialog 안에서도 landmark를 추가하지 않음), ref·HTML 속성 전달 | `accessibilityRole="toolbar"` `View`, ref 없음 |
| 제목 접근성 | `h1`~`h6` | `accessibilityRole="header"`, `titleAccessibilityHint`(`onTitlePress` 필수) |
| 슬롯 스타일 | `className`·`style`, 배치는 `layoutStyle` | 배치는 `layoutStyle`(`style`·`leadingStyle`·`titleStyle`·`trailingStyle`은 deprecated) |
| 큰 글자 | CSS가 제목을 다음 행으로 | 글자 배율이 `largeTextThreshold` 이상이면 leading+제목 행 아래에 행동 행 |
| 행동 컴포넌트 | 일반 `IconButton`·`Link` | `TopBarAction`(아이콘 + 마이크로 라벨, 44pt) |
| `NavigationBar` 배경 | 지원 시 blur + 92% 불투명 | 불투명 surface(blur 없음) |
