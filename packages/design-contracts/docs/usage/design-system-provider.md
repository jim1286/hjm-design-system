# DesignSystemProvider 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [DesignSystemProvider](../design-system-provider.md), [브랜드 경계](../brand-boundary.md)(브랜드 규칙 단일 원본),
[테마 주입](../theming.md), [팔레트 결정](../theme-palette.md)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `HjmProvider` | `@hjmds/react`, `/provider` | 없음 | Web 기본 |
| `HjmNativeProvider` | 없음 | `@hjmds/react-native`, `/provider` | Native 기본 |

테마 값은 Web `useHjmTheme()`, Native `useHjmNativeTheme()`로 읽는다(둘 다 Provider 밖에서는 예외).

## 최소 사용 예

```tsx
// Web
import "@hjmds/react/styles.css";
import { HjmProvider } from "@hjmds/react/provider";
import { PRODUCT_BRAND_PALETTE } from "./theme/brand-palette"; // 제품 소유

<HjmProvider theme="system" brandPalette={PRODUCT_BRAND_PALETTE}>
  <App />
</HjmProvider>
```

```tsx
// Native
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PRODUCT_BRAND_PALETTE } from "./theme/brand-palette"; // 제품 소유

<HjmNativeProvider theme="system" brandPalette={PRODUCT_BRAND_PALETTE} safeAreaInsets={useSafeAreaInsets()}>
  <App />
</HjmNativeProvider>
```

```ts
// 제품 테스트: 팔레트를 바꿀 때마다 돈다
import { checkBrandPaletteContrast } from "@hjmds/design-contracts/palette-contrast";
expect(checkBrandPaletteContrast(PRODUCT_BRAND_PALETTE)).toEqual({ light: [], dark: [] });
```

## 축과 기본값

- `theme`: `system`(기본) · `light` · `dark`. `direction`: `ltr`(기본) · `rtl`. `textScale`: 연속값(기본 1).
  `reducedMotion`·`minimumVisualTarget`: 기본 `false`. 주지 않은 축은 상위 Provider → OS 신호 → 기본값 순이다.
- `brandPalette`: `{ light?, dark? }`마다 `ThemeColors` 17개 key 중 필요한 것만 넘긴다(부분 병합). 상태 강조색은 덮을 수 없다.
- 중첩 Provider는 가장 가까운 상위의 `brandPalette`를 물려받는다.
- `value`(완성된 provider 값)는 환경 prop과 함께 쓸 수 없고, 주면 OS theme·모션 관찰이 멈춘다.

## 꼭 지킬 것

- 제품 브랜드는 `brandPalette` prop으로만 넣는다. 전체 `value`를 손으로 조립하는 것은 테스트·임베딩용이다
  ([브랜드 경계 §1](../brand-boundary.md#1-지원하는-경로는-brandpalette-하나다)).
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

- [테마 주입](../theming.md)의 두 번째 예시는 1.4까지의 `value` 경로다. 1.5.0부터는 위처럼 `brandPalette` prop을 쓴다.
- Native는 OS reduce-motion 값이 오기 전 첫 프레임을 reduced motion으로 취급한다.
- Native `textScale`을 명시하면 HJM이 배율을 한 번만 적용하는 controlled 모드가 된다. OS 배율과 곱하지 않는다.
