# 대시보드

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-17
- 근거: `showcase/web/src/patterns/Dashboard.stories.tsx`, `showcase/native/src/Dashboard.stories.tsx`, `showcase/shared/dashboard-pattern.ts`, `showcase/native/src/pattern-status.tsx`, `packages/react/src/screens.tsx`, `packages/react/src/styles.css`(`.hjm-screen`, `.hjm-statistic`)
- 스토리북: `배포/화면/콘텐츠/대시보드`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 화면 API가 없는 제품 콘텐츠는 `ScreenLayout`의 본문에 HJM 구성을 연결한다.

## 목적

한 기간의 개인 활동을 숫자 요약 → 날짜별 활동 → 기록 목록 순서로 돌아보는 화면이다.
기간을 바꾸면 세 영역이 같은 데이터에서 함께 다시 계산된다. 차트·비교·목표 설정은 없다.
수치·기간·기록은 제품 데이터다. 스토리의 기록은 합성 예제이며 화면 본문에 예제 안내 문구를 두지 않는다.

## 영역 구조

```text
좁은 폭(Native·모바일 Web) — ScreenLayout 하나, 본문만 세로 스크롤
┌ ScreenLayout 헤더 (가운데 정렬, padding spacing.md 16) ──┐
│            작은 순간이 쌓인 한 달   ← title               │
│      기록한 날과 머문 시간을 함께 돌아봐요.  ← description  │
├ notice (좌우 16, 본문 상태가 바뀌어도 유지) ───────────────┤
│ [최근 7일] [9월] [8월]  ← 기간 선택                        │  SegmentedControl pills, 단일 선택
├ 본문 (padding 16, 스크롤) ─────────────────────────────────┤
│ ② "2026-09-01 — 2026-09-30"  (상태 알림)                    │  직계 요소 사이 spacing.xl 24
│ (오류면 notice에 Notice danger + [다시 시도])               │
│ ┌ ③ 요약 Surface padding lg 20 ─────────────────────────┐ │
│ │ 남긴 기록 / 7                                           │ │  라벨-값 spacing.xxs 4
│ │          ↕ spacing.lg 20                                │ │  좁은 폭: Grid 1열
│ │ 기록한 날 / 6                                            │ │
│ │          ↕ 20                                           │ │
│ │ 머문 시간 (분) / 125                                     │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌ ④ Section ─────────────────────────────────────────────┐ │
│ │ 기록한 날                    [날짜 목록으로 보기]         │ │  머리 한 줄: title · action(ghost small)
│ │ ActivityHeatmap (grid ↔ list)                           │ │
│ └────────────────────────────────────────────────────────┘ │
│ ⑤ 기록 List — 최신 날짜가 위                                 │
│   ├ ListRow 제목 / "날짜 · N분"                             │
│   └ …                                                      │
│ (기록 0개면 ④⑤ 대신 EmptyState + [9월 보기])                 │
└ 아래: 고정 영역 없음 ─────────────────────────────────────────┘
```

