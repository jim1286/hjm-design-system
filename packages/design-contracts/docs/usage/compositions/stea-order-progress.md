# 처리 단계와 재시도

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Steps](../../steps.md), [Timeline](../../timeline.md), `showcase/web/src/patterns/stea-composition-previews.tsx`(`OrderProgressRetry`), `showcase/native/src/stea-composition-previews.tsx`(`OrderProgressRetry`, `Frame`), `showcase/shared/stea-compositions.ts`(`orderReducer`, `orderStepsDescriptor`), `src/steps.ts`, `src/container.ts`
- 스토리북: `배포/구성/피드백과 복구/처리 단계와 재시도`

## 언제 쓰나

주문·신청처럼 서버가 단계를 하나씩 확정하는 처리 과정을 보여 주고, 확정에 실패하면 같은 단계를 다시 요청하게 할 때 쓴다.
다음 단계는 서버가 확정한 뒤에만 완료로 바뀌고, 실패는 거절된 단계에 오류 표시만 남긴다. 사용자가 직접 입력하며
앞뒤로 오가는 마법사는 [Steps](../components/steps.md) 단독이나 `StepPlayer`를 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Card` | 제목("주문 처리 단계")·설명 틀 | [Card](../components/card.md) |
| `Steps` | 가로 단계 표시. `currentStepStatus`: `current` · `error` · `complete` | [Steps](../components/steps.md) |
| 진행 문구 `Text` | "서버 확인을 기다리는 중이에요." / "모든 단계가 확정됐어요." | [Text](../components/text.md) |
| `Notice` `tone="danger"` | 실패 안내(상태는 그대로이니 다시 요청) | [Notice](../components/notice.md) |
| `Button` primary | 다음 단계 요청 / 다시 요청. 요청 중 `loading` | [Button](../components/button.md) |
| `Button` secondary | 전체 완료 후 "처음부터 다시" | [Button](../components/button.md) |
| `Text` label muted + `Timeline` | "처리 기록" 제목과 확정·실패 사건 목록 | [Timeline](../components/timeline.md) |
| `Switch` | 스토리 전용 "다음 요청을 실패로 응답". 제품에 넣지 않는다 | [Switch](../components/switch.md) |
| `ScrollView` + `Container`(Native) | 바깥 틀. 세로 스크롤·위아래 여백, 좌우 gutter | [Container](../components/container.md), [화면 여백과 너비](../tokens/layout.md) |

## 배치

```text
Native 화면(ScrollView, 위아래 spacing.lg 20) > Container gutter 16(폭 < 600) · 20(폭 ≥ 600)
┌ Card ────────────────────────────────────────┐  body padding spacing.md 16
│ 주문 처리 단계                    (title)    │
│ 다음 단계는 서버가 확정한 뒤에만…  (muted)   │
│ (✓)──(2)──(3)──(4)──(5)          ← Steps     │
│ 접수 결제확인 상품준비 발송 도착              │
│               ↕ spacing.lg 20                │
│ 서버 확인을 기다리는 중이에요.  ← 진행 문구  │
│               ↕ spacing.lg 20                │
│ ┌ ! 서버가 이 단계를 확정하지 못했어요… ┐    │  ← 실패 때만 Notice danger
│ └───────────────────────────────────────┘    │
│               ↕ spacing.lg 20                │
│ [           다시 요청               ]        │  ← 주 행동(primary)
│               ↕ spacing.lg 20                │
│ 처리 기록                     (label muted)  │
│               ↕ spacing.lg 20                │
│ ● 접수 · 주문을 받았어요.        ← Timeline  │
│ ● 결제 확인 실패 · 단계는 바뀌지 않았어요.   │
└──────────────────────────────────────────────┘
  고정 영역 없음. 기록이 길어지면 화면 스크롤로 내려간다. 안전 영역은 화면 골격이 맡는다
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web: 제품 화면 레이아웃(문서 스크롤). Native: `ScrollView` > `Container` | 이 구성은 바깥 폭·여백을 정하지 않는다(스토리는 Card만 그린다). Native는 Card를 `ScrollView` 안 [Container](../components/container.md)에 둔다. 입력이 없어 키보드 처리는 없다. 안전 영역은 화면 골격(내비게이션 헤더·탭 바)이 맡는다 | Native ScrollView 위아래 `spacing.lg` 20, Container gutter 폭 600 미만 `compact` 16 · 이상 `regular` 20(`layout.pagePadding`) |
| 틀 | `Card` | 바깥 틀 안, 스크롤과 함께 | body padding `spacing.md` 16, 안쪽 `Stack gap="lg"` 20 |
| 단계 | `Steps` | Card 머리 아래 맨 위 | 단계 사이 `stepsRecipe.gap` `spacing.xs` 8, 표시 원 `glyph.md` |
| 진행 | 진행 문구 | 단계 아래 | `spacing.lg` 20 |
| 실패 | `Notice` danger | 진행 문구 아래, 실패 때만 | `spacing.lg` 20 |
| 행동 | `Button` primary(또는 완료 후 secondary) | Notice 아래, 꽉 찬 폭(`Stack` 기본 `align="stretch"`가 채우므로 Web `layoutStyle`·Native `fullWidth`를 따로 주지 않는다) | 높이 44, 행동 묶음 안 `Stack gap="sm"` 12 |
| 기록 | label + `Timeline` | 맨 아래, 스크롤 | `spacing.lg` 20, 기록은 아래로 쌓인다 |

