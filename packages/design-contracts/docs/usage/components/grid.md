# Grid

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Responsive values와 Grid](../../responsive-grid.md), [레이아웃 primitive 판정](../../layout-primitives.md), recipe `gridRecipe`(`src/grid.ts`)
- 스토리북: `배포/컴포넌트/레이아웃/격자`

## 언제 쓰나

카드·타일처럼 같은 모양의 자식을 창 크기에 따라 열 수를 바꿔 배치할 때 쓴다. 열 수는 창 너비를
`compact`·`medium`·`expanded`·`wide` 네 class로 번역해 고르고, 자식 순서는 바꾸지 않는다(row-major).

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 행·열 의미가 있는 표(헤더, 정렬, 선택) | [DataTable](data-table.md) |
| 높이가 제각각인 카드 벽 | [Masonry](masonry.md) |
| 한 방향으로 쌓기·간격 | [Stack](stack.md) |
| 페이지 폭·여백 제한 | [Container](container.md) |
| 긴 목록 가상화 | [VirtualList](virtual-list.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Grid` | 기본 | `@hjmds/react`, `/layout` | `@hjmds/react-native`, `/primitives` |

`GridReveal`은 이름이 비슷하지만 Image 계약의 확장이며 Grid와 무관하다.

## 최소 사용 예

```tsx
// Web
import { Grid } from "@hjmds/react/layout";

<Grid columns={{ compact: 1, medium: 2, expanded: 3 }} gap={{ compact: "md" }} minColumnWidth={{ compact: 160 }}>
  {items.map((item) => <ProductCard key={item.id} item={item} />)}
</Grid>
```

```tsx
// Native
import { Grid } from "@hjmds/react-native/primitives";

<Grid columns={{ compact: 2, medium: 3 }} gap={{ compact: { row: "lg", column: "sm" } }}>
  {items.map((item) => <ProductCard key={item.id} item={item} />)}
</Grid>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `columns` | `ResponsiveValue<number>`(필수) | — | `compact`가 필수이고 빈 class는 좁은 쪽 값을 물려받는다. 양의 정수만 받는다 |
| `gap` | `ResponsiveValue<GridGap>`. `GridGap`은 token(`none` · `xxs`~`xxxl`) 또는 `{ row, column }` | `md`(16) | 항상 구간 객체로 준다: `{ compact: "md" }`, `{ compact: "sm", expanded: "lg" }`, `{ compact: { row: "lg", column: "sm" } }`. 맨 token `gap="md"`는 타입 오류다 |
| `minColumnWidth` | `ResponsiveValue<number>` | — | 선택. 열이 이 폭보다 좁아지기 전에 열 수를 줄인다. 한 열은 그대로 줄어든다 |
| `availableWidth` | 숫자 | — | 생략하면 렌더된 컨테이너를 잰다(Web `ResizeObserver`, Native `onLayout`) |
| Native `onLayoutResolved` | `(layout: ResolvedGridLayout) => void` | — | `layout`은 `{ windowClass, flow: "row-major", requestedColumns, columns, rowGap, columnGap, columnWidth }`. 열 수가 줄었는지(`columns < requestedColumns`) 확인할 때 쓴다 |
| Web `windowWidth` | 숫자 | `window.innerWidth`(SSR 320) | 테스트·SSR에서 창 너비를 덮는다 |

- `ResponsiveValue<V>`는 `{ compact: V; medium?: V; expanded?: V; wide?: V }`다(`@hjmds/design-contracts/responsive`).

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Grid는 부모 폭을 채우고 바깥 여백을 갖지 않는다. 열 폭은 Grid가 실제로 받은 폭(`availableWidth`)으로 계산한다 | `grid.ts` `resolveGridLayout`, `styles.css` `.hjm-grid` |
| 간격 | 기본 간격 `md`(16). 페이지 좌우 여백은 [Container](container.md)·Layout이 준다 | `grid.ts` `gridDefaults` |
| 순서·정렬 | 자식 순서는 행 우선(row-major)이고 RTL에서는 오른쪽에서 시작한다 | `grid.ts` `gridDefaults` |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 창 너비 class는 `breakpoint` 기준이다: `compact` 0 · `medium` 600 · `expanded` 960 · `wide` 1280. 열 수는 이 class로 고른다. `columns`는 `compact` 값부터 정하고 넓은 class에서 늘린다(빈 class는 좁은 쪽 값을 물려받는다). `minColumnWidth`를 주면 열이 그 폭보다 좁아지기 전에 열 수가 줄어든다. 큰 글자로 카드가 좁아질 때 이 값으로 열을 줄인다 | `responsive.ts` `resolveWindowClass`, `foundations.ts` `breakpoint` |

## 꼭 지킬 것

- 간격은 gap token으로만 준다. 숫자 px나 자식 margin으로 간격을 만들지 않는다.
- class 이름 오타·알 수 없는 key·0 이하 열 수는 resolver가 던진다. 조용히 무시되지 않는다.
- Grid는 자식의 의미를 만들지 않는다. 목록이면 자식에 제품이 목록 의미를 준다.
- Web 배치는 `layoutStyle`로 한다(색·테두리 등 시각 key는 받지 않는다).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구현 | CSS Grid(`repeat(n, minmax(0, 1fr))`) | `flexWrap` 행 + 자식마다 고정 폭 셀 View |
| 창 너비 | `window.innerWidth`, `windowWidth`로 덮기(테스트·SSR) | `useWindowDimensions` |
| SSR 첫 렌더 | 창 너비를 모르면 320으로 계산 | 해당 없음 |
| 셀 스타일 | 없음(자식이 직접) | `itemStyle` |
| 결과 통지 | `data-columns`·`data-state` 속성 | `onLayoutResolved(layout)` |
| 배치 prop | `layoutStyle`, `className`, `style` | `style`(View). Grid는 layout primitive라 deprecated 대상이 아니고 `layoutStyle`은 없다 |
| RTL | CSS가 처리 | Provider의 `environment.direction` 적용 |

## 함정

- Native는 자식마다 셀 View를 감싸고 폭을 기기 픽셀 단위로 내림한다. 셀 자체를 꾸밀 때는 자식이 아니라 `itemStyle`을 쓴다.
- Web SSR에서는 320 기준 열 수로 그렸다가 하이드레이션 뒤 실제 너비로 바뀐다. 첫 화면 열 수가 중요하면 `windowWidth`를 넘긴다.
