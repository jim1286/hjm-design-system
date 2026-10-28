# AuthScreenLayout

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-20
- 근거: [로그인 화면 골격](../../auth-screen.md), [1.4 제품 채택 가이드](../../product-adoption-1.4.md), recipe `authScreenRecipe`(`src/auth-screen.ts`), 포트폴리오 상위 기준 루트 `docs/LOGIN_SCREEN_STANDARD.md`(LS)
- 스토리북: `배포/컴포넌트/레이아웃/로그인 화면`

## 언제 쓰나

로그인·가입 진입 화면의 배치에 쓴다. 위 영역(`hero` + `main`)은 남는 세로 공간에서 가운데 정렬되고,
`footer`(동의 고지·정책 링크)는 바닥에 붙는다. 내용이 화면보다 길면 스크롤로 바뀐다.
`AuthScreenLayout`은 배치를 소유하고, 히어로 문구와 동의 고지·정책 링크는 같은 모듈의 `AuthScreenHero`·`AuthScreenFooter`가
글자 단계·색·간격을 소유한다. 제품은 문자열·마크·링크 목적지만 넘긴다.

기본 API 제공 기준은 1.12.1이며, Native `safeAreaBottom`과 링크 `target`·`rel`·`accessibilityHint`는 1.28.1부터 지원한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 제공자 버튼 하나하나 | [AuthProviderButton](auth-provider-button.md) (`main` 슬롯에 넣는다) |
| 동의 체크 항목 | [Agreement](agreement.md) (`footer`나 가입 단계에 넣는다) |
| 로그인 위에 "로그인" 제목·뒤로/닫기만 두려고 바깥에 얹는 [TopBar](top-bar.md) | 이 레이아웃의 `title`·`exit`(1.31.0) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `AuthScreenLayout` | 기본(배치) | `@hjmds/react`, `/auth-screen` | `@hjmds/react-native`, `/auth-screen` |
| `AuthScreenHero` | `hero` 슬롯: 마크·eyebrow·태그라인·설명 | 같음 | 같음 |
| `AuthScreenFooter` | `footer` 슬롯: 동의 고지·정책 링크(·구분) | 같음, 링크 `href`(+`target`·`rel`) 또는 `onClick` | 같음, 링크 `onPress` |

## 최소 사용 예

```tsx
// Web
import { AuthScreenFooter, AuthScreenHero, AuthScreenLayout } from "@hjmds/react/auth-screen";

<AuthScreenLayout
  mainCard
  {...(pending ? { pendingLabel: t("auth.pending") } : {})}
  hero={<AuthScreenHero mark={<ProductMark />} title={t("auth.tagline")} description={t("auth.description")} />}
  main={<ProviderButtons />}        // pending이어도 같은 목록
  footer={<AuthScreenFooter notice={t("auth.consent")} links={[
    // 새 탭에서 여는 문서: target만 주면 rel은 "noreferrer noopener"가 기본이다.
    { label: t("legal.privacy"), href: privacyUrl, target: "_blank", accessibilityHint: t("legal.opensNewTab") },
    { label: t("legal.terms"), href: termsUrl, target: "_blank", accessibilityHint: t("legal.opensNewTab") },
  ]} />}
/>
```

