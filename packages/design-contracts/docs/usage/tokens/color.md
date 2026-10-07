# 색상

- 단계: 토큰
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [브랜드 경계](../../brand-boundary.md), [테마 팔레트](../../theme-palette.md), [테마 사용법](../../theming.md), `src/colors.ts`, `src/semantic-colors.ts`, `src/component-recipes.ts`(`textRecipe`·`iconRecipe`), `src/base-recipes.ts`(`buttonRecipe`·`surfaceRecipe`), `packages/react/src/theme.ts`, `packages/react-native/src/provider.tsx`
- 스토리북: `배포/토큰/색과 글자/색상`

## 언제 쓰나

색은 팔레트 이름(파랑·회색)이 아니라 배경·글자·브랜드·피드백·테두리 **역할**로 고른다. 두 테마(light·dark)는 정확히
같은 key를 가지므로 역할로 고르면 다크 모드가 따라온다. 대부분은 컴포넌트의 `tone` prop이 역할을 대신 고르므로,
값을 직접 읽는 것은 제품 고유 영역(그래프·일러스트 틀·제품 전용 카드)일 때뿐이다.

고르는 순서:

1. 컴포넌트에 `tone`이 있으면 그것으로 고른다([Text](../components/text.md), [Icon](../components/icon.md),
   [Badge](../components/badge.md), [Notice](../components/notice.md), [Button](../components/button.md)).
2. 없으면 아래 표에서 **칠할 대상**(용도 열)으로 역할을 찾는다. 같은 대상에 후보가 둘이면 위쪽(더 강한) 것을 먼저 본다.
3. 채운 바탕 위의 글자는 반드시 짝(`onPrimary`·`onDanger`·`onAccentFill`)을 쓴다.

## 값

값 열은 `light / dark`. Native 경로의 `theme`은 `useHjmNativeTheme()`, 역할 이름은 `semanticColors`(`@hjmds/design-contracts/tokens`)다.

### 배경

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `canvas` = `bg` | `#ffffff` / `#0d1116` | `--hjm-color-bg` | `theme.colors.bg` | 화면 바탕. 카드·패널(Surface·Card)도 모든 tone이 `bg`를 칠하고 층은 테두리·그림자로 나눈다 |
| `surface.default` = `surface` | `#f2f4f6` / `#161b22` | `--hjm-color-surface` | `theme.colors.surface` | 바탕과 구분되는 옅은 면 |
| `surface.sunken` = `surfaceAlt` | `#e5e8eb` / `#1e232a` | `--hjm-color-surface-alt` | `theme.colors.surfaceAlt` | 한 단계 더 들어간 면(CodeBlock 바탕) |
| `surface.brand` = `surfaceAccent` | `#c9e2ff` / `#224159` | `--hjm-color-surface-accent` | `theme.colors.surfaceAccent` | 브랜드가 드러나는 옅은 면 |

### 글자

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `content.primary` = `text` | `#191f28` / `#f3f5f7` | `--hjm-color-text` | `theme.colors.text` | 제목·강조 글자. Text `tone="primary"`(기본) |
| `content.body` = `textBody` | `#333d4b` / `#e1e5ea` | `--hjm-color-text-body` | `theme.colors.textBody` | 긴 본문. Text `tone="body"` |
| `content.secondary` = `textMuted` | `#4e5968` / `#cad0d8` | `--hjm-color-text-muted` | `theme.colors.textMuted` | 보조 설명. Text `tone="muted"` |
| `content.tertiary` = `textSub` | `#65707d` / `#9ba5b0` | `--hjm-color-text-sub` | `theme.colors.textSub` | 시간·출처 같은 약한 메타 정보. Text `tone="subtle"` |
| `content.decorative` = `textWeak` | `#8b95a1` / `#8b96a2` | `--hjm-color-text-weak` | `theme.colors.textWeak` | 비활성·placeholder·장식 표지. Text `tone="weak"`. 읽혀야 하는 글자에는 쓰지 않는다 |