넓은 폭 Web도 같은 한 열이다. ScreenLayout이 `screenPatternRecipe.maxWidth`(`layout.readingMaxWidth` 720)로
폭을 묶고 가운데에 둔다. ③ 요약은 [Grid](../components/grid.md) `columns={{ compact: 3 }}` `minColumnWidth={{ compact: 160 }}`(`dashboardStatMinWidth`)라
세 수치가 각각 160 이상 들어가는 폭(최대 폭 720에서 Surface 안쪽 648)에서는 한 줄 3열, 좁은 폭에서는 1열로 쌓인다.

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | [ScreenLayout](../components/screen-layout.md) `title` `description` `notice` > Stack `gap="xl"` (Web `@hjmds/react/screens`, Native `@hjmds/react-native/screens`) | 화면 전체, 본문만 스크롤 | 헤더·notice·본문 좌우 `screenPatternRecipe.padding` 16, 최대 폭 720. 본문 직계 요소 사이 `spacing.xl` 24. 별도 ScrollView·Container로 감싸지 않는다. 아래 고정 영역이 없어 inset은 스크롤로 지나간다. 입력이 없어 키보드 처리는 없다 |
| ① 머리 | ScreenLayout `title`·`description` · `notice`의 SegmentedControl `presentation="pills"` | 맨 위, 헤더 아래 notice | 제목은 가운데 정렬 헤더(`screenHeaderRecipe.centeredTitleLevel`). 버튼 높이 44(`control.buttonHeight.medium`), 사이 `spacing.sm` 12. 기간 선택을 헤더 `actions`가 아닌 `notice`에 두는 이유: 가운데 헤더의 양옆 칸은 같은 폭이라 pills 세 개가 들어가면 제목 칸이 사라지고, `notice`는 본문이 loading·empty·error로 바뀌어도 남는다 |
| ② 기간 표시 | Text `role="status"`(Web) · 공개 StatusText(Native) | 본문 맨 위 | 아래 24 |
| ③ 요약 | Surface `padding="lg"` > Grid `columns={{ compact: 3 }}` `minColumnWidth={{ compact: 160 }}` `gap={{ compact: "lg" }}` > AnimatedStatistic ×3 | ② 아래 | 안쪽 `spacing.lg` 20, 수치 사이 20, 라벨-값 `spacing.xxs` 4 |
| ④ 활동 | [Section](../components/section.md) `title` · `action`(Button `ghost` `size="small"`) > ActivityHeatmap `view` | ③ 아래 | 머리 한 줄(제목 시작, 전환 버튼 끝, 사이 `spacing.sm` 12, Web 폭 600 미만·Native 큰 글자에서 세로로 쌓임). 머리-히트맵 `sectionRecipe.gap` |
| ⑤ 기록 | List > ListRow(누름 없음) | ④ 아래 | 두 줄 행 최소 68(`layout.rowHeight.twoLine`). 기록은 최신 날짜가 위(내림차순)다. 요약·히트맵과 같은 기간 필터 결과를 뒤집어 쓴다(`dashboard-pattern.ts` `records.slice().reverse()`) |
| 빈 상태 | EmptyState + `action` Button | ④⑤ 자리 | Web 위아래 `spacing.xxl` 32 · Native 위아래 `spacing.xxxl` 40·좌우 `spacing.xl` 24 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 기간 선택 | SegmentedControl `presentation="pills"` | ScreenLayout `notice`, 시작 정렬, wrap | 3(짧은 기간 → 긴 기간 → 과거). 기본 선택은 현재 달(스토리 `month`). 화면에 primary가 없다 — 이 화면의 주 행동은 읽기다 |
| 보기 전환 | Button `ghost` `size="small"` | ④ Section `action`, 제목과 같은 줄 끝 | 1. 라벨은 바뀔 보기를 말한다(`viewToggleKey`: grid → `dashboard.showList`, list → `dashboard.showGrid`) |
| 빈 상태 복구 | EmptyState `action` > Button(기본 primary) | EmptyState 맨 아래 가운데 | 1. 기록 있는 기간(스토리는 현재 달)으로 돌린다 |
| 다시 시도 | [Notice](../components/notice.md) `action` > Button `tone="secondary" size="small"` | notice의 Notice 끝(Web 같은 줄 끝, Native 문구 아래) | 1. 오류일 때만 |
| 기록 열기 | — | — | 스토리에서는 누를 수 없다. 상세가 있으면 ListRow에 `onClick`/`onPress`를 주고 [작품 탐색](discovery-gallery.md)처럼 Sheet로 연다 |
| 파괴 행동 | — | — | 없음 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | ①~⑤ 모두. AnimatedStatistic이 이전 값에서 새 값으로 굴러간다(모션 줄이기면 즉시) | 기간 선택·보기 전환 |
| 로딩 | 동기 스토리에 없음. 제품 최초 조회는 ScreenLayout `state=loading`으로 본문 중앙 spinner 하나를 표시하고 라벨은 접근성 이름으로 전달한다. 재조회는 기존 본문을 유지한다 | 기간 선택 유지, 같은 요청 중복 실행 방지 |
| 빈 | 동기 스토리는 수치 0과 인라인 EmptyState를 시연한다. 제품의 전체 빈 상태는 ScreenLayout `state=empty`로 본문 중앙에 두고 기간 선택은 `notice`에 유지한다 | 기록 있는 기간으로 |
| 오류 | 스토리에 없음. ScreenLayout `notice`에 기간 선택과 함께 [Notice](../components/notice.md) `tone="danger"`(Native `announcement="assertive"` — 기본 `none`). 문구는 원인별 키(`errorKey`: 네트워크 `dashboard.error.network`, 서버 `dashboard.error.server`). 이전 데이터가 있으면 ③④⑤를 유지하고, 첫 로딩 실패면 ScreenLayout `state=error`와 `stateAction`으로 본문 중앙에 오류·재시도를 함께 둔다. 다시 시도가 또 실패하면 같은 Notice를 같은 자리에 두고 버튼 `loading`만 푼다(Notice를 쌓지 않는다) | Notice `action` 다시 시도 1개(`tone="secondary" size="small"`, 요청 중 `loading`) |
| 기간 변경 | ② 기간 문구가 바뀌어 읽히고 ③④⑤가 같이 바뀐다 | — |
| 날짜 값 모름 | 히트맵 값 `null`은 `formatDay`로 "확인되지 않음"이라 읽힌다. 0과 구분해 넘긴다 | — |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [ScreenLayout](../components/screen-layout.md) | 바깥 틀·제목·소개·기간 선택 자리·최대 폭 |
| [Stack](../components/stack.md) | 본문 세로 리듬 |
| [Grid](../components/grid.md) | ③ 요약 수치 배치 |
| [Section](../components/section.md) | ④ 활동 머리(제목·보기 전환) |
| [Text](../components/text.md) | 기간 표시 |
| [SegmentedControl](../components/segmented-control.md) | 기간 단일 선택 |
| [Button](../components/button.md) | 보기 전환, 복구, 다시 시도 |
| [Surface](../components/surface.md) | ③ 요약 카드 |
| [Statistic](../components/statistic.md) | ③ `AnimatedStatistic` |
| [ActivityHeatmap](../components/activity-heatmap.md) | ④ 날짜별 활동 |
| [List](../components/list.md) · [ListRow](../components/list-row.md) | ⑤ 기록 |
| [EmptyState](../components/empty-state.md) | 기록 없음 |
| [Skeleton](../components/skeleton.md) | 로딩 | 동기 스토리에 없음. 제품 최초 조회는 ScreenLayout `state=loading`으로 본문 중앙 spinner 하나를 표시하고 라벨은 접근성 이름으로 전달한다. 재조회는 기존 본문을 유지한다 | 기간 선택 유지, 같은 요청 중복 실행 방지 |
| [Notice](../components/notice.md) | 오류 |
| [화면 여백과 너비](../tokens/layout.md) | 최대 폭 |
| [간격](../tokens/spacing.md) | `spacing.xxs`·`sm`·`lg`·`xl` |

