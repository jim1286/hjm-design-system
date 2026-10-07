# Tabs

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Gooey navigation](../../gooey-navigation.md), `src/component-recipes.ts`(`tabsRecipe`), `src/behaviors.ts`(`tabsBehaviorDefaults`)
- 스토리북: `배포/컴포넌트/탐색/탭`, `배포/컴포넌트/탐색/선택 표시가 이어지는 탭`

## 언제 쓰나

같은 화면 안에서 **서로 다른 패널 여러 개 중 하나를 보여 줄 때** 쓴다. 프로필의 "게시물/좋아요",
설정의 "일반/알림"처럼 탭마다 패널이 따로 있고 화면 이동 없이 바뀌는 자리다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 같은 목록의 필터·보기 방식만 바꿈(패널이 하나) | [SegmentedControl](segmented-control.md) |
| 앱의 최상위 화면 이동 | [BottomNavigation](bottom-navigation.md), [Sidebar](sidebar.md) |
| 여러 개를 동시에 켜고 끔 | [ToggleGroup](toggle-group.md), [Chip](chip.md) |
| 순서가 있는 단계 진행 | [Steps](steps.md) |
| 접고 펼치는 여러 섹션 | [Accordion](accordion.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Tabs` | 기본 | `@hjmds/react`, `/navigation` | `@hjmds/react-native`, `/navigation`, `/top-bar` |
| `TabPanel` | 동반(패널을 Tabs 밖에 둘 때) | `@hjmds/react`, `/navigation` | `@hjmds/react-native`, `/navigation`, `/top-bar` |

## 최소 사용 예

```tsx
// Web
import { Tabs } from "@hjmds/react/navigation";

<Tabs
  label={t("profile.tabs")}
  value={tab}
  onValueChange={setTab}
  items={[
    { id: "posts", label: t("profile.posts"), panel: <PostList /> },
    { id: "likes", label: t("profile.likes"), panel: <LikeList /> },
  ]}
/>
```

```tsx
// Native
import { Tabs } from "@hjmds/react-native/navigation";

<Tabs
  label={t("profile.tabs")}
  defaultValue="posts"
  layout="fitted"
  items={[
    { id: "posts", label: t("profile.posts"), panel: <PostList /> },
    { id: "likes", label: t("profile.likes"), badge: "3", badgeAccessibilityLabel: t("profile.likesNew", { count: 3 }), panel: <LikeList /> },
  ]}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value`+`onValueChange` / `defaultValue` | 항목 `id`, `(value: string) => void`(Native는 `Value`) | 첫 활성 항목 | controlled는 둘 다 필수. 비제어에서도 `onValueChange`로 바뀐 값을 받는다 |
| `items[]` | Web `{ id, label: ReactNode, panel?, renderLeading?, disabled? }`, Native는 더해 `badge?`·`badgeAccessibilityLabel?`·`panelAccessibilityLabel?`(`label`은 `string`) | — (필수) | — |
| `renderLeading`(항목) | `(state: { selected, disabled, color, size }) => ReactNode` | — | `color`는 Web `"currentColor"`, Native 색 문자열 |
| `activationMode` | `manual` · `automatic` | `manual` | `manual`은 Web에서 방향키로 포커스만 옮기고 Enter/Space로 선택 |
| `mountPolicy` | `active` · `visited` · `always` | `active` | `active`는 선택된 패널만 mount |
| `panelMode` | `keyed` · `dynamic` | `keyed` | `dynamic`은 `mountPolicy="active"`일 때만 허용 |
| `size` | `medium` · `small` | `medium` | 최소 높이 48 · 44 |
| `layout` | `content` · `fitted` | `content` | `fitted`는 폭을 나눠 채움 |
| `overflow` | `scroll` · `clip` | `scroll` | — |
| `orientation` | `horizontal` · `vertical` | `horizontal` | — |
| `loop` | `boolean` | `true` | — |
| `appearance` | `standard` · `gooey` | `standard` | `gooey`는 가로일 때만 선택 표시가 늘어나며 이동, 세로는 standard 유지 |
| `renderPanels` | `boolean` | `true` | `false`면 패널을 그리지 않는다. 패널을 라우터·스크롤 상태와 함께 따로 둘 때 `TabPanel`에 `tabsId`(Tabs의 `id`와 같게)·`activeValue`·`value`를 넘긴다 |
| `children`(Native) | `(selectedValue: Value) => ReactNode` | — | 항목 `panel` 대신 선택 값으로 패널을 그린다 |
| `TabPanel` | `{ tabsId, activeValue, children, mode?: "keyed", value, mountPolicy? }` 또는 `{ mode: "dynamic" }`, Native는 `label` 필수 | — | — |
| `layoutStyle` | `HjmCompositionStyleProp` | — | Tabs·TabPanel 루트 배치. Web·Native 모두 |
| Native `style`·`tabListStyle`, TabPanel `style` | `StyleProp<ViewStyle>` | — | deprecated — `layoutStyle` 또는 `size`·`layout`·`overflow`·`appearance`. 개발 모드에서 한 번 경고하고 다음 major에서 제거된다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 탭 높이 `medium` 최소 48, `small` 최소 44(`control.minTouchTarget`). 목록 아래 구분선 1(`border` 색), 선택 밑줄 2(`stroke.strong`) | `tabsRecipe.sizes`·`indicatorHeight`, `styles.css` `.hjm-tabs__tab` |
| 간격 | 좌우 안쪽 여백 `medium` `spacing.md` 16 · `small` `spacing.sm` 12, 탭 사이 `spacing.xs` 8, 아이콘과 라벨 사이 `spacing.xs` 8. Web 패널 위아래 여백 `spacing.md` 16 | `tabsRecipe`, `styles.css` `.hjm-tabs__list`·`.hjm-tabs__leading`·`.hjm-tabs__panel` |
| 순서·정렬 | 화면 상단(TopBar 아래)이나 섹션 머리에 가로로 놓고 패널이 바로 아래. 탭이 적고(2~4) 폭을 꽉 채워야 하면 `layout="fitted"`, 많거나 라벨 길이가 다르면 `content`. 세로(`orientation="vertical"`)는 Web에서 왼쪽 목록(최소 8rem)과 오른쪽 패널을 `spacing.md` 16 간격으로 나란히 두고 구분선이 목록 오른쪽에 선다 | `styles.css` `.hjm-tabs[data-orientation="vertical"]`, `react-native/src/navigation.tsx` |
| 고정·스크롤 | 기본 `overflow="scroll"`로 탭 목록이 가로 스크롤한다. 목록은 스크롤 영역 안에서 고정되지 않으며 상단에 붙여야 하면 제품이 sticky 영역에 넣는다 | `tabsRecipe.overflow`, `styles.css` `.hjm-tabs__list` |
| 좁은 폭·큰 글자 | 라벨은 줄바꿈하지 않는다(`white-space: nowrap`). 좁은 폭·큰 글자에서는 가로 스크롤로 받는다 | `styles.css` `.hjm-tabs__tab` |

```text
┌────────────────────────────────────┐
│ TopBar                             │
├────────────────────────────────────┤
│ [전체] [내 글] [저장] →(스크롤)    │ ← 최소 48, 사이 8
│  ━━━━                              │ ← 선택 밑줄 2 / 구분선 1
├────────────────────────────────────┤
│ 패널(Web 위아래 16)                │
└────────────────────────────────────┘
```

## 꼭 지킬 것

- `label`(탭 목록 이름)은 필수이고 비어 있으면 `TypeError`다. 항목 라벨과 함께 i18n 키로 넣는다.
- `items`의 `id`는 비지 않고 겹치지 않아야 하며, 활성 항목이 하나 이상 있어야 한다(위반 시 `TypeError`).
  Web controlled `value`가 비활성·없는 항목이면 `RangeError`다.
- 아이콘은 `renderLeading`으로 넣고 받은 `color`·`size`를 쓴다. 색을 직접 정하지 않는다.
- 탭을 바꿔도 화면 이동(뒤로 가기 대상)이 아니다. 주소에 남겨야 하면 제품이 controlled 값으로 동기화한다.
- 배치는 `layoutStyle`로 한다. Web 루트 `div` 속성(`className`·`style`)과 Native의 deprecated `style`·`tabListStyle`로
  색·높이·인디케이터를 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 항목 `label` 타입 | `ReactNode` | `string` |
| 항목 배지 | 없음 | `badge`, `badgeAccessibilityLabel` |
| 패널 접근 이름 | 탭 라벨로 연결(`aria-labelledby`) | 항목 `panelAccessibilityLabel`, `TabPanel`은 `label` 필수 |
| 패널 렌더 함수 | 없음 | `children(selectedValue)` |
| 값 타입 | `string` | 제네릭 `Value extends string` |
| ref | `forwardRef`(`div`) | 없음 |
| import 경로 | `/navigation` | `/navigation`, `/top-bar` |

## 함정

- 2026-10-07 [Animated Tabs 대조](../../../../../docs/plans/aceternity-interaction-adoption-2026-10-07.md)에서
  선택 표시의 이동과 겹친 패널의 이동을 구분했다. 현재 `appearance="gooey"`는 표시선만 늘어나며,
  패널을 겹쳐 복제하거나 순서를 바꾸지 않는다. `designProfile.interactions.selectionMotion`은
  현재 SegmentedControl에 연결되며 Tabs의 `appearance`를 자동 변경하지 않는다. `slide`와 `gooey`를
  같은 의미로 간주하지 않는다. 전환 표현이 필요하면 [ContentTransition](content-transition.md)의
  단일 콘텐츠 전환과 Tabs의 `mountPolicy`·`panelMode`를 함께 검토한다. 프로필이 탭·패널 수명을
  자동 결정하거나 active 패널의 unmount 후 로컬 초안을 보존한다고 안내하지 않는다.

- Native `Tabs`는 예전 `options` prop을 받으면 `TypeError`("options was removed")를 던진다. `items`로 옮긴다.
- 외부 `TabPanel`을 쓸 때 Tabs에 `id`를 주지 않으면 Web은 생성 id를 써서 `tabsId`를 맞출 수 없다.
  `id`를 명시하고 같은 값을 `TabPanel tabsId`에 넘긴다.
