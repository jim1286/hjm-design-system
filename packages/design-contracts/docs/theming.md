# 테마 주입 — 내 브랜드색으로 시작하기

HJM은 `theme`(light/dark/system) 같은 **환경**과, 그 환경이 해석된 **값**을 분리해서
받는다. 제품 브랜드색은 값 쪽에 넣는다. 이 문서는 새 제품이 처음 부딪히는 그 경로만
설명한다. 팔레트를 어떻게 고를지는 [theme-palette.md](./theme-palette.md), 색의 의미
구분은 [identity.md](./identity.md)에 있다.

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

React Native는 `HjmNativeProvider`가 같은 `value`를 받는다. 실제 사용 예는 BurnTok의
`apps/web/src/components/ThemeProvider.tsx`다 — 경계선 색 두 개만 주입하고 나머지는
기본값을 쓴다.

## 덮어도 되는 것과 아닌 것

| key | 덮기 | 이유 |
| --- | --- | --- |
| `primary` / `onPrimary` / `contentBrand` | 권장 | 브랜드의 자리다. 주 행동과 현재 위치를 이 색이 말한다 |
| `borderControl` / `focus` | 선택 | 브랜드 채도가 높으면 포커스 대비를 맞추기 위해 함께 조정한다 |
| `border` / `borderControl` | 선택 | 제품 경계선 밀도가 다를 때. BurnTok이 이 둘만 주입한다 |
| `bg` / `surface` / `text*` 중성 계열 | 신중히 | 대비 검증이 붙어 있다. 바꾸면 라이트·다크 양쪽에서 4.5:1을 다시 확인한다 |
| `danger` / `success` / `warning` / `info` | 비권장 | 상태색을 브랜드색으로 바꾸면 "오류"와 "브랜드"가 같은 색이 된다 |
| 컴포넌트별 색 | 불가 | recipe가 semantic key만 읽는다. 컴포넌트 하나만 다른 색이 되면 그것은 제품 예외지 테마가 아니다 |

## 하지 말아야 할 세 가지

1. **CSS로 `.hjm-*` 클래스를 덮거나 `--hjm-color-*`를 인라인 style로 재정의하지 않는다.** 그 순간 업그레이드마다 깨진다. 필요한 것이
   semantic key로 표현되지 않으면 그것은 계약 공백이고, 우회가 아니라 이슈로 올린다.
2. **recipe 값을 읽어 인라인 스타일로 다시 싣지 않는다.** 렌더러가 이미 그 값을
   칠한다. 제품이 다시 실으면 두 벌이 생기고 한쪽만 갱신된다.
3. **제공자 브랜드색을 팔레트에 넣지 않는다.** 소셜 로그인 색은 테마가 아니라 남의
   자산이다 — [AuthProviderButton](./provider-button.md)이 그 자리를 갖는다.

## 어댑터를 두는 이유

제품 저장소의 `@<product>/design-system` 같은 얇은 층은 세 가지만 한다: (1) 위
`brandPalette` 주입, (2) 현지화된 필수 문구(`closeLabel`, `emptyMessage` 등)의 주입,
(3) 제품 고유 합성(`AppModal`처럼 닫힘 사유를 제품 어휘로 옮기는 것). 그 이상을 하고
있다면 — 크기를 다시 계산하거나 색을 다시 칠하고 있다면 — 그것은 HJM의 공백이다.
