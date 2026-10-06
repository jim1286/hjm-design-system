# 화면 여백과 너비

- 단계: 토큰
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Container](../../container.md), [반응형 Grid](../../responsive-grid.md), `src/foundations.ts`(`layout`·`breakpoint`), `src/container.ts`, `src/responsive.ts`, `src/component-recipes.ts`(`listRowRecipe`)
- 스토리북: `배포/토큰/공간과 크기/화면 여백과 너비`

## 언제 쓰나

화면 좌우 여백·본문 최대 폭·구획 간격·행 높이·breakpoint를 정하는 화면 배치의 기준값이다. 숫자는 Web CSS px,
Native dp(pt)로 같다. 화면 지침의 영역 구조는 이 값을 전제로 한다.

## 값

### 화면 좌우 여백·구획 간격

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `layout.pagePadding.compact` | 16 (`spacing.md`) | — (Container `gutter="compact"`) | `layout.pagePadding.compact` | 폭 600 미만 화면 좌우 여백, AuthScreen compact |
| `layout.pagePadding.regular` | 20 (`spacing.lg`) | — (Container `gutter="regular"`, 기본) | `layout.pagePadding.regular` | 일반 화면 좌우 여백, AuthScreen regular |
| `layout.pagePadding.spacious` | 24 (`spacing.xl`) | — (Container `gutter="spacious"`) | `layout.pagePadding.spacious` | 여유 있는 넓은 화면 |
| — | 0 | — (Container `gutter="none"`) | — | 지도·갤러리처럼 가장자리까지 채우는 영역 |
| `layout.sectionGap` | 24 (`spacing.xl`) | `--hjm-space-xl` | `layout.sectionGap` | 화면 안 구획 사이(Stack `gap="xl"`) |
| `layout.contentGap` | 16 (`spacing.md`) | `--hjm-space-md` | `layout.contentGap` | 한 구획 안 요소 사이(Stack `gap="md"`) |

### 최대 폭

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `layout.readingMaxWidth` | 720 | — (Container `size="reading"`) | `layout.readingMaxWidth` | 글 읽기·설정·폼처럼 한 줄 길이를 제한할 화면 |
| `layout.contentMaxWidth` | 1200 | — (Container `size="content"`, 기본) | `layout.contentMaxWidth` | 일반 제품 화면 |
| — | 제한 없음 | — (Container `size="full"`) | — | 의도적으로 가득 채우는 영역 |

### 행 높이

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `layout.rowHeight.singleLine` | 56 | `--hjm-list-row-comfortable-one-line` | `layout.rowHeight.singleLine` | ListRow 한 줄 최소 높이(`comfortable` 기본). `relaxed` 64 · `spacious` 72 · `compact` 44(`control.minTouchTarget`) |
| `layout.rowHeight.twoLine` | 68 | `--hjm-list-row-comfortable-two-line` | `layout.rowHeight.twoLine` | ListRow 두 줄 최소 높이(`comfortable`). `relaxed` 76 · `spacious` 84 · `compact` 60. UploadItem 최소 높이 |

### Breakpoint(폭 구간)

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `breakpoint.compact` | 0 | — | `breakpoint.compact` | `compact` 구간: 0 이상 600 미만. 휴대폰 세로 |
| `breakpoint.medium` | 600 | — | `breakpoint.medium` | `medium` 구간: 600 이상 960 미만. AlertDialog 버튼이 가로로 바뀌는 경계 |
| `breakpoint.expanded` | 960 | — | `breakpoint.expanded` | `expanded` 구간: 960 이상 1280 미만 |
| `breakpoint.wide` | 1280 | — | `breakpoint.wide` | `wide` 구간: 1280 이상 |

- 경계값은 포함한다. 폭 600은 `medium`이다(`resolveWindowClass`).
- 구간 이름은 기기 종류가 아니라 폭이다. 태블릿 세로·작은 브라우저 창도 폭으로 판단한다.
- `ResponsiveValue`는 `compact` 값이 필수이고, 빠진 큰 구간은 가장 가까운 좁은 구간 값을 물려받는다.
- Native 경로의 `layout`·`breakpoint`는 `@hjmds/design-contracts/foundations` import다. CSS 변수가 없는 값은 Container·Grid prop으로 쓴다.

## 쓰는 법

화면 본문은 Container로 감싸 최대 폭과 좌우 여백을 한 번에 정한다. 구획은 Stack `gap="xl"`(`layout.sectionGap`)로 띄운다.

```text
폭 < 600 (compact)                  폭 ≥ 960 (expanded) — Container size="content"
┌────────────────────────┐          ┌──────────────────────────────────────────────┐
│←16→ 본문          ←16→│          │        ┌──── 최대 1200 ────┐                 │
│     구획 A             │          │ ←20→   │ 구획 A            │   ←20→          │
│     ↕ 24 (sectionGap)  │          │        │ ↕ 24              │                 │
│     구획 B             │          │        │ 구획 B            │                 │
└────────────────────────┘          └──────────────────────────────────────────────┘
gutter="compact"(16)                gutter="regular"(20), inline 축 가운데 정렬
```

```tsx
// Web
import { Container, Stack } from "@hjmds/react/layout";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const gutter = resolveWindowClass(window.innerWidth) === "compact" ? "compact" : "regular";

<Container size="content" gutter={gutter}>
  <Stack gap="xl">{sections}</Stack>
</Container>
```

```tsx
// Native
import { useWindowDimensions } from "react-native";
import { Container, Stack } from "@hjmds/react-native/primitives";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const { width } = useWindowDimensions();
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";

<Container size="reading" gutter={gutter}>
  <Stack gap="xl">{sections}</Stack>
</Container>
```

폭에 따라 열 수가 바뀌는 배치는 [Grid](../components/grid.md)의 `columns`(ResponsiveValue)로, 화면 틀은 [Layout](../components/layout.md)으로 정한다.

## 하지 말 것

- `max-width: 1100px`, `@media (min-width: 768px)`처럼 토큰에 없는 폭을 만들지 않는다. 경계는 600·960·1280만 쓴다.
- 화면마다 `paddingHorizontal: 20`을 직접 적지 않는다. Container `gutter`나 `layout.pagePadding`을 쓴다.
- `left`/`right` 물리 방향 여백을 쓰지 않는다. Container는 inline 축 기준이라 RTL에서도 맞다.
- 기기 이름(phone·tablet)으로 분기하지 않는다. 폭 구간으로 분기한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 폭 읽기 | `window.innerWidth` 또는 컨테이너 폭 | `useWindowDimensions().width` |
| Container 폭·여백 | `max-inline-size` · `padding-inline` | `maxWidth` + `width: "100%"` · `paddingHorizontal` |
| CSS media query | 변수를 못 읽으므로 경계 숫자를 쓸 때는 600·960·1280만 | 해당 없음 |
