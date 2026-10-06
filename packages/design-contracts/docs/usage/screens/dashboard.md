# 대시보드

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `showcase/web/src/patterns/Dashboard.stories.tsx`, `showcase/native/src/Dashboard.stories.tsx`, `showcase/shared/dashboard-pattern.ts`, `showcase/native/src/pattern-status.tsx`, `packages/react/src/styles.css`(`.hjm-statistic`, `.hjm-text`)
- 스토리북: `배포/화면/콘텐츠/대시보드`

## 목적

한 기간의 개인 활동을 숫자 요약 → 날짜별 활동 → 기록 목록 순서로 돌아보는 화면이다.
기간을 바꾸면 세 영역이 같은 데이터에서 함께 다시 계산된다. 차트·비교·목표 설정은 없다.
수치·기간·기록은 제품 데이터이며 스토리의 "예제 기록입니다" 안내는 showcase 전용이다.

## 영역 구조

```text
좁은 폭(Native·모바일 Web) — 전체가 하나의 세로 스크롤, 고정 영역 없음
┌ 상단 안전 영역 (화면 소유 아님: 헤더·TopBar safeAreaTop) ┐
│ ScrollView 위아래 spacing.lg 20                            │
│ Container gutter: 폭<600 compact 16 · 이상 regular 20      │
│ ① 머리                                                     │
│   제목 Heading level3 · semanticLevel 1                    │
│   소개 Text (Web as="p")                                   │  직계 요소 사이 spacing.xl 24
│   [최근 7일] [9월] [8월]  ← 기간 선택                        │  ghost + selected, wrap gap sm 12
│ ② "2026-09-01 — 2026-09-30"  (상태 알림)                    │
│ (오류면 여기 Notice danger + [다시 시도])                    │
│ ┌ ③ 요약 Surface padding lg 20 ─────────────────────────┐ │
│ │ 남긴 기록          ← 라벨(muted)                        │ │  라벨-값 spacing.xxs 4
│ │ 7                  ← 값(tabular-nums)                   │ │
│ │          ↕ spacing.lg 20                                │ │
│ │ 기록한 날 / 6                                            │ │
│ │          ↕ 20                                           │ │
│ │ 머문 시간 (분) / 125                                     │ │
│ └────────────────────────────────────────────────────────┘ │
│ ④ 활동                                                     │
│   "기록한 날"  Text emphasis=strong                         │
│   [날짜 목록으로 보기]  ← 보기 전환(ghost)                   │
│   ActivityHeatmap (grid ↔ list)                            │
│ ⑤ 기록 List — 최신 날짜가 위                                 │
│   ├ ListRow 제목 / "날짜 · N분"                             │
│   └ …                                                      │
│ (기록 0개면 ④⑤ 대신 EmptyState + [9월 보기])                 │
└ 아래: 고정 영역 없음, 내용이 스크롤된다 ───────────────────────┘
```

