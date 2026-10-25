# Statistic

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Statistic](../../statistic.md), [optional adapters](../../optional-adapters.md), `src/component-recipes.ts`(`statisticRecipe`)
- 스토리북: `배포/컴포넌트/데이터 표시/수치 표시`, `배포/컴포넌트/데이터 표시/움직이는 수치`

## 언제 쓰나

라벨이 붙은 **숫자 지표 하나**(또는 여러 개)를 보여 줄 때 쓴다. 오늘 기록 수, 승률, 잔액,
전주 대비 증감처럼 값·단위·추세·보조 설명이 한 묶음인 자리다. 여러 지표를 나란히 두면 `StatisticGroup`을 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 항목 이름과 값이 짝인 속성 목록(숫자가 주인공이 아님) | [DescriptionList](description-list.md) |
| 진행률·완료 비율 | [Progress](progress.md) |
| 아이콘·탭 옆의 작은 개수 | [CounterBadge](counter-badge.md), [Badge](badge.md) |
| 행·열이 있는 수치 표 | [DataTable](data-table.md) |
| 기간별 활동 밀도 | [ActivityHeatmap](activity-heatmap.md) |
| 누르면 이동하는 지표 | 바깥을 [Link](link.md)·[Button](button.md)으로 감싼다(Statistic은 interactive하지 않다) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Statistic` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |
| `StatisticGroup` | 동반(1~4열 묶음) | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |
| `AnimatedStatistic` | 확장(값 변화 모션, optional-extension) | `/statistic-motion` | `/statistic-motion` |

`AnimatedStatistic`은 granular subpath로만 import 된다. Web은 optional peer `@number-flow/react` 0.6.2를
앱에 설치해야 한다. Native는 추가 peer 없이 HJM `ContentTransition`(RN `Animated`)으로 전체 지표를 전환한다.

## 최소 사용 예

```tsx
// Web
import { StatisticGroup } from "@hjmds/react/display";

<StatisticGroup
  label={t("stats.weekly")}
  descriptor={{
    columns: 2,
    items: [
      { id: "letters", label: t("stats.letters"), value: formatNumber(sent), suffix: t("stats.unitLetters") },
      {
        id: "streak", label: t("stats.streak"), value: formatNumber(streak),
        trend: { direction: "up", tone: "success", label: t("stats.trendUp") },
      },
    ],
  }}
/>
```

```tsx
// Native
import { Statistic } from "@hjmds/react-native/data-display";

