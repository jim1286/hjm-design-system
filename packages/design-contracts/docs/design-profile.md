# 디자인 프리셋 계약

검토일: 2026-10-07 · 상태: 10종 실험 구현·대상 로컬 검사 완료 · 미게시(1.14.0 이후)

사용자가 레트로·종이·숲 등의 테마에 따라 같은 기능의 상호작용·구성·화면 배치도 자동으로 달라지고, 앱이 자기 테마를 한 번 주입하기를 요청했다. 색상 프리셋만으로는 그 요구를 충족하지 못하므로 네 축을 하나의 데이터 계약으로 둔다. 기존 상태 엔진을 테마마다 복제하는 방식은 채택하지 않는다.

## 소유권과 공개 경로

`@hjmds/design-contracts/design-profile`은 `hjmDesignPresets`, `defineHjmDesignProfile`, `resolveDesignProfileSurfaceMaterial`, `HjmDesignProfile`, `HjmDesignProfileInput`, `HjmDesignPreset`을 제공한다. 이 subpath는 기존 ThemeStudio의 색상 편집과 역할이 다르다. 색상 편집 subpath에 질감/구성 그래프를 추가하지 않고 선택형 프로필 진입점으로 분리했다. package export 추가의 근거는 이 절이다.

제품은 설정 파일에서 preset을 상속하고 필요한 축만 수정한다. 설정은 Web/Native renderer를 import하지 않으며 글꼴 자산의 설치·라이선스·로딩, 브랜드 자산, 데이터·권한·라우팅·서버 확정은 제품이 소유한다. HJM은 지원 가능한 표현/행동/배치와 환경 대체 경로를 소유한다.

```ts
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";

export const productDesign = defineHjmDesignProfile({
  extends: "forest",
  id: "product-design",
  compositions: { collection: "rows" },
});
```

이 helper는 검증한 불변 프로필을 만든다. Web `HjmProvider.designProfile`, Native `HjmNativeProvider.designProfile`에 넣으며, 중첩 Provider는 가장 가까운 프로필을 상속한다. 기존 프로필 없는 소비자의 기본값은 유지한다.

## 축과 기본값

| 축 | 중립 기본값 | 참고 프리셋의 차이 |
| --- | --- | --- |
| palette | 현재 HJM light/dark 17 semantic roles | 레트로의 잉크/황갈색, 종이의 따뜻한 중립색, 숲의 녹색 |
| tokens | 기존 radius/fontFamily/typography/heading/shadow | 모서리·글자 크기/행간/강조·그림자와 일반 monospace fallback; 폰트 자산은 번들하지 않음 |
| material | canvas/card/surface 모두 null | 레트로 noise, 종이 grain, 숲 mesh+glow; 오로라만 active=true, 나머지는 정적 |
| interactions | contentTransition=fade, selectionMotion=none | 레트로 slide, 종이 fade, 숲 rise와 slide 선택 배경 |
| compositions | collection=rows, toolbar=inline | 레트로 grid/inline, 종이 rows/collapsible, 숲 cards/collapsible |
| screens | overview=dashboard | 종이 editorial, 숲 landscape |

상속 후 데이터는 재귀적으로 동결한다. 호출자의 배열/descriptor를 동결하지 않고 복사해 앱 소유 상태에 영향을 주지 않는다. light/dark 팔레트와 nested 토큰은 역할별로 병합하며, preset 원본은 바뀌지 않는다. 고정된 원·pill 의미 때문에 radius.full=999는 유지한다. 글자 크기·줄 높이·그림자·질감 범위와 지원하는 변형 이름을 검사하고 지정 색상 쌍의 대비 미달을 거부한다. 이 검사는 완성 화면 접근성 인증이 아니다.

## 기존 API 비교와 연결 순서

- 기존 Provider/brandPalette/environment는 유지한다. 프리셋은 별도 환경 축이 아니라 네 단계의 표현/배치 기본값이며 명시적인 props가 우선한다.
- `ContentTransition`의 fade/rise/slide/scale와 `SegmentedControl`·`Tabs`의 selectionMotion을 재사용한다. Tabs의 명시 appearance가 우선이며 세로는 standard다. 없는 피드백 엔진을 제공했다고 표시하지 않는다.
- Surface와 Web 테마 변수, Native tokens 및 직접 foundation을 읽는 소비자를 함께 연결한다. `tokens.radius` 값 정의만으로 전체 컴포넌트 적용을 주장하지 않는다.
- 구성은 기존 Grid/List/Collapsible/도구 묶음과 공개 슬롯을 대조한다. 화면은 기존 ScreenLayout의 제목·본문·상태·주 행동 계약을 유지하며 배치 변형을 추가한다. 같은 화면의 데이터/초안을 variant subtree 안에 저장해 전환 시 버리지 않는다.
- 질감은 optional EffectSurface renderer의 host/peer 경계를 유지한다. 프로필의 descriptor 정의만으로 native SVG peer 설치나 실제 표시를 보증하지 않는다.

