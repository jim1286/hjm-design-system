# BottomNavigation contract

검토일: 2026-10-10

`BottomNavigation`은 콘텐츠 panel을 바꾸는 `Tabs`가 아니라 앱의 안정된 최상위 route를
이동합니다. 같은 destination 의미를 Web의 link와 React Native navigator tab으로 적응시키며,
route state는 제품 router 한 곳에서만 소유합니다. 각 renderer의 환경 matrix, Web route-link
키보드 동작, Native navigate/reselect host action과 긴 목적지 label 회귀가 연결되어 catalog
status는 `stable`입니다. 구체적인 router·navigator와 결합한 화면 동작은 소비 앱 QA입니다.

## Descriptor와 configuration

descriptor에는 2–6개 destination, router가 확정한 `selectedKey`, navigation landmark 이름만
둡니다. item icon은 label과 의미가 중복되므로 이름과 `decorative: true`만 허용하는
`BottomNavigationIconDescriptor`를 사용합니다. 크기·tone·weight·RTL 방향은 recipe와
semantic Icon registry가 소유하며 호출부에서 덮어쓸 수 없습니다.
route path, React component, navigation callback, 생성 action은 descriptor에 넣지 않습니다.

```ts
const descriptor = {
  accessibilityLabel: "주요 탐색",
  selectedKey: currentRoute,
  items: [
    { id: "home", label: "홈", icon: { name: "home" } },
    {
      id: "messages",
      label: "메시지",
      icon: { name: "notifications" },
      badge: {
        count: unreadCount,
        accessibilityLabel: `읽지 않은 메시지 ${unreadCount}개`,
      },
    },
  ],
} satisfies BottomNavigationDescriptor;
```

시각·플랫폼 선택은 별도 `BottomNavigationConfiguration`으로 전달합니다.

- `presentation`: `bar | floating | capsule`
- `distribution`: `equal | center-gap`
- `density`: `compact | regular`
- `direction`: `ltr | rtl`
- `keyboardBehavior`: `hide | remain`
- `labels`: `visible | hidden` (기본 `visible`). 2026-10-10 번뚝의 아이콘 전용 독 요청으로 추가했다.
  제품이 deprecated style이나 투명 팔레트로 라벨을 숨기는 대신 계약 옵션으로 둔다. `hidden`은 화면의
  이름 줄만 그리지 않고 항목의 접근성 이름(`resolvedAccessibilityLabel`)은 유지하며, 아이콘을 항목
  가운데에 둔다. 선택의 비색상 증거는 아이콘 선 굵기·확대로 남는다.

두 renderer 모두 `resolveBottomNavigationConfiguration(configuration, itemCount)`를 사용합니다.
`center-gap`은 짝수 destination에서만 유효합니다. 이 gap은 별도 primary action의 시각적 자리만
예약하며 action을 collection에 추가하지 않습니다.

Web renderer도 이름이 있는 실제 link landmark, `aria-current`, modifier click 보존,
keyboard viewport hide와 center-gap 배치를 first-party SSR·browser test로 검증합니다. 제품
router와 결합한 브라우저 릴리스 증거는 컴포넌트 API 성숙도가 아니라 소비 앱 QA에 속합니다.

## Route source of truth

`selectedKey`는 controlled/uncontrolled selection API가 아니라 read-only input입니다.
`resolveBottomNavigationActivation`은 `navigate | reselect` intent만 반환하고 값을 바꾸지 않습니다.
renderer는 router 또는 navigator에 intent를 전달하며, route 전환이 실제로 완료된 뒤 새
`selectedKey`를 받습니다. 인증 gate, preventDefault, navigation 실패가 있으면 기존 selected
상태를 그대로 유지합니다. 각 destination의 nested stack과 scroll state도 navigator가
보존하며 renderer가 screen을 조건부 remount하지 않습니다.

## Badge announcement

item의 기본 접근성 이름은 `item.accessibilityLabel ?? item.label`입니다. badge count가 0보다
크면 resolver가 이 이름과 `badge.accessibilityLabel`을 한 번만 합쳐
`resolvedAccessibilityLabel`로 반환합니다. visible badge는 `99+`처럼 CounterBadge 규칙으로
제한할 수 있지만 실제 접근성 copy는 제품이 현지화합니다.

resolved badge에는 `hiddenFromAccessibility: true`와 visible label만 있습니다. Web은 badge에
`aria-hidden="true"`, RN은 badge subtree에 `accessible={false}`와 해당 플랫폼의 descendant
hide 설정을 적용하고 item root에 `resolvedAccessibilityLabel`만 전달합니다. badge 자체에
status/live role이나 별도 accessibility label을 추가하면 같은 정보가 두 번 낭독되므로
금지합니다. polling으로 count가 바뀌어도 focus, selection, live announcement를 만들지 않습니다.

## Adaptive renderer semantics

### Web

- 컴포넌트 root 자체가 이름이 있는 `nav` landmark이고 list 안에 실제 link를 렌더링합니다.
  `footer`/contentinfo를 자체 생성하지 않으므로 `Layout`의 `footer` slot에 합성해도
  `<footer>` 안에 `<footer>`가 중첩되지 않습니다.
- 현재 link는 `aria-current="page"`를 사용합니다.
- browser의 Tab/Enter, modifier click, context menu, 새 탭 열기를 보존합니다.
- `tab`/`tablist` role, roving focus, 방향키 navigation을 적용하지 않습니다.
- SPA router를 사용해도 link의 기본 의미를 button으로 바꾸지 않습니다.

