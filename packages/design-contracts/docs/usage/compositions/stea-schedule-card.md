# 날짜 선택과 예정 목록

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `showcase/web/src/patterns/stea-composition-previews.tsx`(`ScheduleDayList`), `showcase/native/src/stea-composition-previews.tsx`(`ScheduleDayList`, `Frame`), `showcase/shared/stea-compositions.ts`(`scheduleCopy`), `src/card.ts`, `src/component-recipes.ts`(`segmentedControlRecipe`, `listRowRecipe`), `src/container.ts`
- 스토리북: `배포/구성/선택과 필터/날짜 선택과 예정 목록`

## 언제 쓰나

한 주처럼 짧은 날짜 범위에서 날짜 하나를 고르면 같은 카드 안의 일정 목록이 그 날짜로 바뀌는 요약 카드에 쓴다.
날짜가 5개 안팎이라 한 줄 SegmentedControl에 다 들어갈 때 맞다. 달력에서 아무 날짜나 고르면
[Calendar](../components/calendar.md)·[DatePicker](../components/date-picker.md)를 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Card` | 제목("이번 주 일정")·설명을 가진 틀 | [Card](../components/card.md) |
| `SegmentedControl` | 날짜 선택(라벨 "월 5"처럼 짧게) | [SegmentedControl](../components/segmented-control.md) |
| `ContentTransition` | 날짜가 바뀔 때 목록 교체(기본 `fade`), `stateKey`=날짜 | [ContentTransition](../components/content-transition.md) |
| `List` + `ListRow` | 일정 행. 제목 + "시각 · 장소" 설명 | [List](../components/list.md), [ListRow](../components/list-row.md) |
| 빈 상태 `Text` 두 줄 | strong "이 날은 예정된 일정이 없어요." + muted 안내 | [Text](../components/text.md) |
| `Skeleton`·`Notice` | 서버에서 받는 일정일 때 목록 자리의 로딩·실패(스토리에 없음) | [Skeleton](../components/skeleton.md), [Notice](../components/notice.md) |
| `ScrollView` + `Container`(Native) | 바깥 틀. 세로 스크롤·위아래 여백, 좌우 gutter | [Container](../components/container.md), [화면 여백과 너비](../tokens/layout.md) |

## 배치

```text
Native 화면(ScrollView, 위아래 spacing.lg 20) > Container gutter 16(폭 < 600) · 20(폭 ≥ 600)
┌ Card ──────────────────────────────────────┐  body padding spacing.md 16
│ 이번 주 일정                 (title)       │
│ 날짜를 고르면 같은 카드 안에서…  (muted)   │
│ ┌──────┬──────┬──────┬──────┬──────┐       │  ← SegmentedControl, 높이 44
│ │ 월 5 │ 화 6 │ 수 7 │ 목 8 │ 금 9 │       │
│ └──────┴──────┴──────┴──────┴──────┘       │
│              ↕ spacing.md 16               │
│ ┌ 주간 계획 맞추기                      ┐  │  ← ListRow 두 줄 최소 68
│ │ 오전 10:00 · 회의실 A                 │  │
│ ├ 디자인 검토                           ┤  │
│ └ 오후 3:30 · 화상 회의                 ┘  │
│   (일정 없음: 강조 문구 / 안내 문구, xs 8) │
└────────────────────────────────────────────┘
  고정 영역 없음. 목록이 길면 화면 스크롤로 내려간다. 안전 영역은 화면 골격이 맡는다
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web: 제품 화면 레이아웃(문서 스크롤). Native: `ScrollView` > `Container` | 이 구성은 바깥 폭·여백을 정하지 않는다(스토리는 Card만 그린다). Native는 Card를 `ScrollView` 안 [Container](../components/container.md)에 둔다. 입력이 없어 키보드 처리는 없다. 안전 영역은 화면 골격(내비게이션 헤더·탭 바)이 맡는다 | Native ScrollView 위아래 `spacing.lg` 20, Container gutter 폭 600 미만 `compact` 16 · 이상 `regular` 20(`layout.pagePadding`) |
| 틀 | `Card` | 바깥 틀 안, 스크롤과 함께 | body padding `spacing.md` 16, 안쪽 `Stack gap="md"` 16 |
| 날짜 | `SegmentedControl` medium | Card 머리 아래 | 최소 높이 `control.minTouchTarget` 44, 트랙 padding·항목 사이 Native `spacing.xxs` 4 / Web CSS 2px |
| 목록 | `List` + `ListRow` | 날짜 아래 | 두 줄 행 최소 `layout.rowHeight.twoLine` 68(comfortable), 날짜와 `spacing.md` 16 |
| 빈 상태 | Text strong + muted | 목록 자리 | 두 줄 사이 `spacing.xs` 8 |
| 로딩·실패 | `Skeleton` 행 / `Notice` danger + 다시 시도 | 목록 자리(날짜 선택은 그대로) | 날짜와 `spacing.md` 16 |

- 날짜 선택은 목록 **위**에 둔다. 목록 높이가 바뀌어도 날짜 위치는 움직이지 않는다.
- 큰 글자(`largeTextThreshold` 이상, Web은 `data-large-text`)에서 SegmentedControl이 세로로 쌓인다(`segmentedControlRecipe.adaptive`). 보통 폭에서는 Web 항목이 `min-inline-size: max-content`라 넘치면 가로 스크롤된다. 날짜 라벨을 짧게 유지한다.

## 흐름과 상태

