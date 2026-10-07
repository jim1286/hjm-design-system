# DesignSystemProvider

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [DesignSystemProvider](../../design-system-provider.md), [브랜드 경계](../../brand-boundary.md)(브랜드 규칙 단일 원본), [테마 주입](../../theming.md), [팔레트 결정](../../theme-palette.md)
- 스토리북: `배포/컴포넌트/기반 기능/디자인 시스템 설정`

## 언제 쓰나

앱 루트에 한 번 둔다. theme(light/dark/system)·방향·글자 배율·reduced motion을 해석하고, 제품 브랜드색을
HJM semantic token 위에 얹는 **유일한 진입점**이다. Native HJM 컴포넌트는 테마를 이 Provider에서 읽으므로
Provider 없이 렌더하면 예외가 난다. 화면 일부의 밀도·테마만 바꿀 때는 중첩 Provider를 둔다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 브랜드색을 컴포넌트마다 넣고 싶다 | Provider `brandPalette` 한 번(컴포넌트 `style`로 칠하지 않는다) |
| 컴포넌트 하나만 촘촘하게 | 해당 컴포넌트의 `density` prop |
| 명령형으로 Dialog·Sheet 열기 | [Dialog](dialog.md)의 `OverlayStackProvider`(Web) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `HjmProvider` | 기본 — Web | `@hjmds/react`, `/provider` | 없음 |
| `HjmNativeProvider` | 기본 — Native | 없음 | `@hjmds/react-native`, `/provider` |

테마 값은 Web `useHjmTheme()`, Native `useHjmNativeTheme()`로 읽는다(둘 다 Provider 밖에서는 예외).

## 최소 사용 예

```tsx
// Web
import "@hjmds/react/styles.css";
import { HjmProvider, type HjmBrandPalette } from "@hjmds/react/provider";

// 제품이 정한 브랜드 key만 넘긴다. "#…"는 제품 docs/DESIGN.md의 값 자리이며 HJM 기본값이 아니다.
const PRODUCT_BRAND_PALETTE = {
  light: { primary: "#…", contentBrand: "#…" },
  dark: { primary: "#…", contentBrand: "#…" },
} satisfies HjmBrandPalette;

<HjmProvider theme="system" brandPalette={PRODUCT_BRAND_PALETTE}>
  <App />
</HjmProvider>
```

```tsx
// Native — SafeAreaProvider 안. PRODUCT_BRAND_PALETTE는 Web과 같은 제품 값(HjmNativeBrandPalette)
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const insets = useSafeAreaInsets();

<HjmNativeProvider theme="system" brandPalette={PRODUCT_BRAND_PALETTE} safeAreaInsets={insets}>
  <App />
</HjmNativeProvider>
```

