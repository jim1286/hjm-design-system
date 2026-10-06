# 단계별 드로어

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Sheet](../../sheet.md), [Steps](../../steps.md), `src/component-recipes.ts` `sheetRecipe`, `src/steps.ts`(`currentStepStatus`), `packages/react-native/src/overlays.tsx`(footer), `showcase/shared/family-drawer.ts`
- 스토리북: `배포/구성/입력과 작성/단계별 드로어`

## 언제 쓰나

초대 → 설정 → 확인처럼 짧은 단계 2~5개를 현재 화면을 떠나지 않고 하단 시트 안에서 차례로 진행할 때 쓴다.
단계마다 화면을 push할 만큼 내용이 크지 않고, 끝나면 원래 화면으로 돌아와 결과만 알리면 되는 설정 흐름이다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Container` · `ScrollView` | 시작 화면의 바깥 틀. 제품 화면이 소유한다 | [Container](../components/container.md), [화면 여백](../tokens/layout.md) |
| `Heading level="level2"`, `Text` | 시작 화면의 제목·설명 | [Heading](../components/heading.md), [Text](../components/text.md) |
| `Button` primary | 시트를 여는 트리거(시작 화면의 주 행동) | [Button](../components/button.md) |
| `Sheet` | 하단 시트. 제목·닫기·`footer`, 안전 영역·스크롤·`busy` | [Sheet](../components/sheet.md) |
| `Steps` | 현재 단계와 전체 단계 수, 실패하면 현재 단계 `error` | [Steps](../components/steps.md) |
| `ContentTransition preset="slide"` | 단계 본문 교체 | [ContentTransition](../components/content-transition.md) |
| `Heading level="level3"`, `Text` | 단계 본문 | [Heading](../components/heading.md), [Text](../components/text.md) |
| `Notice tone="danger"` | 저장 실패 문구(시트 안) | [Notice](../components/notice.md) |
| `Button` `ghost`·primary | 이전 · 계속/마치기. Sheet `footer`에 둔다 | [Button](../components/button.md) |
| `Text` 상태 문구 | 완료 결과(시작 화면) | [Text](../components/text.md) |

## 배치

```text
시작 화면 (제품 화면 바깥 틀 안)            하단 시트 (열림, Modal)
┌ Web 문서 스크롤 · Native ScrollView ┐    ┌──────────── backdrop ─────────────┐
│ ←gutter 16|20→ Container            │    │╭──────────────────────────────────╮│
│ ┌ Stack gap="xl" 24 ──────────────┐ │    ││ 함께하는 공간              [닫기] ││ ← 머리 고정, 최소 44
│ │ 공간 제목 (Heading level2)      │ │    ││──────────────────────────────────││
│ │ 설명 (Text)                     │ │    ││ ① 초대 ─ ② 설정 ─ ③ 확인         ││ ← Steps
│ │ [ 공간 설정하기 ] primary       │ │    ││          ↕ spacing.xl 24         ││   본문(스크롤)
│ │ 설정을 마쳤어요. (상태 문구)    │ │    ││ (실패 시 Notice danger)          ││
│ └─────────────────────────────────┘ │    ││ 단계 제목 (Heading level3)        ││ ┐ ContentTransition
└─────────────────────────────────────┘    ││ 단계 설명 (Text) ↕ spacing.md 16  ││ ┘ slide
                                           ││──────────────────────────────────││
                                           ││ footer Web: [이전][계속] 오른쪽   ││ ← 고정, 위 여백
                                           ││ footer Native: [   계속   ]       ││   (Native spacing.sm 12)
                                           ││                [   이전   ]       ││
                                           │╰──── 하단 안전 영역(시트가 더함) ─╯│
                                           └───────────────────────────────────┘
                                            radius xl 24, 좌우 spacing.lg 20, 최대 높이 90%, Web 최대 폭 640
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | 시작 화면: Web 문서 스크롤 > `Container size="reading"`, Native `ScrollView` > `Container size="reading"`. 시트: `Sheet`가 Modal로 화면 위에 뜨며 스크롤·안전 영역·키보드를 소유 | 시작 화면은 제품 화면 본문. 상단 안전 영역은 헤더(또는 [TopBar](../components/top-bar.md))가 맡는다 | 좌우 `Container gutter`: 폭 600 미만 `compact` 16, 이상 `regular` 20([화면 여백](../tokens/layout.md)). Native 위아래 `contentContainerStyle` `paddingVertical: spacing.lg` 20. 시트 안 inset은 제품이 다시 더하지 않는다 |
| 시작 화면 | `Stack gap="xl"` | 본문 흐름 안 | 자식 사이 `spacing.xl` 24 |
| 시트 표면 | `Sheet placement="bottom" size="auto"`(기본값) | 화면 아래에서 올라옴, 내용 높이 | radius `xl` 24, 최대 높이 90%. 좌우 `spacing.lg` 20·위아래 `spacing.sm` 12(두 플랫폼, `sheetRecipe.content`), Web 최대 폭 640 |
| 시트 머리 | Sheet `title`·`closeLabel` | 시트 맨 위 고정 | 최소 높이 `control.minTouchTarget` 44 |
| 단계 표시 | `Steps` | 본문 맨 위 | 항상 가로 한 줄, 아래 `spacing.xl` 24 |
| 단계 본문 | `ContentTransition` > `Stack gap="md"` | Steps 아래, 본문 스크롤 | 제목·설명 사이 `spacing.md` 16, `slide` 가로 16 이동 |
| 행동 | Sheet `footer` + Button ×2 | 시트 아래 고정(스크롤 밖) | Web 오른쪽 정렬 가로 [이전 ghost][계속 primary], 사이 `spacing.sm` 12. Native 세로 열 꽉 찬 폭 [계속]→[이전], 사이 `spacing.sm` 12, 위 `spacing.sm` 12. 높이 44 |
| 하단 안전 영역 | `Sheet` | 시트 아래 | Native `spacing.sm` 12 + inset, Web footer 아래 `spacing.lg` 20 + `env(safe-area-inset-bottom)` |

