# 온보딩

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screen-flows.tsx`(`OnboardingScreen`), 예제 `showcase/*/screen-flow-previews.tsx`(`OnboardingFlowPreview`)·`showcase/shared/onboarding-pattern.ts`(주제·요약). 2026-10-06 사용자 승인으로 실험 `기본 흐름/온보딩`(OnboardingScreen)을 배포하면서 같은 일을 직접 조립하던 배포 `화면/온보딩`을 대체했다(Web id `patterns-onboarding` 보존, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/소개/온보딩`

## 목적

첫 실행 사용자를 몇 단계(소개 → 관심 주제 → 시작)로 안내하고 마지막 단계에서 완료를 저장하는 화면을 OnboardingScreen 하나로 구성한다.
단계 제목·설명은 화면 맨 위, 진행 문구는 그 아래에 둔다. Web은 머리를 고정하고 Native는 제목·설명·진행을 본문과 함께 스크롤한다. 이동 버튼은 footer에 고정한다. 권한 요청·로그인·가입은
이 화면에 없다([권한 안내](flow-permission.md), [로그인](common-login.md)).
스토리는 `기본`(1단계부터 직접 넘기기), `관심 주제 고르기`(2단계를 바로 연 상태), `실패와 복구`(다음 완료 저장 실패 → 다시 시작하기)다.
2026-10-06 배포 직접 조립 온보딩(Steps·ContentTransition·여러 개 고르는 주제 버튼)을 이 항목으로 합쳤고, 그 고유 상태인
관심 주제 여러 개 고르기는 OnboardingScreen 2단계의 Chip 다중 선택으로 옮겼다(두 플랫폼 `관심 주제 고르기` 스토리가 같은 화면을 연다).
단계·주제·문구·저장은 제품이 공급한다.

## 영역 구조

```text
좁은 폭(Native·모바일 Web) — host가 남은 높이·safe area·키보드를 준다
┌ OnboardingScreen = ScreenLayout(최대 720, 바깥 padding spacing.md 16) ┐
│ 머리(고정)                                                          │
│   단계 제목 (title)                         [건너뛰기] ← skip, ghost │
│   단계 설명 (description)                                           │
│ 진행 문구(고정 notice): "2 / 3"  Text caption muted                  │
├──────────────────────────── 본문 스크롤 ──────────────────────────────┤
│ 단계 content(제품)                                                  │
│   1단계: 소개 그림 + 짧은 설명                                        │
│   2단계: 관심 주제 [일상] [여행] [독서] [아이디어] ← Chip multiple, wrap │
│   3단계: 고른 주제 요약                                               │
│          (완료 저장 실패면) Notice danger + 다시 시도                   │
├──────────────────────────── footer(고정, 위 테두리 1) ─────────────────┤
│ [          다음 / 시작하기          ]  ← primary, 마지막 단계는 complete │
│ [               이전                ]  ← ghost, 첫 단계에는 없음        │  사이 spacing.sm 12
└ 아래 safe area(Web은 footer padding이 늘어난다) ──────────────────────┘
```

넓은 폭 Web도 한 열이다. ScreenLayout이 `layout.readingMaxWidth` 720으로 폭을 묶고 가운데 둔다.

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | OnboardingScreen(내부 ScreenLayout `scroll="screen"`) | route 본문. host가 남은 높이·safe area·키보드를 준다 | 폭 최대 720, 바깥 padding `spacing.md` 16([ScreenLayout 배치](../components/screen-layout.md#배치)). 화면 props는 `layoutStyle`만 받는다 |
| 머리 | `steps[index].title`·`description` + `skip`(ghost Button) | 맨 위, Web 고정·Native 본문 스크롤 | 제목 열 최소 120 × 글자 배율, 모자라면 건너뛰기가 다음 줄로 내려간다 |
| 진행 문구 | `progressLabel(current, total)` → Text `variant="caption" tone="muted"` | 머리 아래, Web notice 고정·Native 본문 스크롤 | 좌우 16 |
| 단계 본문 | `steps[index].content` | 진행 문구 아래, 본문 스크롤 | 본문 안 간격은 제품 소유. 예제는 Stack `gap="lg"` 20 |
| 관심 주제 | Stack `axis="inline" wrap gap="xs"`(Web `role="group"` + 이름) > [Chip](../components/chip.md) `selectionMode="multiple"` | 2단계 content 안 | 칩 높이 `small` 36(Native hitSlop으로 터치 44), 사이 `spacing.xs` 8 |
| 저장 실패 | [Notice](../components/notice.md) `tone="danger"` + `action` | 마지막 단계 content 맨 아래 | 본문 Stack 간격을 따른다 |
| footer | Stack `gap="sm"` > Button primary(다음·완료) → Button ghost(이전) | 맨 아래, 고정 | 사이 `spacing.sm` 12, 위 테두리 1 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 다음 | `nextLabel` → Button primary | footer 첫째 | 마지막 단계 전까지 1 |
| 완료(시작하기) | `complete` → Button primary, `pending`이면 `loading`·비활성 | footer 첫째(마지막 단계) | 1. 저장 중 중복 실행을 막는다 |
| 이전 | `backLabel` → Button ghost | footer 둘째 | 첫 단계에는 없다(숨김) |
| 건너뛰기 | `skip` → Button ghost | 머리 끝(actions) | 선택. 1 |
| 관심 주제 고르기 | Chip `selectionMode="multiple"`(checkbox 역할) | 2단계 본문 | 주제 수만큼, 여러 개 선택. 선택 상태는 제품이 든다 |
| 다시 시도 | 실패 Notice `action` > Button `tone="secondary" size="small"` | 마지막 단계 본문 | 실패일 때만 1. footer의 완료를 다시 눌러도 같다 |
| 파괴 행동 | — | — | 없음 |

한 단계에 primary는 footer의 다음·완료 하나다. 진행·이동이 footer에 고정돼 단계 본문이 바뀌어도 버튼 자리가 흔들리지 않는다.

2026-10-06 관심 주제를 ghost+`selected` Button에서 Chip `multiple`로 바꿨다. 여러 개 고르는 선택은 checkbox 역할로 읽혀야 하는데
Button `selected`는 눌림 토글(`aria-pressed`)로 읽히고, 한 줄짜리 주제 선택에 CheckboxGroup은 세로 목록이라 화면을 많이 차지한다.

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 1단계: 소개 그림·설명, 진행 "1 / 3", footer에 다음만(이전 없음), 머리 끝 건너뛰기 | 다음 · 건너뛰기 |
| 관심 주제 고르기 | `관심 주제 고르기` 스토리: 2단계. 주제 칩을 눌러 켜고 끈다(여러 개, 처음엔 아무것도 고르지 않음). 고른 것이 없어도 다음으로 갈 수 있다 | 주제 토글 · 다음 · 이전 · 건너뛰기 |
| 로딩 | 주제 목록을 서버에서 받으면 받는 동안 주제 줄 자리에 [Skeleton](../components/skeleton.md). 완료 저장 중에는 `complete.pending`으로 완료 버튼 `loading` | 기다림 |
| 빈 | 주제를 하나도 고르지 않고 마지막 단계에 오면 요약 자리에 "관심 주제를 아직 선택하지 않았어요" 안내 | 이전 또는 시작하기 |
| 오류 | 완료 저장 실패: 마지막 단계에 머물고 고른 주제는 그대로 둔다. 마지막 단계 본문에 Notice `danger`(Native `announcement="assertive"` — 기본 `none`). 다시 실패하면 같은 자리 Notice를 유지한다(쌓지 않는다) | 다시 시도 1 |
| 실패와 복구 | `실패와 복구` 스토리: 다음 저장 실패를 예약한 뒤 시작하기 → 실패 문구 → 다시 시작하기로 완료 | 같은 완료 행동 |
| 완료 | 제품이 온보딩을 닫고 홈으로 보낸다. 예제는 "시작할 준비가 됐어요" 화면과 다시 열기 | — |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [OnboardingScreen](../components/onboarding-screen.md) | 필수 props·단계 범위·플랫폼 차이 |
| [ScreenLayout](../components/screen-layout.md) | 머리·notice·footer 고정, 본문 스크롤, 최대 폭 |
| [Button](../components/button.md) | 다음·완료·이전·건너뛰기, 다시 시도 |
| [Chip](../components/chip.md) | 관심 주제 여러 개 고르기 |
| [Notice](../components/notice.md) | 완료 저장 실패 |
| [Skeleton](../components/skeleton.md) | 주제 목록 로딩 |
| [Stack](../components/stack.md) | 단계 본문 세로 리듬, 주제 줄 |
| [Steps](../components/steps.md) | 단계 표시를 본문에 따로 그려야 할 때(OnboardingScreen은 진행 문구만 준다) |
| [권한 안내](flow-permission.md) | 온보딩 뒤 권한을 묻는 화면 |

## 코드 골격

단계·주제·문구는 제품 소유다. 진행 문구는 보간 키 하나로 만들고 키 문자열을 조립하지 않는다.

```tsx
// Web
import { OnboardingScreen } from "@hjmds/react/screen-flows";
import { Stack } from "@hjmds/react/layout";
import { Button } from "@hjmds/react/actions";
import { Chip } from "@hjmds/react/selection";
import { Notice } from "@hjmds/react/feedback";

const topicPicker = <Stack role="group" aria-label={t("onboarding.topics.label")} axis="inline" wrap gap="xs">
  {topics.map((topic) => <Chip key={topic.id} label={t(topic.labelKey)} selectionMode="multiple"
    selected={chosen.includes(topic.id)} onSelectedChange={() => toggleTopic(topic.id)} />)}
</Stack>;

<OnboardingScreen
  steps={[
    { id: "welcome", title: t("onboarding.welcome.title"), description: t("onboarding.welcome.body"), content: welcomeArt },
    { id: "topics", title: t("onboarding.topics.title"), description: t("onboarding.topics.body"), content: topicPicker },
    { id: "ready", title: t("onboarding.ready.title"), description: t("onboarding.ready.body"), content: <Stack gap="lg">
      {summary}
      {failed ? <Notice tone="danger" title={t("onboarding.error")}
        action={<Button tone="secondary" size="small" onClick={finish}>{t("common.retry")}</Button>} /> : null}
    </Stack> },
  ]}
  index={index}
  onIndexChange={setIndex}
  nextLabel={t("common.next")}
  backLabel={t("common.back")}
  complete={{ label: t("onboarding.start"), onAction: finish, pending: saving }}
  skip={{ label: t("common.skip"), onAction: finish }}
  progressLabel={(current, total) => t("onboarding.progress", { current, total })}
/>
```

```tsx
// Native
import { OnboardingScreen } from "@hjmds/react-native/screen-flows";
import { Stack } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
import { Chip } from "@hjmds/react-native/inputs";
import { Notice } from "@hjmds/react-native/feedback";

const topicPicker = <Stack axis="inline" wrap gap="xs">
  {topics.map((topic) => <Chip key={topic.id} label={t(topic.labelKey)} selectionMode="multiple"
    selected={chosen.includes(topic.id)} onPress={() => toggleTopic(topic.id)} />)}
</Stack>;

<OnboardingScreen
  steps={[
    { id: "welcome", title: t("onboarding.welcome.title"), description: t("onboarding.welcome.body"), content: welcomeArt },
    { id: "topics", title: t("onboarding.topics.title"), description: t("onboarding.topics.body"), content: topicPicker },
    { id: "ready", title: t("onboarding.ready.title"), description: t("onboarding.ready.body"), content: <Stack gap="lg">
      {summary}
      {failed ? <Notice tone="danger" announcement="assertive" title={t("onboarding.error")}
        action={<Button tone="secondary" size="small" onPress={finish}>{t("common.retry")}</Button>} /> : null}
    </Stack> },
  ]}
  index={index}
  onIndexChange={setIndex}
  nextLabel={t("common.next")}
  backLabel={t("common.back")}
  complete={{ label: t("onboarding.start"), onAction: finish, pending: saving }}
  skip={{ label: t("common.skip"), onAction: finish }}
  progressLabel={(current, total) => t("onboarding.progress", { current, total })}
/>
```

`finish`는 고른 주제와 완료 여부를 저장하고 성공하면 온보딩을 닫는다. 실패하면 `failed`를 켜고 `index`는 그대로 둔다.

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자(`textScale` 2) | 단계 제목이 줄바꿈되고 건너뛰기가 제목 아래 줄로 내려간다. 주제 줄은 여러 줄로 감긴다. footer는 고정이라 본문만 스크롤된다 |
| 다크 | semantic token만 쓰므로 따로 처리하지 않는다. 소개 그림·브랜드 이미지는 제품이 다크용을 준비한다 |
| 좁은 폭 | 320부터 한 열, 바깥 padding 16. footer 버튼은 세로로 쌓인다 |
| 넓은 폭 Web | 한 열 유지, 최대 720 가운데 |
| 키보드 | 단계 본문에 입력을 두면 Native host가 safe area와 키보드를 한 번 처리한다. Web은 포커스된 입력이 footer에 가리지 않는지 확인 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 이동 | `onClick` | `onPress` |
| 저장 실패 발표 | Notice `danger`가 `role="alert"`로 읽힌다 | Notice `announcement="assertive"`를 줘야 읽힌다 |
| 주제 칩 선택 콜백 | `onSelectedChange(next)` | `onPress(next, event)` |
| 주제 묶음 이름 | Stack `role="group"` + `aria-label` | 칩마다 `label`로 읽힌다(묶음 역할 없음) |

## 함정

- `notice` 자리는 진행 문구가 차지한다. 저장 실패를 띄우려고 OnboardingScreen에 notice를 넘길 수 없으니 마지막 단계 `content`에 둔다.
- 완료 `pending` 동안에도 이전 버튼은 막히지 않는다. 저장 중 단계 이동이 문제가 되면 `onIndexChange`에서 무시한다.
- 현재 스토리의 진행 문구는 `` `${index} / ${total}` `` 고정 문자열이다. 제품은 보간 키 하나(`onboarding.progress`)를 쓴다.
- Storybook은 실제 서버·라우터 연동 증거가 아니다. 기본·어두운 테마·큰 글자와 실패와 복구를 각각 확인한다.

2026-10-07 iOS 26.5 / 200% 글자에서 키보드가 열린 시작 안내의 고정 머리가 본문 높이를 모두 소비했다. Native는 기존 ScreenLayout의 본문 스크롤 안으로 단계 안내를 옮겨 입력에 도달하게 하고 footer의 완료·이전 버튼은 유지한다. [검토 결과](../../../../../docs/qa/2026-10-07-experiment-promotion-release.md).