```ts
// 제품 테스트: 팔레트를 바꿀 때마다 돈다
import { checkBrandPaletteContrast } from "@hjmds/design-contracts/palette-contrast";
expect(checkBrandPaletteContrast(PRODUCT_BRAND_PALETTE)).toEqual({ light: [], dark: [] });
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `theme` | `system` · `light` · `dark` | `system` | — |
| `direction` | `ltr` · `rtl` | `ltr` | — |
| `textScale` | 연속값 | `1` | — |
| `reducedMotion` | `true` · `false` | `false` | — |
| `minimumVisualTarget` | `true` · `false` | `false` | — |
| `brandPalette` | `{ light?, dark? }` | — | 각각 `ThemeColors` 17개 key 중 필요한 것만 넘긴다(부분 병합). 상태 강조색은 덮을 수 없다. 중첩 Provider는 가장 가까운 상위의 값을 물려받는다 |
| `designProfile` | `HjmDesignProfile` | 가장 가까운 상위 프로필 또는 없음 | 미게시 실험. `hjmDesignPresets` 또는 `defineHjmDesignProfile` 결과만 넣는다. [프로필 계약](../../design-profile.md)의 토큰·질감·전환·구성·화면 기본값을 상속한다 |
| `value` | `DesignSystemProviderValue`(`resolveDesignSystemProviderValue` 결과) | — | 테스트·스토리·임베딩용. 환경 prop·`brandPalette`·`designProfile`과 함께 쓸 수 없고(타입이 막는다), 주면 OS theme·모션 관찰과 상위 `brandPalette` 상속이 멈춘다 |
| `safeAreaInsets`(Native) | `{ top?, right?, bottom?, left? }`(pt) | `{}` | 보통 `useSafeAreaInsets()` 결과. 중첩 Provider는 가장 가까운 상위 값을 물려받는다 |

- 이벤트·콜백 prop은 없다. 해석된 값은 Web `useHjmTheme()`, Native `useHjmNativeTheme()`로 읽는다.
- `layoutStyle`을 받지 않는다(Web `HjmProvider`는 `layoutStyle` 제외 15개 중 하나). Web 루트 `div`의 표면 처리는 `host`로 정한다.

- 주지 않은 축은 상위 Provider → OS 신호 → 기본값 순이다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 크기·여백을 더하지 않는다. Web은 `div.hjm-root`를 그리고, Native는 렌더 요소가 없다(Context만) | `packages/react/src/provider.tsx`, `packages/react/src/styles.css` `.hjm-root`, `packages/react-native/src/provider.tsx` |
| 간격 | — | — |
| 순서·정렬 | 앱 루트에 한 번, 모든 HJM 컴포넌트·포털보다 바깥에 둔다. Native는 `useSafeAreaInsets()`를 쓰므로 `SafeAreaProvider` 안쪽에 둔다. 중첩 Provider는 밀도·테마를 바꿀 영역 둘레에만 둔다 | — |
| 고정·스크롤 | Web `host="surface"`(기본)는 배경색·글자색·UI 글꼴을 칠한다. 문서 루트가 이미 표면을 칠하면 `host="contents"`(`display: contents`)로 레이아웃에서 빠진다. Native의 화면 여백·안전 영역 배치는 화면 골격이 한다 | `packages/react/src/styles.css` `.hjm-root[data-host]` |
| 좁은 폭·큰 글자 | — | — |

## 꼭 지킬 것

- 색만 바꾸면 `brandPalette`, 표현·구성도 바꾸면 검증한 `designProfile`을 쓴다. 전체 `value`를 손으로 조립하는 것은 테스트·임베딩용이다
  ([브랜드 경계 §1](../../brand-boundary.md#1-지원하는-제품-설정-경로)).
- **Showcase·Theme Studio의 예시 색·자산·테마를 제품 기본값으로 복사하지 않는다**(2026-10-05 규칙). 색은 제품 목적과
  기존 디자인에서 정해 `brandPalette`의 semantic key로 연결하고, 로고·이미지·문구는 각 컴포넌트의 공개 슬롯으로 넘긴다.
- 모든 브랜드 팔레트는 `checkBrandPaletteContrast` 결과가 빈 배열이어야 한다(MUST).
- `.hjm-*` 클래스나 `--hjm-*` 변수를 제품 CSS로 재정의하지 않는다. semantic key로 표현되지 않으면 계약 공백으로 올린다.
- 제3자 브랜드 색(소셜 로그인)은 테마가 아니다. [AuthProviderButton](auth-provider-button.md)이 소유한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `density`(`comfortable` 기본 · `compact`) | 있음 | 없음 |
| `host`(`surface` 기본 · `contents`) | 있음. 문서 루트가 이미 표면을 칠하면 `contents` | 없음 |
| `systemTheme` 고정(SSR·테스트) | 있음 | 없음(`useColorScheme`) |
| `safeAreaInsets` | 없음 | 있음. Sheet·DatePicker·Select·Combobox가 기본 여백으로 쓴다 |
| 요소 | `div.hjm-root`(CSS 변수·`dir`·`data-theme`) | 렌더 요소 없음(Context만) |
| stylesheet | `@hjmds/react/styles.css` import 필요 | 해당 없음 |

## 함정

- [테마 주입](../../theming.md)은 2026-10-06에 `brandPalette` prop 경로로 정정됐다. 그 이전 사본이나 1.4식 제품 코드
  (BurnTok `ThemeProvider.tsx`)의 `value` 조립을 새 제품의 출발점으로 복사하지 않는다.
- Native는 OS reduce-motion 값이 오기 전 첫 프레임을 reduced motion으로 취급한다.
- Native `textScale`을 명시하면 HJM이 배율을 한 번만 적용하는 controlled 모드가 된다. OS 배율과 곱하지 않는다.
