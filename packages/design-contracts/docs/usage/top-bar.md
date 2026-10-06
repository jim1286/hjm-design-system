# TopBar 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [화면 제목과 마지막 행동](../screen-chrome.md), [NavigationBar](../navigation-bar.md),
recipe `topBarRecipe`(`src/component-recipes.ts`)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `TopBar` | `@hjmds/react`, `/top-bar` | `@hjmds/react-native`, `/navigation`, `/top-bar` | 기본 |
| `TopBarAction` | 없음 | `@hjmds/react-native`, `/navigation`, `/top-bar` | 아이콘 위 짧은 라벨 행동 |
| `NavigationBar` | `/navigation-bar` | `/navigation-bar` | 사이트 탐색 다중 슬롯 조합 |

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

- `centered`: `true`(기본). 남은 제목 영역 안에서의 정렬이며 좌우 열을 같은 폭으로 맞추지 않는다.
- `safeAreaTop`: 0(기본, 0 이상 유한수). Web은 `env(safe-area-inset-top)`과 큰 값을 쓴다.
- `headingLevel`(Web만): 1(기본)~6. 페이지 구조에 맞춘다.
- `title`을 누를 수 있게 하려면 Web `onTitleClick`, Native `onTitlePress`. `titleLeading`은 제목 앞 작은 시각 요소.
- `TopBarAction`: `intent` `button`(기본, `onPress`) · `link`(`destination` + `onNavigate` 또는 `renderLink`).
  `labelVisibility` `visible`(기본) · `accessibility-only`.

## 꼭 지킬 것

- `actions`와 `trailing`은 같은 슬롯의 두 이름이다. 둘을 함께 주면 `TypeError`다.
- `title` 없이 `titleLeading`·`onTitleClick`/`onTitlePress`·`titleAccessibilityLabel`을 주면 `TypeError`다.
- 이동은 슬롯 안의 Link(Native는 `intent="link"`)로, 제목 클릭은 실제 버튼으로 표현한다.
- 화면 이름·행동 라벨은 i18n 키로, 아이콘은 제품 소유다. 높이·간격·제목 색은 recipe가 정한다.
- 큰 글자에서 Native는 슬롯 구조를 다시 만들어 슬롯 안 로컬 상태·포커스가 초기화될 수 있다.
  유지할 상태는 TopBar 밖에 둔다.
- `NavigationBar`는 `label`(빈 문자열이면 throw)·`brand`·`children` 필수, `actions` 선택이다.
  메뉴·검색 동작은 그 안의 [Menu](menu.md)·[SearchField](search-field.md)가 소유한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 루트 | `div`(Dialog 안에서도 landmark를 추가하지 않음), ref·HTML 속성 전달 | `accessibilityRole="toolbar"` `View`, ref 없음 |
| 제목 접근성 | `h1`~`h6` | `accessibilityRole="header"`, `titleAccessibilityHint`(`onTitlePress` 필수) |
| 슬롯 스타일 | `className`·`style` | `style`·`leadingStyle`·`titleStyle`·`trailingStyle` |
| 큰 글자 | CSS가 제목을 다음 행으로 | 글자 배율이 `largeTextThreshold` 이상이면 leading+제목 행 아래에 행동 행 |
| 행동 컴포넌트 | 일반 `IconButton`·`Link` | `TopBarAction`(아이콘 + 마이크로 라벨, 44pt) |
| `NavigationBar` 배경 | 지원 시 blur + 92% 불투명 | 불투명 surface(blur 없음) |
