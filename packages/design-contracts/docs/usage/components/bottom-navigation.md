# BottomNavigation

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-08
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
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. Native `style`·`surfaceStyle`·`listStyle`·`primaryActionStyle`은 deprecated — layoutStyle 또는 `configuration` |

## 배치

2026-10-08 Spint 누름 상태 점검: Native floating의 양 끝 항목은 프레임 안쪽 곡률을 따라 누름 배경을 그린다. 작은 일반 항목 모서리가 프레임을 덮던 문제를 수정하며, 전체 표면 clipping으로 그림자·포커스를 자르지 않는다.

Native floating 프레임·선택 표시·항목 모서리는 각 recipe radius 역할을 Provider token에서 읽는다. full/capsule 원형 역할과 목적지·키보드 동작은 유지한다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 항목 최소 `regular` 56×64 · `compact` 52×52. 표면 최대 폭 `bar` 제한 없음(화면 폭) · `floating` 384 · `capsule` 480. 모서리 `floating` `radius.xl` 24 · `capsule` `radius.full`. 아이콘·배지 자리 40×28 | `bottomNavigationRecipe.density`·`presentations`·`indicator` |
| 간격 | 항목 안쪽 `regular` `spacing.xs` 8 · `compact` `spacing.xxs` 4, 아이콘↔라벨 `regular` `spacing.xxs` 4 · `compact` 2. `floating`·`capsule`은 바깥 좌우 `spacing.md` 16 · 위 `spacing.xs` 8. 하단은 안전 영역 + `spacing.xs` 8(Native는 `safeAreaBottom`을 최소 padding에 더함). `center-gap` 가운데 빈칸 `control.buttonHeight.large` + `spacing.md` = 68 | `presentations`, `distributions`, `safeArea`, `.hjm-bottom-navigation` |
| 순서·정렬 | 항목은 논리 순서(RTL이면 뒤집힘)로 같은 폭을 나눈다. 라벨은 아이콘 아래 가운데. `primaryAction`은 막대 정가운데에 겹친다(`center-gap` 빈칸 또는 `capsule`). 배지는 아이콘 끝·위 모서리(`blockStart` −4, `inlineEnd` −8) | `.hjm-bottom-navigation__list`·`__primary-action`, `bottomNavigationRecipe.badge`·`direction` |
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
- 배치는 `layoutStyle`로만 한다. Native의 `style`·`surfaceStyle`·`listStyle`·`primaryActionStyle`은 deprecated(개발 모드 1회 경고, 다음 major 제거)이며 외형은 `configuration`이 소유한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 항목 | `aria-current` 링크(`getHref` 필수, `renderLink`로 라우터 연결) | tab(iOS는 button role) + `onActivate` 필수 |
| `onActivate` | 선택, 수정키 없는 왼쪽 클릭에만 | 필수, 추가로 `onLongActivate` |
| 배치 | CSS `position: fixed` 하단 | 제품 레이아웃이 배치 |
| 하단 inset | `env(safe-area-inset-bottom)` 자동 | `safeAreaBottom`(recipe 최소 padding에 더함) |
| 키보드 감지 | `visualViewport` 높이 | `Keyboard` 이벤트 |
| `renderIcon`의 `color` | `"currentColor"` | 해석된 색 문자열 |
| 그 밖 | `className`·`style`·HTML 속성·`layoutStyle` | `renderBadge`, `getItemTestID`, `layoutStyle`(`style`·`surfaceStyle`·`listStyle`·`primaryActionStyle`은 deprecated) |

## 함정

- Web root가 `position: fixed`라 본문 마지막 내용이 막대 아래로 들어간다. 제품 레이아웃이 하단 여백을 둔다.
- `renderLink` 없이 쓰면 일반 `<a>`로 그려 SPA 전환이 일어나지 않는다.
- Web `onActivate`는 링크 기본 이동을 막지 않는다. `renderLink`의 라우터 Link가 이동하고 `onActivate`는 계측·맨 위로 스크롤 같은 부수 동작에만 쓴다. 수정키·가운데 클릭에는 불리지 않는다.
- 현재 Native 내비게이션 연구 스토리(`showcase/native/src/reference-navigation-bars.tsx`)는 deprecated `style`(`paddingHorizontal: 0`)·`listStyle`(`borderRadius`)로 recipe 여백·모서리를 덮고, 제목을 `Text variant="heading"`으로 그린다. 규칙은 `configuration`·`layoutStyle`과 [Heading](heading.md)이다(스토리 수정 후보).

미게시(1.14.0 이후): Native의 floating/capsule은 프로필 `shadow.floating`을 읽으며 0-opacity는 Android elevation도 제거한다. bar는 원래 무그림자 계약을 유지한다. Web은 기존 CSS token 경로로 같은 프로필을 읽는다. 선택 route와 이동 intent는 제품이 소유한다.
