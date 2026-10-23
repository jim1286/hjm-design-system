# Steps

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.41.2 이후)
- 검토일: 2026-10-23
- 근거: [Steps](../../steps.md), [StepPlayer](../../step-player.md), `src/steps.ts`(`stepsRecipe`)
- 스토리북: `배포/컴포넌트/탐색/단계 탐색`, `배포/컴포넌트/상태와 알림/단계별 진행 표시`

## 언제 쓰나

여러 단계로 된 **선형 흐름에서 지금 어디인지** 보여 줄 때 쓴다. 온보딩(환영 → 구단 → 알림 → 완료),
가입·주문 처리 단계가 여기에 속한다. 순서가 있는 설계 설명은 `navigationMode: "free"`로 자유롭게 탐색할 수 있다. 기본은 표시 전용이고, `onStepPress`를 주면 **이미 지난 단계만** 눌러 그 단계로
돌아갈 수 있다(1.31.0, 단계형 작성).

기본 `focus`는 현재 번호만 중립색 원으로 채우고 완료 체크·예정 번호의 무게를 낮춘다.
본문 공간이 필요하면 `compact`, 현재 단계 본문을 같은 목록 안에서 펼치려면 `vertical`을 선택한다.

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
| `descriptor.navigationMode` | `linear` · `free` | `linear` | `free`는 읽기 흐름에서 모든 단계 선택. 입력 검증이 필요한 흐름은 기본값 유지 |
| `descriptor.currentStepStatus` | `current` · `error` · `complete` | `current` | 커서 단계의 상태 |
| `descriptor.steps` | 단계 배열 | — (필수) | 2개 이상, `id`는 고유하고 앞뒤 공백이 없어야 한다. 어기면 `RangeError`/`TypeError` |
| `descriptor.steps[]` | `{ id, label, description? }` | — | — |
| `statusLabels` | `{ pending, current, complete, error }`(모두 `string`) | — (필수) | 상태를 읽는 문구 |
| `composeAccessibleName` | `(info: { position: number, total: number, label: string }) => string` | — (필수) | `position`은 1부터 |
| `presentation` | `focus` · `compact` · `vertical` | `focus` | 같은 커서와 이동 규칙을 세 표현으로 제공 |
| `overviewLabel` | `string` | — | compact의 전체 단계 펼침 버튼에 쓰는 제품 번역 문구. compact에서는 필수 |
| `renderStepContent` | `(id) => ReactNode` | 없음 | vertical 전용 현재 단계 본문 슬롯. 다른 단계는 접힘; 초안은 상위 제품 상태로 보관 |
| `renderMark` | `(status: StepStatus, position: number) => ReactNode` | `✓`·`!`·번호 | 원 안 표시를 바꾸며 제품 그림 공간 44를 보존한다 |
| `onStepPress` | `(id) => void` | 없음 | 1.31.0. 기본 linear에서 커서 앞 단계(`revisitable`, 상태는 늘 `complete`)만 원·라벨 전체가 한 버튼이 되고 누르면 그 `id`를 넘긴다. linear의 현재·다음 단계는 표시 전용으로 남는다. free에서는 현재·다음도 버튼이다. 버튼 이름은 `composeAccessibleName` 결과, 상태 문구는 설명(Web `aria-describedby`·Native `accessibilityHint`). 흐름이 잠긴 동안(제출 중)은 prop을 빼면 모두 표시 전용이 된다 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 루트 배치. Web·Native 모두 |
| `style`(Native) | 지원하지 않음 | — | 제거된 속성 — `layoutStyle`. 현재 공개 props에서 제거되었다 |
| `StepPlayer` `progress`·`playing` | `number`(0~1)·`boolean` | — (필수) | 호스트 소유 |
| `StepPlayer` `onPlayingChange`·`onReplay` | `(playing: boolean) => void`·`() => void` | — (필수) | 재생/일시정지·다시 보기 요청 |
| `StepPlayer` `labels` | `{ play, pause, replay, progress }` | — (필수) | — |

