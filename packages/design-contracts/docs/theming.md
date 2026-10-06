# 테마 주입 — 내 브랜드색으로 시작하기

검토일: 2026-10-06 (`value` 중심 예시를 1.5.0 `brandPalette` prop 경로로 정정)

HJM은 `theme`(light/dark/system) 같은 **환경**과, 그 환경이 해석된 **값**을 분리해서
받는다. 제품 브랜드색은 값 쪽에 넣는다. 이 문서는 새 제품이 처음 부딪히는 그 경로만
설명한다. **무엇을 어디까지 바꿀 수 있는지와 대비 검사 규칙은 [brand-boundary.md](./brand-boundary.md)가
단일 원본이다.** 팔레트를 어떻게 고를지는 [theme-palette.md](./theme-palette.md), 색의 의미 구분은
[identity.md](./identity.md)에 있다.

## 두 가지 사용 방식

### 1. 기본 팔레트로 시작 (환경만 넘긴다)

```tsx
import { HjmProvider } from "@hjmds/react/provider";

<HjmProvider theme="system" direction="ltr">
  <App />
</HjmProvider>
```

`theme="system"`이면 provider가 OS 설정을 읽고, `textScale`·`reducedMotion`도 같은
방식으로 환경에서 해석한다. 이 경로는 HJM 기본 팔레트를 쓴다.

### 2. 제품 팔레트 주입 (`brandPalette` prop)

브랜드색은 별도 토큰 층을 만들지 않고 **HJM semantic key 위에 덮는다**. 넘긴 key만
교체되고 나머지는 기본값을 유지하므로 recipe와 대비 규칙이 그대로 적용된다.
1.5.0부터 Provider가 `brandPalette`를 prop으로 직접 받는다. 이 경로에서 Provider는 계속
OS theme·글자 크기·reduced motion을 관찰하고, 중첩 Provider는 가장 가까운 상위 `brandPalette`를 물려받는다.

```tsx
import { HjmProvider, type HjmBrandPalette } from "@hjmds/react/provider";

// 제품이 정한 브랜드 값. 아래 hex는 형식 예시일 뿐 HJM이 권하는 기본값이 아니다.
const PRODUCT_BRAND_PALETTE = {
  light: { primary: "#…", contentBrand: "#…", borderControl: "#…" },
  dark: { primary: "#…", contentBrand: "#…", borderControl: "#…" },
} satisfies HjmBrandPalette;

<HjmProvider theme={preference} brandPalette={PRODUCT_BRAND_PALETTE}>
  <App />
</HjmProvider>
```

React Native도 같은 모양이다(`<HjmNativeProvider theme={preference} brandPalette={…}>`,
타입은 `HjmNativeBrandPalette`). 앱 안에서 사용자가 고른 light/dark/system 설정은 `theme` prop으로
넘기면 되고, 그것 때문에 `value`로 내려갈 필요는 없다.

**값은 제품 것이다.** 2026-10-05 사용자 규칙: Showcase·Storybook·이 문서의 예시 색과 자산을 제품
기본값으로 복사하지 않는다. 제품의 기존 디자인(`docs/DESIGN.md` 등)에서 브랜드 key를 정하고, 필요한 key만
넘긴다. 중성색·상태색은 HJM 기본값을 쓴다.

#### `value` prop은 언제 쓰는가

`value`(`resolveDesignSystemProviderValue` 결과 전체)는 1.4까지 브랜드를 넣는 유일한 방법이었고, 지금도
타입상 지원한다. 하지만 `value`를 넘기면 Provider가 OS 설정 관찰을 멈추고 `brandPalette` 상속도 끊기므로
브랜드 경로로 쓰지 않는다([brand-boundary.md §1](./brand-boundary.md#1-지원하는-경로는-brandpalette-하나다)).
남은 용도는 다음뿐이다.

- 테스트·스토리에서 환경을 결정적으로 고정할 때(SSR·테스트만 필요하면 `systemTheme` prop으로도 충분한지 먼저 본다).
- 이미 해석된 값을 다른 렌더 트리에 그대로 옮기는 임베딩(예: 상위 앱이 해석한 값을 별도 root에 미러링).

BurnTok의 `apps/web/src/components/ThemeProvider.tsx`·`apps/mobile/src/components/ThemeProvider.tsx`는
2026-10-06 확인 시점에도 1.4식 `value` 경로를 쓴다. 이관 대상 사례로만 참고하고 새 제품의 출발점으로 복사하지 않는다.

팔레트를 바꾸면 제품 테스트에서 대비 검사를 돌린다.

```ts
import { checkBrandPaletteContrast } from "@hjmds/design-contracts/palette-contrast";

expect(checkBrandPaletteContrast(PRODUCT_BRAND_PALETTE)).toEqual({ light: [], dark: [] });
```

## 덮어도 되는 것과 아닌 것

규칙은 [brand-boundary.md](./brand-boundary.md)에 있다. 요약하면 `brandPalette`의 17개 semantic key만 바꿀 수 있고,
상태 강조색과 컴포넌트별 색은 바꿀 수 없으며, `.hjm-*`·`--hjm-*` CSS 재정의는 지원하는 경로가 아니다.

## 어댑터를 두는 이유

제품 저장소의 `@<product>/design-system` 같은 얇은 층은 세 가지만 한다: (1) 위
`brandPalette` 주입, (2) 현지화된 필수 문구(`closeLabel`, `emptyMessage` 등)의 주입,
(3) 제품 고유 합성(`AppModal`처럼 닫힘 사유를 제품 어휘로 옮기는 것). 그 이상을 하고
있다면 — 크기를 다시 계산하거나 색을 다시 칠하고 있다면 — 그것은 HJM의 공백이다.
