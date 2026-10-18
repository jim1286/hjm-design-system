# Steps

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-18
- 근거: [Steps](../../steps.md), [StepPlayer](../../step-player.md), `src/steps.ts`(`stepsRecipe`)
- 스토리북: `배포/컴포넌트/탐색/단계 탐색`, `배포/컴포넌트/상태와 알림/단계별 진행 표시`

## 언제 쓰나

여러 단계로 된 **선형 흐름에서 지금 어디인지** 보여 줄 때 쓴다. 온보딩(환영 → 구단 → 알림 → 완료),
가입·주문 처리 단계가 여기에 속한다. 기본은 표시 전용이고, `onStepPress`를 주면 **이미 지난 단계만** 눌러 그 단계로
돌아갈 수 있다(1.31.0, 단계형 작성).

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 단계 이름 없이 진행률만 | [Progress](progress.md) |
| 시간 순 사건 기록 | [Timeline](timeline.md) |
| 같은 수준의 화면 사이 이동 | [Tabs](tabs.md), [SegmentedControl](segmented-control.md) |
| 페이지 번호 이동 | [Pagination](pagination.md) |
| 화면을 가리키며 하는 기능 안내 | [Tour](tour.md) |
| 흐름이 끝난 뒤의 결과 | [Result](result.md) (또는 `currentStepStatus: "complete"`) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Steps` | 기본 | `@hjmds/react`, `/navigation`, `/steps` | `@hjmds/react-native`, `/steps` |
| `StepPlayer` | 확장(재생형 단계 소개, optional-extension) | `/step-player` | `/step-player` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor.currentStepId` | 단계 `id` | — (필수) | 상태는 단계별로 넘기지 않는다. 앞은 `complete`, 커서는 지정 상태, 뒤는 `pending`이 유도된다 |
| `descriptor.currentStepStatus` | `current` · `error` · `complete` | `current` | 커서 단계의 상태 |
| `descriptor.steps` | 단계 배열 | — (필수) | 2개 이상, `id`는 고유하고 앞뒤 공백이 없어야 한다. 어기면 `RangeError`/`TypeError` |
| `descriptor.steps[]` | `{ id, label, description? }` | — | — |
| `statusLabels` | `{ pending, current, complete, error }`(모두 `string`) | — (필수) | 상태를 읽는 문구 |
| `composeAccessibleName` | `(info: { position: number, total: number, label: string }) => string` | — (필수) | `position`은 1부터 |
| `renderMark` | `(status: StepStatus, position: number) => ReactNode` | `✓`·`!`·번호 | 원 안 표시를 바꾼다 |
| `onStepPress` | `(id) => void` | 없음 | 1.31.0. 커서 앞 단계(`revisitable`, 상태는 늘 `complete`)만 원·라벨 전체가 한 버튼이 되고 누르면 그 `id`를 넘긴다. 현재·다음 단계는 표시 전용으로 남는다(앞으로 건너뛰면 검증을 지나친다). 버튼 이름은 `composeAccessibleName` 결과, 상태 문구는 설명(Web `aria-describedby`·Native `accessibilityHint`). 흐름이 잠긴 동안(제출 중)은 prop을 빼면 모두 표시 전용이 된다 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 루트 배치. Web·Native 모두 |
| `style`(Native) | 지원하지 않음 | — | 제거된 속성 — `layoutStyle`. 현재 공개 props에서 제거되었다 |
| `StepPlayer` `progress`·`playing` | `number`(0~1)·`boolean` | — (필수) | 호스트 소유 |
| `StepPlayer` `onPlayingChange`·`onReplay` | `(playing: boolean) => void`·`() => void` | — (필수) | 재생/일시정지·다시 보기 요청 |
| `StepPlayer` `labels` | `{ play, pause, replay, progress }` | — (필수) | — |

방향·variant 축과 앞으로 건너뛰는 이동은 없다(계약에서 배제). 항상 가로 한 줄이다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 단계마다 같은 폭(`minmax(0, 1fr)`, Native `flex: 1`). 원(indicator) 24(`glyph.md`), 연결선 1(`stroke.default`), 현재·오류 단계의 원 테두리 2(`stroke.strong`). 누를 수 있는 단계는 칸 전체가 버튼이고 최소 높이 44(`stepsRecipe.press.minTouchTarget`) | `stepsRecipe`, `styles.css` `.hjm-steps*`, `react-native/src/steps.tsx` |
| 간격 | 단계 사이·원과 글자 사이 `spacing.xs` 8(`stepsRecipe.gap`) | `stepsRecipe.gap` |
| 순서·정렬 | 흐름 화면의 맨 위(머리 아래, 본문 위)에 가로 한 줄. 화면 아래 행동 버튼과 떨어뜨리고, 같은 수준 화면 사이 이동(탭)으로 쓰지 않는다 | — |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 라벨·설명은 줄바꿈된다(`overflow-wrap: anywhere`). 좁은 폭에서 라벨이 세 줄 이상이 되면 라벨을 줄이거나 [Progress](progress.md)로 바꾼다. 세로 배치 축은 없다 | `styles.css` `.hjm-steps__label` |

## 꼭 지킬 것

- `statusLabels` 네 개와 `composeAccessibleName`은 필수다. "3단계 중 2단계" 같은 어순은 제품이 i18n으로 조립한다.
- 바로 앞 단계로 가는 주 행동은 Steps 밖에 둔다(단계형 작성은 [EditorScreen](editor-screen.md) `stepBack` 헤더 뒤로, 온보딩은 "이전" [Button](button.md)). `onStepPress`는 여러 단계 앞으로 한 번에 돌아가는 보조 길이다.
- 누를 수 있는 단계 표시를 제품이 Pressable·button으로 다시 그리지 않는다. 지난 단계·현재·다음의 구분과 이름은 HJM이 만든다.
- `StepPlayer`는 타이머가 없다. `progress`(0~1)·`playing`·커서를 호스트가 소유하고, `onPlayingChange`·`onReplay`에서
  직접 상태를 바꾼다. `labels`(`play`·`pause`·`replay`·`progress`)는 비면 `TypeError`, `progress`가 범위를 벗어나면 `RangeError`다.
- 실제 비동기 작업의 완료를 `StepPlayer` 시계로 추정하지 않는다([계약](../../step-player.md)).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구조 | `<ol>`, 현재 단계 `aria-current="step"`, 상태 문구는 숨은 텍스트. 누를 수 있는 단계는 `<li>` 안 `<button>`(이름 = 단계 이름, 설명 = 상태 문구) | `accessibilityRole="summary"`, 단계마다 이름 + `accessibilityHint`에 상태 문구. 누를 수 있는 단계는 `Pressable` `button` |
| 스타일 | `className`·`style`(HTML 속성), 배치는 `layoutStyle` | 배치는 `layoutStyle`(`style`은 제거된 속성) |
| ref | `forwardRef`(`ol`) | 없음 |
| import 경로 | root, `/navigation`, `/steps` | root, `/steps`(`/navigation` 없음) |

## 근거

- `onStepPress`(1.31.0): 2026-10-18 spint 작성(색 → 이모지 → 글)이 지난 단계를 눌러 돌아가려고 단계 레일 전체를 PressableScale로 직접 그렸다. 계약은 "필요해지면 추가"로 clickable을 미뤄 두었고([계약](../../steps.md#공개한-축--배제한-축)), 앞으로 건너뛰기는 검증을 지나치므로 커서 앞 단계만 연다.
