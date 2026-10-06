# 수치와 이전 대비 변화

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Statistic](../../statistic.md), [Progress](../../progress.md), `showcase/shared/stea-compositions.ts`, `showcase/{web/src/patterns,native/src}/stea-composition-previews.tsx`(`StatChangeSummary`, Native `Frame`), `src/container.ts`
- 스토리북: `배포/구성/정보 표시/수치와 이전 대비 변화`

## 언제 쓰나

매출·주문·반품처럼 몇 개의 핵심 수치를 비교 기간과 함께 보이고, 증감의 방향과 좋고 나쁨을 색 없이도 읽히게 할 때 쓴다.
기간을 바꾸면 수치와 목표 달성률이 같은 기간으로 함께 바뀌는 요약 카드다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Card `title`·`description` | 요약 묶음과 제목 | [Card](../components/card.md) |
| SegmentedControl | 비교 기간(지난주와 비교·지난달과 비교) | [SegmentedControl](../components/segmented-control.md) |
| Statistic | 수치 하나 + `trend`(방향·tone·보이는 문구) | [Statistic](../components/statistic.md) |
| Progress | 같은 기간의 목표 달성률 | [Progress](../components/progress.md) |
| Stack | 세로 간격 | [Stack](../components/stack.md) |
| Skeleton · Notice | 서버에서 받는 수치일 때 로딩·실패(스토리에 없음) | [Skeleton](../components/skeleton.md), [Notice](../components/notice.md) |
| `ScrollView` + `Container`(Native) | 바깥 틀. 세로 스크롤·위아래 여백, 좌우 gutter | [Container](../components/container.md), [화면 여백과 너비](../tokens/layout.md) |

## 배치

