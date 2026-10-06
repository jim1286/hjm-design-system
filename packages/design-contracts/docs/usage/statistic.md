# Statistic 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Statistic](../statistic.md), recipe `statisticRecipe`(`src/component-recipes.ts`),
확장: [optional adapters](../optional-adapters.md)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Statistic` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` | 기본 |
| `StatisticGroup` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` | 1~4열 묶음(companion) |
| `AnimatedStatistic` | `/statistic-motion` | `/statistic-motion` | 값 변화 모션(optional-extension) |

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

- descriptor: `id`·`label`·`value`(포맷이 끝난 문자열) 필수, `prefix`·`suffix`·`hint`·`trend` 선택. 빈 문자열은 `TypeError`다.
- `trend`: `direction` `up`·`down`·`flat`, `tone` `neutral`(기본)·`success`·`warning`·`danger`, 보이는 `label` 필수.
- `density`: `comfortable`(기본, 값 `heading` 크기) · `compact`(값 `title` 크기). `presentation`: `plain`(기본) · `surface`(테두리 상자).
- `StatisticGroup` `columns`: 1~4, 기본 3. 폭이 좁거나 글자가 크면 renderer가 1열까지 줄인다.
- `AnimatedStatistic`: `value`(유한한 숫자)·`locale` 필수, `format`(`Intl.NumberFormatOptions`), `animated` 기본 `true`.

## 꼭 지킬 것

- 숫자·통화·단위 포맷은 제품이 한다. HJM은 계산·포맷하지 않고 받은 `value` 문자열을 그대로 그린다.
- 모든 문구(label·trend label·hint·group label)는 i18n 키로 넣는다. 추세는 색만으로 알리지 않는다.
- `direction`과 `tone`은 따로 정한다. 증가가 나쁜 지표는 `up` + `danger`다([계약](../statistic.md)).
- 접근성 이름은 기본으로 `[contextLabel, label, 값, trend label, hint]`를 이어 만든다. 어순을 바꿔야 하면
  `composeAccessibilityLabel`을 쓴다. `StatisticGroup`은 group `label`을 각 항목의 `contextLabel`로 넘긴다.
- Native의 `style`·`labelStyle`·`valueStyle`·`affixStyle`·`trendStyle`·`hintStyle`로 recipe 색·굵기를 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 값 렌더 교체 | `renderValue`(접근성 값은 descriptor 유지) | 없음 |
| 그룹 폭 | CSS grid, 좁은 화면에서 1열 | `availableWidth` 또는 측정 폭, 최소 항목 폭 120×글자 배율로 열 수 감소 |
| 슬롯 스타일 prop | 없음(`className`) | `style`·`*Style`, 그룹 `itemStyle` |
| `AnimatedStatistic` 모션 | 숫자 자리 단위 NumberFlow | 지표 전체 `rise` 전환 |
| `renderTrendMark` color | `"currentColor"` | trend tone을 푼 색 문자열 |

## 함정

- Web `AnimatedStatistic`은 reduced motion, RTL, 라틴 숫자가 아닌 numbering system, `ar`·`fa`·`he`·`ur` locale,
  `scientific`·`engineering` 표기에서는 애니메이션 없이 `Intl` 결과 문자열만 그린다.
- `AnimatedStatistic`의 `descriptor`에는 `value`를 넣지 않는다. 값은 `value` prop의 숫자로 받는다.
