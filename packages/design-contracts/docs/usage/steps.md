# Steps 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Steps](../steps.md), [StepPlayer](../step-player.md)

## 언제 쓰나

여러 단계로 된 **선형 흐름에서 지금 어디인지** 보여 줄 때 쓴다. 온보딩(환영 → 구단 → 알림 → 완료),
가입·주문 처리 단계가 여기에 속한다. 읽기 전용이며 단계를 눌러 이동하지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 단계 이름 없이 진행률만 | [Progress](progress.md) |
| 시간 순 사건 기록 | [Timeline](timeline.md) |
| 같은 수준의 화면 사이 이동 | [Tabs](tabs.md), [SegmentedControl](segmented-control.md) |
| 페이지 번호 이동 | [Pagination](pagination.md) |
| 화면을 가리키며 하는 기능 안내 | [Tour](tour.md) |
| 온보딩 화면 전체 | [OnboardingScreen](onboarding-screen.md) |
| 흐름이 끝난 뒤의 결과 | [Result](result.md) (또는 `currentStepStatus: "complete"`) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Steps` | `@hjmds/react`, `/navigation`, `/steps` | `@hjmds/react-native`, `/steps` | 기본 |
| `StepPlayer` | `/step-player` | `/step-player` | 재생형 단계 소개(optional-extension) |

`StepPlayer`는 granular subpath로만 import 된다. Steps·Progress·Button·Stack만 합성하므로 추가 peer는 없다.

## 최소 사용 예

```tsx
// Web
import { Steps } from "@hjmds/react/steps";

<Steps
  descriptor={{
    currentStepId: "team",
    steps: [
      { id: "welcome", label: t("onboarding.welcome") },
      { id: "team", label: t("onboarding.team") },
      { id: "alerts", label: t("onboarding.alerts") },
    ],
  }}
  statusLabels={{
    pending: t("steps.pending"), current: t("steps.current"),
    complete: t("steps.complete"), error: t("steps.error"),
  }}
  composeAccessibleName={({ position, total, label }) => t("steps.name", { position, total, label })}
/>
```

```tsx
// Native — props가 같다
import { Steps } from "@hjmds/react-native/steps";

<Steps descriptor={descriptor} statusLabels={statusLabels} composeAccessibleName={composeStepName} />
```

## 축과 기본값

- 상태는 단계별로 넘기지 않는다. `currentStepId` 하나와 `currentStepStatus`(`current` 기본 · `error` · `complete`)로
  앞은 `complete`, 커서는 지정 상태, 뒤는 `pending`이 유도된다.
- 단계는 2개 이상, `id`는 고유하고 앞뒤 공백이 없어야 한다. 어기면 `RangeError`/`TypeError`다.
- `renderMark(status, position)`로 원 안 표시(기본 `✓`·`!`·번호)를 바꿀 수 있다.
- 방향·clickable·variant 축은 없다(계약에서 배제). 항상 가로 한 줄이다.

## 꼭 지킬 것

- `statusLabels` 네 개와 `composeAccessibleName`은 필수다. "3단계 중 2단계" 같은 어순은 제품이 i18n으로 조립한다.
- 이전 단계로 가는 행동은 Steps 밖의 [Button](button.md)으로 둔다.
- `StepPlayer`는 타이머가 없다. `progress`(0~1)·`playing`·커서를 호스트가 소유하고, `onPlayingChange`·`onReplay`에서
  직접 상태를 바꾼다. `labels`(`play`·`pause`·`replay`·`progress`)는 비면 `TypeError`, `progress`가 범위를 벗어나면 `RangeError`다.
- 실제 비동기 작업의 완료를 `StepPlayer` 시계로 추정하지 않는다([계약](../step-player.md)).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구조 | `<ol>`, 현재 단계 `aria-current="step"`, 상태 문구는 숨은 텍스트 | `accessibilityRole="summary"`, 단계마다 이름 + `accessibilityHint`에 상태 문구 |
| 스타일 | `className`·`style`(HTML 속성) | `style` |
| ref | `forwardRef`(`ol`) | 없음 |
| import 경로 | root, `/navigation`, `/steps` | root, `/steps`(`/navigation` 없음) |