1. 첫 날짜가 선택된 채 열린다.
2. 다른 날짜를 누르면 `ContentTransition`이 목록을 그 날짜 일정으로 바꾼다. 서버에서 받으면 그동안 목록 자리에 Skeleton이 나온다.
3. 일정이 없는 날짜면 목록 대신 빈 상태 두 줄이 나온다.
4. 불러오기에 실패하면 목록 자리에 Notice와 "다시 시도"가 나온다. 다시 시도는 같은 날짜를 다시 요청한다.

- 문구 키는 상태별 상수로 둔다(`schedule.empty`·`schedule.emptyHint`·`schedule.loadFailed`·`common.retry`). 행 설명은 `t("schedule.rowDescription", { time, place })`처럼 변수로 넘기고 문자열을 이어 붙이지 않는다(언어마다 순서가 다르다).

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 첫 날짜 선택, `List` 이름 "10월 5일 월요일 일정"(긴 날짜), 행 여러 개 | 포커스는 SegmentedControl에 남는다 |
| 진행 중 | 서버에서 받는 일정이면 목록 자리에 `Skeleton` 행(`text` 두 줄). 날짜는 계속 바꿀 수 있고, 늦게 온 이전 날짜 응답은 버린다 | 포커스는 SegmentedControl에 남는다 |
| 실패 | 목록 자리에 `Notice` danger + `action` "다시 시도"(`secondary` `small`). 날짜 선택은 유지 | Web `danger`는 `role="alert"`, Native는 `announcement="assertive"` |
| 일정 없음 | strong + muted 문구 두 줄 | 알림 없음(스토리). 필요하면 제품이 live region을 더한다 |

## 코드 골격

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { ContentTransition } from "@hjmds/react/content-transition";
import { Card, List, ListRow } from "@hjmds/react/display";
import { Notice, Skeleton } from "@hjmds/react/feedback";
import { Stack, Text } from "@hjmds/react/layout";
import { SegmentedControl } from "@hjmds/react/selection";

<Card title={t("schedule.title")} description={t("schedule.description")}>
  <Stack gap="md">
    <SegmentedControl label={t("schedule.dayLabel")} value={day} onValueChange={setDay} items={dayItems} />
    <ContentTransition stateKey={`${day}:${status}`}>
      {status === "loading"
        ? <Stack gap="xs"><Skeleton shape="text" /><Skeleton shape="text" width="60%" /></Stack>
        : status === "failed"
          ? <Notice tone="danger" title={t("schedule.loadFailed")}
              action={<Button tone="secondary" size="small" onClick={retry}>{t("common.retry")}</Button>} />
          : items.length
            ? <List label={t("schedule.listLabel", { day: longDay })}>
                {items.map((item) => <ListRow key={item.id} title={item.title}
                  description={t("schedule.rowDescription", { time: item.time, place: item.place })} />)}
              </List>
            : <Stack gap="xs">
                <Text emphasis="strong">{t("schedule.empty")}</Text>
                <Text tone="muted">{t("schedule.emptyHint")}</Text>
              </Stack>}
    </ContentTransition>
  </Stack>
</Card>;
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Button } from "@hjmds/react-native/actions";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { Card, List, ListRow } from "@hjmds/react-native/data-display";
import { Notice, Skeleton } from "@hjmds/react-native/feedback";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";

const { width } = useWindowDimensions();
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";

<ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
  <Container gutter={gutter}>
    <Card title={t("schedule.title")} description={t("schedule.description")}>
      <Stack gap="md">
        <SegmentedControl label={t("schedule.dayLabel")} value={day} onValueChange={setDay} items={dayItems} />
        <ContentTransition stateKey={`${day}:${status}`}>
          {status === "loading"
            ? <Stack gap="xs"><Skeleton shape="text" accessibilityLabel={t("schedule.loading")} /><Skeleton shape="text" width="60%" /></Stack>
            : status === "failed"
              ? <Notice tone="danger" announcement="assertive" title={t("schedule.loadFailed")}
                  action={<Button tone="secondary" size="small" onPress={retry}>{t("common.retry")}</Button>} />
              : items.length
                ? <List label={t("schedule.listLabel", { day: longDay })}>
                    {items.map((item) => <ListRow key={item.id} title={item.title}
                      description={t("schedule.rowDescription", { time: item.time, place: item.place })} />)}
                  </List>
                : <Stack gap="xs">
                    <Text emphasis="strong">{t("schedule.empty")}</Text>
                    <Text tone="muted">{t("schedule.emptyHint")}</Text>
                  </Stack>}
        </ContentTransition>
      </Stack>
    </Card>
  </Container>
</ScrollView>;
```

날짜 목록(10월 5~9일)과 일정 다섯 개는 예시 데이터다. 날짜 계산·시간 표기(로케일)·일정 데이터는 제품 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `SegmentedControl` import | `@hjmds/react/selection` | `@hjmds/react-native/inputs` |
| `Card`·`List` import | `@hjmds/react/display` | `@hjmds/react-native/data-display` |
| 큰 글자 | `data-large-text`에서 세로로 쌓음 | 기준 글자 크기 이상에서 세로로 쌓음 |
| 트랙 padding·항목 간격 | CSS 2px | `spacing.xxs` 4 |
| 바깥 틀 | 제품 화면 레이아웃(문서 스크롤) | `ScrollView` > `Container` |
| 실패 Notice 발표 | `danger`는 늘 `role="alert"` | `announcement="assertive"`를 지정해야 발표(기본 `none`) |

## 함정

- 날짜를 빨리 바꾸면 이전 날짜 응답이 나중에 도착할 수 있다. 응답의 날짜가 현재 선택과 같을 때만 반영한다.
- 현재 스토리는 로컬 데이터라 로딩·실패 경로가 없고, 행 설명을 `` `${time} · ${place}` ``로 이어 붙인다.