넓은 폭 Web도 같은 한 열이다. [Container](../components/container.md) `size="content"`(`layout.contentMaxWidth` 1200)가
폭을 묶는다. 요약 수치를 가로로 놓는 배치는 스토리에서 확인되지 않았다.

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web `main` > [Container](../components/container.md) `size="content"` `gutter` > Stack `gap="xl"`, 문서 스크롤 · Native `ScrollView` > Container `size="content"` `gutter` > Stack `gap="xl"` | 화면 전체, 세로 스크롤 하나 | 좌우 Container gutter: 폭 < 600 `compact` 16, 이상 `regular` 20([화면 여백](../tokens/layout.md)). Native ScrollView 위아래 `spacing.lg` 20(`paddingVertical`). 직계 요소 사이 `spacing.xl` 24. 위 안전 영역은 내비게이션 헤더·[TopBar](../components/top-bar.md) `safeAreaTop`이 맡고, 헤더 없이 띄울 때만 제품이 감싼다. 아래 고정 영역이 없어 inset은 스크롤로 지나간다. 입력이 없어 키보드 처리는 없다 |
| ① 머리 | [Heading](../components/heading.md) `level="level3"` `semanticLevel={1}` · Text(소개) · Stack `axis="inline" wrap gap="sm"` > Button `ghost` | 맨 위 | 제목 24/32 heavy. 버튼 높이 44(`control.buttonHeight.medium`), 사이 `spacing.sm` 12 |
| ② 기간 표시 | Text `role="status"`(Web) · `accessibilityLiveRegion="polite"` Text(Native) | ① 아래 | 위아래 24 |
| ③ 요약 | Surface `padding="lg"` > Stack `gap="lg"` > AnimatedStatistic ×3 | ② 아래 | 안쪽 `spacing.lg` 20, 수치 사이 20, 라벨-값 `spacing.xxs` 4 |
| ④ 활동 | Text `emphasis="strong"` · Button `ghost` · ActivityHeatmap `view` | ③ 아래, 세 요소가 바깥 Stack 직계 | 요소 사이 24 |
| ⑤ 기록 | List > ListRow(누름 없음) | ④ 아래 | 두 줄 행 최소 68(`layout.rowHeight.twoLine`). 기록은 최신 날짜가 위(내림차순)다. 요약·히트맵과 같은 기간 필터 결과를 뒤집어 쓴다(`dashboard-pattern.ts` `records.slice().reverse()`) |
| 빈 상태 | EmptyState + `action` Button | ④⑤ 자리 | Web 위아래 `spacing.xxl` 32 · Native 위아래 `spacing.xxxl` 40·좌우 `spacing.xl` 24 |

④의 제목·토글·히트맵이 바깥 Stack 직계라 사이가 24로 벌어진다. 제목과 전환 버튼을 한 줄에 묶으려면
[Section](../components/section.md)의 `title`·`action`(머리 한 줄, 사이 `spacing.sm` 12, Web 폭 600(`breakpoint.medium`) 미만에서 세로로 쌓임)을 쓴다.

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 기간 선택 | SegmentedControl `presentation="pills"` | ① 소개문 아래 한 줄, 시작 정렬, wrap | 3(짧은 기간 → 긴 기간 → 과거). 기본 선택은 현재 달(스토리 `month`). 화면에 primary가 없다 — 이 화면의 주 행동은 읽기다 |
| 보기 전환 | Button `ghost` | ④ 제목 아래 | 1. 라벨은 바뀔 보기를 말한다(`viewToggleKey`: grid → `dashboard.showList`, list → `dashboard.showGrid`) |
| 빈 상태 복구 | EmptyState `action` > Button(기본 primary) | EmptyState 맨 아래 가운데 | 1. 기록 있는 기간(스토리는 현재 달)으로 돌린다 |
| 다시 시도 | [Notice](../components/notice.md) `action` > Button `tone="secondary" size="small"` | ② 아래 Notice 끝(Web 같은 줄 끝, Native 문구 아래) | 1. 오류일 때만 |
| 기록 열기 | — | — | 스토리에서는 누를 수 없다. 상세가 있으면 ListRow에 `onClick`/`onPress`를 주고 [작품 탐색](discovery-gallery.md)처럼 Sheet로 연다 |
| 파괴 행동 | — | — | 없음 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | ①~⑤ 모두. AnimatedStatistic이 이전 값에서 새 값으로 굴러간다(모션 줄이기면 즉시) | 기간 선택·보기 전환 |
| 로딩 | 스토리에 없음. ①② 그대로, ③ Surface 안에 수치 3개 모양의 [Skeleton](../components/skeleton.md)(라벨 `shape="text"` 40% + 값 `shape="block"` 30%, 사이 `spacing.xxs` 4), ④⑤는 그리지 않는다. 로딩 사실은 영역 단위로 한 번 알린다(Web 감싼 Surface `aria-busy`·`aria-label`, Native 첫 Skeleton `accessibilityLabel`) | 기간 선택은 그대로 둔다 |
| 빈 | ③ 수치는 0, ④⑤ 자리에 EmptyState(제목·설명) | [9월 보기] 같은 기록 있는 기간으로 |
| 오류 | 스토리에 없음. ② 바로 아래 [Notice](../components/notice.md) `tone="danger"`(Native `announcement="assertive"` — 기본 `none`). 문구는 원인별 키(`errorKey`: 네트워크 `dashboard.error.network`, 서버 `dashboard.error.server`). 이전 데이터가 있으면 ③④⑤를 유지하고, 첫 로딩 실패면 ③④⑤를 그리지 않는다. 다시 시도가 또 실패하면 같은 Notice를 같은 자리에 두고 버튼 `loading`만 푼다(Notice를 쌓지 않는다) | Notice `action` 다시 시도 1개(`tone="secondary" size="small"`, 요청 중 `loading`) |
| 기간 변경 | ② 기간 문구가 바뀌어 읽히고 ③④⑤가 같이 바뀐다 | — |
| 날짜 값 모름 | 히트맵 값 `null`은 `formatDay`로 "확인되지 않음"이라 읽힌다. 0과 구분해 넘긴다 | — |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [Container](../components/container.md) | 바깥 틀 폭·좌우 여백 |
| [Stack](../components/stack.md) | 바깥 세로 리듬, 기간 버튼 줄, 요약 안 |
| [Heading](../components/heading.md) | ① 화면 제목 |
| [Text](../components/text.md) | 소개·기간 표시·활동 제목 |
| [SegmentedControl](../components/segmented-control.md) | 기간 단일 선택 |
| [Button](../components/button.md) | 보기 전환, 복구, 다시 시도 |
| [Surface](../components/surface.md) | ③ 요약 카드 |
| [Statistic](../components/statistic.md) | ③ `AnimatedStatistic` |
| [ActivityHeatmap](../components/activity-heatmap.md) | ④ 날짜별 활동 |
| [List](../components/list.md) · [ListRow](../components/list-row.md) | ⑤ 기록 |
| [EmptyState](../components/empty-state.md) | 기록 없음 |
| [Skeleton](../components/skeleton.md) | 로딩 |
| [Notice](../components/notice.md) | 오류 |
| [화면 여백과 너비](../tokens/layout.md) | gutter·최대 폭 |
| [간격](../tokens/spacing.md) | `spacing.xxs`·`sm`·`lg`·`xl` |