## 코드 골격

완성된 동기 fixture의 배치·기간 계산 원본은 `showcase/web/src/patterns/Dashboard.stories.tsx`,
`showcase/native/src/Dashboard.stories.tsx`, `showcase/shared/dashboard-pattern.ts`다.
이 스토리는 공개 DashboardScreen API가 아니며 서버 최초 조회·재조회 실패를 구현한 증거도 아니다.
제품은 아래 공개 ScreenLayout의 상태 경로를 사용하고 기존 요약·활동·목록을 children으로 둔다.
`periodControls`는 위에서 설명한 SegmentedControl, `summaryAndRecords`는 같은 기간 데이터로 만든 세 영역이다.

```tsx
// Web
import { ScreenLayout } from "@hjmds/react/screens";
import { Button } from "@hjmds/react/actions";
import { Notice } from "@hjmds/react/feedback";
import { Stack } from "@hjmds/react/layout";

const initial = data === undefined;
<ScreenLayout title={t("dashboard.title")} description={t("dashboard.intro")}
  state={initial
    ? error ? { kind: "error", title: t(errorKey[error]) } : { kind: "loading", title: t("dashboard.loading") }
    : data.count === 0 ? { kind: "empty", title: t("dashboard.empty.title") } : { kind: "ready" }}
  stateAction={initial && error ? <Button loading={retrying} onClick={retry}>{t("common.retry")}</Button>
    : !initial && data.count === 0 ? <Button onClick={() => setPeriod("month")}>{t("dashboard.reset")}</Button> : null}
  notice={<Stack gap="sm">{periodControls}{!initial && error ? <Notice tone="danger" title={t(errorKey[error])}
    action={<Button tone="secondary" loading={retrying} onClick={retry}>{t("common.retry")}</Button>} /> : null}</Stack>}>
  {summaryAndRecords}
</ScreenLayout>
```

```tsx
// Native
import { ScreenLayout } from "@hjmds/react-native/screens";
import { Button } from "@hjmds/react-native/actions";
import { Notice } from "@hjmds/react-native/feedback";
import { Stack } from "@hjmds/react-native/primitives";

const initial = data === undefined;
<ScreenLayout title={t("dashboard.title")} description={t("dashboard.intro")}
  state={initial
    ? error ? { kind: "error", title: t(errorKey[error]) } : { kind: "loading", title: t("dashboard.loading") }
    : data.count === 0 ? { kind: "empty", title: t("dashboard.empty.title") } : { kind: "ready" }}
  stateAction={initial && error ? <Button loading={retrying} onPress={retry}>{t("common.retry")}</Button>
    : !initial && data.count === 0 ? <Button onPress={() => setPeriod("month")}>{t("dashboard.reset")}</Button> : null}
  notice={<Stack gap="sm">{periodControls}{!initial && error ? <Notice tone="danger" announcement="assertive" title={t(errorKey[error])}
    action={<Button tone="secondary" loading={retrying} onPress={retry}>{t("common.retry")}</Button>} /> : null}</Stack>}>
  {summaryAndRecords}
</ScreenLayout>
```