```text
Native 화면(ScrollView, 위아래 spacing.lg 20) > Container gutter 16(폭 < 600) · 20(폭 ≥ 600)
┌──────────── Card (padding spacing.md 16, radius lg 16) ────────────┐
│ 판매 요약 (title)                                                   │
│ 설명 (description)                                                  │
│ [ 지난주와 비교 | 지난달과 비교 ]   ← SegmentedControl, 전체 폭      │
│                 ↕ spacing.lg 20                                     │
│ 매출  3,950,000원   ▲ 지난주보다 20% 늘었어요   (success)           │
│                 ↕ spacing.md 16                                     │
│ 주문  128건         ― 지난주와 같아요           (neutral)           │
│ 반품  9건           ▲ 지난주보다 3건 늘었어요    (danger)            │
│                 ↕ spacing.lg 20                                     │
│ 이번 주 목표 달성률                                   76%           │
│ ████████████████████░░░░░░                                         │
└────────────────────────────────────────────────────────────────────┘
  고정 영역 없음. 안전 영역은 화면 골격이 맡는다
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web: 제품 화면 레이아웃(문서 스크롤). Native: `ScrollView` > `Container` | 이 구성은 바깥 폭·여백을 정하지 않는다(스토리는 Card만 그린다). Native는 Card를 `ScrollView` 안 [Container](../components/container.md)에 둔다. 입력이 없어 키보드 처리는 없다. 안전 영역은 화면 골격(내비게이션 헤더·탭 바)이 맡는다 | Native ScrollView 위아래 `spacing.lg` 20, Container gutter 폭 600 미만 `compact` 16 · 이상 `regular` 20(`layout.pagePadding`) |
| 틀 | Card | 바깥 틀 안, 함께 스크롤 | padding `md` 16, radius `lg` 16, 테두리 있음 |
| 기간 선택 | SegmentedControl | 카드 본문 맨 위 | `size` `medium`, 아래 `spacing.lg` 20 |
| 수치 목록 | Stack > Statistic ×3 | 기간 선택 아래 | 수치 사이 `spacing.md` 16, 값은 `comfortable`(`heading` 크기) |
| 목표 | Progress | 카드 맨 아래 | 위 `spacing.lg` 20, `size` `medium` |
| 로딩·실패 | Skeleton / Notice danger + 다시 시도 | 수치 목록 자리(기간 선택은 그대로) | 수치 목록과 같은 자리 |

수치가 많아 가로로 늘어놓을 때는 [Statistic](../components/statistic.md)의 `StatisticGroup`(`columns` 기본 3, 좁은 폭·큰 글자에서 1열까지 줄어듦)을 쓴다.

## 흐름과 상태

1. 기간을 바꾸면 세 수치, 증감 문구, 목표 라벨("이번 주"/"이번 달")과 값이 한꺼번에 바뀐다.
2. 증가가 나쁜 지표(반품)는 `direction: "up"`이어도 `tone: "danger"`로 둔다. 방향과 의미를 따로 준다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 선택한 기간의 수치와 증감 | `trend.label`이 보이는 문구이자 읽히는 문구다 |
| 진행 중 | 서버에서 받는 수치면 수치 목록·목표 자리에 Skeleton(`text`). 기간 선택은 계속 바꿀 수 있고, 늦게 온 이전 기간 응답은 버린다 | 포커스는 SegmentedControl에 남는다 |
| 실패 | 수치 목록·목표 자리에 Notice danger + `action` "다시 시도". 이전 기간 수치를 남겨 두지 않는다(기간과 수치가 어긋난다) | Web `danger`는 `role="alert"`, Native는 `announcement="assertive"` |
| 기간 변경 | 수치·목표가 함께 바뀐다 | 포커스는 SegmentedControl에 남는다 |
| 큰 글자 | Native SegmentedControl이 글자 배율 1.6 이상에서 세로로 쌓인다 | — |
| 빈 값 | 스토리에 없다. 기간 안 데이터가 전혀 없으면 수치 목록 자리를 [EmptyState](../components/empty-state.md)로 바꾼다 | — |

- 문구 키는 상태·기간별 상수로 둔다. 기간 이름으로 키를 조립하지 않는다.

| 기간·상태 | 문구 키 |
| --- | --- |
| 주간 목표 | `sales.goal.week` |
| 월간 목표 | `sales.goal.month` |
| 실패 | `sales.loadFailed` |
| 다시 시도 | `common.retry` |

## 코드 골격

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { Card, Statistic } from "@hjmds/react/display";
import { Notice, Progress, Skeleton } from "@hjmds/react/feedback";
import { Stack } from "@hjmds/react/layout";
import { SegmentedControl } from "@hjmds/react/selection";

// 기간 → 목표 문구 키
const goalKey = { week: "sales.goal.week", month: "sales.goal.month" } as const;

<Card title={t("sales.title")} description={t("sales.description")}>
  <Stack gap="lg">
    <SegmentedControl label={t("sales.period")} value={period} onValueChange={changePeriod} items={periods} />
    {status === "loading"
      ? <Stack gap="md"><Skeleton shape="text" /><Skeleton shape="text" /><Skeleton shape="text" width="60%" /></Stack>
      : status === "failed"
        ? <Notice tone="danger" title={t("sales.loadFailed")}
            action={<Button tone="secondary" size="small" onClick={retry}>{t("common.retry")}</Button>} />
        : <>
            <Stack gap="md">{data.items.map((item) => <Statistic key={item.id} descriptor={item} />)}</Stack>
            <Progress label={t(goalKey[period])} value={data.goal} valueText={formatPercent(data.goal)} />
          </>}
  </Stack>
</Card>;
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Button } from "@hjmds/react-native/actions";
import { Card, Statistic } from "@hjmds/react-native/data-display";
import { Notice, Progress, Skeleton } from "@hjmds/react-native/feedback";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { Container, Stack } from "@hjmds/react-native/primitives";

const goalKey = { week: "sales.goal.week", month: "sales.goal.month" } as const;
const { width } = useWindowDimensions();
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";

<ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
  <Container gutter={gutter}>
    <Card title={t("sales.title")} description={t("sales.description")}>
      <Stack gap="lg">
        <SegmentedControl label={t("sales.period")} value={period} onValueChange={changePeriod} items={periods} />
        {status === "loading"
          ? <Stack gap="md"><Skeleton shape="text" accessibilityLabel={t("sales.loading")} /><Skeleton shape="text" /><Skeleton shape="text" width="60%" /></Stack>
          : status === "failed"
            ? <Notice tone="danger" announcement="assertive" title={t("sales.loadFailed")}
                action={<Button tone="secondary" size="small" onPress={retry}>{t("common.retry")}</Button>} />
            : <>
                <Stack gap="md">{data.items.map((item) => <Statistic key={item.id} descriptor={item} />)}</Stack>
                <Progress label={t(goalKey[period])} value={data.goal} valueText={formatPercent(data.goal)} />
              </>}
      </Stack>
    </Card>
  </Container>
</ScrollView>;
```

Statistic descriptor는 `{ id, label, value(포맷 끝난 문자열), suffix, trend: { direction, tone, label } }`이다. 수치·문구·목표는 제품 데이터다.

## 함정

- 증감을 색만으로 전하지 않는다. `trend.label`은 필수이고 비교 기준("지난주보다")을 문구에 넣는다.
- 목표 라벨을 기간과 따로 고정하면("월 목표") 주간 비교와 섞여 읽힌다. 기간과 함께 바꾼다.
- 로딩·실패 자리를 Fragment로 바꿔 넣으면 수치 목록과 Progress가 바깥 `Stack gap="lg"`의 직계 자식으로 남는다. 둘을 한 `Stack`으로 묶으면 사이가 `spacing.lg` 20에서 바뀐다.
- `onValueChange`는 `string`을 넘긴다. 기간 타입으로 좁힐 때 허용 값인지 확인하고 바꾼다(스토리는 `as StatPeriod`로 단언한다).
- 현재 스토리는 로컬 데이터라 로딩·실패 경로가 없고, 목표 값 문구를 `` `${goal}%` ``로 이어 붙인다. 퍼센트 표기는 로케일 포맷(`formatPercent`)으로 만든다.