### 브랜드

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `action.brand.background` = `primary` | `#0369a1` / `#0476b4` | `--hjm-color-primary` | `theme.colors.primary` | 채운 주 행동 바탕. Button `tone="primary"` |
| `action.brand.content` = `onPrimary` | `#ffffff` / `#ffffff` | `--hjm-color-on-primary` | `theme.colors.onPrimary` | `primary` 위 글자·아이콘. Text·Icon `tone="inverse"` |
| `content.brand` = `contentBrand` | `#075985` / `#51bff6` | `--hjm-color-content-brand` | `theme.colors.contentBrand` | 바탕 위 브랜드 색 글자(링크·현재 위치·강조 숫자). Text `tone="brand"`. 포커스 링(`border.focus`)도 이 색 |
| `brandGradient` | `#0369a1` → `#155dfc` | — | `brandGradient` | HJM 조직 표면 서명. 제품 기본 브랜드가 아니다 |

### 피드백

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `content.danger` = `danger` | `#b71919` / `#f87171` | `--hjm-color-danger` | `theme.colors.danger` | 오류 글자·아이콘. Text `tone="danger"`, 필드 오류 |
| `action.danger.background` = `dangerFill` | `#b91c1c` / `#b91c1c` | `--hjm-color-danger-fill` | `theme.colors.dangerFill` | 파괴 행동 바탕. Button `tone="danger"` |
| `action.danger.content` = `onDanger` | `#ffffff` / `#ffffff` | `--hjm-color-on-danger` | `theme.colors.onDanger` | `dangerFill` 위 글자 |
| `feedback.info.foreground` | `#6d28d9` / `#a78bfa` | `--hjm-accent-info` | `theme.palette.statusAccents.info` | 안내 |
| `feedback.success.foreground` | `#065f46` / `#34d399` | `--hjm-accent-success` | `theme.palette.statusAccents.success` | 완료 |
| `feedback.warning.foreground` | `#92400e` / `#fbbf24` | `--hjm-accent-warning` | `theme.palette.statusAccents.warning` | 주의가 필요한 상태 |
| `feedback.attention.foreground` | `#9a3412` / `#fb923c` | `--hjm-accent-attention` | `theme.palette.statusAccents.attention` | 눈길을 끌 새 소식 |
| `feedback.<tone>.background` · `.border` | 위 색 alpha 0.1 · 0.3 | — (`color-mix`) | `resolveColorReference(…, theme.palette)` | 피드백 영역의 옅은 바탕·테두리(Notice·Badge가 그린다) |
| `accentFill.<tone>` | info `#6d28d9` · success `#065f46` · warning `#92400e` · attention `#9a3412`(두 테마 공통) | `--hjm-accent-fill-<tone>` | `theme.palette.statusAccentFills.<tone>` | 꽉 찬 상태 표지 바탕. 글자는 `onAccentFill` `#ffffff` |
| `accentTint` | `weak` 0.1 · `base` 0.15 · `strong` 0.2 · `border` 0.3 | — | `accentTint` | 피드백 색을 옅게 깔 때 쓰는 alpha |

도메인 상태(예: "배송 지연")는 제품 어댑터에서 `info`·`success`·`warning`·`attention`·`danger` 중 하나로 매핑한다.
피드백 색은 `brandPalette`로 바꿀 수 없다(브랜드와 오류·성공이 같은 색이 되는 것을 막는다).

### 테두리·상호작용

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `border.default` = `border` | `#e5e8eb` / `#6a788a` | `--hjm-color-border` | `theme.colors.border` | 영역 경계 hairline. Surface `bordered`, Divider. `border.subtle`은 alpha 0.7 |
| `border.control` = `borderControl` | `#6b7684` / `#929faf` | `--hjm-color-border-control` | `theme.colors.borderControl` | 쉬고 있는 컨트롤 윤곽(Button `secondary`, 필드) |
| `border.strong` = `textWeak` | `#8b95a1` / `#8b96a2` | `--hjm-color-text-weak` | `theme.colors.textWeak` | 강한 경계 |
| `border.focus` | `contentBrand` | `--hjm-color-focus` | `theme.colors.contentBrand` | 포커스 링. 컴포넌트가 그린다 |
| `interaction.hover` · `focus` · `pressed` · `selected` | `text` 0.06 · `contentBrand` 0.08 · `text` 0.1 · `primary` 0.1 | — | `resolveColorReference(…, theme.palette)` | 상태 덧칠. 제품 고유 누름 영역에만 직접 쓴다 |

