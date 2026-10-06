# 둥글기

- 단계: 토큰
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `src/foundations.ts`(`radius`), `src/base-recipes.ts`(`buttonRecipe.shapes`·`fieldRecipe.shapes`·`surfaceDefaults`), `src/component-recipes.ts`, `packages/react/src/theme.ts`
- 스토리북: `배포/토큰/표면과 움직임/둥글기`

## 언제 쓰나

모서리 반경을 정할 때 쓴다. 컴포넌트는 자기 radius를 recipe로 이미 갖고 있으므로, 제품이 직접 고르는 것은 제품 고유 틀
(이미지 틀·제품 카드 안쪽 영역)일 때다. 고를 때는 아래 용도 열에서 같은 크기의 HJM 컴포넌트를 찾아 맞춘다.

## 값

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `radius.sm` | 8 | `--hjm-radius-sm` | `radius.sm` · `theme.tokens.radius.sm` | Tooltip, Skeleton 글자 줄 |
| `radius.md` | 12 | `--hjm-radius-md` | `radius.md` · `theme.tokens.radius.md` | Button `shape="rounded"`(기본), 필드 `shape="medium"`, Notice, Skeleton 블록, Avatar `shape="rounded"`, 목록 팝업 |
| `radius.lg` | 16 | `--hjm-radius-lg` | `radius.lg` · `theme.tokens.radius.lg` | Surface·Card 기본, Dialog, Toast, SegmentedControl, 필드 `shape="large"` |
| `radius.xl` | 24 | `--hjm-radius-xl` | `radius.xl` · `theme.tokens.radius.xl` | Sheet 위쪽 모서리 |
| `radius.full` | 999 | `--hjm-radius-full` | `radius.full` · `theme.tokens.radius.full` | 원·캡슐: Button `shape="pill"`, Badge, Chip, SearchField, Avatar `shape="circle"`, BottomNavigation 캡슐 |

- 안쪽 요소의 radius는 바깥보다 크지 않게 고른다. 예: `radius.lg` Surface 안의 이미지 틀은 `radius.md`.
- Native 경로의 `radius`는 `@hjmds/design-contracts/foundations` import다.

## 쓰는 법

```tsx
// Web
import { Surface } from "@hjmds/react/layout";

<Surface radius="lg" padding="md">{children}</Surface>
// 제품 고유 틀: .product-thumb { border-radius: var(--hjm-radius-md); overflow: hidden; }
```

```tsx
// Native
import { StyleSheet } from "react-native";
import { radius } from "@hjmds/design-contracts/foundations";
import { Surface } from "@hjmds/react-native/primitives";

<Surface radius="lg" padding="md">{children}</Surface>
const styles = StyleSheet.create({ thumb: { borderRadius: radius.md, overflow: "hidden" } });
```

## 하지 말 것

- `border-radius: 10px`처럼 토큰에 없는 값을 쓰지 않는다.
- HJM 컴포넌트의 radius를 `style`·`className`으로 덮지 않는다. Button·필드는 `shape`, Surface는 `radius` prop으로만 고른다.
- 원형을 만들려고 `50%`나 폭의 절반을 계산하지 않는다. `radius.full`을 쓴다.