## 현재 증거와 남은 조건

공통 데이터·Provider·기본 토큰 소비·상호작용 기본값·OverviewScreen 구성과 화면·양쪽 Storybook 비교를 구현했다. 전체 기존 컴포넌트의 정적 토큰 소비 감사는 진행 중이다. 브라우저의 입력 유지·복구와 light/dark·좁은 폭·큰 글자·RTL·모션 축소는 [QA 기록](../../../docs/qa/2026-10-07-design-profile-research.md)에서 확인했다. Native 실기기 검증은 아직 미완료다. 실험 등록·승격·게시·Utilverse 적용을 분리한다. 완료 기준은 [작업 계획](../../../docs/plans/reference-release-utilverse-2026-10-07.md)의 프리셋 절을 따른다.

## 10종 확장과 현재 연결

2026-10-07 사용자 요청으로 참조 팩은 최소 10종이며 neutral은 수에서 제외한다.
[조사/QA 기록](../../../docs/qa/2026-10-07-design-profile-research.md)에 개별 출처와 원본 관찰/HJM 해석을 구분한다.
Provider의 `designProfile`에 `hjmDesignPresets.forest` 또는 `defineHjmDesignProfile(...)` 결과를 넣는다.
부분 JSON을 Provider에 직접 넣지 않는다. 앱의 파일·등록·설정 저장과 폰트 로딩은 앱이 소유한다.
`brandPalette`는 선택된 프로필의 해당 테마 팔레트 위에 놓인다.

프로필은 현재 양 플랫폼 Provider, 기본 Text/Surface/Button·필드 모서리, ContentTransition,
SegmentedControl·Tabs, ScreenLayout 및 optional OverviewScreen에 연결한다. 모든 기존 공개 컴포넌트의
정적 recipe 경로까지 자동 반영 완료를 뜻하지 않는다. ScreenLayout의 기존 기본 배치는 프로필이 없으면 유지한다.
유리의 실제 backdrop blur와 클레이 inset shadow는 아래 Surface 질감 계약으로 연결한다. Native의 선택형 host·OS·architecture 조건과 실제 기기 검증은 별도다.


## 큰 제목까지 한 번에 지정하기

`tokens.heading`은 `level1`~`level5`의 fontSize/lineHeight/fontWeight를 부분 지정한다.
현재 Heading은 두 renderer 모두 이 값으로 그리고 문서 `semanticLevel`과 textScale을
따로 유지한다. 중립은 foundation의 40/32/24/20/18px를 그대로 쓰며, 에디토리얼의
level1/2는 44/34px·행간 54/44px·굵기 500, 브루탈리즘은 48/38px·행간 56/46px·굵기
800이다. 이 두 큰 제목 선택은 원본 치수 복제가 아니라 편집형/강한 강조 프리셋의
시각 계층을 구분한 HJM 실험값이며 좁은 폭·큰 글자 QA와 함께 판단한다.

```ts
const productDesign = defineHjmDesignProfile({
  extends: "paper",
  tokens: { heading: { level1: { fontSize: 52, lineHeight: 64, fontWeight: "500" } } },
});
```

미지정 값은 preset을 상속한다. `tokens.typography.heading/titleLarge/title`은 이전과
같이 Heading level3/4/5의 변경 기본값이며, 같은 필드에 명시한 `tokens.heading`이
우선한다. 나머지 프로필 축·본문 Text typography와 문서 순서는 바꾸지 않는다.
지원하지 않는 persisted heading 단계는 조용히 무시하지 않고 거부한다.

## 오버레이·선택 입력의 프로필 연결 보완

2026-10-07 실제 소비 경로 대조에서 Web의 Dialog/Sheet/Toast 전용 그림자 변수와 Native의
Dialog/AlertDialog/Sheet, Select/Combobox, Notice/Progress/Skeleton/Toast가 프로필의 해당
역할 대신 foundation/recipe 값을 직접 읽었다. Provider 값만 바꾸는 방식으로는 동일 화면의
카드와 열린 오버레이가 다른 표현을 유지했으므로 기존 API의 소비 경로를 연결했다.