## 코드 골격

수치 라벨·기간 목록·`formatDay` 문구는 제품 소유다. 상태마다 다른 문구는 키를 문자열로 조립하지 않고
상태→키 상수 표로 고른다. 그래야 상태 표와 키 목록이 한 곳에서 맞는다. 아래 두 예는 설치 버전 타입으로
검사했다(`period`·`data`·`error` 등 상태 값은 제품이 둔다).

```tsx
// Web
import { Container, Stack, Surface, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { Button } from "@hjmds/react/actions";
import { SegmentedControl } from "@hjmds/react/selection";
import { EmptyState, Notice, Skeleton } from "@hjmds/react/feedback";
import { AnimatedStatistic } from "@hjmds/react/statistic-motion";
import { ActivityHeatmap } from "@hjmds/react/activity-heatmap";
import { List, ListRow } from "@hjmds/react/display";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

type Period = "week" | "month" | "lastMonth";
type LoadError = "network" | "server";
const periods: readonly Period[] = ["week", "month", "lastMonth"];
const periodKey = { week: "dashboard.period.week", month: "dashboard.period.month", lastMonth: "dashboard.period.lastMonth" } as const satisfies Record<Period, string>;
const errorKey = { network: "dashboard.error.network", server: "dashboard.error.server" } as const satisfies Record<LoadError, string>;
// 라벨은 지금 보기가 아니라 바뀔 보기를 말한다.
const viewToggleKey = { grid: "dashboard.showList", list: "dashboard.showGrid" } as const;
const gutter = resolveWindowClass(window.innerWidth) === "compact" ? "compact" : "regular";

<main><Container size="content" gutter={gutter}><Stack gap="xl">
  <Heading level="level3" semanticLevel={1}>{t("dashboard.title")}</Heading>
  <Text as="p">{t("dashboard.intro")}</Text>
  <SegmentedControl label={t("dashboard.period")} presentation="pills"
      items={periods.map(id => ({ value: id, label: t(periodKey[id]) }))} value={period} onValueChange={setPeriod} />
  <Text role="status">{t("dashboard.range", range)}</Text>
  {error ? <Notice tone="danger" title={t(errorKey[error])}
    action={<Button tone="secondary" size="small" loading={retrying} onClick={retry}>{t("common.retry")}</Button>} /> : null}
  {loading && !data ? (
    <Surface padding="lg" aria-busy="true" aria-label={t("dashboard.loading")}><Stack gap="lg">
      {[0, 1, 2].map(i => <Stack key={i} gap="xxs"><Skeleton shape="text" width="40%" /><Skeleton shape="block" width="30%" /></Stack>)}
    </Stack></Surface>
  ) : data ? <>
    <Surface padding="lg"><Stack gap="lg">
      <AnimatedStatistic descriptor={{ id: "count", label: t("dashboard.count") }} value={data.count} locale={locale} />
      <AnimatedStatistic descriptor={{ id: "days", label: t("dashboard.activeDays") }} value={data.activeDays} locale={locale} />
      <AnimatedStatistic descriptor={{ id: "minutes", label: t("dashboard.minutes") }} value={data.minutes} locale={locale} />
    </Stack></Surface>
    {data.count ? <>
      <Text emphasis="strong">{t("dashboard.activity")}</Text>
      <Button tone="ghost" onClick={() => setList(v => !v)}>{t(viewToggleKey[list ? "list" : "grid"])}</Button>
      <ActivityHeatmap descriptor={data.heatmap} label={t("dashboard.activity")} formatDay={formatDay} view={list ? "list" : "grid"} />
      <List label={t("dashboard.records")}>{data.records.map(r =>
        <ListRow key={r.id} title={r.title} description={t("dashboard.recordMeta", { date: r.date, minutes: r.minutes })} />)}</List>
    </> : <EmptyState title={t("dashboard.empty.title")} description={t("dashboard.empty.body")}
        action={<Button onClick={() => setPeriod("month")}>{t("dashboard.reset")}</Button>} />}
  </> : null}
</Stack></Container></main>
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Container, Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { Heading } from "@hjmds/react-native/heading";
import { Button } from "@hjmds/react-native/actions";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { EmptyState, Notice, Skeleton } from "@hjmds/react-native/feedback";
import { AnimatedStatistic } from "@hjmds/react-native/statistic-motion";
import { ActivityHeatmap } from "@hjmds/react-native/activity-heatmap";
import { List, ListRow } from "@hjmds/react-native/data-display";

// periods·periodKey·errorKey·viewToggleKey는 Web과 같다.
const { width } = useWindowDimensions();
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";

<ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
  <Container size="content" gutter={gutter}><Stack gap="xl">
    <Heading level="level3" semanticLevel={1}>{t("dashboard.title")}</Heading>
    <Text>{t("dashboard.intro")}</Text>
    <SegmentedControl label={t("dashboard.period")} presentation="pills"
      items={periods.map(id => ({ value: id, label: t(periodKey[id]) }))} value={period} onValueChange={setPeriod} />
    <Text accessibilityLiveRegion="polite">{t("dashboard.range", range)}</Text>
    {error ? <Notice tone="danger" announcement="assertive" title={t(errorKey[error])}
      action={<Button tone="secondary" size="small" loading={retrying} onPress={retry}>{t("common.retry")}</Button>} /> : null}
    {loading && !data ? (
      <Surface padding="lg"><Stack gap="lg">
        {[0, 1, 2].map(i => <Stack key={i} gap="xxs">
          <Skeleton shape="text" width="40%" {...(i === 0 ? { accessibilityLabel: t("dashboard.loading") } : {})} />
          <Skeleton shape="block" width="30%" />
        </Stack>)}
      </Stack></Surface>
    ) : data ? <>
      <Surface padding="lg"><Stack gap="lg">
        <AnimatedStatistic descriptor={{ id: "count", label: t("dashboard.count") }} value={data.count} locale={locale} />
        {/* activeDays · minutes — Web과 같다 */}
      </Stack></Surface>
      {data.count ? <>
        <Text emphasis="strong">{t("dashboard.activity")}</Text>
        <Button tone="ghost" onPress={() => setList(v => !v)}>{t(viewToggleKey[list ? "list" : "grid"])}</Button>
        <ActivityHeatmap descriptor={data.heatmap} label={t("dashboard.activity")} formatDay={formatDay} view={list ? "list" : "grid"} />
        <List label={t("dashboard.records")}>{data.records.map(r =>
          <ListRow key={r.id} title={r.title} description={t("dashboard.recordMeta", { date: r.date, minutes: r.minutes })} />)}</List>
      </> : <EmptyState title={t("dashboard.empty.title")} description={t("dashboard.empty.body")}
          action={<Button onPress={() => setPeriod("month")}>{t("dashboard.reset")}</Button>} />}
    </> : null}
  </Stack></Container>
</ScrollView>
```

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자(`textScale` 2) | 기간 선택은 큰 글자에서 세로로 쌓인다. Statistic 값은 Web에서 `type.title` 크기 × 글자 배율로 커지고 `overflow-wrap: anywhere`로 꺾인다. 긴 제목은 Heading이 줄바꿈한다 |
| 다크 | 테마 토큰만 쓰므로 바꿀 것이 없다 |
| 좁은 폭 | 구조 동일, gutter가 `compact` 16으로 준다. ActivityHeatmap 격자가 좁으면 보기 전환으로 목록을 쓴다 |
| 넓은 폭 Web | 한 열 유지, Container `content`가 1200으로 폭을 묶고 gutter `regular` 20 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 바깥 스크롤 | 문서 스크롤 | `ScrollView` 위아래 `spacing.lg` 20, 좌우는 안쪽 Container gutter |
| 상단 안전 영역 | 브라우저 | 화면이 소유하지 않는다. 내비게이션 헤더 또는 [TopBar](../components/top-bar.md) `safeAreaTop`이 맡고, 헤더 없이 띄울 때만 제품이 감싼다 |
| 기간 표시 알림 | `role="status"` | `accessibilityLiveRegion="polite"`(Android만), iOS는 제품이 직접 알림(함정 참고) |
| 로딩 알림 | 감싼 영역 `aria-busy` + `aria-label`(Skeleton은 항상 `aria-hidden`) | 첫 Skeleton `accessibilityLabel` 하나 |
| 오류 Notice 알림 | `tone="danger"`가 알림 영역 | `announcement="assertive"`를 명시(기본 `none`) |
| EmptyState 기본 위아래 여백 | `spacing.xxl` 32(`styles.css`) | `spacing.xxxl` 40(`emptyStateRecipe.density.regular`) |