- 마지막 단계의 "설정 마치기"가 저장이므로 행동은 Sheet `footer`에 둔다([Sheet](../components/sheet.md) 꼭 지킬 것). 본문만 스크롤되고 행동은 큰 글자에서도 보인다.
- primary는 시작 화면의 트리거 하나, 시트 안의 "계속/마치기" 하나다. Sheet 안의 행동은 그 표면 안에서 primary 하나를 센다([Button](../components/button.md) 꼭 지킬 것의 예외).
- Native에서 본문이 길 수 있으면 `scrollable`을 켠다. 단계에 입력이 있으면 `keyboardAvoidance`도 함께 켜고 제품 키보드 처리는 두지 않는다.

## 흐름과 상태

1. 트리거를 누르면 단계를 0으로, 완료·실패 표시를 지우고 시트를 연다.
2. "계속"은 다음 단계로 간다. 첫 단계에서 "이전"은 `disabled`다.
3. 마지막 단계에서 주 행동 라벨이 "설정 마치기"로 바뀐다. 누르면 결과를 저장한다. 저장이 비동기면 저장 중 Sheet `busy`로 닫기를 막고 주 행동은 `loading`이다.
4. 저장이 성공하면 시트를 닫고 시작 화면에 완료 문구가 나타난다.
5. 저장이 실패(네트워크·서버 오류)하면 시트를 유지하고 본문에 `Notice tone="danger"`, Steps 현재 단계를 `currentStepStatus: "error"`로 둔다. 주 행동을 다시 누르면 재요청하고, 재요청도 실패하면 같은 상태를 유지한다.
6. 닫기 버튼·바깥·Escape/back으로 닫으면 저장하지 않는다(취소).

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 시작 화면만 보인다. 시트 닫힘 | — |
| 단계 진행 | Steps가 앞 단계 `complete`, 현재 `current`, 뒤 `pending`. 본문이 가로로 미끄러져 바뀐다 | Steps 접근성 이름 "3단계 중 2, 설정"(제품 `composeAccessibleName`). reduced motion이면 즉시 교체 |
| 진행 중 | 저장 중. 주 행동 `loading`, "이전" `disabled`, Sheet `busy`(닫기·바깥·back 막힘) | 포커스는 주 행동에 유지 |
| 실패 | 시트 유지, 본문에 `Notice tone="danger"`, Steps 현재 단계 `error`, 주 행동 다시 활성 | Native `Notice announcement="polite"`로 알림, Web Notice. 포커스 이동 없음 |
| 완료 | 시트가 닫히고 시작 화면에 완료 문구 | Web `Text role="status"`, Native live region + iOS 알림(새로 나타난 문구라 첫 렌더에도 알린다) |

- 단계 문구 키는 단계 id → 키 상수 표(`stepKey`)로 둔다. 템플릿 문자열 키(`` `space.setup.${id}.title` ``)는 키 추출·누락 검사가 찾지 못한다.
- 오류 문구는 제품이 지역화한다. raw exception을 그대로 보이지 않는다.

## 코드 골격

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { ContentTransition } from "@hjmds/react/content-transition";
import { Notice } from "@hjmds/react/feedback";
import { Heading } from "@hjmds/react/heading";
import { Container, Stack, Text } from "@hjmds/react/layout";
import { Sheet } from "@hjmds/react/overlays";
import { Steps } from "@hjmds/react/steps";

const stepIds = ["invite", "preferences", "review"] as const;
const stepKey = {
  invite: { label: "space.setup.invite.label", title: "space.setup.invite.title", body: "space.setup.invite.body" },
  preferences: { label: "space.setup.preferences.label", title: "space.setup.preferences.title", body: "space.setup.preferences.body" },
  review: { label: "space.setup.review.label", title: "space.setup.review.title", body: "space.setup.review.body" },
} as const;

const current = stepIds[step] ?? "invite";
const isLast = step === stepIds.length - 1;

