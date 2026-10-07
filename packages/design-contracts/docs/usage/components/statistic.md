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
| `availableWidth`(Native `StatisticGroup`) | `number` | 측정 폭 | 열 수 계산에 쓸 폭 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 루트 배치. Web·Native 모두 |
| Native `style`·`labelStyle`·`valueStyle`·`affixStyle`·`trendStyle`·`hintStyle`, 그룹 `style`·`itemStyle` | `StyleProp` | — | deprecated — `layoutStyle` 또는 `density`·`presentation`. 개발 모드에서 한 번 경고하고 다음 major에서 제거된다 |

## 배치

Native 프레임의 모서리는 `statisticRecipe.presentations`의 역할을 Provider token에서 해석한다. 수치·locale·낭독 문구는 제품 데이터 그대로다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | `presentation="surface"`의 안쪽 여백: `comfortable` `spacing.md` 16 · `compact` `spacing.sm` 12(두 플랫폼). 테두리 `stroke.default` 1, radius `md` 12 | `statisticRecipe.density`·`presentations`, `styles.css` `.hjm-statistic[data-presentation="surface"]` |
| 글자 | 라벨 `label` 12 semibold(`compact` `caption` 11), 값 `heading` 24 heavy(`compact` `title` 18), prefix·suffix `body` 14 semibold 본문색, hint `caption`, 추세 `caption` bold(두 플랫폼). 2026-10-06까지 Web은 라벨 본문 14 medium, 값은 밀도와 관계없이 18, prefix·suffix는 흐린색이었다(1.12.1 이후 미게시) | `statisticRecipe.density`·`label`·`value`·`affix`·`hint`·`trend`, `.hjm-statistic__*` |
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
- 배치는 `layoutStyle`로만 한다. Native의 deprecated `style`·`*Style`·`itemStyle`로 recipe 색·굵기를 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 값 렌더 교체 | `renderValue`(접근성 값은 descriptor 유지) | 없음 |
| 그룹 폭 | CSS grid, 좁은 화면에서 1열 | `availableWidth` 또는 측정 폭, 최소 항목 폭 120×글자 배율로 열 수 감소 |
| 슬롯 스타일 prop | 없음(`className`, 배치는 `layoutStyle`) | `style`·`*Style`, 그룹 `itemStyle`(모두 deprecated, 배치는 `layoutStyle`) |
| `AnimatedStatistic` 모션 | 숫자 자리 단위 NumberFlow | 지표 전체 `rise` 전환 |
| `renderTrendMark` color | `"currentColor"` | trend tone을 푼 색 문자열 |

## 함정

- Web `AnimatedStatistic`은 reduced motion, RTL, 라틴 숫자가 아닌 numbering system, `ar`·`fa`·`he`·`ur` locale,
  `scientific`·`engineering` 표기에서는 애니메이션 없이 `Intl` 결과 문자열만 그린다.
- `AnimatedStatistic`의 `descriptor`에는 `value`를 넣지 않는다. 값은 `value` prop의 숫자로 받는다.

### 외부 숫자 효과 대조

2026-10-07 Number Ticker 공식 소스와 기본 데모를 대조했다. 진입 시 중간 숫자를 표시하는
효과와 실제 값 변경은 구분한다. 현재 AnimatedStatistic의 Intl locale과 RTL·비라틴 숫자·
지수 표기 fallback을 유지하며 별도 count-up 엔진을 추가하지 않는다. 숫자가 올라가는 효과를
실제 집계 과정으로 오해시키지 않기 위해 제품은 확정한 값을 전달한다.

양쪽 움직이는 수치 Storybook에 소수와 음수(de-DE), 비라틴 숫자(ar-EG), 지수 표기(en-US),
동작 줄이기와 RTL 비교를 제공한다. 소수·음수 예제는 기록 개수가 아닌 측정값이다.
Web은 자리 단위 전환, Native는 지표 전체 전환이며 같은 시각 효과를 보장하지 않는다.
