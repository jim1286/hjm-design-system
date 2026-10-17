# BottomNavigation

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-13
- 근거: [BottomNavigation](../../bottom-navigation.md), recipe `bottomNavigationRecipe`
- 스토리북: `배포/컴포넌트/탐색/하단 탐색`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `BottomNavigation` | 기본 | `@hjmds/react`, `/navigation` | `@hjmds/react-native`, `/navigation`, `/top-bar` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor` | `{ accessibilityLabel: string; selectedKey: Key; items: { id: Key; label: string; accessibilityLabel?: string; icon: { name: IconName }; badge?: { count: number; max?: number; accessibilityLabel: string }; disabled?: boolean }[] }` | 필수 | 항목 2~6개. `selectedKey`는 router가 확정한 값 |
| `configuration.presentation` | `bar` · `floating` · `capsule` | `bar` | — |
| `configuration.distribution` | `equal` · `center-gap` | `equal` | `center-gap`은 짝수 개 항목만, `capsule`과 함께 쓰면 오류다 |
| `configuration.density` | `regular` · `compact` | `regular` | — |
| `configuration.direction` | `ltr` · `rtl` | Provider 환경(없으면 `ltr`) | — |
| `configuration.keyboardBehavior` | `hide` · `remain` | `hide` | 기본은 소프트 키보드가 열리면 막대를 숨긴다 |
| `configuration.labels` | `visible` · `hidden` | `visible` | `hidden`은 아이콘만 남기고 목적지 이름을 화면에서 뺀다. 이름은 항목의 접근성 이름으로 그대로 읽힌다. 아이콘을 칸 가운데에 둔다. 선택 표시는 아이콘 굵기·확대(와 제품 선택 표시)만 남으므로 의도한 아이콘 전용 막대에만 쓴다 |
| `configuration.selection` | `emphasis` · `tile` | `emphasis` | `tile`은 선택 목적지 전체를 카드로 채운다. floating·equal·visible labels 전용 |
| `configuration.surface` | `flat` · `raised` | `flat` | `raised`는 `selection: "tile"` 전용 두께 있는 막대다. surfaceAlt 바탕·borderControl 옆면(4)·선택 카드 옆면(3) |
| `primaryAction` | `ReactNode`(Button/IconButton) | — | `configuration` 밖의 별도 prop. 생성 같은 비목적지 행동이며 `center-gap` 또는 `capsule`과 짝짓는다 |
| 항목 `badge` | `{ count, max?, accessibilityLabel }` | `max` 99 | 숫자만. 점 배지는 없다. `count`가 0이면 그리지 않는다 |
| `onActivate` | `(activation: { key: Key; reason: "navigate" \| "reselect" }) => void` | Web 선택 · Native 필수 | 이동 의도만 알린다. 선택은 바꾸지 않는다. `reselect`는 이미 선택된 항목을 다시 누른 경우 |
| Native `onLongActivate` | 같은 시그니처 | — | 길게 누름(tabLongPress 등) |
| `renderIcon` | `(props: { item; name: IconName; selected: boolean; color: string; size: number; strokeWidth: number }) => ReactNode` | 필수 | Web `color`는 `"currentColor"`이고 `scale: number`가 더 있다 |
| Web `getHref` | `(item: ResolvedBottomNavigationItemDescriptor) => string` | 필수 | 빈 문자열은 `TypeError` |
| Web `renderLink` | `(props: AnchorHTMLAttributes & { href: string; children: ReactNode; "data-state": "idle" \| "selected" }) => ReactElement` | 일반 `<a>` | 라우터 Link를 연결한다. props를 그대로 펼친다 |
| Native `renderBadge` | `(props: { item; badge: { visibleLabel: string; hiddenFromAccessibility: true }; count: number; max?: number; selected: boolean }) => ReactNode` | 기본 배지 | 결과 subtree는 보조기기에서 숨겨진다 |
| Native `getItemTestID` | `(item) => string \| undefined` | — | — |
| Native `safeAreaBottom` | 0 이상 숫자 | 0 | recipe 최소 하단 padding에 더한다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. Native `style`·`surfaceStyle`·`listStyle`·`primaryActionStyle`은 제거된 속성 — layoutStyle 또는 `configuration` |

## 배치

2026-10-08 Spint 누름 상태 점검: Native floating의 양 끝 항목은 프레임 안쪽 곡률을 따라 누름 배경을 그린다. 작은 일반 항목 모서리가 프레임을 덮던 문제를 수정하며, 전체 표면 clipping으로 그림자·포커스를 자르지 않는다.

Native floating 프레임·선택 표시·항목 모서리는 각 recipe radius 역할을 Provider token에서 읽는다. full/capsule 원형 역할과 목적지·키보드 동작은 유지한다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 항목 최소 `regular` 56×64 · `compact` 52×52. 표면 최대 폭 `bar` 제한 없음(화면 폭) · `floating` 384 · `capsule` 480. 모서리 `floating` `radius.xl` 24 · `capsule` `radius.full`. 아이콘·배지 자리 40×28 | `bottomNavigationRecipe.density`·`presentations`·`indicator` |
| 간격 | 항목 안쪽 `regular` `spacing.xs` 8 · `compact` `spacing.xxs` 4, 아이콘↔라벨 `regular` `spacing.xxs` 4 · `compact` 2. `floating`·`capsule`은 바깥 좌우 `spacing.md` 16 · 위 `spacing.xs` 8. 하단은 안전 영역 + `spacing.xs` 8(Native는 `safeAreaBottom`을 최소 padding에 더함). `center-gap` 가운데 빈칸 `control.buttonHeight.large` + `spacing.md` = 68 | `presentations`, `distributions`, `safeArea`, `.hjm-bottom-navigation` |
| 순서·정렬 | 항목은 논리 순서(RTL이면 뒤집힘)로 같은 폭을 나눈다. 예외로 `capsule`에서 라벨을 펼치지 않는 상태(항목 4개 이하·글자 배율 1.5 미만)는 선택 항목이 2칸 폭 알약에 아이콘+라벨을 가로로 두고 나머지 항목은 아이콘만 남긴다(Web·Native 같은 규칙). 그래서 첫·끝 아이콘의 막대 끝 거리는 다르지만 항목 상자의 양끝 여백은 같다. `selection: "tile"` 선택 카드의 아이콘·라벨 줄은 다른 항목과 같다. 라벨은 아이콘 아래 가운데. `primaryAction`은 막대 정가운데에 겹친다(`center-gap` 빈칸 또는 `capsule`). 배지는 아이콘 끝·위 모서리(`blockStart` −4, `inlineEnd` −8) | `.hjm-bottom-navigation__list`·`__primary-action`, `bottomNavigationRecipe.badge`·`direction` |
| 고정·스크롤 | Web은 화면 아래 `position: fixed`(z-index `layer.sticky` 100). 본문 마지막 내용이 막대 아래로 들어가므로 제품 레이아웃이 하단 여백을 둔다. Native는 navigator 탭 막대 자리에 제품 레이아웃이 둔다. 키보드가 열리면 기본으로 숨는다 | `.hjm-bottom-navigation`, `bottomNavigationRecipe.adaptive`·`keyboard` |
| 좁은 폭·큰 글자 | 라벨은 줄바꿈되고 항목 높이가 늘어난다(고정 높이 없음). 글자 배율은 최대 1.4배까지만 커진다 | `bottomNavigationRecipe.largeText`·`label.wrap` |

```text
bar(기본)                               center-gap + primaryAction
┌──────────────────────────────┐        ┌──────────────────────────────┐
│ 스크롤 본문(하단 여백 필요)    │        │ 스크롤 본문                   │
├──────────────────────────────┤        ├──────────────────────────────┤
│ (홈)  (검색)  (알림)  (나)    │        │ (홈) (검색)  [＋]  (알림) (나)│
│  홈    검색    알림    나     │        │  홈   검색  ↑68↑   알림   나  │
│ ░ 안전 영역 + spacing.xs 8 ░  │        │ ░ 안전 영역 + spacing.xs 8 ░  │
└──────────────────────────────┘        └──────────────────────────────┘
floating·capsule: 바깥 좌우 16 · 위 8 띄운 둥근 표면, 최대 폭 384 · 480
```

## 꼭 지킬 것

- `selectedKey`는 router가 확정한 값으로 넘긴다. `onActivate`는 의도일 뿐이며 컴포넌트가 선택을 바꾸지 않는다.
- 선택된 항목은 `disabled`일 수 없다. id 중복, 빈·앞뒤 공백 label, 2~6개 밖은 거부한다.
- icon은 `name`만 넘긴다. 크기·색·굵기는 `renderIcon`이 받은 값을 그대로 적용한다(덮어쓰기 금지).
- label과 badge `accessibilityLabel`은 i18n 키로 만든다. icon 이름·아이콘 세트는 제품 소유다.
- 생성 버튼을 항목으로 넣지 않는다. `primaryAction`으로 둔다.
- 배치는 `layoutStyle`로만 한다. Native의 `style`·`surfaceStyle`·`listStyle`·`primaryActionStyle`은 제거된 속성이며 외형은 `configuration`이 소유한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 항목 | `aria-current` 링크(`getHref` 필수, `renderLink`로 라우터 연결) | tab(iOS는 button role) + `onActivate` 필수 |
| `onActivate` | 선택, 수정키 없는 왼쪽 클릭에만 | 필수, 추가로 `onLongActivate` |
| 배치 | CSS `position: fixed` 하단 | 제품 레이아웃이 배치 |
| 하단 inset | `env(safe-area-inset-bottom)` 자동 | `safeAreaBottom`(recipe 최소 padding에 더함) |
| 키보드 감지 | `visualViewport` 높이 | `Keyboard` 이벤트 |
| `renderIcon`의 `color` | `"currentColor"` | 해석된 색 문자열 |
| 그 밖 | `className`·`style`·HTML 속성·`layoutStyle` | `renderBadge`, `getItemTestID`, `layoutStyle`(`style`·`surfaceStyle`·`listStyle`·`primaryActionStyle`은 제거된 속성) |

## 함정

- Web root가 `position: fixed`라 본문 마지막 내용이 막대 아래로 들어간다. 제품 레이아웃이 하단 여백을 둔다.
- `renderLink` 없이 쓰면 일반 `<a>`로 그려 SPA 전환이 일어나지 않는다.
- Web `onActivate`는 링크 기본 이동을 막지 않는다. `renderLink`의 라우터 Link가 이동하고 `onActivate`는 계측·맨 위로 스크롤 같은 부수 동작에만 쓴다. 수정키·가운데 클릭에는 불리지 않는다.
- Native 내비게이션 연구 스토리(`showcase/native/src/reference-navigation-bars.tsx`)는 `configuration`과 [Heading](heading.md)을 사용한다. 과거의 `style`·`listStyle` override는 제거되었으며, 선택 타일과 모서리는 공개 configuration 축으로 정한다.

1.15.0 변경: Native의 floating/capsule은 프로필 `shadow.floating`을 읽으며 0-opacity는 Android elevation도 제거한다. bar는 원래 무그림자 계약을 유지한다. Web은 기존 CSS token 경로로 같은 프로필을 읽는다. 선택 route와 이동 intent는 제품이 소유한다.


### 선택 카드 (2026-10-12)

Spint에서 모든 이름·동일 너비를 유지하면서 선택한 목적지를 분명히 구분하기 위해
`configuration={{ presentation: "floating", distribution: "equal", density: "compact", selection: "tile" }}`를 추가했다.
기본 `selection: "emphasis"`는 기존 외형을 유지한다. `tile`은 floating·equal·visible labels에만 허용된다.
Web·Native 모두 막대에는 surfaceAccent, 선택한 항목에는 primary/onPrimary를 사용한다.
연한 선택 카드가 도크와 구분되지 않는 사용자 피드백에 따라 선택한 카드 전체를 브랜드 색으로 채운다.
안쪽 여백과 카드 사이 간격은 spacing.xxs, 카드 모서리는 radius.lg다.
라우팅·누름 방지·키보드·접근성·배지는 기존 BottomNavigation 계약을 그대로 따른다.

### 두께 있는 팻말 (2026-10-13)

Spint가 하단 탐색을 들판 게임의 나무 팻말처럼 보이게 요청해 `selection: "tile"`에 `surface: "raised"`를 추가했다.
기본 `surface: "flat"`은 기존 선택 카드 외형을 유지한다. `raised`는 `selection: "tile"`에서만 허용된다.
막대 바탕은 surfaceAlt(`surface.sunken`), 테두리는 borderControl이며 아래 테두리가 4로 두꺼워져 옆면이 된다.
floating 그림자는 그리지 않는다. 옆면이 높이를 표현하므로 그림자를 함께 두면 두 물체로 보인다.
선택한 카드는 primary 위에 아래 테두리 3을 text 45% 반투명으로 겹쳐 더 진한 옆면을 만든다.
팔레트에 "눌린 브랜드" 역할이 없어서 새 역할을 추가하지 않고 기존 역할을 겹쳐 쓴다.
선택하지 않은 카드도 같은 두께의 투명 테두리를 둔다. 그래서 선택이 바뀌어도 아이콘·라벨 줄이 움직이지 않는다.
제품은 나무 같은 색을 surfaceAlt·borderControl 팔레트 역할로 공급한다. deprecated 시각 style로 덮지 않는다.

## 근거

- capsule 선택 알약·tile 선택 카드: 2026-10-17 정렬 실측(Web 402·1280, 실험 내비게이션 바 비교). 첫·끝 아이콘의 막대 끝 거리 차이 17~23px은 선택 항목의 `flex: 2` 알약 때문이며 항목 상자 양끝 여백은 5/5로 같았다. 가운데 항목이 14.5px 솟아 보인 값은 tile 선택 카드 상자를 다른 항목의 라벨과 비교한 측정 오차였고 아이콘 244·라벨 268이 모든 항목에서 같았다. 두 renderer에 이미 같은 규칙이 있어 코드는 바꾸지 않고 배치 표에 의도를 적었다.
