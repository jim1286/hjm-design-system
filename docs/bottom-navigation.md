# BottomNavigation contract

`BottomNavigation`은 콘텐츠 panel을 바꾸는 `Tabs`가 아니라 앱의 안정된 최상위 route를
이동합니다. 같은 destination 의미를 Web의 link와 React Native navigator tab으로 적응시키며,
route state는 제품 router 한 곳에서만 소유합니다. BurnTok Web/RN과 Yajalal RN의 실제
navigation renderer에서 route lifecycle·접근성·큰 글자·safe area를 검증해 catalog status는
`beta`입니다.

## Descriptor와 configuration

descriptor에는 2–5개 destination, router가 확정한 `selectedKey`, navigation landmark 이름만
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

- `presentation`: `bar | floating`
- `distribution`: `equal | center-gap`
- `density`: `compact | regular`
- `direction`: `ltr | rtl`
- `keyboardBehavior`: `hide | remain`

두 renderer 모두 `resolveBottomNavigationConfiguration(configuration, itemCount)`를 사용합니다.
`center-gap`은 짝수 destination에서만 유효합니다. 이 gap은 별도 primary action의 시각적 자리만
예약하며 action을 collection에 추가하지 않습니다.

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

- 이름이 있는 `nav` landmark와 list 안에 실제 link를 렌더링합니다.
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
- selected 상태는 brand tint pill, 2px `border.focus`, label weight 변화로 보여 색 하나에 의존하지
  않습니다. selected mark는 indicator 안에, keyboard focus ring은 item 바깥에 그려 동시에
  보이게 합니다.
- item target은 최소 44×44입니다. label은 항상 보이고 font scaling을 허용하며 고정 item 높이와
  한 줄 clipping을 사용하지 않습니다. 모든 destination을 동시에 유지해야 하는 persistent chrome의
  visual label은 최대 `1.4×`까지만 커지고, 원문 전체는 item의 접근성 이름으로 유지합니다.
- safe-area bottom inset은 recipe의 최소 padding에 더합니다. `max(base, inset)`으로 대체하지
  않습니다.
- 기본 keyboard behavior는 `hide`입니다. software keyboard 위로 bottom navigation을 밀어
  올려 입력 영역을 가리지 않습니다.
- RTL에서는 item 순서와 badge의 inline-end anchor가 함께 뒤집힙니다. icon 자체의 mirror 여부는
  semantic Icon contract가 결정합니다.
- Reduce Motion에서는 transform을 제거해도 selected/focus/route 상태와 press 결과는 같습니다.

## Centered primary action

BurnTok의 생성 버튼처럼 작업을 시작하는 control은 destination이 아닙니다. `center-gap`
distribution을 선택하고 outer Dock frame에서 기존 Button/IconButton 기반 action을 sibling으로
합성합니다. 이 action은 tab role, selected state, badge, `selectedKey`, destination count를
가질 수 없습니다. Web은 button, RN은 button role과 activate action을 사용하며 제품 router나
modal API를 직접 호출합니다.