<Statistic
  presentation="surface"
  descriptor={{ id: "balance", label: t("wallet.balance"), value: formatCurrency(balance) }}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor` | `id`·`label`·`value`(포맷이 끝난 문자열) 필수, `prefix`·`suffix`·`hint`·`trend` 선택 | — | 빈 문자열은 `TypeError` |
| `trend.direction` | `up` · `down` · `flat` | — | — |
| `trend.tone` | `neutral` · `success` · `warning` · `danger` | `neutral` | 보이는 `trend.label` 필수 |
| `density` | `comfortable` · `compact` | `comfortable` | 값 크기 `heading` · `title` |
| `presentation` | `plain` · `surface` | `plain` | `surface`는 테두리 상자 |
| `columns`(`StatisticGroup`) | 1~4 | 3 | 폭이 좁거나 글자가 크면 renderer가 1열까지 줄인다 |
| `value`(`AnimatedStatistic`) | 유한한 숫자 | — (필수) | `locale` 필수, `format`(`Intl.NumberFormatOptions`) |
| `animated`(`AnimatedStatistic`) | `boolean` | `true` | — |
| `contextLabel` | `string` | — | 접근성 이름 앞에 붙는 맥락. `StatisticGroup`은 group `label`을 넘긴다 |
| `composeAccessibilityLabel` | `(input: { contextLabel?, descriptor, valueText }) => string` | 기본 어순 | `descriptor`는 trend tone 기본값이 채워진 descriptor, `valueText`는 prefix·value·suffix를 이은 문자열 |
| `renderTrendMark` | `(props: { name: "trendUp" \| "trendDown" \| "trendFlat", color, size }) => ReactNode` | 내장 표시 | 추세 아이콘을 제품 아이콘으로 바꾼다. `color`는 Web `"currentColor"`, Native trend tone 색 |
| `renderValue`(Web) | `(value: string) => ReactNode` | — | 보이는 값만 바꾼다. 접근성 값은 descriptor 그대로 |
| `arrangement`(`StatisticGroup`, 미게시) | `grid` · `bar` | `grid` | bar는 짧은 수치들을 같은 폭 한 줄로 표시 |
| `leading` · `valueColor`(미게시) | ReactNode · 색 문자열 | 없음 | 수치 옆 장식과 제품 범주/시리즈 색 |
| `renderLeading` · `getValueColor`(`StatisticGroup`, 미게시) | callback | 없음 | 항목별 장식/색. 아래 한 줄 통계 바 참조 |
| `availableWidth`(Native `StatisticGroup`) | `number` | 측정 폭 | 열 수 계산에 쓸 폭 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 루트 배치. Web·Native 모두 |
| Native `style`·`labelStyle`·`valueStyle`·`affixStyle`·`trendStyle`·`hintStyle`, 그룹 `style`·`itemStyle` | 지원하지 않음 | — | 제거된 속성 — `layoutStyle` 또는 `density`·`presentation`. 현재 공개 props에서 제거되었다 |

## 한 줄 통계 바(미게시)

2026-10-18 번뚝의 피드 요약·이야기 상세가 각각 숫자 3칸의 순서·아이콘·세로 구분선을
다시 그리던 문제를 기존 StatisticGroup의 `arrangement="bar"`로 해결했다. 별도 통계 API를 만들지 않는다.

- 기본 `grid`는 기존 열 수/좁은 폭 동작을 유지한다. `bar`는 짧은 수치 몇 개를 한 행의 같은 폭 칸으로 둔다. 열 수는 항목 수이며 `descriptor.columns`는 grid에만 적용한다.
- bar는 아이콘+값 → 라벨 → 추세/힌트 순서로 가운데 정렬한다. 구분선은 논리적 시작 쪽에 그리므로 RTL도 같은 읽기 순서를 유지한다. 칸 좌우 `spacing.xs` 8, 값/라벨 간격 `spacing.xxs` 4다.
- `Statistic.leading`은 값 옆 장식 슬롯, `valueColor`는 제품이 소유한 범주/시리즈 색이다. 그룹은 `renderLeading(item, {color, size})`, `getValueColor(item)`로 공급한다. 아이콘 크기는 `glyph.sm`이며 값 색이 없으면 기본 본문색이다. 아이콘이 있는 경우 값 줄의 세로 중앙을 맞춘다.
- 아이콘은 읽기 대상이 아니다. 접근성 이름은 기존 descriptor의 label/value/trend/hint로 만든다. `0`도 값이며 숨기지 않는다.
- 바깥 입체 판은 Card, 이미 카드 안이면 Divider/Stack을 합성한다. 제품에서 칸 배치·숫자 굵기·구분선을 다시 그리지 않는다.

```tsx
// Web
<StatisticGroup arrangement="bar" label={t("stats.summary")}
  descriptor={{ items: stats }}
  getValueColor={item => seriesColors[item.id]}
  renderLeading={(item, { color, size }) => <SeriesIcon id={item.id} color={color} size={size} />} />
