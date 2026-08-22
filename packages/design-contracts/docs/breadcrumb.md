# Breadcrumb contract

**문제.** 깊은 계층 안 화면에서 지금 위치가 전체 구조 어디쯤인지 보여 주고, 상위 계층으로
곧장 돌아가게 합니다 — `구단 목록 › LG 트윈스 › 선수단`처럼 현재 화면까지의 경로입니다.

**일반화한 계약.** Collection 기본 계약의 stable `id`와 보이는 `label`만 가져옵니다.
`textValue`, 선택, 비동기 상태는 없습니다 — Breadcrumb는 선택하는 목록이 아니라 이미 온
경로를 보여 주는 목록입니다. 항목은 순서가 곧 계층이며, **배열의 마지막 항목만 현재
위치**이고 그 항목만 `destination`이 없습니다. 그 앞의 모든 항목은 `destination`이
필수입니다.

```ts
const trail = {
  items: [
    { id: "teams", label: "구단", destination: { kind: "internal", href: "/teams" } },
    { id: "lg", label: "LG 트윈스" },
  ],
} satisfies BreadcrumbDescriptor;
```

`validateBreadcrumbDescriptor`는 빈 trail, 중복 id, 빈 label, **마지막 항목의
destination**, **마지막이 아닌 항목의 missing destination**을 모두 거부합니다. 항목이
하나뿐인 trail(현재 화면만, 조상 없음)은 유효합니다.

## Link 목적지 재사용

Breadcrumb는 새 href 개념을 만들지 않습니다. 조상 항목의 `destination`은 `Link`의
`LinkDestination`(`internal | external`) 타입 그대로이고, `validateBreadcrumbDescriptor`는
각 조상 항목마다 `validateLinkDestination`을 그대로 호출합니다. 그래서 internal href가
`/`, `?`, `#`로 시작해야 한다거나 external href가 허용된 protocol만 써야 한다는 규칙은
Link 문서(`docs/link.md`)가 유일한 출처입니다. Breadcrumb 조상 항목은 Web에서는 실제
anchor, Native가 이 컴포넌트를 쓴다면 Expo Router Link로 렌더링될 항목이라는 뜻이며,
`Link`의 `disabled`/`onClick`/`onPress` 금지 규칙도 그대로 상속합니다.

## HJM 기본값

- 마지막 항목은 링크가 아니라 plain text이고 `aria-current="page"`로 표시합니다.
- 구분자(`/`, `›`)는 정보가 아니라 장식입니다. `breadcrumbRecipe.separator.decorative`는
  항상 `true`이고 renderer는 이를 접근성 트리에서 숨깁니다(Web `aria-hidden`, 스크린
  리더는 순서만 듣습니다).
- 구분자 아이콘은 `chevronEnd`처럼 Icon registry의 논리 방향 이름을 씁니다. RTL 미러링은
  Icon 계약이 이미 소유하므로 Breadcrumb가 따로 방향을 계산하지 않습니다.
- **축약(`...`)을 넣지 않습니다.** 항목이 많을 때 가운데를 접는 것은 실제 화면에서
  측정된 수요가 아직 없습니다. 필요해지면 별도 `collapsed` 축으로 명시적으로 추가하고,
  지금은 renderer가 전체 trail을 그대로 그립니다.
- 크기는 Link의 inline 취급을 따릅니다 — 44-unit 최소 target을 강제하지 않고 밑줄과
  focus indicator만 유지합니다. Breadcrumb 항목은 문장이 아니라 한 줄 경로이므로 독립된
  standalone Link처럼 하나씩 별도 target으로 쓰기보다, 촘촘한 한 줄 trail로 배치됩니다.

## 플랫폼 번역 — 왜 Web 전용인가

Breadcrumb는 `platform: web`입니다. Native에서는 같은 문제("지금 어디에 있고 어떻게
돌아가는가")를 이미 두 가지가 풀고 있습니다.

- 플랫폼 back 제스처(스와이프, 하드웨어 back)가 바로 이전 화면으로 돌아가는 동작을
  소유합니다.
- `TopBarRecipe`의 `title` 슬롯이 지금 위치를 한 줄로 보여 줍니다(`docs/bottom-navigation.md`
  및 `topBarRecipe` 참고 — slot은 `root/leading/title/trailing`뿐이고 다단계 경로 trail을
  위한 자리가 없습니다).

그래서 Native에 별도 Breadcrumb를 만들면 TopBar와 같은 정보를 두 번 계약하게 됩니다.
`breadcrumbBehaviorSpec.native`는 의도적으로 빈 `{ roles: [], states: [], actions: [] }`이며,
이는 미완성이 아니라 "이 컴포넌트는 Native에 존재하지 않는다"는 선언입니다.

Web에서는:

- `nav` landmark(`role="navigation"`) 하나가 전체 trail을 감싸고, 순서 있는 `list`/`listitem`
  구조로 항목을 나열합니다.
- 조상 항목은 `Link`의 `web.roles: ["link"]`, `keyboard: ["Tab", "Enter"]`를 그대로
  가져오므로 Breadcrumb 자체가 새 키보드 상호작용을 정의하지 않습니다.
- 현재 항목은 tab stop이 아니고 `aria-current="page"`만 갖습니다.

## 검증 화면

아직 없음. 이전 판정이 후보로 든 "야잘알의 구단 상세 → 선수단 → 선수 상세" 계층은
검증 결과 근거가 될 수 없다 — Breadcrumb는 `platform: "web"`인데 야잘알(`modules/app`,
`modules/app-rn`)은 Flutter/React Native 모바일 앱뿐이고 Web 화면 자체가 없다(Native
계층 이동은 이미 위에서 TopBar가 담당하기로 판정했다). BurnTok의 Web 앱
(`apps/web/src/app`)도 함께 확인했지만 지금 라우트는 대부분 2단 이하(`/c/[id]`,
`/ideas/[id]`, `/messages/[peerId]`, `/u/[id]`)라 3단 이상 계층 화면을 아직 찾지
못했다. `planned → beta` 승격은 실제 3단 이상 Web 화면이 나오고 키보드/스크린리더
검증을 거친 뒤 리드가 결정한다.