- 실패 Notice는 버튼 **위**에 둔다. 사용자가 이유를 읽은 다음 "다시 요청"에 닿는다.
- 기록이 길어지면 Card 밖 화면 스크롤로 내려간다. 단계·행동은 위에 남는다(고정은 아님).

## 흐름과 상태

1. 첫 단계("접수")가 확정된 채 열리고 커서는 다음 단계("결제 확인")에 있다.
2. "다음 단계 요청"을 누르면 요청 중이 된다(버튼 `loading`, 진행 문구).
3. 서버가 확정하면 커서가 다음 단계로 가고 기록에 success 항목이 붙는다.
4. 서버가 거절하면 커서는 그대로, 그 단계에 `error` 표시, danger Notice, 기록에 attention 항목. 버튼 라벨이 "다시 요청"이 된다.
5. 네트워크·서버 오류로 판정을 받지 못하면 단계 표시는 그대로 두고 Notice로 알린 뒤 "다시 요청"을 받는다.
6. 마지막 단계까지 확정되면 `currentStepStatus="complete"`로 전체 완료를 표시하고 버튼이 secondary "처음부터 다시"로 바뀐다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | Steps `current`, 버튼 "다음 단계 요청" | — |
| 진행 중 | 버튼 `loading`, 진행 문구 | 진행 문구가 Web `role="status"`, Native live region으로 읽힌다. 포커스는 버튼 유지 |
| 실패 | 서버 거절: 거절된 단계 `error`(라벨 "확인 필요"), Notice danger, 버튼 "다시 요청", 기록에 attention 항목 | Notice가 알린다(Web `danger`는 `role="alert"`, Native는 `announcement="assertive"`를 줘야 발표된다) |
| 요청 실패(네트워크·서버 오류) | 커서·단계 표시는 그대로(`current`), Notice danger에 연결 실패 문구, 버튼 "다시 요청". 서버가 판정하지 않았으므로 기록에 사건을 남기지 않는다 | 실패와 같다 |
| 완료 | 모든 단계 complete, 진행 문구 "모든 단계가 확정됐어요.", secondary 버튼 | 진행 문구가 읽힌다 |

- 요청 중 중복 요청은 상태 로직에서 무시한다. 버튼 `loading`만으로는 키보드 반복 입력을 막지 못한다.
- 문구 키는 상태별 상수로 둔다. 상태 이름으로 키를 조립하지 않는다.

| 상태 | 진행 문구 키 | Notice 키 | 버튼 키 |
| --- | --- | --- | --- |
| 기본 | — | — | `order.request` |
| 진행 중 | `order.requesting` | — | `order.request`(`loading`) |
| 실패(거절) | — | `order.failed` | `order.retry` |
| 요청 실패 | — | `order.requestFailed` | `order.retry` |
| 완료 | `order.done` | — | `order.restart` |

## 코드 골격

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { Card, Timeline } from "@hjmds/react/display";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Text } from "@hjmds/react/layout";
import { Steps } from "@hjmds/react/steps";

// 상태 → 문구 키
const noticeKey = { rejected: "order.failed", requestFailed: "order.requestFailed" } as const;
const progressKey = { requesting: "order.requesting", done: "order.done" } as const;

