# 테마 주입 — 내 브랜드색으로 시작하기

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

### 2. 제품 팔레트 주입 (`brandPalette`)

브랜드색은 별도 토큰 층을 만들지 않고 **HJM semantic key 위에 덮는다**. 넘긴 key만
교체되고 나머지는 기본값을 유지하므로 recipe와 대비 규칙이 그대로 적용된다.

```tsx
import { resolveDesignSystemProviderValue } from "@hjmds/design-contracts/components/design-system-provider";
import { HjmProvider } from "@hjmds/react/provider";
import { useMemo } from "react";

function ProductProvider({ preference, systemDark, children }) {
  const value = useMemo(
    () => resolveDesignSystemProviderValue(
      { theme: preference },
      {
        systemTheme: systemDark ? "dark" : "light",
        systemDirection: "ltr",
        systemTextScale: 1,
        systemReducedMotion: false,
        // 브랜드가 소유하는 key만 덮는다. 중성색·상태색은 HJM 기본값을 쓴다.
        brandPalette: {
          light: { primary: "#0F6FFF", contentBrand: "#0B57C7", borderControl: "#C9D3E0" },
          dark: { primary: "#5AA2FF", contentBrand: "#8CC0FF", borderControl: "#3A4757" },
        },
      },
    ),
    [preference, systemDark],
  );
  return <HjmProvider value={value}>{children}</HjmProvider>;
}
```

React Native는 `HjmNativeProvider`가 같은 `value`를 받는다. `value`를 넘기면 Provider가 OS 설정 관찰을
멈추므로, 위 예시처럼 system theme 등의 신호를 제품이 구독해 resolver에 넣는다. 실제 사용 예는 BurnTok의
`apps/web/src/components/ThemeProvider.tsx`(경계선 두 key)와 `apps/mobile/src/components/ThemeProvider.tsx`
(경계선 두 key + 표면 두 key)다.

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
