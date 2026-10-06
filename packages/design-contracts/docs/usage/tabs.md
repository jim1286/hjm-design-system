# Tabs 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `tabsRecipe`(`src/component-recipes.ts`), 동작 기본값 `tabsBehaviorDefaults`(`src/behaviors.ts`),
gooey 표시: [Gooey navigation](../gooey-navigation.md)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Tabs` | `@hjmds/react`, `/navigation` | `@hjmds/react-native`, `/navigation`, `/top-bar` | 기본 |
| `TabPanel` | `@hjmds/react`, `/navigation` | `@hjmds/react-native`, `/navigation`, `/top-bar` | 패널을 Tabs 밖에 둘 때(companion) |

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

- 선택: `value`+`onValueChange`(controlled, 둘 다 필수) 또는 `defaultValue`. 생략하면 첫 활성 항목.
- `activationMode`: `manual`(기본, Web은 방향키로 포커스만 옮기고 Enter/Space로 선택) · `automatic`.
- `mountPolicy`: `active`(기본, 선택된 패널만 mount) · `visited` · `always`.
  `panelMode`: `keyed`(기본) · `dynamic`(`mountPolicy="active"`일 때만 허용).
- `size`: `medium`(기본, 최소 48) · `small`. `layout`: `content`(기본) · `fitted`(폭을 나눠 채움).
  `overflow`: `scroll`(기본) · `clip`. `orientation`: `horizontal`(기본) · `vertical`. `loop`: 기본 `true`.
- `appearance`: `standard`(기본) · `gooey`(가로일 때만 선택 표시가 늘어나며 이동, 세로는 standard 유지).
- `renderPanels={false}`면 패널을 그리지 않는다. 패널을 라우터·스크롤 상태와 함께 따로 둘 때
  `TabPanel`에 `tabsId`(Tabs의 `id`와 같게)·`activeValue`·`value`를 넘긴다.

## 꼭 지킬 것

- `label`(탭 목록 이름)은 필수이고 비어 있으면 `TypeError`다. 항목 라벨과 함께 i18n 키로 넣는다.
- `items`의 `id`는 비지 않고 겹치지 않아야 하며, 활성 항목이 하나 이상 있어야 한다(위반 시 `TypeError`).
  Web controlled `value`가 비활성·없는 항목이면 `RangeError`다.
- 아이콘은 `renderLeading`으로 넣고 받은 `color`·`size`를 쓴다. 색을 직접 정하지 않는다.
- 탭을 바꿔도 화면 이동(뒤로 가기 대상)이 아니다. 주소에 남겨야 하면 제품이 controlled 값으로 동기화한다.
- `layoutStyle`은 없다. Web은 루트 `div` 속성(`className`·`style`)을, Native는 `style`·`tabListStyle`을
  받지만 색·높이·인디케이터를 덮는 데 쓰지 않는다.

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

- Native `Tabs`는 예전 `options` prop을 받으면 `TypeError`("options was removed")를 던진다. `items`로 옮긴다.
- 외부 `TabPanel`을 쓸 때 Tabs에 `id`를 주지 않으면 Web은 생성 id를 써서 `tabsId`를 맞출 수 없다.
  `id`를 명시하고 같은 값을 `TabPanel tabsId`에 넘긴다.