<Container size="reading" gutter={gutter}>
  <Stack gap="xl">
    <Heading level="level2">{t("space.title")}</Heading>
    <Text as="p">{t("space.description")}</Text>
    <Button onClick={openSetup}>{t("space.setup.open")}</Button>
    {saved ? <Text as="p" role="status">{t("space.setup.saved")}</Text> : null}
  </Stack>
  <Sheet open={open} onOpenChange={setOpen} busy={saving}
    title={t("space.setup.title")} closeLabel={t("common.close")}
    footer={<>
      <Button tone="ghost" disabled={step === 0 || saving} onClick={back}>{t("common.back")}</Button>
      <Button loading={saving} onClick={isLast ? finish : next}>{isLast ? t("space.setup.finish") : t("common.next")}</Button>
    </>}>
    <Stack gap="xl">
      <Steps descriptor={{ steps: stepIds.map((id) => ({ id, label: t(stepKey[id].label) })), currentStepId: current, currentStepStatus: failed ? "error" : "current" }}
        statusLabels={statusLabels} composeAccessibleName={stepName} />
      {failed ? <Notice tone="danger" title={t("space.setup.failed")} /> : null}
      <ContentTransition stateKey={current} preset="slide">
        <Stack gap="md">
          <Heading level="level3">{t(stepKey[current].title)}</Heading>
          <Text as="p">{t(stepKey[current].body)}</Text>
        </Stack>
      </ContentTransition>
    </Stack>
  </Sheet>
</Container>
```

```tsx
// Native
import { ScrollView } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { Button } from "@hjmds/react-native/actions";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { Notice } from "@hjmds/react-native/feedback";
import { Heading } from "@hjmds/react-native/heading";
import { Sheet } from "@hjmds/react-native/overlays";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";
import { Steps } from "@hjmds/react-native/steps";

// stepIds · stepKey · current · isLast는 Web과 같다.

<ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
  <Container size="reading" gutter={gutter}>
    <Stack gap="xl">
      <Heading level="level2">{t("space.title")}</Heading>
      <Text>{t("space.description")}</Text>
      <Button onPress={openSetup}>{t("space.setup.open")}</Button>
      {saved ? <StatusText announceOnMount>{t("space.setup.saved")}</StatusText> : null}
    </Stack>
  </Container>
  <Sheet scrollable open={open} onOpenChange={setOpen} busy={saving}
    title={t("space.setup.title")} closeLabel={t("common.close")}
    footer={<>
      <Button loading={saving} onPress={isLast ? finish : next}>{isLast ? t("space.setup.finish") : t("common.next")}</Button>
      <Button tone="ghost" disabled={step === 0 || saving} onPress={back}>{t("common.back")}</Button>
    </>}>
    <Stack gap="xl">
      <Steps descriptor={{ steps: stepIds.map((id) => ({ id, label: t(stepKey[id].label) })), currentStepId: current, currentStepStatus: failed ? "error" : "current" }}
        statusLabels={statusLabels} composeAccessibleName={stepName} />
      {failed ? <Notice tone="danger" announcement="polite" title={t("space.setup.failed")} /> : null}
      <ContentTransition stateKey={current} preset="slide">
        <Stack gap="md">
          <Heading level="level3">{t(stepKey[current].title)}</Heading>
          <Text>{t(stepKey[current].body)}</Text>
        </Stack>
      </ContentTransition>
    </Stack>
  </Sheet>
</ScrollView>
```

단계 목록·문구·저장 동작은 제품 소유다. `gutter`는 폭 구간으로 고른다(`resolveWindowClass(width) === "compact" ? "compact" : "regular"`).
`StatusText`는 [저장과 재시도](action-recovery-save.md#공통-세션과-상태-알림)의 helper이며, 완료 문구는 새로 나타나므로 첫 렌더에도 알리게 한다(스토리 `PatternStatus announceOnMount`).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 본문 스크롤 | Sheet 본문이 스스로 스크롤 | `scrollable`(기본 `false`)을 켠다 |
| footer 배치 | 오른쪽 정렬 가로 줄 [보조][주] | 세로 열, 꽉 찬 폭, 주 행동 먼저 |
| 완료 알림 | `Text role="status"` | `accessibilityLiveRegion`(Android) + iOS `announceForAccessibilityWithOptions` |
| 실패 알림 | Notice | `Notice announcement="polite"` |
| 포커스 | `initialFocusRef`·`returnFocusRef`, focus trap | `returnFocusRef` |

## 함정

- 저장을 시트 닫힘 사유와 묶지 않는다. 닫기·바깥·back 닫힘은 취소다.
- 단계를 열 때마다 0으로 되돌린다. 이전 진행 상태가 남으면 마지막 단계에서 바로 열린다.
- 저장 중 `busy`를 빼면 사용자가 시트를 닫아 저장 결과를 볼 곳이 사라진다.
- 현재 스토리는 시작 화면에 바깥 틀(Container·ScrollView)이 없고 Storybook 프레임이 감싼다. 제품은 위 바깥 틀 행을 따른다.
- 현재 스토리는 저장이 동기라 진행 중·실패 상태가 없다.
