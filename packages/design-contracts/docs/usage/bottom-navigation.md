# BottomNavigation 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [BottomNavigation](../bottom-navigation.md), recipe `bottomNavigationRecipe`

## 언제 쓰나

앱의 안정된 최상위 route(홈·검색·메시지·내 정보) 2~6개 사이를 이동하는 하단 막대에 쓴다.
선택 상태는 제품 router가 소유하고, 컴포넌트는 이동 의도만 알린다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 같은 화면 안에서 패널만 바꿈 | [Tabs](tabs.md) |
| 화면의 결론 행동 | [BottomCTA](bottom-cta.md) |
| 넓은 화면의 측면 탐색 | [Sidebar](sidebar.md) |
| 화면 제목과 뒤로 가기 | [TopBar](top-bar.md) |
| 몇 개 중 하나를 고르는 값 | [SegmentedControl](segmented-control.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `BottomNavigation` | `@hjmds/react`, `/navigation` | `@hjmds/react-native`, `/navigation`, `/top-bar` | 기본 |

## 최소 사용 예

```tsx
// Web (Next.js)
import { BottomNavigation } from "@hjmds/react/navigation";

<BottomNavigation
  descriptor={{
    accessibilityLabel: t("nav.main"),
    selectedKey: currentRoute,
    items: [
      { id: "home", label: t("nav.home"), icon: { name: "home" } },
      { id: "inbox", label: t("nav.inbox"), icon: { name: "notifications" },
        badge: { count: unread, accessibilityLabel: t("nav.unread", { count: unread }) } },
    ],
  }}
  getHref={(item) => routes[item.id]}
  renderLink={(props) => <Link {...props} />}
  renderIcon={({ name, size, strokeWidth }) => <AppIcon name={name} size={size} strokeWidth={strokeWidth} />}
/>
```

```tsx
// Native
import { BottomNavigation } from "@hjmds/react-native/navigation";

<BottomNavigation
  descriptor={descriptor}
  safeAreaBottom={insets.bottom}
  onActivate={({ key, reason }) => reason === "reselect" ? scrollToTop(key) : navigation.navigate(key)}
  renderIcon={({ name, color, size, strokeWidth }) => <AppIcon name={name} color={color} size={size} strokeWidth={strokeWidth} />}
/>
```

## 축과 기본값

`configuration`으로 고른다.

- `presentation`: `bar`(기본) · `floating` · `capsule`.
- `distribution`: `equal`(기본) · `center-gap`. `center-gap`은 짝수 개 항목만, `capsule`과 함께 쓰면 오류다.
- `density`: `regular`(기본) · `compact`. `direction`: 기본은 Provider 환경(없으면 `ltr`).
- `keyboardBehavior`: `hide`(기본) · `remain`. 기본은 소프트 키보드가 열리면 막대를 숨긴다.
- `primaryAction`: 생성 같은 비목적지 행동을 Button/IconButton으로 넣는다. `center-gap` 또는 `capsule`과 짝짓는다.
- 항목 `badge`는 숫자만(`count`·`max`·`accessibilityLabel` 필수). 점 배지는 없다.

## 꼭 지킬 것

- `selectedKey`는 router가 확정한 값으로 넘긴다. `onActivate`는 의도일 뿐이며 컴포넌트가 선택을 바꾸지 않는다.
- 선택된 항목은 `disabled`일 수 없다. id 중복, 빈·앞뒤 공백 label, 2~6개 밖은 거부한다.
- icon은 `name`만 넘긴다. 크기·색·굵기는 `renderIcon`이 받은 값을 그대로 적용한다(덮어쓰기 금지).
- label과 badge `accessibilityLabel`은 i18n 키로 만든다. icon 이름·아이콘 세트는 제품 소유다.
- 생성 버튼을 항목으로 넣지 않는다. `primaryAction`으로 둔다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 항목 | `aria-current` 링크(`getHref` 필수, `renderLink`로 라우터 연결) | tab(iOS는 button role) + `onActivate` 필수 |
| `onActivate` | 선택, 수정키 없는 왼쪽 클릭에만 | 필수, 추가로 `onLongActivate` |
| 배치 | CSS `position: fixed` 하단 | 제품 레이아웃이 배치 |
| 하단 inset | `env(safe-area-inset-bottom)` 자동 | `safeAreaBottom`(recipe 최소 padding에 더함) |
| 키보드 감지 | `visualViewport` 높이 | `Keyboard` 이벤트 |
| `renderIcon`의 `color` | `"currentColor"` | 해석된 색 문자열 |
| 그 밖 | `className`·`style`·HTML 속성 | `renderBadge`, `getItemTestID`, `style`·`surfaceStyle`·`listStyle`·`primaryActionStyle` |

## 함정

- Web root가 `position: fixed`라 본문 마지막 내용이 막대 아래로 들어간다. 제품 레이아웃이 하단 여백을 둔다.
- `renderLink` 없이 쓰면 일반 `<a>`로 그려 SPA 전환이 일어나지 않는다.