## 함정

- ActivityHeatmap은 1~366일만 받는다(범위 밖이면 `RangeError`). 1년 넘는 기록은 제품이 기간을 나눈다.
- 스토리의 `PatternStatus`는 showcase 전용이다. iOS 알림은 `AccessibilityInfo.announceForAccessibilityWithOptions(text, { queue: true })`로
  제품이 두되, **기간 문구가 이전과 달라졌을 때만** 보내고 첫 렌더·같은 문구 재렌더·빈 문자열·앱이 active가 아닐 때(`AppState.currentState`)는
  보내지 않는다(`showcase/native/src/pattern-status.tsx`).
- 구획 제목은 Heading으로 표시한다. 이전 Text heading 예제는 2026-10-06 제목 의미 구조를 맞추면서 수정했다.
  Text의 기본 `emphasis="regular"`가 굵기를 덮어 24px 보통 굵기로 나오고(`.hjm-text[data-emphasis="regular"]`), Native는 제목 단계가 없다.
  [Text](../components/text.md) 규칙대로 새 제품은 Heading `level3`·`semanticLevel={1}`(24/32 heavy)을 쓴다.
- 예제는 양 플랫폼 모두 Container로 감싼다. 예제의 compact gutter 16과 제품이 폭에 따라 선택하는 regular gutter 20을 구분한다.
