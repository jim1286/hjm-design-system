# 크기

- 단계: 토큰
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `src/foundations.ts`(`glyph`·`control`), `src/component-recipes.ts`(`iconRecipe`·`spinnerRecipe`·`chipRecipe`·`avatarRecipe`·`skeletonRecipe`), `src/base-recipes.ts`(`buttonRecipe`), `src/design-system-provider.ts`(`visibleControlHeight`), `packages/react/src/theme.ts`
- 스토리북: `배포/토큰/공간과 크기/크기`

## 언제 쓰나

아이콘·작은 그림(glyph)의 크기와 누를 수 있는 컨트롤의 높이·최소 터치 영역을 정할 때 쓴다. 모든 버튼의 폭이나 화면 요소의
크기를 뜻하지 않는다. 화면 폭·행 높이는 [화면 여백과 너비](layout.md)에 있다.

## 값

### glyph(아이콘·작은 그림)

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `glyph.xs` | 14 | — | `glyph.xs` | Spinner `small` |
| `glyph.sm` | 20 | — | `glyph.sm` | Spinner `medium`(기본), 작은 아이콘 |
| `glyph.md` | 24 | — | `glyph.md` | Icon 기본 크기, Steps 표지 |
| `glyph.lg` | 28 | — | `glyph.lg` | Spinner `large`, EmptyState 아이콘 |
| `glyph.xl` | 32 | — | `glyph.xl` | 큰 아이콘 |
| `glyph.xxl` | 44 | — | `glyph.xxl` | Skeleton 원 기본 지름, Calendar `large` 날짜 칸 지름 |
| `glyph.xxxl` | 48 | — | `glyph.xxxl` | 가장 큰 아이콘 |

Icon의 `size` prop은 이 이름(`"md"`)을 받는다. Avatar는 glyph가 아니라 자기 크기(`small` 32 · `medium` 40 · `large` 48 · `xlarge` 64)를 쓴다.

### control(컨트롤 높이·터치 영역)

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `control.minTouchTarget` | 44 | `--hjm-control-min-touch-target` | `control.minTouchTarget` | 누를 수 있는 모든 것의 최소 터치 영역(가로·세로). ListRow `compact` 한 줄, Calendar `medium` 칸 |
| `control.buttonHeight.small` | 36 | `--hjm-control-button-small` | `control.buttonHeight.small` | Button `size="small"`. `control.buttonHitSlop.small` 4를 더해 터치 영역 44 |
| `control.buttonHeight.medium` | 44 | `--hjm-control-button-medium` | `control.buttonHeight.medium` | Button `size="medium"`(기본) |
| `control.buttonHeight.large` | 52 | `--hjm-control-button-large` | `control.buttonHeight.large` | Button `size="large"`, 화면 하단 주 행동 |
| `control.fieldHeight` | 44 | `--hjm-control-field-height` | `control.fieldHeight` | 한 줄 입력 필드 높이 |
| `control.chipHeight.small` | 36 | — | `control.chipHeight.small` | Chip `size="small"` |
| `control.chipHeight.medium` | 44 | — | `control.chipHeight.medium` | Chip `size="medium"` |
| `control.selectionIndicator` | 24 | — | `control.selectionIndicator` | Checkbox·Radio 표지 상자 |

Provider의 `minimumVisualTarget`을 켜면 보이는 버튼 높이가 44보다 작아지지 않는다(`small`도 44). Web은 `--hjm-control-button-*`에 반영된다.
Native 경로의 `glyph`·`control`은 `@hjmds/design-contracts/foundations` import다.

## 쓰는 법

```tsx
// Web
import { Icon } from "@hjmds/react/display";

<Icon name="search" size="sm" />
// 제품 고유 누름 영역: .product-tile { min-block-size: var(--hjm-control-min-touch-target); }
```

```tsx
// Native
import { Pressable } from "react-native";
import { control, glyph } from "@hjmds/design-contracts/foundations";

<Pressable style={{ minHeight: control.minTouchTarget, minWidth: control.minTouchTarget }} onPress={open}>
  <ProductMark width={glyph.md} height={glyph.md} />
</Pressable>
```

아이콘 사용법은 [Icon](../components/icon.md), 버튼 크기 선택은 [Button 배치](../components/button.md#배치)를 본다.

## 하지 말 것

- 누를 수 있는 영역을 44보다 작게 만들지 않는다. 그림이 작으면 hitSlop·padding으로 터치 영역을 44로 맞춘다.
- Button·필드 높이를 `style`로 바꾸지 않는다. `size` prop으로만 고른다.
- 아이콘 크기에 18, 22 같은 새 숫자를 쓰지 않는다.