// Native: 같은 공개 props와 callback. descriptor.value는 제품에서 포맷한 문자열이다.
```

## 배치

Native 프레임의 모서리는 `statisticRecipe.presentations`의 역할을 Provider token에서 해석한다. 수치·locale·낭독 문구는 제품 데이터 그대로다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | `presentation="surface"`의 안쪽 여백: `comfortable` `spacing.md` 16 · `compact` `spacing.sm` 12(두 플랫폼). 테두리 `stroke.default` 1, radius `md` 12 | `statisticRecipe.density`·`presentations`, `styles.css` `.hjm-statistic[data-presentation="surface"]` |
| 글자 | 라벨 `label` 12 medium(`compact` `caption` 11), 값 `title` 18 semibold(2026-10-25 번뚝 리뷰: 콘텐츠보다 큰 요약 숫자를 줄임, 개발 소스·미게시)(`fontWeight.semibold`, `compact` `bodyLarge` 16. 2026-10-21 다에리 오늘의 기록 숫자가 크다는 사용자 피드백으로 compact 값을 한 단계 낮춤. 2026-10-17 큰 글자 단계 폐지로 `heading.level2` 굵기 참조를 끊음), prefix·suffix `body` 14 medium 본문색, hint `caption`, 추세 `caption` medium(두 플랫폼). 2026-10-06까지 Web은 라벨 본문 14 medium, 값은 밀도와 관계없이 18, prefix·suffix는 흐린색이었다(1.13.0 변경) | `statisticRecipe.density`·`label`·`value`·`affix`·`hint`·`trend`, `.hjm-statistic__*` |
| 간격 | 그룹 간격 `statisticRecipe.group.gap` = `spacing.xs` 8. 지표 안 줄 간격(라벨·값·추세) `comfortable` `spacing.xs` 8 · `compact` `spacing.xxs` 4(두 플랫폼) | `styles.css` `.hjm-statistic`·`.hjm-statistic-group`, `statisticRecipe` |
| 순서·정렬 | 화면 위쪽 요약 영역이나 카드 안에 둔다. 지표 여러 개는 [Grid](grid.md)를 직접 짜지 말고 `StatisticGroup`으로 묶는다 | — |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 그룹 열 수 `columns`(1~4, 기본 3). Web은 폭 600 미만(`breakpoint.medium`)에서 1열. Native는 항목 폭이 120×글자 배율(`statisticRecipe.group.minItemWidth`) 아래면 열을 줄인다. 값은 줄바꿈된다(자르지 않음). 긴 통화 값이 들어갈 칸이면 열 수를 줄인다 | `styles.css` `@media (max-width: 599.98px)`, `react-native/src/data-display.tsx` |

## 꼭 지킬 것

- 숫자·통화·단위 포맷은 제품이 한다. HJM은 계산·포맷하지 않고 받은 `value` 문자열을 그대로 그린다.
- 모든 문구(label·trend label·hint·group label)는 i18n 키로 넣는다. 추세는 색만으로 알리지 않는다.
- `direction`과 `tone`은 따로 정한다. 증가가 나쁜 지표는 `up` + `danger`다([계약](../../statistic.md)).
- 접근성 이름은 기본으로 `[contextLabel, label, 값, trend label, hint]`를 이어 만든다. 어순을 바꿔야 하면
  `composeAccessibilityLabel`을 쓴다. `StatisticGroup`은 group `label`을 각 항목의 `contextLabel`로 넘긴다.
- 배치는 `layoutStyle`로만 한다. Native에서 제거된 `style`·`*Style`·`itemStyle`로 recipe 색·굵기를 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 값 렌더 교체 | `renderValue`(접근성 값은 descriptor 유지) | 없음 |
| 그룹 폭 | CSS grid, 좁은 화면에서 1열 | `availableWidth` 또는 측정 폭, 최소 항목 폭 120×글자 배율로 열 수 감소 |
| 슬롯 스타일 prop | 없음(`className`, 배치는 `layoutStyle`) | `style`·`*Style`, 그룹 `itemStyle`(모두 제거된 속성, 배치는 `layoutStyle`) |
| `AnimatedStatistic` 모션 | 숫자 자리 단위 NumberFlow | 지표 전체 `rise` 전환 |
| `renderTrendMark` color | `"currentColor"` | trend tone을 푼 색 문자열 |

## 함정

- Web `AnimatedStatistic`은 reduced motion, RTL, 라틴 숫자가 아닌 numbering system, `ar`·`fa`·`he`·`ur` locale,
  `scientific`·`engineering` 표기에서는 애니메이션 없이 `Intl` 결과 문자열만 그린다.
- Web은 탭이 숨겨지거나 숫자 호스트가 제거되면 진행 중 전환을 최종 값으로 완료한다. 화면 밖에서는 모션을 정지하고 새 값·접근 이름을 즉시 반영하며, 화면 안으로 돌아오면 다음 값부터 다시 전환한다. IntersectionObserver 미지원 환경은 정적으로 표시한다.
- `AnimatedStatistic`의 `descriptor`에는 `value`를 넣지 않는다. 값은 `value` prop의 숫자로 받는다.

### 외부 숫자 효과 대조

2026-10-07 Number Ticker 공식 소스와 기본 데모를 대조했다. 진입 시 중간 숫자를 표시하는
효과와 실제 값 변경은 구분한다. 현재 AnimatedStatistic의 Intl locale과 RTL·비라틴 숫자·
지수 표기 fallback을 유지하며 별도 count-up 엔진을 추가하지 않는다. 숫자가 올라가는 효과를
실제 집계 과정으로 오해시키지 않기 위해 제품은 확정한 값을 전달한다.

양쪽 움직이는 수치 Storybook에 소수와 음수(de-DE), 비라틴 숫자(ar-EG), 지수 표기(en-US),
동작 줄이기와 RTL 비교를 제공한다. 소수·음수 예제는 기록 개수가 아닌 측정값이다.
Web은 자리 단위 전환, Native는 지표 전체 전환이며 같은 시각 효과를 보장하지 않는다.

## 근거

2026-10-17 사용자 결정("굵기 좀더 줄여"): 모든 글자 굵기를 한 단계 낮췄다. 큰 숫자·선택 상태 600(큰 제목 단계는 같은 날 폐지), 제목·강조 500, label 500, 본문 400이며 정본은 [타이포그래피](../tokens/typography.md)다.
