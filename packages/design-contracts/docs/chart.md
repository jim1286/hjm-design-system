# Chart contract

검토일: 2026-10-14 · 계약: `src/chart.ts`(`@hjmds/design-contracts/components/chart`) · 색 토큰: `src/dataviz.ts`
· 사용 지침: [usage/components/chart.md](usage/components/chart.md)

**문제.** 사용자가 시간에 따른 값의 흐름(주가·기록·순위), 범주끼리의 크기 비교, 전체 안의 몫,
여러 능력치의 모양, 두 수치의 관계를 한눈에 읽는다. 선 위를 손가락으로 훑어 특정 시점의 값을
확인하고(스크럽), 누른 막대·조각의 값을 본다. 숫자 하나는 [Statistic](statistic.md), 진행 비율은
[Progress](progress.md), 연간 일별 밀도는 [ActivityHeatmap](activity-heatmap.md), 정확한 값의
비교·정렬은 [DataTable](data-table.md)이 맡는다. 이 계약은 그 사이의 **그림으로 읽는 수치**를 맡는다.

## 결정 번복 — 2026-10-14

**이전 결정.** 2026-09 라이브러리 격차 분석은 `Chart`를 "토큰만 채택"으로 닫았고
([library-gap-analysis.md](library-gap-analysis.md)), 2026-09-29 카탈로그 정리에서 `Chart` 행을
지웠다([catalog-cleanup.md](catalog-cleanup.md)). HJM은 계열 팔레트·축·격자·범례 토큰(`dataviz`)만
고정하고 그리기는 제품 라이브러리(Recharts·victory-native·d3)에 맡겼다. 근거는 "축·툴팁·애니메이션·
접근성을 다시 만들면 제품이 차트를 두 벌 갖게 된다"였다. `src/dataviz.ts` 머리 주석이 그 근거로 이
문서를 가리켰지만 문서는 없었다.

**번복.** 2026-10-14 사용자 요청 "유명한 차트·표 라이브러리를 리버스 엔지니어링해서 우리 시스템에 흡수,
여러 타입의 차트와 표 다 흡수"에 따라 그리기를 HJM으로 옮긴다. 이전 근거의 전제가 틀렸다는 실측이 있다.
제품은 외부 라이브러리를 쓰지 않고 같은 것을 **직접 다시 만들었다** — Yajalal이 스크럽하는 선 차트
(`modules/mobile/src/components/market/StockChart.tsx`), 막대, 정렬되는 기록 표(`RecordTable.tsx`)를 자체 구현했다.
빈 값 처리·축 눈금·정렬 규칙·접근성 문장을 제품 코드가 각자 정하게 된다. 두 벌이 생기는 것은 HJM이 그릴 때가
아니라 HJM이 그리지 않을 때였다.

