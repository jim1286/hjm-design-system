# Badge

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-23
- 근거: recipe `badgeRecipe`(`src/component-recipes.ts`)
- 스토리북: `배포/컴포넌트/데이터 표시/배지`

## 언제 쓰나

항목의 상태나 분류를 짧은 글자 하나로 붙일 때 쓴다. "진행 중", "완료", "시즌 3"처럼 누를 수 없는 표시다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 읽지 않은 수·알림 점 | [CounterBadge](counter-badge.md) |
| 사용자가 붙인 키워드·카테고리 | [Tag](tag.md) |
| 누르거나 고르는 필터 | [Chip](chip.md) |
| 문장으로 설명해야 하는 상태 | [Notice](notice.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Badge` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |

## 최소 사용 예

```tsx
// Web
import { Badge } from "@hjmds/react/display";

<Badge tone="success" size="small">{t("order.status.done")}</Badge>
```

```tsx
// Native
import { Badge } from "@hjmds/react-native/data-display";

<Badge tone="success" size="small" label={t("order.status.done")} />
```

왼쪽 → 라벨 → 오른쪽 순서로 배치한다. 아이콘 콜백은 배지 글자와 같은 `color`, `glyph.xs`(14) `size`, Icon `regular`와 같은 선 굵기 `strokeWidth`(2, `badgeRecipe.iconStrokeWidth`)를 받는다. 제품 글리프 렌더러(Lucide 등)에 셋을 그대로 넘기고 Icon 노드를 따로 만들지 않는다(strokeWidth는 개발 소스, 미게시). Native는 실제 테마 색을, Web은 `currentColor`를 전달한다. 이 콜백 API는 미게시다. 아이콘은 장식이며 별도 누르기 동작을 넣지 않는다.

```tsx
// Web
<Badge tone="success" leading={({ color, size, strokeWidth }) => <Trophy size={size} color={color} strokeWidth={strokeWidth} />} trailing={({ color, size }) => <Check size={size} color={color} />}>완료</Badge>
```

### 제품 분류 색 — 개발 소스, 미게시

경기 시리즈·FA 등급처럼 **상태도 브랜드도 아닌 제품 분류**는 `tone` 대신 `categoryColor`에 테마별 색을 넣는다.
제품이 색을 정하고, HJM이 틀·글자 굵기·간격과 글자색을 정한다. `filled`는 `onStatusFill`(흰색)과 어두운 글자
(`badgeRecipe.category.darkInk`, 기본 light `text`) 중 대비가 높은 쪽을 고르고, `outline`은 그 색을 글자·테두리로 쓴다.
어느 쪽도 WCAG AA 4.5:1에 못 미치면(outline은 `bg`·`surface` 모두) `RangeError`를 던진다. 어두운 테마에서 읽히지 않는 색은
`dark` 값을 따로 준다. `tone`과 함께 주면 `TypeError`다.

```tsx
// Native
const seriesColor = { light: "#216BA8", dark: "#216BA8" } as const; // 제품 분류 정의
<Badge size="small" label={t("series.regular")} categoryColor={seriesColor} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `tone` | `neutral` · `strong` · `brand` · `info` · `success` · `warning` · `attention` · `danger` | `neutral` | 단색 배경과 흰색 굵은 글자를 사용한다. `neutral`은 회색, `strong`은 더 진한 회색, 나머지는 각 의미의 solid fill이다. `outline`은 투명 배경과 의미색 글자다 |
| `categoryColor` | `{ light: string; dark: string }`(6자리 hex) | — | `tone` 대신 쓰는 제품 분류 색. 글자색은 HJM이 고르고 AA를 검사한다(위 절). 개발 소스, 미게시 |
| `variant` | `filled` · `outline` · `plain` | `filled` | — |
| `size` | `small` · `medium` | `medium` | — |
| `leading` · `trailing` | `ReactNode \| (context: BadgeAdornmentContext) => ReactNode` | — | 라벨 왼쪽·오른쪽 아이콘. 양쪽 동시 사용 가능하며 보조기기에서 숨겨진다 |
| Web `children` · Native `label` | `ReactNode` · `string \| number`(필수) | — | 표시 라벨 |
| Native `accessibilityLabel` | `string` | `String(label)` | 숫자 라벨에 단위를 붙여 읽힐 때 쓴다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. Native `style`·`labelStyle`은 제거된 속성 — layoutStyle 또는 tone/토큰 |

행동 콜백은 없다. 아이콘 렌더 콜백은 색·크기·선 굵기만 받으며 배지는 누를 수 없는 표시다.

상태 채움의 글자·아이콘은 `onStatusFill`, 브랜드 채움은 `onPrimary`, 위험 채움은 `onDanger`를 쓴다. 브랜드의 전경색이 어두워도 상태 배지의 대비를 독립적으로 유지하기 위한 역할 분리다(미게시).

## 배치

Web·Native 모두 `radius.sm`(8)의 둥근 사각형을 사용한다. 2026-10-18 사용자가 제시한 오늘야구 경기 상태 배지에 맞춘 공통 표현이다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 내용 폭만 차지한다. 최소 높이 `medium` 24 · `small` 20, 모서리 `radius.sm`. 누를 수 없는 표시라 44 터치 영역이 필요 없다(누르게 하려면 [Chip](chip.md)) | `badgeRecipe.sizes`, `.hjm-badge` |
| 간격 | 좌우 여백 `medium` `spacing.xs` 8 · `small` `spacing.xs` 8, 아이콘↔라벨 `spacing.xxs` 4. 여러 개를 나란히 둘 때는 `spacing.xxs` 4~`spacing.xs` 8 | `badgeRecipe.sizes` |
| 순서·정렬 | 제목·행 이름 옆(끝 쪽) 또는 카드 머리 위에 인라인으로 붙인다. 한 행에 2~3개를 넘기지 않는다 | `.hjm-badge`(`inline-flex`) |
| 고정·스크롤 | 고정 영역이 없다 | — |
| 좁은 폭·큰 글자 | 라벨이 줄바꿈된다(`overflow-wrap: anywhere`). 말줄임하지 않는다 | `.hjm-badge` |

## 꼭 지킬 것

- 라벨은 i18n 키로 넣고 짧게 둔다. 상태 뜻을 색에만 싣지 않는다(글자가 뜻을 말해야 한다).
- 색은 `tone`으로 고르고, 제품 분류 색만 `categoryColor`로 넣는다. 브랜드 색을 `style`·`className`·`labelStyle`로 덮거나 배지 하나를 `brandPalette` Provider로 감싸지 않는다(2026-10-23 야잘알 GameSeriesBadge·FA 등급 감사: Provider 중첩은 그 범위의 모든 토큰을 바꾼다).
- 배치는 Web·Native 모두 `layoutStyle`로만 한다. Native `style`·`labelStyle`은 제거된 속성이다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 라벨 | `children` | `label`(문자열·숫자, 필수) |
| 접근성 이름 | 라벨 텍스트 | `accessibilityLabel`(기본 `String(label)`) |
| 배치 | `layoutStyle` | `layoutStyle`(`style`은 제거된 속성) |
| 라벨 스타일 훅 | 없음 | `labelStyle` 제거된 속성 — tone/토큰 |
| 기본 폭 | inline | `alignSelf: "flex-start"` |

### 테두리 없는 상태 — 개발 소스, 미게시

2026-10-26 오늘야구 라이브 표시 요청에 따라 `variant="plain"`을 추가했다.
outline과 같은 의미색 글자를 유지하고 배경·테두리를 없앤다. 점은 `leading`에 장식 노드로 전달한다.

```tsx
<Badge label="진행 중" tone="danger" variant="plain" size="small" />
```