최초 로딩·실패·빈 상태는 host가 확보한 본문 영역의 가로·세로 중앙에 둔다. 별도 ScrollView로
ScreenLayout을 감싸지 않는다. 재조회는 기존 데이터와 기간 설명을 유지하고 `ready` 상태에서
해당 재조회 행동만 pending으로 표시한다. 새 기간 요청 중 이전 기간 자료를 새 기간 자료처럼 표시하지 않는다.
요청 취소 또는 request key 대조로 오래된 응답이 최신 선택을 덮지 못하게 한다.

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자(`textScale` 2) | 기간 선택 pills는 가로 순서를 유지하며 공간이 부족하면 감긴다. Statistic 값은 Web에서 `type.title` 크기 × 글자 배율로 커지고 `overflow-wrap: anywhere`로 꺾인다. 긴 제목은 Heading이 줄바꿈한다 |
| 다크 | 테마 토큰만 쓰므로 바꿀 것이 없다 |
| 좁은 폭 | 구조 동일, ③ 요약이 1열로 쌓인다. ActivityHeatmap 격자가 좁으면 보기 전환으로 목록을 쓴다 |
| 넓은 폭 Web | 한 열 유지, ScreenLayout이 720으로 폭을 묶고 ③ 요약은 3열 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 바깥 스크롤 | ScreenLayout 본문(`.hjm-screen__body`) | ScreenLayout 본문 ScrollView |
| 상단 안전 영역 | 브라우저 | ScreenLayout이 소유하지 않는다. host 내비게이션 또는 안전 영역 래퍼가 맡는다 |
| 기간 표시 알림 | `role="status"` | 공개 StatusText(Android live region + iOS 변경 알림) |
| 로딩 알림 | ScreenLayout 본문 busy와 Spinner 접근성 이름 | ScreenLayout 내부 Spinner 접근성 이름 |
| 오류 Notice 알림 | `tone="danger"`가 알림 영역 | `announcement="assertive"`를 명시(기본 `none`) |
| EmptyState 기본 위아래 여백 | `spacing.xxl` 32(`styles.css`) | `spacing.xxxl` 40(`emptyStateRecipe.density.regular`) |

## 함정

- ActivityHeatmap은 1~366일만 받는다(범위 밖이면 `RangeError`). 1년 넘는 기록은 제품이 기간을 나눈다.
- 기간·결과 문구는 공개 [StatusText](../components/text.md#statustext)를 쓴다. iOS에서는 active 중 바뀐 비어 있지 않은 문구만 알리고, 최초 안내·동일 문구·배경 변경은 재생하지 않는다.
- 화면 제목은 ScreenLayout `title`, 구획 제목은 Section `title`로 둔다. 본문에 Heading·강조 Text로 제목을 다시 만들지 않는다.
- 요약 수치를 Surface 안 세로 Stack에 두면 넓은 폭에서 오른쪽이 비고, 보기 전환 Button을 바깥 Stack 직계로 두면 내용 폭 전체로 늘어난다.


제거/복구 뒤 초점: Web 빈 기간 복구는 선택된 기간 컨트롤로 초점을 돌린다. 기간을 바꿔도 목록/격자 보기 선택은 유지한다.

## 근거

- 구획 제목 Heading: 2026-10-06 제목 의미 구조를 맞추면서 이전 Text heading 예제를 수정했다.
- 제거/복구 뒤 초점 규칙: 2026-10-13 행동 검수에서 제거/복구 뒤 키보드 문맥 유실을 확인했다.
- ScreenLayout·Grid·Section 구조: 2026-10-17 화면 검토(S5)에서 헤더 없는 본문 Heading, Web 모바일 상단 여백 없음, 화면 맨 위 예제 안내 문구, 1170px로 늘어난 보기 전환 버튼과 세로로만 쌓인 요약을 확인해 ScreenLayout 본문·notice 기간 선택·Grid 요약·Section 머리로 바꿨다.
