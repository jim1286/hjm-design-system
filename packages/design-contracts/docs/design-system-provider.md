# DesignSystemProvider contract

## 문제

antd `ConfigProvider`는 테마·방향(RTL)·글자 배율·locale 같은 전역 설정을 React Context로
아래 모든 컴포넌트에 내려준다. 이 패키지는 React도 RN도 import하지 않으므로 "Context로
내려준다"는 부분(그 자체가 antd `ConfigProvider`의 본체)은 애초에 이 저장소의 물건이 될
수 없다. 그래서 먼저 물어야 했다: **런타임(Context 전파)을 걷어내고 나면 계약할 것이
남는가?**

**남는다 — 다만 "provider 컴포넌트"가 아니라 "환경 값의 타입 + 기본값 + 병합 규칙 +
해석된 색 팔레트"다.**
`showcaseEnvironmentMatrix`(`src/showcase.ts`)가 이미 theme/direction/textScale/motion
네 축을 정확히 열거하고 있다는 것이 그 증거였다 — 다만 그건 Showcase 문서 도구가 쓰는
**닫힌 5개 fixture 시나리오**(`id: "default"|"dark"|"large-text"|"rtl"|"reduced-motion"`)
이지, 실제 제품이 런타임에 구독할 **열린 값 타입**이 아니다. 이 계약이 그 열린 버전이다.

## 이미 있는 것과 겹치지 않는지 먼저 확인했다

- **theme 축은 이미 완결돼 있다.** `colors.ts`가 이미 `ThemePreference =
  "system"|"light"|"dark"`, `ResolvedTheme`, `isThemePreference()`를 갖고 있다. 이
  모듈은 그것을 **재선언하지 않고 그대로 import**한다 — "이미 있는 것과 겹치면 만들지
  마라"는 지시를 theme 축에는 그대로 적용해 아무것도 새로 만들지 않았다.
- **direction 축은 겹치는 게 아니라 흩어져 있었다.** `"ltr" | "rtl"`가
  `BottomNavigationDirection`, `TabsDirection`, `SelectionDirection`, `IconDirection`,
  `ShowcaseDirection`, 그리고 `calendar.ts`의 인라인 파라미터까지 **최소 6곳에서 각자 다시
  선언**돼 있었다. 공개 이름은 호환성을 위해 유지하되 모두
  `DesignSystemDirection`의 type alias로 이관했다. 따라서 기존 import는 깨지지 않고,
  허용 값의 단일 출처만 Provider 계약으로 모였다.
- **textScale은 이름도 모양도 이미 두 갈래였다.** `description-list.ts`는 `fontScale`
  (연속값, `Math.max(fontScale, 1)`로 자체 clamp), `showcase.ts`는 `textScale`(닫힌
  `1|1.5|2`)을 각자 쓰고 있었다. `DesignSystemTextScale = number`(연속값)를 상류
  신호로 열었고 DescriptionList의 세 번째 인수와 Showcase fixture 변환 함수가 이 타입을
  사용한다. Showcase의 닫힌 union과 기존 `motion` 필드는 fixture API 호환을 위해 유지한다.
- **reducedMotion은 "선호"와 "전략"이 이미 분리돼 있었다.** `foundations.ts`의
  `ReducedMotionBehavior`("instant"/"opacity"/"static")는 컴포넌트가 Reduce Motion일
  **때 무엇을 하는지**(전략)이고, `carousel.ts`의 `inputs: ["reducedMotion", ...]`는 그
  현재 **선호값**(boolean) 하나를 이미 컴포넌트 입력으로 받고 있었다. 이 모듈은 그
  boolean 선호값의 단일 출처를 계약할 뿐, 각 컴포넌트의 전략(motionPreset)을 대체하지
  않는다 — 둘은 계속 분리된 채로 둔다.

## 일반화한 계약

- `DesignSystemEnvironmentInput`은 네 필드 모두 **선택**이다 — 렌더러가 아직 일부
  신호만 알고 있을 수 있기 때문이다(RN의 `AccessibilityInfo.isReduceMotionEnabled()`는
  비동기라 첫 렌더에는 값이 없을 수 있다).