- Web Dialog/Sheet/Toast와 Native Dialog/AlertDialog/Sheet/일반 Toast는 `tokens.shadow.floating`을
  읽는다. 프로필 없는 소비자는 각 recipe의 기존 그림자와 Native elevation을 유지한다.
- Native에서 모서리의 역할 이름은 각 recipe가 정하고 값은 Provider의 `tokens.radius`가 정한다.
  원·pill의 full=999, Sheet 하단의 바닥 모서리 0, 명시한 Skeleton 반지름은 유지한다.
- Android elevation은 별도 플랫폼 그림자를 그리므로 프로필 opacity=0이면 elevation도 0이다.
  나머지는 radius/offsetY의 최대값으로 근사한다. CSS blur와 기기 그림자의 픽셀 동등성을 뜻하지
  않는다. [플랫폼 근거](https://reactnative.dev/docs/view-style-props#elevation).
- 액션·선택·초안·Modal lifecycle·safe area·키보드 처리는 바꾸지 않는다. Liquid Toast의
  managed presentation은 기존 별도 표현 host가 계속 소유한다.

기존 테마 조합 실험에서 Notice/Skeleton/Toast와 Dialog/Sheet를 직접 열고, 오버레이 안의
다음 테마 버튼으로 10종을 순회한다. 같은 제어 초안을 닫기/재열기에서도 유지한다.
Web의 10개 밝은 Dialog와 10개 dark/RTL/2배 Sheet 및 390px 검토는 위 QA 기록에 있다.
Native 테스트는 실제 기기의 표시·VoiceOver 증거가 아니다. 오버레이 토큰 연결만으로 모든 질감이 적용되는 것은 아니다. 아래 Surface 질감 연결과 별도로 남은 다른 컴포넌트의 직접 토큰/recipe 소비 경로도 계속 대조한다.


## Surface/Card의 유리·클레이 질감

2026-10-07 원본 대조에서 유리는 glow만, 클레이는 grain만 있어 물리적인 표면 표현이 빠져 있었다.
`material.surface`를 기존 Surface와 그 소비자인 Card에 연결한다. 새 wrapper나 상태 엔진을 만들지 않는다.
EffectSurface는 mesh/glow/noise/grain 장식이며, ProgressiveBlur는 스크롤·입력 가림을 판단하는 가장자리
마스크다. 배경 영역 전체의 blur/inset은 이들과 역할이 달라 Surface가 소유한다.

| 필드 | 중립/미지정 | 범위와 실제 사용 |
| --- | --- | --- |
| `material.surface` | null | 부분 객체는 선택 preset의 surface를 상속, null은 해당 처리를 해제 |
| `blurStrength` | 0 | 0~1. glass 0.75 → Web 24px. Native host의 강도는 기기별로 보정하며 픽셀 동등성 아님 |
| `fillOpacity` | 1 | 0.85~1. glass 요청 0.88. blur가 0이거나 지원되지 않으면 불투명 |
| `insetShadows` | 빈 배열 | 최대 2개. color 6자리 HEX·opacity 0~1·radius 0~96·offsetX/Y -96~96 |

clay의 안쪽 빛은 white/0.22/radius10/offset3,4, 그림자는 black/0.12/radius12/offset-3,-4다.
밝은 glass의 textSub=#5b6879·textWeak=#748292는 중립 팔레트의 약한 색이 대비 보정에서 opacity=1을
요구했던 실제 비교 결과 때문에 더 짙게 정했다. 대비 기준을 낮추지 않고 질감과 읽기 경계를 함께 유지한다.
이 값은 외부 원본 치수·브랜드색의 복사가 아니라 HJM의 정적인 표면 실험값이다. 바깥 그림자는 기존
`tokens.shadow.floating`, 모서리는 같은 `tokens.radius` 역할을 계속 읽는다.

```ts
const productDesign = defineHjmDesignProfile({
  extends: "glass",
  material: { surface: { blurStrength: 0.5 } },
});
```

`resolveDesignProfileSurfaceMaterial(profile, finalThemePalette)`는 Provider의 최종 제품 팔레트에서
bg 위의 기존 대비 쌍이 검정/흰색 배경 합성 후에도 유지되도록 요청 opacity를 0.01씩 높인다.
질감 뒤의 실제 이미지가 글자 대비의 근거가 될 수 없기 때문이다. 두 renderer는 같은 엔진인
`@hjmds/design-contracts/palette-contrast`의 `resolveSurfaceFillOpacity(requested, palette)`를 읽는다.
이 palette-only 진입점을 재사용해 일반 Provider가 선택형 전체 preset registry를 runtime import하지 않는다. 이 함수는 장식·선택된 입력·이미지·
실제 화면 전체 접근성을 인증하지 않는다. inset의 가장자리와 미디어/결과 상태는 실제 화면에서도 확인한다.

### Web

Provider가 네 surface CSS 변수를 매번 해석한다. 중첩 neutral은 상위 glass/clay를 지운다.
실제 `backdrop-filter` 또는 Safari의 prefixed 속성을 지원할 때만 투명 fill을 쓰고, OS
`prefers-reduced-transparency: reduce`이면 opaque/none으로 대체한다. blur=0이면 `none`으로
내보내므로 평범한 Surface에 불필요한 backdrop stacking context를 만들지 않는다.

### Native의 한 번 등록하는 host

`HjmNativeProvider.surfaceEffects`는 `renderBackdrop({ strength, theme })`와 `insetShadows`를
제품 루트에서 공급한다. 중첩 Provider는 그대로 상속하며 `{}`는 그 subtree를 해제한다.
core renderer는 Expo/Skia/blur 라이브러리를 import하지 않는다. `renderBackdrop`은 실제 backdrop
React element를 반환하고 사용할 수 없으면 null을 반환한다. callback은 앱 setup에서 안정적으로 둔다.

- iOS는 [AccessibilityInfo](https://reactnative.dev/docs/0.81/accessibilityinfo)의 투명도 줄이기 설정을
  한 번 관찰한다. unknown/reject/설정 활성화는 불투명이다. 실시간 이벤트가 초기 비동기 응답보다 우선한다.
- 장식만 pointer/접근성에서 제외하고 모서리 clip을 한다. 본문은 stable keyed sibling이므로 optional host
  실패·테마 전환이 초안을 remount하지 않는다. 실패는 opaque로 대체하고 host 함수 교체/질감 변경 때만 재시도한다.
- `insetShadows=true`는 제품이 [RN New Architecture와 Android API 29 이상](https://reactnative.dev/docs/0.81/view-style-props#boxshadow)을 확인한 경우만 쓴다. 기본 false이며 core는 기존 architecture도 지원한다.
- [Expo BlurView](https://docs.expo.dev/versions/latest/sdk/blur-view/)를 쓰는 Android 제품은 먼저 렌더한
  BlurTargetView의 ref를 host에 공급한다. Target은 효과가 그려지는 범위를 덮어야 한다. Showcase는 API31 미만을
  불투명으로 유지하며, 지원 기기에서 strength×100과 `dimezisBlurViewSdk31Plus`를 쓴다.

```tsx
// 선택형 blur 모듈이 설치된 제품 host. capability 확인과 Target 배경은 제품 setup 소유.
const effects = useMemo(() => ({
  insetShadows: hostSupportsInsetShadows,
  renderBackdrop: ({ strength, theme }: { strength: number; theme: "light" | "dark" }) =>
    hostSupportsBlur ? <BlurView style={StyleSheet.absoluteFill} blurTarget={targetRef}
      intensity={strength * 100} tint={theme} blurMethod="dimezisBlurViewSdk31Plus" /> : null,
}), [hostSupportsBlur, hostSupportsInsetShadows, targetRef]);

<HjmNativeProvider designProfile={productDesign} surfaceEffects={effects}>{children}</HjmNativeProvider>
```

실험 ‘테마 조합’의 무늬 배경 위 공개 Card에서 입력한 초안과 다음 테마 버튼으로 비교한다.
Web 실제 표시·Native mock-host 회귀·기기 미확인 범위는 [QA 기록](../../../docs/qa/2026-10-07-design-profile-research.md)에 보존한다.
오버레이/상단 바 등 Surface를 쓰지 않는 모든 공개 소비자에 이 material까지 반영 완료한 것은 아니다.


## 모서리·서체 소비 경로 보완

2026-10-07 후속 감사에서 Native의 날짜·태그·약관·목록·메뉴·상단 바·저장 컬렉션 등은
recipe가 정한 역할을 foundation에서 직접 읽어 프로필의 모서리를 놓쳤다. 같은 공개 API가
Provider의 `tokens.radius`에서 역할을 해석하도록 연결했다. 원·pill의 full, 날짜 셀의 원형,
selection glyph의 고정 geometry는 별도 계약으로 유지한다. 테마가 상태 엔진을 대체하지 않는다.

PasswordField large, Calendar custom content, CodeBlock, optional GestureSheetInput도
Provider typography를 읽는다. PasswordField는 같은 줄 높이로 프레임을 계산하며 size recipe는
최소 높이로만 사용한다. CodeBlock의 `fontFamily.code`는 Web CSS 변수와 Native host로 연결하고
글자 확대는 한 번만 적용한다. 사용자 font 등록·실기기 glyph/줄바꿈은 제품 검증 대상이다.

구조 비교 근거: [Tailwind theme 변수](https://tailwindcss.com/docs/theme)는 서체·모서리 등
범주별 token과 실제 소비 utility를 연결하고, [shadcn theme](https://ui.shadcn.com/docs/theming)는
semantic foreground/background와 공유 radius scale을 소비 컴포넌트에 연결한다. HJM도 기존
semantic role을 재사용하되 CSS 생성기·단일 비율 radius를 새 의존성으로 도입하지 않는다.
기존 프로필의 sm/md/lg/xl 개별 값과 네이티브 번역·상태 계약을 유지하는 선택이다.


## Native UI 서체의 실제 host 연결

2026-10-07 raw Text/TextInput 대조에서 Text는 UI 서체를 읽었지만 FieldRenderer,
Combobox, NumberField, Slider, TagsInput, optional GestureSheetInput과 CodeBlock 제목은
시스템 서체를 유지했다. [React Native 텍스트 상속](https://reactnative.dev/docs/text)은 Text
하위 트리에 한정되므로 상위 View 스타일만으로 해결하지 않는다. 내부 font resolver를 공유하고
각 입력/라벨 host에서 Provider의 UI 역할을 읽는다. CodeBlock 원문만 code 역할을 유지한다.
고정 체크·닫기 glyph와 투명 OTP editor는 기존 의미를 유지한다.

기본 UI stack 전체는 Native OS 서체로 유지한다. 첫 항목만 비교하면 제품이 직접 등록한
`ui: ["Inter"]`까지 기본 stack으로 오인하므로 전체 stack과 비교한다. 제품의 명시적인 named
font는 첫 항목을 Native에 전달한다. Native는 CSS fallback 목록을 그대로 해석하지 않는다.
`ui-monospace`/`monospace`는 기존 iOS Menlo·Android monospace로 번역한다. 나머지 제품 font는
유효한 플랫폼 등록 이름과 글리프/굵기 지원을 제품이 검증해야 한다. 제품 자산은 HJM에 번들하지 않는다.

TagsInput의 실제 입력칸은 body 글자·줄 높이와 같은 controlled scale을 한 번만 읽는다.
부모/중첩 프로필 전환은 입력 요소·초안·NumberField의 미확정 숫자·검색어를 유지한다.
[Refero token 지침](https://styles.refero.design/ai-agents/css-variables-design-tokens)의 역할 소비,
[컴포넌트 비교](https://styles.refero.design/ai-agents/component-design-prompts)의 반복되는 서체 역할,
[검수 지침](https://styles.refero.design/ai-agents/agentic-ui-quality-checklist)의 실제 상태 검토를
기존 HJM 계약과 대조한 후속 보완이다. linked 제품 소스와 모든 상태를 검수한 결과는 아니다.
실제 기기의 폰트 로딩·텍스트 줄바꿈·접근성 증거는 계속 별도 검증한다.

## 팝오버와 하단 chrome의 그림자 상속

2026-10-07 추가 소비 감사에서 Web Popover의 inline recipe 값과 Native BottomCTA·
floating/capsule BottomNavigation의 recipe 그림자가 프로필을 우회하는 것을 확인했다.
기존 API에 `shadow.floating`을 연결했다. bar는 무그림자를 유지하고 BottomCTA는 footer가
위 콘텐츠와 겹치는 역할이라 offsetY의 절댓값을 위쪽으로 뒤집는다(bottomCtaRecipe 근거).
별도의 그림자 토큰/엔진을 추가하지 않는다. Native의 0-opacity는 iOS 값뿐 아니라 기존
공통 helper로 Android elevation도 제거한다. 프로필 없는 경로는 이전 renderer 외형이다.

양 Showcase의 같은 저장/실패 행동은 공개 BottomCTA로 비교하고 Web chrome 비교에는
기존 공개 Popover를 연결했다. 열린 초안/포커스·safe area·선택 route·행동 소유권 검증과
Native 기기 미확인 범위는 [QA](../../../docs/qa/2026-10-07-design-profile-research.md)에 남긴다.