### React Native

- 각 destination은 현지화된 label과 `selected`/`disabled` state를 가집니다. Android와
  지원되는 renderer는 tab role을 사용합니다. iOS에서 navigator가 tab role을 안정적으로
  발표하지 못하면 button role과 selected state를 함께 제공하는 플랫폼 fallback을 허용합니다.
  지원되지 않는 role 문자열을 억지로 주입하는 것보다 실제 VoiceOver 발표를 우선합니다.
- press 시 navigator의 preventable `tabPress`를 먼저 emit하고, 막히지 않았을 때만 navigate합니다.
- `tabLongPress`와 test ID 같은 navigator option을 renderer까지 전달합니다.
- navigator route collection과 scene lifecycle을 보존하며 별도 placeholder route를 만들지 않습니다.

## Visual and layout requirements

- inactive icon/label도 필수 정보이므로 `content.secondary` 이상을 사용합니다.
- `indicator` slot은 icon target과 badge의 안정된 layout anchor일 뿐이며 selected pill을 그리지
  않습니다(`visual: none`, `background`/`border`: `null`). renderer는 이 null paint를 플랫폼의
  transparent 값으로 번역합니다. selected 상태는 label weight와 icon
  emphasis를 함께 바꿔 색 하나에 의존하지 않습니다. stroke를 제어할 수 있는 icon adapter는
  `strokeWidth`, 그렇지 않은 adapter는 `scale` 중 최소 하나를 recipe 값으로 적용합니다.
- selected icon과 label의 색 intent는 모두 `content.brand`이며 renderer는 각각
  `colors.selectedIcon`과 `colors.selectedLabel`을 소비합니다.
- keyboard focus ring은 item 바깥에 그려 selected icon/label evidence와 별개로 동시에 보이게
  합니다.
- item target은 최소 44×44입니다. label은 항상 보이고 font scaling을 허용하며 고정 item 높이와
  한 줄 clipping을 사용하지 않습니다. 모든 destination을 동시에 유지해야 하는 persistent chrome의
  visual label은 최대 `1.4×`까지만 커지고, 원문 전체는 item의 접근성 이름으로 유지합니다.
  Native에서는 명시적 Provider/value가 글자 배율을 style에 굽는 경로에도 같은 제한을
  적용합니다. 2026-10-05 번뚝 최대 글자 QA에서 native multiplier prop만 전달하면
  controlled Provider의 3배 style에는 제한이 작동하지 않았습니다(BT-QA-021).
  기존 Provider API로 라벨에만 recipe 배율을 적용하며 본문·목적지 접근성 이름은 보존합니다.
- safe-area bottom inset은 recipe의 최소 padding에 더합니다. `max(base, inset)`으로 대체하지
  않습니다.
- 긴 label은 320px viewport의 Web geometry matrix와 React Native renderer matrix에서 확인합니다.
  Web link의 전체 이름/visible label 보존과 Native accessibility name/Text 보존은 전용 interaction proof에 둡니다.
- 기본 keyboard behavior는 `hide`입니다. software keyboard 위로 bottom navigation을 밀어
  올려 입력 영역을 가리지 않습니다.
- RTL에서는 item 순서와 badge의 inline-end anchor가 함께 뒤집힙니다. icon 자체의 mirror 여부는
  semantic Icon contract가 결정합니다.
- Reduce Motion에서는 transform을 제거해도 label weight evidence는 유지되며
  selected/focus/route 상태와 press 결과는 같습니다.

## Centered primary action

BurnTok의 생성 버튼처럼 작업을 시작하는 control은 destination이 아닙니다. `center-gap`
distribution을 선택하고 outer Dock frame에서 기존 Button/IconButton 기반 action을 sibling으로
합성합니다. 이 action은 tab role, selected state, badge, `selectedKey`, destination count를
가질 수 없습니다. Web은 button, RN은 button role과 activate action을 사용하며 제품 router나
modal API를 직접 호출합니다.

## Capsule presentation (2026-10-01)

`configuration={{ presentation: "capsule" }}`는 둥근 route 표면과 선택된 항목의 가로형
icon/label을 제공합니다. `primaryAction`은 컬렉션 밖의 별도 원형 행동으로 배치됩니다.
`center-gap`과 함께 지정하면 오류입니다. 생성 행동이 route로 오인되거나 중앙에서 이름을
가리는 것을 방지하기 위한 선택입니다.

기본 크기에서 비선택 항목의 시각 label은 접히지만 전체 접근성 이름/배지/route intent는
그대로 유지됩니다. 큰 글씨(1.5 이상) 또는 5–6개 목적지는 모든 이름을 세로 배치해 표시합니다.
기존 bar/floating 및 router 소유 selectedKey는 바뀌지 않습니다.
[사용자 레퍼런스 두 번째 이미지](https://www.instagram.com/p/Ddb8lXmjnV9/?img_index=2)의
선택 캡슐과 분리된 추가 행동을 참고했으며, 원본 소스는 복제하지 않았습니다.

Storybook: **컴포넌트 → 탐색 → 캡슐 네비게이션**, Default/Dark/LargeText.

### Native floating pressed-edge geometry (2026-10-08)

Spint reproduced the first/last pressed background covering the rounded frame. Edge destinations now
use the frame radius minus its border width on their logical outer corners; interior corners keep
the item radius. This preserves the existing public API, router activation and focus behavior. Do not
clip the entire elevated surface as a workaround: that also clips its shadow and focus outline.


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
