# AuthScreenLayout

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [로그인 화면 골격](../../auth-screen.md), [1.4 제품 채택 가이드](../../product-adoption-1.4.md), recipe `authScreenRecipe`(`src/auth-screen.ts`), 포트폴리오 상위 기준 루트 `docs/LOGIN_SCREEN_STANDARD.md`(LS)
- 스토리북: `배포/컴포넌트/레이아웃/로그인 화면`

## 언제 쓰나

로그인·가입 진입 화면의 배치에 쓴다. 위 영역(`hero` + `main`)은 남는 세로 공간에서 가운데 정렬되고,
`footer`(동의 고지·정책 링크)는 바닥에 붙는다. 내용이 화면보다 길면 스크롤로 바뀐다.
이 컴포넌트는 배치만 소유하며 슬롯 안의 내용은 그리지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 제공자 버튼 하나하나 | [AuthProviderButton](auth-provider-button.md) (`main` 슬롯에 넣는다) |
| 동의 체크 항목 | [Agreement](agreement.md) (`footer`나 가입 단계에 넣는다) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `AuthScreenLayout` | 기본 | `@hjmds/react`, `/auth-screen` | `@hjmds/react-native`, `/auth-screen` |

## 최소 사용 예

```tsx
// Web
import { AuthScreenLayout } from "@hjmds/react/auth-screen";

<AuthScreenLayout
  mainCard
  {...(pending ? { pendingLabel: t("auth.pending") } : {})}
  hero={<ProductHero />}            // 제품 마크·제목·설명
  main={<ProviderButtons />}        // pending이어도 같은 목록
  footer={<ConsentAndPolicyLinks />}
/>
```

```tsx
// Native
import { AuthScreenLayout } from "@hjmds/react-native/auth-screen";

<AuthScreenLayout
  mainCard
  {...(pending ? { pendingLabel: t("auth.pending") } : {})}
  hero={<ProductHero />}
  main={<ProviderButtons />}
  footer={<ConsentAndPolicyLinks />}
  testID="login-screen"
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `hero` · `main` | `ReactNode` | 필수 | 제품 마크·제목·설명 / 제공자 버튼 목록(진행 중에도 같은 목록) |
| `footer` | `ReactNode` | — | 동의 고지·정책 링크 |
| `density` | `regular` · `compact` | `regular` | 제품이 화면 높이를 보고 고른다. 간격·padding만 바뀐다 |
| `hasFooter` | `boolean` | `true` | `false`이거나 `footer`가 없으면 아래 영역을 그리지 않는다 |
| `mainCard` | `boolean` | `false` | 기존 제품 카드와 중첩 방지. 새 조합은 켠다. 카드 배경은 테마 `bg`, radius `lg`, padding `md` |
| `pendingLabel` | 문자열 | — | 주면 진행 상태다. 공백만 있으면 `TypeError`. 제거하면 원래 상태로 돌아온다 |
| Web `as` | `main` · `section` | `main` | 최대 폭은 416이다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 배치 전용(Web·Native 모두) |
| Native `testID` | `string` | — | 뿌리 `ScrollView` 식별 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 화면 전체(Web `min-block-size: 100dvh`, Native `ScrollView flex: 1`). 위 블록과 footer는 최대 폭 416, 마크 72(`markSize`, `radius.lg`), 정책 링크 최소 44(`footerMinTouchTarget`), mainCard 모서리 `radius.lg` 16 | `authScreenRecipe`, `.hjm-auth-screen*` |
| 간격 | `regular` / `compact`: 바깥 좌우 `layout.pagePadding.regular` 20 / `.compact` 16, 바깥 위아래 `spacing.xxxl` 40 / `spacing.lg` 20, hero 안 `spacing.md` 16 / `spacing.xs` 8, hero↔main `spacing.xl` 24 / `spacing.md` 16, 위 블록↔footer 최소 `spacing.xl` 24 / `spacing.md` 16. mainCard 안쪽 `spacing.md` 16 | `authScreenRecipe.densities`·`mainCard` |
| 순서·정렬 | 위→아래 hero(가운데 정렬 문구) → main(폭 꽉 채움) → footer(동의 고지·정책 링크). 위 블록은 남는 세로 공간에서 가운데, footer는 바닥에 붙는다. 진행 중 로딩은 main 카드 가운데에 겹친다 | `.hjm-auth-screen__block`(`justify-content: center`), `.hjm-auth-screen__pending` |
| 고정·스크롤 | 고정 영역이 없다. 넘치면 화면 전체가 스크롤한다. 안전 영역은 Native `contentInsetAdjustmentBehavior="automatic"`과 키보드 inset 자동 조정이 처리하고, Web은 safe-area inset을 더하지 않는다 | `react-native/src/auth-screen.tsx`, `.hjm-auth-screen` |
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
- 슬롯 내용은 전부 제품 소유다: 마크 자산, 모든 문구(i18n 키), 제공자 목록과 순서, 정책 링크 목적지,
  심사자 폼 노출 조건. 제공자 로고를 HJM에 넣지 않는다([AuthProviderButton](auth-provider-button.md)).
- iOS 앱의 제공자 목록에는 Apple이 있어야 한다(LS-02). 심사자 이메일 폼은 서버 env와 `review=1` 두 조건이
  모두 맞을 때만 제품이 `main` 카드 안에 그린다(LS-07).
- `hasFooter: false`는 필수 동의 고지·정책 링크를 생략해도 된다는 뜻이 아니다.
- 외부 배치는 `layoutStyle`(정렬·flex·margin·폭 키만 허용)로 한다. Native에는 `style` prop이 없고, Web `style`로 배치하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 뿌리 요소 | `<main>` 또는 `as="section"`, ref 전달 | `ScrollView` |
| 배치·식별 | `layoutStyle`, `className`, HTML 속성 | `layoutStyle`, `testID` |
| 진행 중 숨김 | `inert` + `aria-hidden` + `visibility: hidden`, 로딩은 `role="status"` | 터치·접근성 제외 + 불투명도 0, 로딩은 `progressbar` + live region |
| 키보드 | 브라우저 기본 | 키보드 inset 자동 조정, 탭 유지(`handled`), iOS `interactive`·Android `on-drag` 내리기 |

## 함정

- Native는 자체로 키보드 스크롤 여백을 준다. 부모가 다시 keyboard avoidance를 하면 여백이 중복될 수 있으니
  심사자 폼처럼 입력칸이 있는 화면은 소비 화면에서 확인한다.
- 앱 셸이 이미 `<main>`을 가진 Web 화면에서 기본값을 쓰면 main landmark가 중첩된다. `as="section"`을 쓴다.
- 기존 제품 카드 wrapper 안에서 `mainCard`를 켜면 카드가 이중이 된다. wrapper를 걷어내고 `mainCard`로 옮긴다.
- 현재 Web `style`은 recipe 크기 변수(`--hjm-auth-screen-*`) 뒤에 펼쳐져 최대 폭·간격 변수를 덮을 수 있다. 배치는 `layoutStyle`로만 준다.