- `resolveDesignSystemEnvironment(input, options)`의 우선순위는 축마다
  **명시 input → 해석된 parent → renderer의 system signal → HJM default**다. 기존 호출의
  필수 `systemTheme`은 그대로이며 `systemDirection`, `systemTextScale`,
  `systemReducedMotion`, `parent`만 선택적으로 추가됐다. `theme: "system"`을 명시하면
  parent보다 현재 `systemTheme`을 우선한다.
- `resolveDesignSystemProviderValue()`는 이 환경과 `THEMES`, `ACCENTS`, `accentFill`을 묶어
  `{ environment, palette }`를 반환한다. renderer는 `palette`를
  `resolveColorReference()`에 그대로 전달한다.
- `validateDesignSystemProviderValue()`는 renderer에 직접 주입되는 완전한 제품 palette도
  같은 런타임 경계에서 검사한다. 모든 semantic theme/accent role과 alpha 합성 가능한
  6자리 hex 값이 필요하며, 일부 token만 덮는 partial override는 허용하지 않는다. 제품
  palette의 대비 fixture와 승인 책임은 그 완전한 palette를 제공하는 제품 adapter가 가진다.
- `validateDesignSystemEnvironmentInput()`은 선택형 input을 검사하고,
  `validateResolvedDesignSystemEnvironment()`는 parent 전용 invariant를 검사한다. 후자는
  `theme: "system"`, 누락된 축, 잘못된 direction, 0 이하/non-finite textScale, boolean이
  아닌 reducedMotion을 모두 거부한다. 이미 resolved라는 타입 이름을 런타임에서도 지킨다.
- **OS 조회 자체는 하지 않는다.** `Appearance`, `AccessibilityInfo`, `I18nManager`,
  `PixelRatio`, `matchMedia`는 renderer 몫이고 코어는 계속 React/RN/DOM 의존성이 없다.

## HJM 기본값

`designSystemEnvironmentDefaults`: `theme: "system"`, `direction: "ltr"`,
`textScale: 1`, `reducedMotion: false` — 기존 호출의 fallback과 호환되는 값이다. 실제
renderer는 이 fallback을 OS 감지 결과로 오해하면 안 되고, root에서 반드시
`systemReducedMotion`을 공급해야 한다. RN의 비동기 신호를 아직 모르는 첫 프레임에는 adapter가
애니메이션을 시작하지 않는 정책을 별도로 적용한다.

## 플랫폼 번역

이 모듈 자체는 플랫폼을 분기하지 않는다 — 같은 Provider value를 Web과 Native가
구독한다. 다른 것은 **system signal을 어떻게 얻고, 값을 어떻게 전파하고, palette를
어떤 style API로 번역하는가**뿐이다:

- Web: `matchMedia`(색 구성표·prefers-reduced-motion), CSS `dir` 속성(direction),
  `document.documentElement`의 root font-size 배율. 전파는 React Context.
- Native: `Appearance`/`useColorScheme()`, `AccessibilityInfo`, `PixelRatio.getFontScale()`
  또는 `useWindowDimensions().fontScale`, `I18nManager.isRTL`. 전파는 RN Context 또는
  동등한 상태 저장소.

catalog의 `platform: "shared"`가 맞다. 오버레이(Web popup vs Native Sheet)처럼 표면을
바꾸는 컴포넌트가 아니라, 같은 값 타입을 두 플랫폼이 각자의 OS API로 채워 넣기 때문이다.

중첩 Provider는 `parent.environment`를 options에 넘긴다. 일부 축만 명시하면 나머지는
parent에서 상속하고, root Provider는 system signal로 채운다. 이 규칙 덕분에 각 React/RN
adapter가 자체 병합 로직을 다시 만들 필요가 없다. `parent`에는 반드시
`resolveDesignSystemEnvironment()` 또는 `resolveDesignSystemProviderValue().environment`의
결과를 넘긴다. `theme: "system"`인 input 객체를 타입 단언으로 parent에 넣어도 resolver가
다시 해석하지 않고 즉시 실패한다.

## 공개한 축 / 배제한 축

