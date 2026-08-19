# DesignSystemProvider contract

## 문제

antd `ConfigProvider`는 테마·방향(RTL)·글자 배율·locale 같은 전역 설정을 React Context로
아래 모든 컴포넌트에 내려준다. 이 패키지는 React도 RN도 import하지 않으므로 "Context로
내려준다"는 부분(그 자체가 antd `ConfigProvider`의 본체)은 애초에 이 저장소의 물건이 될
수 없다. 그래서 먼저 물어야 했다: **런타임(Context 전파)을 걷어내고 나면 계약할 것이
남는가?**

**남는다 — 다만 "provider 컴포넌트"가 아니라 "환경 값의 타입 + 기본값 + 병합 규칙"이다.**
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
  `ShowcaseDirection`, 그리고 이번에 내가 만든 `calendar.ts`의 인라인 파라미터까지 **최소
  6곳에서 각자 다시 선언**돼 있었다. 이건 "이미 있으니 만들지 마라"가 아니라 "정확히
  이런 중복을 막으려고 이 컴포넌트가 필요하다"는 증거로 읽었다 — `DesignSystemDirection`
  하나를 정식으로 열어 두고, 기존 파일은 건드리지 않되(공유 파일 다수·병렬 저작 규칙)
  이 문서에 이관 대상을 남긴다.
- **textScale은 이름도 모양도 이미 두 갈래였다.** `description-list.ts`는 `fontScale`
  (연속값, `Math.max(fontScale, 1)`로 자체 clamp), `showcase.ts`는 `textScale`(닫힌
  `1|1.5|2`)을 각자 쓰고 있었다. `DesignSystemTextScale = number`(연속값)를 상류
  신호로 열어 두고, 두 갈래가 결국 같은 값을 구독하게 될 자리임을 문서에 남긴다.
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
- `resolveDesignSystemEnvironment(input, { systemTheme })`가 기본값으로 채우고
  `theme: "system"`만 렌더러가 넘긴 `systemTheme`(OS가 보고한 현재 색 구성표)으로
  해소한다. **OS 조회 자체는 하지 않는다** — `Appearance.getColorScheme()`,
  `matchMedia('(prefers-color-scheme: dark)')`는 renderer 몫이다.
- validator는 던진다: 지원하지 않는 theme/direction, 0 이하이거나 유한하지 않은
  textScale, boolean이 아닌 reducedMotion.

## HJM 기본값

`designSystemEnvironmentDefaults`: `theme: "system"`, `direction: "ltr"`,
`textScale: 1`, `reducedMotion: false` — 신호가 아예 없을 때 가장 보수적인 값(변화 없음,
왼쪽에서 오른쪽, 기본 배율, 모션 감소 안 함)으로 시작한다.

## 플랫폼 번역

이 모듈 자체는 플랫폼을 분기하지 않는다 — 값 하나(테마/방향/배율/모션 선호)는 Web과
Native가 완전히 같은 모양으로 구독한다. 다른 것은 **그 값을 어떻게 얻고 어떻게
전파하는가**뿐이다:

- Web: `matchMedia`(색 구성표·prefers-reduced-motion), CSS `dir` 속성(direction),
  `document.documentElement`의 root font-size 배율. 전파는 React Context.
- Native: `Appearance`/`useColorScheme()`, `AccessibilityInfo`, `PixelRatio.getFontScale()`
  또는 `useWindowDimensions().fontScale`, `I18nManager.isRTL`. 전파는 RN Context 또는
  동등한 상태 저장소.

**catalog의 `platform: "adaptive"`를 `"shared"`로 바꾸는 것을 제안한다** — Calendar와
같은 이유다. 오버레이(Web popup vs Native Sheet) 선택지가 있는 컴포넌트가 아니라, 같은
값 타입을 두 플랫폼이 각자의 OS API로 채워 넣는 것뿐이라 `adaptive`의 정의(같은 의도의
플랫폼별 다른 표면)에 맞지 않는다.

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

## 검증 화면

아직 없다. `planned → beta` 승격은 실제 제품이 이 타입으로 Web/RN Context를 실제로
연결한 뒤 리드가 진행한다.