```tsx
// Native
import { AuthScreenFooter, AuthScreenHero, AuthScreenLayout } from "@hjmds/react-native/auth-screen";

<AuthScreenLayout
  title={t("auth.title")}                                                       // 머리 띠의 route 이름(선택)
  exit={{ kind: "close", label: t("common.close"), disabled: pending, onPress: close }}  // 헤더 시작 쪽 닫기(선택)
  mainCard
  {...(pending ? { pendingLabel: t("auth.pending") } : {})}
  hero={<AuthScreenHero mark={<ProductMark />} title={t("auth.tagline")} description={t("auth.description")} />}
  main={<ProviderButtons />}
  footer={<AuthScreenFooter links={[
    { label: t("legal.privacy"), onPress: openPrivacy, accessibilityHint: t("legal.opensInBrowser") },
    { label: t("legal.terms"), onPress: openTerms, accessibilityHint: t("legal.opensInBrowser") },
  ]} />}
  safeAreaBottom={useSafeAreaInsets().bottom}   // 바깥 SafeAreaView bottom·paddingBottom 래퍼 대신
  testID="login-screen"
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `title` | 문자열 | — | 1.31.0. route 이름("로그인")을 [ScreenLayout](screen-layout.md) 가운데 정렬 머리와 같은 띠(최소 높이 52, `Heading` `level5`, 문서 수준 1)에 그린다. 공백만 있으면 `TypeError`. Web은 이때 `AuthScreenHero`의 기본 `headingLevel`이 2가 된다(route 이름이 h1) |
| `exit` | `ScreenExit`(`{ kind: "back" \| "close", label, onClick/onPress, disabled? }`) | — | 1.31.0. ScreenLayout·TopBar `exit`와 같은 아이콘 뒤로/닫기, 머리 띠 시작 끝. `label`은 보조기술 이름. `title` 없이 `exit`만 줘도 띠를 그린다 |
| `hero` · `main` | `ReactNode` | 필수 | 제품 마크·제목·설명 / 제공자 버튼 목록(진행 중에도 같은 목록) |
| `footer` | `ReactNode` | — | 동의 고지·정책 링크 |
| `density` | `regular` · `compact` | `regular` | 제품이 화면 높이를 보고 고른다. 간격·padding만 바뀐다 |
| `hasFooter` | `boolean` | `true` | `false`이거나 `footer`가 없으면 아래 영역을 그리지 않는다 |
| `mainCard` | `boolean` | `false` | 기존 제품 카드와 중첩 방지. 새 조합은 켠다. 카드 배경은 테마 `bg`, radius `lg`, padding `md` |
| `pendingLabel` | 문자열 | — | 주면 진행 상태다. 공백만 있으면 `TypeError`. 제거하면 원래 상태로 돌아온다 |
| Web `as` | `main` · `section` | `main` | 최대 폭은 416이다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 배치 전용(Web·Native 모두) |
| `initialFocus` | `first-input` · `none` | `first-input` | 페이지 진입 시 첫 유효 입력 또는 `initialFocusTarget` 칸에 한 번 포커스한다. 기본값·진입 한정 정책 변경은 1.33.0부터 제공. 진입 종료 뒤 단계 변경·입력 표시로 자동 포커스를 다시 시작하지 않으며 하단 시트 안에서는 자동 포커스하지 않는다. [진입 포커스](screen-layout.md#진입-포커스) |
| Native `testID` | `string` | — | 본문 `ScrollView` 식별(머리 띠가 있어도 같은 `ScrollView`) |
| Native `backdrop` | `ReactNode` | — | 미게시(checkout 개발). 스크롤 내용 맨 위 뒤에 깔리는 장식 장면(제품 하늘 띠 등). hero·main·footer와 **함께 스크롤**하고 터치·접근성에서 빠진다. 제품 노드는 내용 위 끝 기준 절대 위치로 놓으며 좌우 여백 밖까지 닿는다. 화면 뒤에 고정한 그림 위로 글자가 지나가지 않게 한다 |
| Native `safeAreaBottom` | 0 이상의 유한수 | `0` | 화면이 닿는 창 아래 가장자리의 safe area(`useSafeAreaInsets().bottom`, 이미 아래를 들인 host 안이면 0). 아래 여백이 `max(paddingBlock, inset)` — `regular` max(40, inset), `compact` max(20, inset) — 으로 한 번만 들어간다(ScreenLayout과 같은 규칙, 합산 없음). 키보드가 열리면 paddingBlock만. 음수·무한대는 `RangeError` |
| `AuthScreenHero` `title` · `eyebrow` · `description` · `mark` · `headingLevel` | 문자열 · `ReactNode` · `1`~`3` | `headingLevel` 1 | 제목은 필수이고 빈 문자열이면 `TypeError`. 밀도는 바깥 `AuthScreenLayout`을 따른다 |
| `AuthScreenFooter` `links` · `notice` · `children` | 링크 배열(1개 이상) · `ReactNode` | — | 빈 링크 목록·빈 라벨은 `TypeError`(LS-04: 약관 링크는 로그인 전 같은 화면에 있어야 한다). `children`은 링크 아래 제품 내용 |
| 링크 `accessibilityHint` | 문자열 | — | 라벨 뒤에 읽히는 보조 안내(예: 제품이 번역한 "브라우저에서 열림"). Native `accessibilityHint`, Web 숨긴 설명(`aria-describedby`). 보이는 라벨은 그대로 링크 이름이다. 공백만 있으면 `TypeError` |
| Web 링크 `target` · `rel` | anchor 속성 | — | `href`가 있을 때만. `target="_blank"`이면 `rel` 기본값 `noreferrer noopener`(Link와 같음) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 화면 전체(Web `min-block-size: 100dvh`, Native `ScrollView flex: 1`). 위 블록과 footer는 최대 폭 416, 마크 72(`markSize`, `radius.lg`), 정책 링크 최소 44(`footerMinTouchTarget`), mainCard 모서리 profile의 `radius.lg`(neutral/미지정 16) | `authScreenRecipe`, `.hjm-auth-screen*` |
| 간격 | `regular` / `compact`: 바깥 좌우 `layout.pagePadding.regular` 20 / `.compact` 16, 바깥 위아래 `spacing.xxxl` 40 / `spacing.lg` 20, hero 안 `spacing.md` 16 / `spacing.xs` 8, hero↔main `spacing.xl` 24 / `spacing.md` 16, 위 블록↔footer 최소 `spacing.xl` 24 / `spacing.md` 16. mainCard 안쪽 `spacing.md` 16 | `authScreenRecipe.densities`·`mainCard` |
| 히어로 문구 | 마크 ↔ 문구 묶음은 hero 간격. eyebrow `label` 12/18·500·브랜드색, 아래 `spacing.xxs` 4 → 태그라인 `regular` `typography.heading` 24/32 · `compact` `titleLarge` 20/28, 굵기는 제목 단계 500, 기본 글자색, 실제 heading 요소(Native `header`) → 설명 `body` 14/20·400·보조색(`muted`), 위 `spacing.xs` 8 | `authScreenRecipe.hero`, `densities.*.titleVariant` |
| 동의 고지·정책 링크 | 고지 `caption` 11/16 흐린 색, 링크 줄과 `spacing.xxs` 4. 링크 `caption`·브랜드색·밑줄, 링크 사이 `linkGap` 8 + `·` + 8(보이는 글자 간격 약 19). 각 링크 높이 44(배경 없음), 가로 터치 폭은 구분점 앞까지 보이지 않게 넓힘(Web 가상 요소, Native `hitSlop`) | `authScreenRecipe.footer`, `.hjm-auth-screen__link` |
| 머리 띠(`title`·`exit`) | ScreenLayout 가운데 머리와 같다: 최소 높이 52(`screenHeaderRecipe.minHeight`), 위아래 `spacing.xxs` 4, 좌우 화면 gutter `spacing.md` 16(`screenPatternRecipe.padding`), 시작 끝 `exit`, 가운데 제목 `level5`(양옆 같은 폭 칸). 화면 가장자리까지 닿고(바깥 좌우 여백 밖), 원래 바깥 위 여백(`regular` 40 / `compact` 20)은 띠 아래로 옮겨진다. 스크롤하지 않는다(Native는 `ScrollView` 밖) | `screenHeaderRecipe`, `.hjm-auth-screen__header`, Native `AuthScreenHeader` |
| 순서·정렬 | 위→아래 (머리 띠) → hero(가운데 정렬 문구) → main(폭 꽉 채움) → footer(동의 고지·정책 링크). 위 블록은 남는 세로 공간에서 가운데, footer는 바닥에 붙는다. 진행 중 로딩은 main 카드 가운데에 겹친다 | `.hjm-auth-screen__block`(`justify-content: center`), `.hjm-auth-screen__pending` |
| 고정·스크롤 | 머리 띠만 고정이고 나머지는 넘치면 함께 스크롤한다. 위 safe area는 host(SafeAreaView top 등, ScreenLayout과 같다)가, 아래는 레이아웃이 `max(paddingBlock, 하단 inset)`으로 맡는다 — Web `env(safe-area-inset-bottom)`, Native `safeAreaBottom`. Native 키보드 inset은 자동 조정이 처리한다 | `react-native/src/auth-screen.tsx`, `.hjm-auth-screen` |
| 좁은 폭·큰 글자 | 키 작은 화면·큰 글자에서는 `compact`를 고른다. 그래도 넘치면 스크롤되며 footer는 맨 아래로 밀린다 | `authScreenRecipe.densities` |

```text
┌──────────────────────────┐
│     (바깥 위 여백 40)     │
│        [마크 72]          │  ← hero(가운데)
│     어떤 계정으로…        │
│        설명 한 줄         │
│      ↕ spacing.xl 24      │
│ ┌──────────────────────┐ │
│ │ [ Google ]           │ │  ← main(mainCard), 최대 폭 416
│ │ [ 카카오 ]  …        │ │
│ └──────────────────────┘ │
│     (남는 공간)          │
│ 계속하면 동의 · 정책 링크 │  ← footer(바닥)
│     (바깥 아래 여백 40)   │
└──────────────────────────┘
```

## 꼭 지킬 것

- 로그인 진행 중에는 `pendingLabel` 하나로 표시한다. `main`의 버튼 목록은 그대로 두고(조건부 제거·교체 금지)
  카드 크기를 유지한 채 중앙 로딩 하나만 보인다. 버튼별 `busy`를 함께 켜지 않는다.
- `pendingLabel`은 스크린리더 안내로만 쓰인다. 로딩 아래에 보이는 문구를 따로 두지 않는다.
  완료·취소·실패 시 prop을 제거한다. 취소는 실패 문장 없이 버튼만 복구한다(LS-09).
- `pendingLabel`은 기존 카드에서 전환하는 상태다. 제공자 목록 최초 조회의 로딩을 대신하지 않는다.
- 히어로에 `Top`(화면 첫 제목, large = display 32/40)이나 직접 조립한 `Text`를 넣지 않는다. `AuthScreenHero`를 쓴다.
  정책 링크를 ghost `Button` + Stack gap으로 만들지 않는다 — 버튼 안쪽 여백이 간격에 더해진다. `AuthScreenFooter`를 쓴다.
- 슬롯 내용은 전부 제품 소유다: 마크 자산, 모든 문구(i18n 키), 제공자 목록과 순서, 정책 링크 목적지,
  심사자 폼 노출 조건. 제공자 로고를 HJM에 넣지 않는다([AuthProviderButton](auth-provider-button.md)).
- iOS 앱의 제공자 목록에는 Apple이 있어야 한다(LS-02). 심사자 이메일 폼은 서버 env와 `review=1` 두 조건이
  모두 맞을 때만 제품이 `main` 카드 안에 그린다(LS-07).
- `hasFooter: false`는 필수 동의 고지·정책 링크를 생략해도 된다는 뜻이 아니다.
- 외부 배치는 `layoutStyle`(정렬·flex·margin·폭 키만 허용)로 한다. Native에는 `style` prop이 없고, Web `style`로 배치하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 뿌리 요소 | `<main>` 또는 `as="section"`, ref 전달. 머리 띠는 그 안의 `<header>` | `ScrollView`. `title`·`exit`가 있으면 `View`(머리 띠 + `ScrollView`)가 뿌리이고 `layoutStyle`은 그 `View`에 간다 |
| 머리 띠 위 safe area | 다루지 않는다(브라우저·host) | host가 SafeAreaView top으로 준다. TopBar `safeAreaTop`에 해당하는 prop은 없다(ScreenLayout과 같다) |
| 배치·식별 | `layoutStyle`, `className`, HTML 속성 | `layoutStyle`, `testID` |
| 진행 중 숨김 | `inert` + `aria-hidden` + `visibility: hidden`, 로딩은 `role="status"` | 터치·접근성 제외 + 불투명도 0, 로딩은 `progressbar` + live region |
| 키보드 | 브라우저 기본 | 키보드 inset 자동 조정, 탭 유지(`handled`), iOS `interactive`·Android `on-drag` 내리기 |
| 아래 안전 영역 | `env(safe-area-inset-bottom)` 자동 | `safeAreaBottom` prop(iOS 자동 content inset 조정은 쓰지 않는다) |
| 정책 링크 보조 안내 | `aria-describedby` 숨긴 텍스트, `target`·`rel` | `accessibilityHint` |

## 함정

- `title`·`exit`를 쓰면 바깥에 얹던 TopBar·제품 헤더를 지운다. 둘 다 두면 머리가 두 줄이 된다. Native에서 host TopBar가 맡던 위 safe area(`safeAreaTop`)는 host의 SafeAreaView top으로 옮긴다.

- Native에서 하늘 띠 같은 장식을 레이아웃 바깥(화면 뒤)에 고정하지 않는다. 내용이 넘쳐 스크롤되면 글자가 그림 위로 지나가 읽히지 않는다(2026-10-28 다에리 가입 단계). `backdrop`으로 넘긴다.
- Native에서 아래 홈 인디케이터를 `SafeAreaView edges={['bottom']}`·`paddingBottom: insets.bottom` 래퍼로 들이지 말고 `safeAreaBottom`으로 넘긴다. 둘을 같이 주면 inset + paddingBlock이 다시 더해진다.
- 1.28.0까지 Native는 iOS `contentInsetAdjustmentBehavior="automatic"`으로 위·아래 safe area를 iOS에서만 더했다. 1.28.1부터 위는 host, 아래는 `safeAreaBottom`이다. 위 safe area를 아무도 들이지 않던 화면은 host에서 TopBar `safeAreaTop`이나 SafeAreaView top으로 들인다.
- Native는 자체로 키보드 스크롤 여백을 준다. 부모가 다시 keyboard avoidance를 하면 여백이 중복될 수 있으니
  심사자 폼처럼 입력칸이 있는 화면은 소비 화면에서 확인한다.
- 앱 셸이 이미 `<main>`을 가진 Web 화면에서 기본값을 쓰면 main landmark가 중첩된다. `as="section"`을 쓴다.
- 기존 제품 카드 wrapper 안에서 `mainCard`를 켜면 카드가 이중이 된다. wrapper를 걷어내고 `mainCard`로 옮긴다.
- 현재 Web `style`은 recipe 크기 변수(`--hjm-auth-screen-*`) 뒤에 펼쳐져 최대 폭·간격 변수를 덮을 수 있다. 배치는 `layoutStyle`로만 준다.

### 테마 카드 모서리

`mainCard`는 가장 가까운 Provider의 `designProfile.tokens.radius.lg`를 양 플랫폼에서 소비한다. 테마가 없으면 기존 recipe의 16을 유지한다. 제공자 버튼은 제공자 브랜드 규격을 유지하며, 처리 중에도 카드와 입력을 제거하지 않는다. 카드 표면과 제공자 브랜드를 같은 radius로 강제하면 제품 테마가 제공자 규격을 덮기 때문에 역할을 나눈다.

## 근거

- `title`·`exit`(1.31.0): 2026-10-18 앱 감사에서 utilverse·burntok 로그인이 "로그인" 제목과 뒤로/닫기만을 위해 레이아웃 위에 TopBar(burntok은 제품 `AppScreenHeader` 래퍼)를 따로 얹어, 로그인만 다른 머리 높이·제목 단계를 가졌다. 앱마다 띠를 조립하지 않도록 ScreenLayout의 `exit` 버튼과 가운데 머리 recipe를 그대로 쓰는 띠를 이 레이아웃이 소유한다. Native에서 TopBar를 가져오면 `navigation` 그래프 전체가 로그인 subpath에 들어오므로(ScreenLayout이 TopBar를 쓰지 않는 같은 이유) 띠는 `screenHeaderRecipe`로 그린다.
- `safeAreaBottom`·링크 `target`/`rel`/`accessibilityHint`(1.28.1): 2026-10-17 1.28 채택에서 다에리·utilverse·spint가 레이아웃을 각자 아래 inset 래퍼로 감쌌고(iOS는 자동 content inset이 이미 더해 합산, Android는 아무도 안 들여 spint가 Android만 덧붙임), 다에리 웹은 정책 문서 새 탭 열기(`target="_blank"`)를, spint는 "브라우저에서 열림" 접근성 안내를 링크 슬롯이 없어 잃었다. ScreenLayout의 max 규칙을 그대로 쓰고 링크에 같은 의미의 보조 안내·anchor 속성을 연다.
- `AuthScreenHero`·`AuthScreenFooter`와 히어로·링크 수치: 2026-10-17 사용자 피드백("굵기랑 크기 줄여", "간격 줄여").
  예제가 히어로에 `Top large`(display 32/40·600)를 넣어 402 폭에서 태그라인이 두 줄이 됐고, 정책 링크는 ghost Button
  안쪽 여백 12+12에 Stack gap 16이 더해져 글자 사이가 Web 42·Native 40이었다. 슬롯 내용을 앱이 조립하면 같은 실수가
  제품마다 반복되므로 HJM이 글자 단계·간격을 recipe로 소유한다. 변경 후 Web 402에서 태그라인 24/32·500 한 줄,
  링크 글자 간격 약 19, 링크 높이 44를 측정했다. 루트 LS §3도 같은 값으로 갱신했다.