| 축 | 상태 |
| --- | --- |
| `theme`(system/light/dark) | 공개 — `colors.ts` 재사용 |
| `direction`(ltr/rtl) | 공개 — 새로 정식화 |
| `textScale`(연속값) | 공개 |
| `reducedMotion`(boolean 선호) | 공개 |
| `locale`(언어 코드) | **배제** — RTL 여부는 `direction`으로 이미 표현되고, 숫자·날짜·복수형
  포맷은 "제품이 포맷한 문자열을 받는다" 원칙상 이 패키지가 몰라도 된다. locale 자체가
  필요한 제품은 그 값을 직접 들고 있다가 필요한 곳(예: `Intl.DateTimeFormat`)에 쓴다. |
| React/RN Context, `<Provider>` 컴포넌트, `useDesignSystem()` 훅 | **배제** — 이 패키지는
  런타임 의존성을 갖지 않는다. 각 제품의 renderer가 이 값 타입을 자신의 Context에 담아
  전파한다. |
| `size`(antd ConfigProvider의 컴포넌트 전역 사이즈 프리셋) | **배제** — 측정된 요구가
  없고, 있다 해도 그건 각 recipe의 `sizes`(예: `selectRecipe.sizes`)가 이미 컴포넌트별로
  갖고 있는 축이라 전역 오버라이드를 얹으면 두 곳이 같은 축을 다시 소유하게 된다. |
| 임의 theme/component token override | **partial override는 배제** — HJM light/dark는 대비
  테스트를 함께 통과하는 고정 계약이다. 별도 브랜드 제품은 모든 semantic role을 가진
  완전한 `DesignSystemProviderValue`만 renderer의 `value` 경계로 주입하며, 런타임 shape 검사와
  제품별 전체 대비 fixture를 함께 둔다. |

## 제품 adapter 증거

Showcase fixture만으로 성숙도를 올리지 않는다. 현재는 다음 실제 제품 경계가
`resolveDesignSystemProviderValue()`의 `environment + palette`를 Context에 저장하고 renderer에
내려준다.

| 제품 표면 | 실제 adapter 증거 | 검증 경계 |
| --- | --- | --- |
| BurnTok Web | `../BurnTok/apps/web/src/components/ThemeProvider.tsx` | `matchMedia`, root `dir`, 저장된 theme preference를 resolver에 넣고 Context가 `providerValue`, `environment`, `palette`를 공개한다. OS 축은 system option으로 전달하므로 nested `parentEnvironment`가 omitted axis보다 먼저 적용된다. `palette.theme.bg`는 브라우저 theme color에 실제 적용된다. `ThemeProvider.test.tsx`가 이 경계를 검증한다. |
| BurnTok RN | `../BurnTok/apps/mobile/src/components/ThemeProvider.tsx` | `useColorScheme`, `I18nManager`, `useWindowDimensions().fontScale`, `AccessibilityInfo`의 신호를 system option으로 해석하고 `parentEnvironment` 상속 및 명시 fixture를 지원하며 `palette.theme`을 Native style renderer의 `colors`로 제공한다. |
| Yajalal RN | `../yajalal/modules/app-rn/src/lib/theme/provider-adapter.ts`, `ThemeProvider.tsx` | HJM resolver로 환경 우선순위와 `parentEnvironment`의 omitted axis 상속을 해석하고 `validateResolvedDesignSystemEnvironment()`로 검증한 뒤, 기존 제품 팔레트만 검토된 adapter로 바꾼다. `ThemeProvider.test.ts`가 해석된 환경과 팔레트를 검증한다. |

Showcase의 `DesignSystemProvider` Web reference는 이 증거를 대신하는 가상 UI가 아니다.
동일한 provider value의 theme, direction, textScale, reducedMotion과 해석된 palette를
직접 표시하는 비시각 adapter presentation이다.

## 현재 성숙도

catalog 상태는 `beta`다. Web과 RN, 두 제품에서 값 해석·Context 전파·palette 소비,
중첩 Provider의 omitted axis 상속 경계까지 확인됐다. 다만 이 상속 adapter가 포함된
추가 제품 릴리스 증거는 아직 없으므로 roadmap은 다음 승격 조건을
`evidence-needed`로 기록하고 `stable`을 과장하지 않는다.
