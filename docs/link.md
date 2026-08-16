# Link contract

`Link`는 callback을 실행하는 Button이 아니라 사용자가 복사하거나 새 탭에서 열 수 있는
**목적지**입니다. HJM은 label, 목적지, semantic icon만 공유하고 Web과 Native가 각 플랫폼의
실제 navigation primitive로 번역합니다. BurnTok의 Web/RN 대화 destination 행에서 실제
navigation·접근성 계약을 검증했으므로 catalog status는 `beta`입니다.

## 목적지

- `internal`: `/profile`, `?tab=stats`, `#details`처럼 앱 router가 해석하는 목적지
- `external`: `https`, `http`, `mailto`, `tel` absolute URL

`href`는 항상 필수입니다. `onClick`/`onPress`로 navigation을 대신하거나 optional href를
Button처럼 사용하는 API는 허용하지 않습니다. 인증 확인, retry, back, replace 같은 command는
Button과 제품 navigation workflow가 소유합니다.

```ts
const profileLink = {
  label: "프로필 보기",
  destination: { kind: "internal", href: "/u/jimin" },
  trailingIcon: { name: "chevronEnd" },
} satisfies LinkDescriptor;
```

unavailable destination은 disabled Link로 만들지 않고 plain Text로 표시합니다. `visited`는 Web의
`:visited` pseudo-state이지 공통 application state가 아니며, download는 Web anchor attribute와
Native 파일 권한·저장·공유가 다른 별도 workflow이므로 공통 Link에 포함하지 않습니다.

## Adaptive renderer

### Web

- Next Link 또는 실제 `<a href>`를 사용합니다.
- Tab/Enter, modifier click, context menu, 주소 복사, 새 탭 열기를 browser에 남깁니다.
- SPA navigation을 사용하더라도 button으로 바꾸지 않습니다.
- inline variant는 색이 없어도 링크임을 알 수 있도록 항상 underline을 유지합니다.

### React Native

- internal destination은 Expo Router Link 같은 실제 route primitive와 link role을 사용합니다.
- external destination은 `Linking` 계열 adapter로 열고 실패를 제품에 전달합니다.
- Pressable callback만으로 내부·외부 목적지를 하나의 button처럼 평준화하지 않습니다.

## Icon과 접근성

label 또는 명시적 `accessibilityLabel`이 링크 이름을 소유합니다. 음성 제어에서 보이는 문구로
대상을 찾을 수 있도록 별도 접근성 이름도 visible label을 포함해야 합니다. leading/trailing
icon은 HJM semantic name만 고릅니다. decorative 처리와 size/tone/weight는 `linkRecipe`가,
`chevronStart`와 `chevronEnd` 같은 논리 방향은 Icon registry가 소유합니다. caller가 raw size,
color, stroke, fixed direction을 넘겨 이 문법을 바꾸지 못합니다. arbitrary ReactNode와 중첩
button/link도 열지 않습니다.

core descriptor와 destination은 허용된 key만 받으며 renderer의 `className`, `target`, `replace`
같은 플랫폼 prop을 섞지 않습니다. resolver는 검증된 label, canonical `{ kind, href }`, semantic
icon identity만 새 객체로 반환해 입력 객체의 숨은 확장 필드를 플랫폼 사이에 전달하지 않습니다.

standalone Link는 최소 44-unit target과 visible focus를 지킵니다. 문장 안 inline Link는 줄 높이를
강제로 키우지 않되 underline과 native focus semantics를 유지합니다.

## 첫 제품 검증

첫 paired slice는 BurnTok 메시지 목록의 대화 destination입니다. 고정된 conversation-row
adapter가 기존 avatar·preview·time·unread 위계를 소유하고, root만 Web의 실제 Next anchor와
Native의 Expo Router `Link asChild`로 분기했습니다. Web modifier/context navigation,
Native link role·activation, 한 번만 읽히는 접근성 이름을 검증했으며 callback·임의 children·
style escape는 열지 않았습니다. rich card 전체를 base Link의 arbitrary children으로 열지 않고
이후 linked-row/card adapter에서 같은 destination contract를 조합합니다.