### 함께 쓰는 쌍과 최소 대비

`checkBrandPaletteContrast`가 검사하는 쌍이다. 이 밖의 조합(예: `contentBrand` 글자를 `surfaceAccent` 위에)은 HJM이 대비를 보장하지 않는다.

- 4.5 이상: `text`·`textBody`·`textMuted`·`textSub`·`contentBrand`·`danger` on `bg`·`surface`, `onPrimary` on `primary`, `onDanger` on `dangerFill`.
- 3 이상: `primary`·`borderControl` vs `bg`·`surface`(형태), `textWeak` vs `bg`.

## 쓰는 법

```tsx
// Web
import { useHjmTheme } from "@hjmds/react/provider";
import { semanticColors } from "@hjmds/design-contracts/tokens";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";

// 제품 CSS: .product-chart-axis { color: var(--hjm-color-text-sub); border-color: var(--hjm-color-border); }
const { palette } = useHjmTheme();
const good = resolveColorReference(semanticColors.feedback.success.foreground, palette);
```

```tsx
// Native
import { View } from "react-native";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { semanticColors } from "@hjmds/design-contracts/tokens";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";

const theme = useHjmNativeTheme();
<View style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border, borderWidth: 1 }} />;
const tint = resolveColorReference(semanticColors.feedback.warning.background, theme.palette);
```

제품 브랜드는 Provider의 `brandPalette`로 17개 key 중 필요한 것만 바꾼다. 값은 [테마 편집](theme-studio.md)으로 고르고 대비를 확인한다.

```tsx
// Web
import { HjmProvider } from "@hjmds/react/provider";
<HjmProvider brandPalette={{ light: { primary: brand.light.fill, contentBrand: brand.light.text }, dark: { primary: brand.dark.fill, contentBrand: brand.dark.text } }}>
  {app}
</HjmProvider>
```

## 하지 말 것

- `#0369a1`, `"gray"` 같은 색 값을 직접 쓰지 않는다. `THEMES.light.primary`를 import해 고정하는 것도 다크 모드와 브랜드를 깨뜨린다.
  현재 palette(`useHjmTheme()`·`useHjmNativeTheme()`)를 읽는다.
- 제품 브랜드를 `--hjm-color-*` 재정의나 `.hjm-*` 덮어쓰기로 넣지 않는다. 색만 바꾸면 `brandPalette`, 여러 표현 축을 함께 선택하면 검증한 `designProfile`을 쓴다([브랜드 경계](../../brand-boundary.md)).
- 성공·오류 색을 브랜드 색으로, 브랜드 색을 상태 색으로 쓰지 않는다.
- `textWeak`로 읽혀야 하는 문구를 쓰지 않는다. 보조 문구는 `textMuted`·`textSub`다.
- 채운 `primary`·`dangerFill`·`accentFill` 위에 `text`를 올리지 않는다. 짝(`onPrimary`·`onDanger`·`onAccentFill`)을 쓴다.
- Showcase의 예시 색을 제품 기본값으로 복사하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 테마 색 읽기 | `--hjm-color-<kebab key>` CSS 변수 또는 `useHjmTheme().palette.theme` | `useHjmNativeTheme().colors` |
| 피드백 색 | `--hjm-accent-<tone>`, `--hjm-accent-fill-<tone>` | `theme.palette.statusAccents` · `statusAccentFills` |
| alpha 섞기 | CSS `color-mix` | `resolveColorReference` 또는 `withAlpha` |

### 디자인 프로필(실험·미게시)

위 표는 프로필 없는 기본값이다. 앱이 [디자인 프로필](../../design-profile.md)을 선택하면 연결된
컴포넌트는 Web CSS 변수 또는 Native `theme.tokens`/semantic palette를 읽는다.
직접 foundations를 import한 값은 기본 상수이므로 프로필 변경을 따라가지 않는다. 현재 연결 API의 범위는
프로필 계약에서 확인하고 앱 CSS로 내부 값을 덮지 않는다.