`focus`는 가로 레일, `compact`는 현재 순서·라벨·상태와 4 높이 분할 막대, `vertical`은 세로 레일이다.
compact는 `overviewLabel` 버튼으로 같은 단계 목록을 펼친 뒤 지난 단계를 누를 수 있다.
vertical의 `renderStepContent(id)`는 현재 커서에만 표시되며 버튼 내부에 중첩되지 않는다.
잘못된 presentation, 비어 있는 compact overviewLabel, vertical 외 renderStepContent는 오류다.
linear는 지난 단계만 돌아가고 free는 설명 읽기에서 모든 단계를 선택한다. handler를 생략하면 표시 전용이다.
제품은 커서와 초안을 controlled state로 소유한다. 예: `presentation="compact" overviewLabel={t("allSteps")}`,
`presentation="vertical" renderStepContent={id => renderControlledForm(id)}`.
실행 예제는 Web·Native의 `showcase/*/src/components/steps-presentation-preview.tsx`에 있다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Web은 연결선이 있는 앞 단계가 남은 폭을 균등하게 나누고 마지막 단계는 내용 폭(전체 폭/단계 수 이내)만 사용한다. 첫·마지막 표지는 양끝에 맞춘다. Native도 마지막 칸은 내용 폭만 사용한다. 숫자 원(indicator) 32(`glyph.xl`), 제품 그림은 44(`glyph.xxl`), 연결선 1(`stroke.default`), 오류 원 테두리 2(`stroke.strong`), 현재 원은 중립 채움과 바깥 링. compact 막대 높이 4(`spacing.xxs`). 누를 수 있는 단계는 칸 전체가 버튼이고 최소 높이 44(`stepsRecipe.press.minTouchTarget`) | `stepsRecipe`, `styles.css` `.hjm-steps*`, `react-native/src/steps.tsx` |
| 간격 | 좌우 안쪽 여백 `spacing.md` 16(`stepsRecipe.paddingInline`), 가로 원과 글자 사이 `spacing.xs` 8(`stepsRecipe.gap`), 세로 표지 옆 본문 간격·단계 간격 `spacing.md` 16 | `stepsRecipe.gap` |
| 순서·정렬 | 흐름 화면의 맨 위(머리 아래, 본문 위)에 배치. focus는 가로 레일, compact는 요약과 펼침 버튼, vertical은 현재 본문을 표지 아래에 배치한다. 화면 아래 행동 버튼과 떨어뜨리고, 같은 수준 화면 사이 이동(탭)으로 쓰지 않는다 | — |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 라벨·설명은 줄바꿈된다(`overflow-wrap: anywhere`). 이름이 길거나 단계가 많으면 compact 또는 vertical을 선택한다 | `styles.css` `.hjm-steps__label` |

상태 전환은 `stepsRecipe.transitionDuration` = `motion.normal` 200ms. Web 표지·연결선 색과 눌림, Native 상태 변경의 짧은 opacity와 눌림으로 표현한다. reduced motion에서는 이동 연출을 생략한다.

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

2026-10-19 포트폴리오 폭 확인: Web 마지막 단계에 연결선 없는 균등 칸이 남아 표지가 본문 오른쪽 끝보다 한 칸 안쪽에 보였다. Web renderer가 단계 수를 전달하고 끝 칸만 내용 폭으로 배치하도록 수정했다. 제품별 CSS 보정이나 공개 prop 추가는 하지 않는다.

2026-10-19 포트폴리오: 사용자가 단계 클릭 시 해당 설명만 표시하도록 요청했다. `navigationMode: "free"`를 명시한 읽기 흐름에 한해 모든 단계가 버튼이 된다. 기본 linear와 handler 생략 시 표시 전용 동작은 유지한다. Web 현재 버튼은 aria-current, Native는 selected를 제공한다.

2026-10-19 스핀트 실제 화면 피드백: 수평 행 gap으로 끊기던 연결선을 없애고 마지막 표지 앞의 연결 구간을 유지한다. Native도 마지막 열에 균등 여분 폭을 남기지 않아 첫·마지막 표지가 본문 양끝에 맞는다. 내부 문구 간격과 기본 이동 계약은 유지한다.

2026-10-21 스핀트 실제 화면 피드백: 24pt 원에 꽃 표시가 붙어 식별하기 어렵고 양끝이 화면 가장자리에 가까웠다. 공통 recipe의 원을 `glyph.xxl` 44pt로 키우고 좌우 안쪽 여백 `spacing.md` 16pt를 두었다. Web·Native에 동일 적용하며 제품 그림은 테두리 안 여유를 두고 배치한다. 개발 소스 변경이며 미게시다.


2026-10-23 사용자 시안 선택: 포커스 레일을 기본으로, 컴팩트 챕터·펼쳐지는 단계를 옵션으로 요청했다.
원·연결선·완료와 현재의 시각 무게가 비슷하던 문제를 공통 recipe에서 고친다. 현재는 `content.primary` 채움과 `canvas` 글자,
완료·도달선은 중립색, 오류는 danger다. 숫자만 32로 줄이고 Spint 꽃 그림의 44 공간과 터치 최소값은 보존한다.
앞선 44 숫자·초록 완료·브랜드 현재 테두리 기본 표현을 대체하는 미게시 개발 변경이다.
