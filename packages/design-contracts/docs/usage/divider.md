# Divider 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `dividerRecipe`(`src/component-recipes.ts`)

## 언제 쓰나

서로 다른 내용 묶음 사이에 얇은 구분선이 필요할 때 쓴다. 가로선은 블록 사이, 세로선은
한 줄 안의 항목 사이(예: 툴바의 무리 구분)에 쓴다. 색은 `border` semantic 역할이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 목록 행 사이 구분선 | [List](list.md)의 `separator`(행마다 Divider를 끼우지 않는다) |
| 제목이 있는 내용 묶음 | [Section](section.md) |
| 단순 간격 | [Stack](stack.md)의 `gap` |
| 카드처럼 테두리로 감싼 묶음 | [Card](card.md), [Surface](surface.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Divider` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Divider } from "@hjmds/react/display";

<Divider />
<Divider orientation="vertical" decorative />
```

```tsx
// Native
import { Divider } from "@hjmds/react-native/data-display";

<Divider />
<Divider orientation="vertical" inset={8} />
```

## 축과 기본값

- `orientation`: `horizontal`(기본) · `vertical`.
- `inset`: Web은 토큰 `none`(기본, 0) · `start` · `both`(`spacing.md`). Native는 숫자(pt, 기본 0)이고
  가로선은 좌우, 세로선은 위아래 여백이 된다.

## 꼭 지킬 것

- 색·두께를 `style`/`className`으로 바꾸지 않는다. 구분선 색은 제품 테마의 `border` key로 바뀐다.
- Web에서 의미가 없는 장식선은 `decorative`로 표시한다(`role="presentation"`, `aria-hidden`).
  기본은 `role="separator"`다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `inset` 타입 | `"none" \| "start" \| "both"` | `number`(0 이상) |
| 접근성 | `separator`(기본) 또는 `decorative` | 항상 `accessible={false}`, `decorative` prop 없음 |
| 요소 | 가로 `hr`, 세로 `div` | `View` |

## 함정

- Native `inset`에 음수·NaN을 넘기면 `RangeError`가 난다.
- Native Divider는 테마를 읽으므로 `HjmNativeProvider` 밖에서 렌더하면 예외가 난다.
