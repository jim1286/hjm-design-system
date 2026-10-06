# 테두리

- 단계: 토큰
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `src/foundations.ts`(`stroke`), `src/component-contracts.ts`(`focusIndicatorContract`), `src/base-recipes.ts`(`fieldRecipe`), `src/component-recipes.ts`(`segmentedControlRecipe`·`tabsRecipe`), `packages/react/src/theme.ts`
- 스토리북: `배포/토큰/표면과 움직임/테두리`

## 언제 쓰나

테두리·구분선·포커스 링의 두께를 정할 때 쓴다. 색은 [색상](color.md)의 테두리 역할(`border`·`borderControl`·`border.focus`)에서 고른다.

## 값

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `stroke.subtle` | 1 | `--hjm-stroke-subtle` | `stroke.subtle` | 약한 경계(`border.subtle` 색과 함께) |
| `stroke.default` | 1 | `--hjm-stroke-default` | `stroke.default` | 영역 경계·구분선·필드 테두리(`fieldRecipe.borderWidth` 1) |
| `stroke.strong` | 2 | `--hjm-stroke-strong` | `stroke.strong` | 선택 표시: SegmentedControl 선택 칸 테두리, Tabs 현재 탭 밑줄 높이 |
| `stroke.focus` | 2 | `--hjm-stroke-focus` · `--hjm-focus-width` | `stroke.focus` | 키보드 포커스 링. 바깥 간격 2(`--hjm-focus-offset`), 색 `contentBrand`(`--hjm-color-focus`) |

Native 경로의 `stroke`는 `@hjmds/design-contracts/foundations` import다.

## 쓰는 법

```tsx
// Web
// 제품 고유 영역: .product-panel { border: var(--hjm-stroke-default) solid var(--hjm-color-border); }
import { Surface } from "@hjmds/react/layout";

<Surface bordered>{children}</Surface>
```

```tsx
// Native
import { View } from "react-native";
import { stroke } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";

const theme = useHjmNativeTheme();
<View style={{ borderWidth: stroke.default, borderColor: theme.colors.border }} />;
```

## 하지 말 것

- 0.5·1.5 같은 두께를 만들지 않는다. hairline이 필요하면 `stroke.subtle`과 `border.subtle` 색을 쓴다.
- HJM 컴포넌트의 포커스 링을 지우거나(`outline: none`) 다시 그리지 않는다. 제품 고유 컨트롤만 같은 값(`stroke.focus` 2, 간격 2)으로 그린다.
- 테두리 두께로 선택 상태를 알리는 경우 색도 함께 바꾼다. 두께만으로는 구분이 약하다.