<Card title={t("order.title")} description={t("order.description")}>
  <Stack gap="lg">
    <Steps descriptor={{ steps, currentStepId, currentStepStatus }} statusLabels={statusLabels}
      composeAccessibleName={({ position, total, label }) => t("order.stepName", { position, total, label })} />
    {/* 알림 자리를 위해 status 영역은 늘 마운트한다 */}
    <Text role="status">{requesting ? t(progressKey.requesting) : done ? t(progressKey.done) : ""}</Text>
    {failure ? <Notice tone="danger" title={t(noticeKey[failure])} /> : null}
    <Stack gap="sm">
      {done
        ? <Button tone="secondary" onClick={restart}>{t("order.restart")}</Button>
        : <Button loading={requesting} onClick={request}>{failure ? t("order.retry") : t("order.request")}</Button>}
    </Stack>
    <Text variant="label" tone="muted">{t("order.log")}</Text>
    <Timeline items={log} composeAccessibleName={({ position, total, label }) => t("order.logName", { position, total, label })} />
  </Stack>
</Card>;
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Button } from "@hjmds/react-native/actions";
import { Card, Timeline } from "@hjmds/react-native/data-display";
import { Notice } from "@hjmds/react-native/feedback";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";
import { Steps } from "@hjmds/react-native/steps";

const noticeKey = { rejected: "order.failed", requestFailed: "order.requestFailed" } as const;
const { width } = useWindowDimensions();
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";

<ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
  <Container gutter={gutter}>
    <Card title={t("order.title")} description={t("order.description")}>
      <Stack gap="lg">
        <Steps descriptor={{ steps, currentStepId, currentStepStatus }} statusLabels={statusLabels}
          composeAccessibleName={({ position, total, label }) => t("order.stepName", { position, total, label })} />
        {/* 빈 Text가 gap 하나만큼 틈을 남기므로 문구가 있을 때만 그린다. */}
        {requesting || done ? <Text accessibilityLiveRegion="polite">{done ? t("order.done") : t("order.requesting")}</Text> : null}
        {failure ? <Notice tone="danger" announcement="assertive" title={t(noticeKey[failure])} /> : null}
        <Stack gap="sm">
          {done
            ? <Button tone="secondary" onPress={restart}>{t("order.restart")}</Button>
            : <Button loading={requesting} onPress={request}>{failure ? t("order.retry") : t("order.request")}</Button>}
        </Stack>
        <Text variant="label" tone="muted">{t("order.log")}</Text>
        <Timeline items={log} composeAccessibleName={({ position, total, label }) => t("order.logName", { position, total, label })} />
      </Stack>
    </Card>
  </Container>
</ScrollView>;
```

단계 이름·문구, 실패 스위치, 900ms 지연은 예시다. 단계 정의와 확정·거절 판단은 서버와 제품 소유다.
상태 전이는 스토리의 `orderReducer`·`orderStepsDescriptor`를 참고한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 진행 문구 자리 | 빈 `role="status"`를 항상 마운트(알림 자리 유지) | 문구가 있을 때만 마운트(iOS는 live region을 무시하고 빈 Text가 틈을 남김, 2026-10-02 시뮬레이터 확인) |
| 이벤트 | `onClick` | `onPress` |
| 바깥 틀 | 제품 화면 레이아웃(문서 스크롤) | `ScrollView` > `Container` |
| 실패 Notice 발표 | `danger`는 늘 `role="alert"` | `announcement="assertive"`를 지정해야 발표(기본 `none`) |

## 함정

- 실패할 때 커서를 옮기거나 완료 표시를 먼저 그리지 않는다. 서버가 거절한 단계를 사용자가 끝난 것으로 오해한다.
- `Timeline` 이름은 단계 이름과 다르게 짓는다("기록 N개 중 M번째"). "5단계 중"으로 읽히면 단계 수와 섞인다.
- Steps는 세로 방향·클릭 이동을 지원하지 않는다(`src/steps.ts`). 단계 사이를 눌러 이동하는 UI를 기대하지 않는다.
- 현재 스토리에는 네트워크·서버 오류로 요청 자체가 실패하는 경로가 없다(실패는 스위치로 만든 거절뿐이다).
- Web은 빈 `role="status"` Text도 Stack 자식이라 gap 한 칸(`spacing.lg` 20)이 Steps 아래에 남는다.
