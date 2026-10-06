# 간격

- 단계: 토큰
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `src/foundations.ts`(`spacing`·`layout`), `src/grid.ts`(`gridGaps`), `src/base-recipes.ts`(`buttonRecipe`·`fieldRecipe`), `src/auth-screen.ts`, `packages/react/src/theme.ts`, `packages/react/src/styles.css`
- 스토리북: `배포/토큰/공간과 크기/간격`

## 언제 쓰나

요소 사이 간격(gap)과 영역 안쪽 여백(padding)을 정할 때 쓴다. 숫자는 Web에서 CSS px, Native에서 dp(pt)다.
화면 좌우 여백·최대 폭은 이 값을 묶어 이름을 붙인 [화면 여백과 너비](layout.md)를 먼저 본다.

## 값

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `spacing.xxs` | 4 | `--hjm-space-xxs` | `spacing.xxs` · `theme.tokens.spacing.xxs` | 목록 팝업 안쪽 여백(Select·Menubar) |
| `spacing.xs` | 8 | `--hjm-space-xs` | `spacing.xs` · `theme.tokens.spacing.xs` | 필드 라벨과 입력 사이, DatePicker 팝업과 입력 사이, EmptyState 안 요소 사이 |
| `spacing.sm` | 12 | `--hjm-space-sm` | `spacing.sm` · `theme.tokens.spacing.sm` | 나란한 버튼 사이, Toast 사이, small 버튼 좌우·필드 위아래 안쪽 여백 |
| `spacing.md` | 16 | `--hjm-space-md` | `spacing.md` · `theme.tokens.spacing.md` | Stack·Grid 기본 gap, medium 버튼·필드 좌우 안쪽 여백, `layout.contentGap`, `layout.pagePadding.compact` |
| `spacing.lg` | 20 | `--hjm-space-lg` | `spacing.lg` · `theme.tokens.spacing.lg` | large 버튼 좌우 안쪽 여백, `layout.pagePadding.regular`, Dialog 하단 여백 |
| `spacing.xl` | 24 | `--hjm-space-xl` | `spacing.xl` · `theme.tokens.spacing.xl` | `layout.sectionGap`, `layout.pagePadding.spacious`, EmptyState·Result 좌우 여백 |
| `spacing.xxl` | 32 | `--hjm-space-xxl` | `spacing.xxl` · `theme.tokens.spacing.xxl` | EmptyState 위아래 여백 |
| `spacing.xxxl` | 40 | `--hjm-space-xxxl` | `spacing.xxxl` · `theme.tokens.spacing.xxxl` | Result 위아래 여백, AuthScreen regular 위아래 여백 |

- Native 경로의 `spacing`은 `@hjmds/design-contracts/foundations` import, `theme`은 `useHjmNativeTheme()` 결과다.
- Stack·Grid·Surface의 `gap`·`padding` prop은 이 토큰 이름(`"md"`)을 받는다. Grid는 `none`(0)을 하나 더 받는다.
- 두 단계 사이에서 애매하면 작은 쪽을 고른다. 새 숫자(10, 18 등)를 만들지 않는다.

## 쓰는 법

```tsx
// Web
import { Stack, Surface } from "@hjmds/react/layout";

<Surface padding="lg">
  <Stack gap="sm">{children}</Stack>
</Surface>

// 제품 CSS가 꼭 필요하면 변수로: .product-toolbar { gap: var(--hjm-space-xs); padding-inline: var(--hjm-space-md); }
```

```tsx
// Native
import { StyleSheet } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { Stack, Surface } from "@hjmds/react-native/primitives";

<Surface padding="lg">
  <Stack gap="sm">{children}</Stack>
</Surface>

const styles = StyleSheet.create({ toolbar: { gap: spacing.xs, paddingHorizontal: spacing.md } });
```

간격 배치 규칙은 [Stack](../components/stack.md)·[Grid](../components/grid.md)·[Container](../components/container.md) 지침에 있다.

## 하지 말 것

- `margin: 13px`, `padding: 10` 같은 숫자를 직접 쓰지 않는다. 토큰에 없는 리듬은 계약 공백이므로 이슈로 올린다.
- 자식마다 margin을 붙여 간격을 만들지 않는다. 감싸는 Stack·Grid의 `gap`으로 정한다.
- `--hjm-space-*` 변수를 제품 CSS에서 재정의하지 않는다([브랜드 경계 §3](../../brand-boundary.md)).
- 화면 좌우 여백을 화면마다 `spacing.lg`로 적지 않는다. [Container](../components/container.md)의 `gutter`를 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 단위 | CSS px(`--hjm-space-*`는 `px` 문자열) | dp(pt) 숫자 |
| Stack `gap` 타입 | 토큰 이름만 | 토큰 이름 또는 숫자 |
