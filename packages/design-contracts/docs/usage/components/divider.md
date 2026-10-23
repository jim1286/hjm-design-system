# Divider

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-23
- 근거: recipe `dividerRecipe`(`src/component-recipes.ts`)
- 스토리북: `배포/컴포넌트/레이아웃/구분선`

## 언제 쓰나

서로 다른 내용 묶음 사이에 얇은 구분선이 필요할 때 쓴다. 가로선은 블록 사이, 세로선은
한 줄 안의 항목 사이(예: 툴바의 무리 구분)에 쓴다. 색은 `border` semantic 역할이다.
한 표면(카드) 안에서 "다른 이야기가 이어진다"는 가벼운 나눔은 `lineStyle="dashed"`다. 실선은 카드 하나를 둘로 읽히게 한다(개발 소스, 미게시).

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 목록 행 사이 구분선 | [List](list.md)의 `separator`(행마다 Divider를 끼우지 않는다) |
| 제목이 있는 내용 묶음 | [Section](section.md) |
| 단순 간격 | [Stack](stack.md)의 `gap` |
| 카드처럼 테두리로 감싼 묶음 | [Card](card.md), [Surface](surface.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Divider` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |

## 최소 사용 예

```tsx
// Web
import { Divider } from "@hjmds/react/display";

<Divider />
<Divider orientation="vertical" decorative />
```

```tsx
// Native
import { spacing } from "@hjmds/design-contracts/foundations";
import { Divider } from "@hjmds/react-native/data-display";

<Divider />
<Divider orientation="vertical" inset={spacing.xs} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `orientation` | `horizontal` · `vertical` | `horizontal` | 가로선·세로선 |
| `inset` | Web `none` · `start` · `both` / Native 숫자(pt, 토큰 값으로 넘긴다) | Web `none`(0) / Native 0 | Web `start`·`both`는 `spacing.md`. Native는 가로선이면 좌우, 세로선이면 위아래 여백이 된다 |
| Web `decorative` | `boolean` | `false` | `true`면 `role="presentation"`·`aria-hidden` |
| `lineStyle` | `solid` · `dashed` | `solid` | `dashed`는 `dividerRecipe.lineStyles.dashed`의 dash 4 · gap 4를 두께 1로 그리며 시작 쪽 끝에서 dash로 시작한다. 색·두께는 실선과 같다(개발 소스, 미게시) |
| `layoutStyle` | 배치 전용 style | — | 루트 배치. Native `style`은 제거된 속성 |

콜백 prop은 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 두께 1(`stroke.subtle`), 색 `border.default`. 가로선은 부모 폭을 채우고 세로선은 부모 높이로 늘어난다. Web 세로선은 최소 높이 44(`control.minTouchTarget`)를 가진다 | `component-recipes.ts` `dividerRecipe`, `styles.css` `.hjm-divider` |
| 간격 | Web `inset="start"`는 시작 쪽만, `both`는 양쪽을 `spacing.md`(16)만큼 비운다. 위아래 간격은 Divider가 아니라 감싸는 [Stack](stack.md)의 `gap`으로 준다. Divider 자체 margin은 0이다 | `styles.css` `.hjm-divider`, `react-native/src/data-display.tsx` |
| 순서·정렬 | 목록 아이콘 열과 맞출 때 `start`를 쓴다. 툴바의 세로선은 무리 사이에 하나만 둔다. 양 끝에는 두지 않는다 | `styles.css` `.hjm-divider` |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | — | — |

## 꼭 지킬 것

- 점선을 `border-*: dashed` CSS나 SVG `Line`으로 따로 그리지 않는다. `lineStyle="dashed"`를 쓴다.
- 색·두께를 `style`/`className`으로 바꾸지 않는다. 구분선 색은 제품 테마의 `border` key로 바뀐다.
  배치는 `layoutStyle`로 한다. Native `style`은 제거된 속성 — `layoutStyle` 또는 `orientation`·`inset`으로 옮긴다.
- Web에서 의미가 없는 장식선은 `decorative`로 표시한다(`role="presentation"`, `aria-hidden`).
  기본은 `role="separator"`다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `inset` 타입 | `"none" \| "start" \| "both"` | `number`(0 이상) |
| 접근성 | `separator`(기본) 또는 `decorative` | 항상 `accessible={false}`, `decorative` prop 없음 |
| 요소 | 가로 `hr`, 세로 `div` | `View` |
| 점선 그리기 | `repeating-linear-gradient`(recipe의 dash·gap을 Provider CSS 변수로) | 측정한 길이에 recipe 크기의 조각 `View`를 나열(iOS는 한쪽 `borderStyle: "dashed"`를 실선으로 그린다). optional SVG peer를 쓰지 않는다 |

## 함정

- Native `inset`에 음수·NaN을 넘기면 `RangeError`가 난다.
- Native Divider는 테마를 읽으므로 `HjmNativeProvider` 밖에서 렌더하면 예외가 난다.

## 근거

- `lineStyle="dashed"`(2026-10-23 소비 감사): 다에리가 같은 의미의 점선을 Web `.cozy-nest-next`의 `border-block-start: 1px dashed`(브라우저가 정한 간격)와
  Native `DashedRule`(SVG `strokeDasharray="4 4"`)로 따로 그렸다. 의미가 같은 선을 두 번 구현해 간격이 갈랐으므로 Divider의 선 모양 축으로 두고,
  간격·두께는 recipe가 소유한다. 새 컴포넌트가 아니라 축인 이유는 색·두께·inset·접근성이 실선과 같고 패턴만 다르기 때문이다.
  이관: Web `<Divider lineStyle="dashed" />`, Native `<Divider lineStyle="dashed" />`로 `DashedRule`과 CSS 점선을 대체한다.