**바뀌지 않는 것.** `datavizSeriesPalette`·`resolveDatavizSeriesColor`·`datavizChromeTokens`의 값과 규칙은
그대로다. HJM 렌더러가 이 토큰을 소비하는 첫 번째 사용자가 된다. 이 계약이 다루지 않는 종류(아래 "넣지 않은
것")를 제품 라이브러리로 그리는 것은 여전히 허용하며, 그때도 색·축·격자는 `dataviz` 토큰을 쓴다.

## 참고한 라이브러리

공개 API와 사용 경험을 연구해 **개념만** 다시 유도했다. 어떤 라이브러리의 소스도 복사·번들하지 않았고
렌더러는 새 런타임 의존성을 추가하지 않는다(Native는 기존 `react-native-svg` host를 쓴다).

| 라이브러리 | 가져온 개념 | 가져오지 않은 것 |
| --- | --- | --- |
| react-native-wagmi-charts | 선 + 커서 십자선, 포커스된 index가 가격·날짜 텍스트를 구동, 손을 떼면 최신 값으로 복귀 | Reanimated worklet 구조, 캔들스틱 |
| victory-native (XL) | x/y key로 묶는 cartesian 데이터, chart press state, 둥근 막대, domain padding | Skia 캔버스 의존, 임의 render-prop 레이어 |
| react-native-gifted-charts | 막대·선·파이·레이더의 prop 어휘(누르면 focus, 쌓은 막대, 도넛 가운데 내용) | 수백 개의 시각 prop, 내장 애니메이션 |
| Recharts | 계열/범주 데이터 모델, 쌓기, nice 눈금, 레이더 극좌표 격자 | 합성 child 컴포넌트 트리(`<XAxis>` 등), 임의 툴팁 컴포넌트 |
| d3-shape / d3-scale | monotone-X 3차 곡선(Fritsch–Carlson), "nice" 눈금 간격(1·2·2.5·5 × 10ⁿ), band scale | d3 패키지 자체(알고리즘만 `src/chart.ts`에 다시 썼다) |
| TanStack Table | `sortDescFirst`, `sortUndefined: "last"`, 안정 정렬 row model | headless 테이블 엔진 전체 |
| AG Grid | 열 고정(pinning) — 시작 쪽 연속 열만 | 그리드 편집·가상화·열 리사이즈 |

표 두 줄(TanStack·AG Grid)은 [DataTable](data-table.md#정렬-helper와-native-renderer--2026-10-14)의 같은 날
추가분이다. 차트와 표를 한 요청으로 흡수했기 때문에 출처를 한 곳에 적는다.

## 차트 종류와 기하 함수

모든 기하는 렌더러 중립 계산이다. Web(SVG DOM)과 Native(react-native-svg)는 같은 좌표·path·접근성 문장을 받아
칠하기만 한다. 같은 입력이 두 플랫폼에서 다른 그림이 되는 것을 이 경계가 막는다.

| 종류 | 컴포넌트 | 기하 함수 | 데이터 |
| --- | --- | --- | --- |
| 선·영역(쌓은 영역 포함) | `LineChart` | `resolveLineGeometry`, `linePath`, `areaPath`, `splitSegments`, `stackValues` | `categories` + `ChartSeries[]` |
| 막대(세로·가로, 묶음·쌓기) | `BarChart` | `resolveBarGeometry`, `scaleBand`, `stackValues` | `categories` + `ChartSeries[]` |
| 파이·도넛 | `PieChart` | `resolvePieGeometry`, `arcPath` | `{ id, label, value, color? }[]` |
| 레이더 | `RadarChart` | `resolveRadarGeometry` | `categories`(3개 이상) + `ChartSeries[]` |
| 산점도 | `ScatterChart` | `resolveScatterGeometry`, `nearestScatterPoint` | `ScatterDatum[]` |
| 작은 추세선 | `Sparkline` | `linePath`, `resolveChartDomain`, `scaleLinear` | `(number \| null)[]` |
| 범례 | `ChartLegend` | — | `{ id, label, color, value? }[]` |

공용 도구: `niceTicks`·`niceStep`(축 눈금), `resolveChartDomain`(값 범위), `scaleLinear`·`scaleBand`·`pointPositions`
(좌표 변환), `nearestChartIndex`·`stepChartIndex`·`observedIndices`(포커스), `seriesExtremes`(최고·최저 표시),
`describeChart`(텍스트 대안), `validateChartSeries`(입력 검증).

`ChartSeries`는 `{ id, label, values: (number | null)[], color? }`다. `values` 길이는 `categories` 길이와 같아야 하고,
`id`는 비어 있지 않고 중복이 없으며, `label`은 비어 있지 않아야 한다. 어기면 `TypeError`/`RangeError`가 난다.
곡선은 `linear`(기본)·`monotone`·`step`, 막대 방향은 `vertical`(기본)·`horizontal`, 배치는 `grouped`(기본)·`stacked`다.

## 그림 규칙

- **빈 값은 끊김이다. 0이 아니다.** `null`(또는 유한하지 않은 수)은 관측이 없다는 뜻이다. 선은 `splitSegments`로
  그 자리에서 끊기고 양옆을 잇지 않는다. 0으로 그리면 "기록 0"이라는 다른 사실을 말하고, 이으면 없는 추세를
  지어낸다. 막대는 그 자리를 비우고, 쌓기에서는 누적에 더하지 않는다. 텍스트 대안에서는 제품이 준
  `missingLabel`로 읽힌다.
- **막대는 항상 0 기준선을 포함한다.** `resolveBarGeometry`는 `includeZero: true`로 범위를 잡는다. 막대 길이가
  값의 크기라서, 0이 아닌 곳에서 시작하면 두 배 차이가 열 배로 보인다. 선은 반대로 관측 범위로 확대한다
  (주가처럼 작은 변화를 읽는 그림). 선에서도 0을 넣어야 하면 `includeZero`를 준다. 쌓은 선(영역)은 항상 0을 넣는다.
- **순위는 뒤집은 척도로 그린다.** `invert`(`scaleLinear`의 세 번째 인자)는 최솟값을 위에 둔다. 1위·평균자책점처럼
  작을수록 좋은 값이 위로 가야 "올라갔다 = 좋아졌다"가 유지된다.
- **레이더는 모든 축이 한 범위를 공유한다.** 기본 `[0, 모든 계열의 최댓값]`, 또는 `domain`으로 고정한다. 축마다 다른
  척도를 쓰면 다각형 넓이가 아무 뜻도 없어진다. 제품 평점이 한 0–100 척도라는 실측에 맞춘 선택이다. 축은 3개 이상이어야
  한다(`RangeError`).
- **파이는 음수와 빈 값을 무시한다.** 전체의 몫은 음수일 수 없다. `resolvePieGeometry`는 0 이하·빈 값을 합계와 조각에서
  모두 뺀다. 합계가 0이면 조각이 없다. 조각은 12시 방향부터 시계 방향이며 사이 간격은 `chartRecipe.pie.padAngle` 0.012rad다.
- **쌓기에서 음수는 0 아래로 따로 쌓인다**(`stackValues`의 양수·음수 누적 분리).
- **눈금은 읽기 좋은 수다.** `niceTicks`는 1·2·2.5·5 × 10ⁿ 간격만 쓴다(0/25/50, 0/23.7/47.4가 아니다).
- **곡선은 데이터를 넘어가지 않는다.** `monotone`은 Fritsch–Carlson monotone-X라 두 점 사이에서 최고·최저를 새로 만들지 않는다.
  일반 cubic/Catmull-Rom은 없는 고점을 그려 채택하지 않았다.
- **평평한 계열**은 위·아래 10%(값이 0이면 ±1)를 넓혀 가장자리에 붙지 않게 한다(`resolveChartDomain`).

## 색

- 계열 색은 `series.color ?? resolveDatavizSeriesColor(theme, index)`다. 제품 브랜드 색이나 의미가 있는 계열(우리 팀 등)은
  제품이 `color`로 주고, 나머지는 `dataviz` 팔레트(light·dark 각 8색)를 index 순서로 쓴다. 9번째부터는 순환한다. 계열이 8개를
  넘는 화면은 대개 차트가 아니라 표가 맞다.
- **상태색(info·success·warning·attention)을 계열색으로 쓰지 않는다.** 상태색은 뜻을 가진 색이라 "3번 계열"에 쓰면
  사용자가 경고로 읽는다. 오르내림의 의미 표시는 차트 밖 [Statistic](statistic.md)의 trend가 맡는다.
- 축·격자·범례·커서 글자는 차트 전용 회색이 아니라 본문 토큰이다(`chartRecipe.chrome` = `datavizChromeTokens`: 축선 `border`,
  축 글자 `textMuted`, 격자 `border` 60%, 범례 `textBody`).
- 색만으로 계열을 구분하게 두지 않는다. 계열이 둘 이상이면 범례(`ChartLegend` 또는 내장 legend)에 이름을 쓰고, 값은 텍스트
  대안으로도 읽힌다.

## 접근성

- **모든 차트는 이름과 텍스트 대안을 갖는다.** `accessibilityLabel`(Web에서는 `aria-label`로 나간다)은 필수다. 그림은
  `role="img"`(Native image)이며, `describeChart(categories, series, formatValue, missingLabel)`가 "계열: 범주 값, 범주 값…"
  문장을 만든다. 숫자 서식과 빈 값 문구는 제품이 공급한다 — HJM은 숫자를 어떤 언어로도 직접 서식하지 않는다.
- **스크럽 가능한 선은 끌지 않고도 탐색된다.** Web은 `role="slider"`, `aria-valuetext`(포커스된 범주와 값), `ArrowLeft`/`ArrowRight`/
  `Home`/`End`. Native는 `accessibilityRole="adjustable"`과 increment/decrement 동작이다. 둘 다 `stepChartIndex`로 **관측값이 있는
  index만**(`observedIndices`) 이동한다 — 빈 칸에 멈추지 않는다.
- 막대·파이·산점도의 누름 선택은 같은 값을 텍스트 대안과 범례에서도 읽을 수 있으므로 별도 접근성 탐색 단위를 만들지 않는다.
- `Sparkline`은 `accessibilityLabel`이 없으면 장식으로 취급해 보조 기술에서 숨긴다. 옆에 같은 값을 말하는 Statistic이
  있는 자리(목록 행·표 셀)를 위한 기본값이다. 혼자 의미를 전달하면 이름을 준다.

## 스크럽(LineChart)

1. 누른 채 가로로 끌면 손가락 x에 가장 가까운 관측 index(`nearestChartIndex`, 후보 `observedIndices`)로 포커스가 옮겨 간다.
   `onFocusChange(index, { scrubbing: true })`가 불리고, 커서 위에 `cursorLabel(index)`(기본 `categories[index]`) 말풍선이 뜬다.
2. 손을 떼면 기본 포커스(마지막 관측 index)로 돌아가고 `onFocusChange(index, { scrubbing: false })`가 불린다. 제품의 "현재 값"
   텍스트는 이 콜백으로 갱신한다(wagmi-charts의 가격 텍스트와 같은 구조).
3. 세로로 끄는 것은 페이지 스크롤이다. Native는 `|dy| > |dx|`일 때 PanResponder가 응답권을 넘기고, Web은 pointer event와
   `touch-action: pan-y`로 같은 결과를 낸다. 스크롤 화면 안의 차트가 스크롤을 삼키지 않게 하는 규칙이다.
4. 포커스된 점은 halo(`chartRecipe.line.focusHaloRadius` 9, 불투명도 0.25) + 점(반지름 4.5)과 세로 커서선으로 그린다. 끄는 중이
   아니면 커서선은 점선(`chartRecipe.cursor.dash` [2, 3])이다.
5. 제어는 `focusIndex`(+ `onFocusChange`), 비제어는 `defaultFocusIndex`다. `extremes`를 주면 포커스가 없을 때 첫 계열의 최고·최저
   (`seriesExtremes`)에 제품 문구 라벨을 붙인다.

`BarChart`는 누름·끌기로 범주를 고르고, 포커스가 있으면 나머지 막대를 `chartRecipe.bar.restOpacity` 0.4로 낮춘다.
`PieChart`는 조각 선택(`selectedId`/`onSelect`), `ScatterChart`는 가장 가까운 점(32px 안, `nearestScatterPoint`) 포커스를 쓴다.

## HJM 기본값 (`chartRecipe`)

| 항목 | 값 |
| --- | --- |
| 높이 | `sparkline` 28 · `compact` 128 · `regular` 180(LineChart·BarChart 기본) · `tall` 240 |
| plot 여백(축 없음) | 위 `spacing.lg` 20 · 오른쪽 `spacing.xs` 8 · 아래 `spacing.xs` 8 · 왼쪽 `spacing.xs` 8 |
| plot 여백(축 있음) | 위 `spacing.md` 16 · 오른쪽 `spacing.xs` 8 · 아래 `spacing.lg` 20 · 왼쪽 36(y 눈금 글자 칸) |
| 선 | 두께 2.4 · 점 반지름 4.5 · 포커스 halo 9 / 0.25 |
| 영역 채움 | 위 0.32 → 아래 0 그라데이션 |
| 막대 | 모서리 `radius.sm`/2 = 4 · 최대 두께 28 · band padding 0.36 · 묶음 간격 2 · 비포커스 0.4 |
| 파이 | 도넛 안쪽 비율 0.62 · 조각 간격 0.012rad · 조각 라벨 최소 비율(`minLabelPercent`) 4% |
| 레이더 | 단계 4 · 선 두께 2 · 채움 0.22 · 라벨 거리 `spacing.sm` 12 |
| 산점도 | 점 반지름 5 · 포커스 8 |
| Sparkline | 72 × 28 · 선 두께 1.8 · 안쪽 여백 2 |
| 커서·기준선 | 커서 `stroke.subtle` 1, 점선 [2, 3] · 기준선 점선 [2, 4] |

## 넣지 않은 것

측정된 제품 요구가 없어 계약하지 않는다. 필요한 제품은 이 문서를 갱신하고 vertical slice로 축을 연다. 그 전에는 제품
라이브러리를 써도 되고, 색·축은 `dataviz` 토큰을 쓴다.

- 캔들스틱(OHLC)·박스 플롯·히스토그램 bin 계산·지도·트리맵·sankey
- 확대·이동(zoom/pan), brush 범위 선택, 이중 y축, 로그 척도
- 임의 컴포넌트 툴팁 — 포커스 값은 제품이 `onFocusChange`로 받아 차트 밖 텍스트로 보여 준다(값이 화면 읽기 도구와 큰 글자
  배치에서 같은 자리에 남는다)
- 데이터 변경 사이 path morph 애니메이션, 실시간 스트리밍 창
- 차트 안 번역·숫자 서식 — 모든 문구와 서식은 제품 공급

## 카탈로그

`Chart`는 2026-09-29에 지운 이름을 같은 이름으로 되살린다(`data-display`, Web·Native). 공개 컴포넌트 `LineChart`·`BarChart`·`PieChart`·
`RadarChart`·`ScatterChart`·`Sparkline`·`ChartLegend`는 이 한 계약의 동반 API다 — 같은 `ChartSeries` 모델·색 규칙·포커스·텍스트 대안을
공유하므로 종류마다 계약을 따로 두지 않는다. 카탈로그 동결 예외는 `docs/catalog-freeze.json`에 기록한다.

## Renderer와 검증

- Web `@hjmds/react/chart`(SVG DOM), Native `@hjmds/react-native/chart`(react-native-svg)는 같은 이름·prop을 쓴다.
- 계약 검사는 `test/chart.test.ts`(기하·빈 값·쌓기·척도·포커스·텍스트 대안)다.
- 2026-10-14 작성 시점에 두 renderer는 구현 중이다. renderer 테스트·Storybook(`실험/컴포넌트/데이터 표시/차트`)·기기 확인 결과는
  들어온 뒤 이 절에 따로 기록한다. 계약 검사 통과를 renderer 검증이나 제품 반영으로 보고하지 않는다.
