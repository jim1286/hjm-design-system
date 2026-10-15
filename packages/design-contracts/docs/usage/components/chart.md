# Chart

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.20.0 이후)
- 검토일: 2026-10-15
- 근거: [Chart](../../chart.md), `src/chart.ts`(`chartRecipe`, `describeChart`, `resolveLineGeometry`), `src/dataviz.ts`(`resolveDatavizSeriesColor`, `datavizChromeTokens`)
- 스토리북: `배포/컴포넌트/데이터 표시/차트`

## 언제 쓰나

수치의 흐름·비교·몫·모양·관계를 그림으로 읽게 할 때 쓴다. 시간에 따른 흐름(기록·가격·순위)은 `LineChart`,
범주끼리의 크기 비교는 `BarChart`, 전체 안의 몫은 `PieChart`, 여러 능력치의 모양은 `RadarChart`,
두 수치의 관계는 `ScatterChart`, 목록 행·표 셀 안의 작은 추세는 `Sparkline`을 쓴다.
여러 계열의 이름과 색을 차트 밖에 따로 보일 때 `ChartLegend`를 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 숫자 지표 하나 또는 몇 개(현재 값·증감) | [Statistic](statistic.md) |
| 진행률·완료 비율 하나 | [Progress](progress.md) |
| 1년 단위 날짜별 활동 밀도 | [ActivityHeatmap](activity-heatmap.md) |
| 정확한 값을 읽고 정렬·비교해야 하는 기록 | [DataTable](data-table.md) |
| 계열이 8개(`datavizSeriesCount`)를 넘는 비교 | [DataTable](data-table.md) — 팔레트가 순환해 색으로 구분되지 않는다 |
| 성공·경고처럼 의미가 있는 상태 표시 | [Badge](badge.md)·[Tag](tag.md)·[Notice](notice.md) — 차트는 상태색을 쓰지 않는다 |
| 캔들스틱·지도·트리맵·이중 y축·확대/이동 | 제품 라이브러리 + `dataviz` 토큰([계약의 넣지 않은 것](../../chart.md#넣지-않은-것)) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `LineChart` | 기본 — 선·영역·쌓은 영역, 스크럽 | `@hjmds/react/chart` | `@hjmds/react-native/chart` |
| `BarChart` | 기본 — 세로·가로, 묶음·쌓기 막대 | `@hjmds/react/chart` | `@hjmds/react-native/chart` |
| `PieChart` | 기본 — 파이·도넛과 몫 범례 | `@hjmds/react/chart` | `@hjmds/react-native/chart` |
| `RadarChart` | 기본 — 공통 범위 레이더 | `@hjmds/react/chart` | `@hjmds/react-native/chart` |
| `ScatterChart` | 기본 — 두 수치의 산점도 | `@hjmds/react/chart` | `@hjmds/react-native/chart` |
| `Sparkline` | 동반 — 축 없는 작은 추세선 | `@hjmds/react/chart` | `@hjmds/react-native/chart` |
| `ChartLegend` | 보조 — 색 견본 + 이름(+ 값) 범례 행 | `@hjmds/react/chart` | `@hjmds/react-native/chart` |

데이터 타입(`ChartSeries`·`ScatterDatum`)과 `describeChart`·`chartRecipe`는 `@hjmds/design-contracts/components/chart`에서,
팔레트는 `@hjmds/design-contracts/dataviz`에서 가져온다.

## 최소 사용 예

```tsx
// Web
import { useState } from "react";
import { LineChart } from "@hjmds/react/chart";
import type { ChartSeries } from "@hjmds/design-contracts/components/chart";

const series: ChartSeries[] = [
  { id: "avg", label: t("record.battingAverage"), values: seasons.map((season) => season.avg ?? null) },
];
const [focus, setFocus] = useState<number | null>(null);
const shown = focus ?? seasons.length - 1;

<>
  <p>{formatAverage(seasons[shown]?.avg ?? null)}</p>
  <LineChart
    categories={seasons.map((season) => season.label)}
    series={series}
    accessibilityLabel={t("record.battingAverageTrend")}
    formatValue={formatAverage}
    missingLabel={t("record.noRecord")}
    showAxis
    onFocusChange={(index) => setFocus(index)}
  />
</>
```

```tsx
// Native
import { BarChart, Sparkline } from "@hjmds/react-native/chart";

<>
  <BarChart
    categories={months.map((month) => month.label)}
    series={[{ id: "wins", label: t("team.wins"), values: months.map((month) => month.wins) }]}
    accessibilityLabel={t("team.winsByMonth")}
    formatValue={formatCount}
    missingLabel={t("team.noGame")}
    showValues
  />
  {/* 옆 텍스트가 값을 말하므로 이름 없이 장식으로 둔다 */}
  <Sparkline values={lastTenGames} />
</>
```

## 축과 기본값

모든 차트 공통: 보이는 문구와 숫자 서식은 제품이 준다(HJM 안에서 번역·서식하지 않는다).
`series[].values` 길이는 `categories` 길이와 같아야 하고 `null`은 빈 관측이다.

### LineChart

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `categories` | `readonly string[]` | — (필수) | x축 범주(시간 순서) |
| `series` | `{ id, label, values: (number \| null)[], color? }[]` | — (필수) | `color`가 없으면 dataviz 팔레트 index 색 |
| `accessibilityLabel` | `string` | — (필수) | 차트 이름. Web은 `aria-label`로 나간다 |
| `formatValue` | `(value: number) => string` | — (필수) | 축 눈금·텍스트 대안·포커스 값 서식 |
| `missingLabel` | `string` | — (필수) | 텍스트 대안에서 빈 값을 읽는 문구 |
| `height` | `number` | `chartRecipe.heights.regular` 180 | 가로는 부모 폭을 채운다 |
| `curve` | `linear` · `monotone` · `step` | `linear` | `monotone`은 데이터 밖으로 넘지 않는 곡선 |
| `area` | `boolean` | 계열이 하나면 `true` | 선 아래 그라데이션(0.32 → 0) |
| `stacked` | `boolean` | `false` | 쌓은 영역. 0을 항상 포함 |
| `invert` | `boolean` | `false` | 작을수록 위(순위·평균자책점) |
| `domain` | `readonly [number, number]` | 관측 범위 | 값 범위 고정 |
| `includeZero` | `boolean` | `false` | 선 범위에 0을 포함 |
| `referenceValue` | `number` · `"first"` | — | 점선 가로 기준선(`"first"`는 첫 관측값) |
| `extremes` | `{ high: string; low: string }` | — | 포커스가 없을 때 첫 계열 최고·최저 표시와 라벨 |
| `showAxis` | `boolean` | `false` | 왼쪽 y 눈금 + plot 아래 첫·끝 범주 |
| `focusIndex` | `number \| null` | — | 제어 포커스 |
| `defaultFocusIndex` | `number \| null` | 마지막 관측 index | 비제어 시작 포커스 |
| `onFocusChange` | `(index: number \| null, detail: { scrubbing: boolean }) => void` | — | 스크럽 중 `scrubbing: true`, 손을 떼면 `false` |
| `cursorLabel` | `(index: number) => string` | `categories[index]` | 스크럽 중 커서 위 말풍선 |

### BarChart

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `categories`·`series`·`accessibilityLabel`·`formatValue`·`missingLabel` | LineChart와 같음 | — (필수) | — |
| `height` | `number` | `chartRecipe.heights.regular` 180 | — |
| `orientation` | `vertical` · `horizontal` | `vertical` | 범주 이름이 길면 `horizontal` |
| `layout` | `grouped` · `stacked` | `grouped` | 범위는 항상 0을 포함 |
| `domain` | `readonly [number, number]` | 0을 포함한 관측 범위 | — |
| `showAxis` | `boolean` | `false` | — |
| `showValues` | `boolean` | `false` | 막대 끝 값 글자 |
| `focusIndex`·`defaultFocusIndex`·`onFocusChange` | LineChart와 같음 | — | 누름·끌기로 범주 선택, 나머지 막대 불투명도 `chartRecipe.bar.restOpacity` 0.4 |

### PieChart

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `data` | `{ id, label, value: number \| null, color? }[]` | — (필수) | 0 이하·`null`은 조각에서 빠진다 |
| `accessibilityLabel` | `string` | — (필수) | — |
| `formatValue` | `(value: number) => string` | — (필수) | 범례 값 서식 |
| `donut` | `boolean` | `true` | 안쪽 반지름 비율 `chartRecipe.pie.donutRatio` 0.62 |
| `size` | `number` | 180 | 정사각 지름 |
| `centerContent` | `ReactNode` | — | 도넛 가운데(합계 등) |
| `selectedId` | `string \| null` | — | 제어 선택 |
| `defaultSelectedId` | `string \| null` | `null` | 비제어 선택 |
| `onSelect` | `(id: string \| null) => void` | — | 조각·범례 선택 |
| `showLegend` | `boolean` | `true` | 견본 + 이름 + 서식 값 + 백분율 행 |

### RadarChart

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `categories` | `readonly string[]` (3개 이상) | — (필수) | 축 이름 |
| `series`·`accessibilityLabel`·`formatValue`·`missingLabel` | LineChart와 같음 | — (필수) | — |
| `domain` | `readonly [number, number]` | `[0, 모든 계열 최댓값]` | 모든 축이 같은 범위 |
| `levels` | `number` | `chartRecipe.radar.levels` 4 | 격자 고리 수 |
| `size` | `number` | 240 | 정사각 지름 |
| `showLegend` | `boolean` | 계열이 둘 이상이면 `true` | — |

### ScatterChart

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `points` | `{ id, label, x, y, seriesIndex? }[]` | — (필수) | — |
| `accessibilityLabel` | `string` | — (필수) | — |
| `xLabel`·`yLabel` | `string` | — (필수) | 축 이름 |
| `formatX`·`formatY` | `(value: number) => string` | — (필수) | 축 눈금·포커스 값 서식 |
| `height` | `number` | `chartRecipe.heights.tall` 240 | — |
| `seriesLabels` | `readonly string[]` | — | `seriesIndex`별 범례 이름 |
| `focusId` | `string \| null` | — | 제어 포커스 |
| `onFocusChange` | `(id: string \| null) => void` | — | 가장 가까운 점(32 안) 포커스 |

### Sparkline · ChartLegend

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `values`(`Sparkline`) | `readonly (number \| null)[]` | — (필수) | 빈 값은 끊김 |
| `color`(`Sparkline`) | `string` | 첫 dataviz 계열색 | — |
| `invert`(`Sparkline`) | `boolean` | `false` | 작을수록 위 |
| `domain`(`Sparkline`) | `readonly [number, number]` | 관측 범위 | 여러 행의 스파크라인을 같은 척도로 비교할 때 고정 |
| `width`·`height`(`Sparkline`) | `number` | 72 · 28 | `chartRecipe.sparkline` |
| `accessibilityLabel`(`Sparkline`) | `string` | — | 없으면 장식(보조 기술에서 숨김) |
| `items`(`ChartLegend`) | `{ id, label, color, value?: string }[]` | — (필수) | `value`는 서식이 끝난 문자열 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 선·막대·산점도는 부모 폭을 채우고 높이는 `chartRecipe.heights`(`compact` 128 · `regular` 180 · `tall` 240)에서 고른다. 파이 180, 레이더 240 정사각. Sparkline 72 × 28 | `src/chart.ts` `chartRecipe.heights`·`sparkline` |
| 간격 | plot 안쪽 여백: 축 없음 위 `spacing.lg` 20 · 나머지 `spacing.xs` 8, 축 있음 위 `spacing.md` 16 · 아래 `spacing.lg` 20 · 왼쪽 36(y 눈금 칸). 차트와 위 제목·현재 값, 아래 범례 사이는 부모 [Stack](stack.md)의 gap으로 준다 | `chartRecipe.insets` |
| 순서·정렬 | 위에서 제목([Section](section.md)·[Heading](heading.md)) → 현재 값 텍스트(제품, `onFocusChange`로 갱신) → 차트 → 범례. y 눈금은 왼쪽, 첫·끝 범주는 plot 아래 양끝 | [계약 스크럽 절](../../chart.md#스크럽linechart) |
| 고정·스크롤 | 차트는 스크롤하지 않는다. 가로로 끌면 스크럽, 세로로 끌면 페이지 스크롤이다. 가로 스크롤 컨테이너·[Carousel](carousel.md) 안에 `LineChart`를 두지 않는다(제스처 충돌) | 계약 스크럽 3단계 |
| 좁은 폭·큰 글자 | 높이는 `height`로 고정되고 가로만 줄어든다. 축 글자는 caption 변형(`chartRecipe.chrome.labelVariant`)이다. 범주가 많아도 축에는 첫·끝 범주만 나오므로 범주 이름 길이에 배치가 흔들리지 않는다. 범주 이름이 긴 막대는 `orientation="horizontal"` | `datavizChromeTokens` |

```text
┌ Section 제목 ───────────────────────────────┐
│ 0.312  (현재 값, 제품 텍스트)                │
│ ┌ LineChart ─────────────────── height 180 ┐ │
│ │ .350┤        ╭─●╮   ┆ (커서)            │ │
│ │ .300┤ ╭──╮  ╱   ╰───┆──                 │ │
│ │ .250┤─╯  ╰─╯        ┆                    │ │
│ │      2021            2025                │ │
│ └──────────────────────────────────────────┘ │
│ ● 타율   ● 출루율   (ChartLegend)            │
└──────────────────────────────────────────────┘
```

## 꼭 지킬 것

- 모든 차트에 `accessibilityLabel`을 준다. 값의 텍스트 대안은 `formatValue`·`missingLabel`로 `describeChart`가 만든다.
  숫자 서식·빈 값 문구는 i18n과 제품 formatter로 공급한다.
- 빈 관측은 `null`로 넘긴다. 0으로 채우면 "기록 0"이 되고, 앞뒤 값을 이어 붙이면 없는 추세가 생긴다.
- 계열 색은 제품 `color` 또는 dataviz 팔레트만 쓴다. `success`·`warning` 같은 상태색을 계열색으로 쓰지 않는다.
- 순위·평균자책점처럼 작을수록 좋은 값은 `invert`로 그린다(데이터를 음수로 바꾸지 않는다).
- 막대·쌓기의 0 기준선을 `domain`으로 빼지 않는다. 막대 길이가 값의 크기다.
- 현재 값 텍스트는 차트 밖에 두고 `onFocusChange`로 갱신한다. 차트 안 툴팁에 제품 컴포넌트를 넣는 경로는 없다.
- 레이더는 한 척도의 값만 넣는다. 단위가 다른 축을 섞어야 하면 [DataTable](data-table.md)이나 막대 여러 개를 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 그리기 | SVG DOM | `react-native-svg` |
| 스크럽 입력 | pointer event + `touch-action: pan-y` | `PanResponder`, `\|dy\| > \|dx\|`이면 부모 스크롤에 응답권을 넘김 |
| 끌지 않는 탐색 | `role="slider"`, `aria-valuetext`, ArrowLeft/ArrowRight/Home/End | `accessibilityRole="adjustable"`, increment/decrement |
| 차트 이름 | `aria-label` | `accessibilityLabel` |

## 함정

- `onFocusChange`는 손을 뗄 때도 불린다(`scrubbing: false`, 기본 포커스 index). 이 호출을 "사용자가 고른 값"으로 저장하면 스크럽이
  끝날 때마다 마지막 값으로 덮인다. `detail.scrubbing`으로 구분한다.
- 스크럽과 화살표 이동은 관측값이 있는 index만 지난다. 모든 계열이 `null`인 범주에는 포커스가 가지 않는다.
- 2026-10-14 작성 시점에 Web·Native renderer와 Storybook 항목은 구현 중이다. prop 표는 공유 사양 기준이며 renderer가 들어온 뒤
  실제 Props 타입과 다시 대조한다.

## 도넛 범주를 실제로 제외하기

범주를 강조하려면 selectedId/onSelect, 분모에서 빼려면 exclusion을 쓴다. 기존 강조 API의 의미는 바꾸지 않았다.

```tsx
// Web — Native는 @hjmds/react-native/chart에서 같은 PieChart를 가져온다.
<PieChart data={data} accessibilityLabel={t("share")} formatValue={formatCount}
  exclusion={{ excludedIds, onExcludedIdsChange: setExcludedIds,
    label: (datum, included) => t(included ? "included" : "excluded", { name: datum.label }) }}
  centerContent={summary => <span>{formatCount(summary.total)}</span>} />;
```

Native centerContent에는 Text 등 Native 노드를 쓴다. 모두 제외하거나 합계 0이면 조각을 그리지 않는다.
항목 ID·색 인덱스는 그대로 보존하고 실제 포함값으로 비율을 재계산한다. 차트 의미 전달에는 수치·checkbox 상태도 사용한다.
