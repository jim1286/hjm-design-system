# 중단해도 남는 현재 상태

- 단계: 구성
- 상태: 배포
- 지원: Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `showcase/native/src/ExpoInteractions.stories.tsx`, `src/content-transition.ts`, `src/foundations.ts`(`spacing`, `layout`), `packages/react-native/src/content-transition.tsx`, `packages/react-native/src/internal/recipe-button.tsx`(`selected`)
- 스토리북: `배포/구성/피드백과 복구/중단해도 남는 현재 상태`

## 언제 쓰나

버튼으로 상태를 빠르게 바꾸거나 전환 도중 내용을 닫아도 현재 상태가 바로 보이고 남아야 하는 영역에 쓴다.
단계 표시, 상태 카드, 결과 문구처럼 한 영역의 내용이 바뀌는 곳이다. 화면 상태는 애니메이션 완료 콜백을
기다리지 않고 바뀌고, 전환은 그 뒤를 따라간다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `ScrollView` · `Container` | 바깥 틀. 제품 화면이 소유한다 | [Container](../components/container.md), [화면 여백](../tokens/layout.md) |
| `Heading level="level5"`, `Text` | 영역 제목(18)과 설명 | [Heading](../components/heading.md), [Text](../components/text.md) |
| `Button tone="secondary" selected` | 동작 줄이기 같은 켜고 끄는 설정(토글 버튼) | [Button](../components/button.md) |
| `Button` `primary`·`secondary`·`ghost` | 다음 상태 · 처음으로 · 내용 닫기/열기 | [Button](../components/button.md) |
| `Stack` | 영역 세로 쌓기 `gap="md"`, 행동 묶음 `gap="sm"` | [Stack](../components/stack.md) |
| `ContentTransition` | `stateKey`가 바뀔 때 새 내용을 `preset="rise"`로 들인다 | [ContentTransition](../components/content-transition.md) |
| `Text` 상태 문구 | 바뀐 상태를 보조기기에 알린다(Android live region + iOS 알림 helper) | [Text](../components/text.md), [상태 알림](action-recovery-save.md#공통-세션과-상태-알림) |

## 배치

```text
┌ ScrollView (제품 화면 소유) ───────────────────────┐ ← 스크롤 영역(화면 전체)
│ ↕ 위아래 spacing.lg 20 (contentContainerStyle)      │
│ ←gutter 16|20→ Container ←gutter 16|20→            │
│ ┌ Stack gap="md" 16 ─────────────────────────────┐ │
│ │ 제목 (Heading level5)                          │ │
│ │ 설명 (Text)                                    │ │
│ │ [ 동작 줄이기 ]  ← secondary + selected 토글    │ │
│ │ ┌ 행동 묶음 Stack gap="sm" 12 ───────────────┐ │ │
│ │ │ [ 다음 상태 ]   primary   ← 주 행동이 맨 위 │ │ │
│ │ │ [ 처음으로 ]    secondary ← 보조 행동       │ │ │
│ │ │ [ 콘텐츠 닫기 ] ghost                       │ │ │
│ │ └────────────────────────────────────────────┘ │ │
│ │ ┌ ContentTransition (stateKey) ──────────────┐ │ │
│ │ │ 현재 상태 문구 (live region + iOS 알림)     │ │ │
│ │ └────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | `ScrollView` > `Container size="reading"` | 화면 전체, 스크롤. 상단 안전 영역은 내비게이션 헤더(또는 [TopBar](../components/top-bar.md))가 맡는다. 입력이 없어 키보드 처리는 없다 | 위아래 `contentContainerStyle` `paddingVertical: spacing.lg` 20. 좌우 `Container gutter`: 폭 600 미만 `compact` 16, 이상 `regular` 20([화면 여백](../tokens/layout.md)) |
| 머리 | `Heading` + `Text` | Stack 맨 위 | 사이 `spacing.md` 16 |
| 설정 토글 | `Button tone="secondary" selected` | 머리 아래 | 높이 `medium` 44(`control.buttonHeight`). Stack 기본 `align="stretch"`로 꽉 찬 폭 |
| 행동 묶음 | `Stack gap="sm"` + Button ×3 세로 | 토글 아래, 주 행동이 위 | 버튼 사이 `spacing.sm` 12, 각 높이 44 |
| 바뀌는 내용 | `ContentTransition` | 행동 묶음 아래, 함께 스크롤 | `rise` 세로 12 이동, 시간 `motion.normal`, 곡선 `easing.enter`. 래퍼 자체 크기·여백 없음 |

- 한 영역(구획 하나) 안이므로 요소 사이는 `layout.contentGap`(`Stack gap="md"` 16)이다([화면 여백](../tokens/layout.md)).
- 한 화면의 primary는 "다음 상태" 하나다. 토글은 `tone="secondary"`로 두고 켜졌을 때만 `selected` 표시(배경 `bg`, 글자·테두리 `contentBrand`)가 된다.
  `selected={false}`인 버튼은 tone 색으로 칠해지므로 tone을 비우면 꺼진 토글이 primary 채움이 된다([Button](../components/button.md) 꼭 지킬 것의 예외 규칙).

## 흐름과 상태

1. "다음 상태"를 누르면 상태 index가 즉시 바뀌고 `stateKey`가 바뀐다. 빠르게 여러 번 눌러도 마지막 상태가 남는다.
2. "처음으로"는 전환 중이어도 첫 상태로 바로 돌린다.
3. "콘텐츠 닫기"는 전환 도중이라도 ContentTransition을 즉시 unmount한다. 다시 열면 현재 상태가 첫 렌더로 보이고 움직이지 않는다.
4. 동작 줄이기를 켜면 `motion="none"`으로 항상 즉시 교체한다. 기본 `motion="system"`은 Provider의 reduced motion을 따른다.
5. 앱이 백그라운드로 가면 진행 중 전환을 멈추고 내용을 바로 다 보인다(`AppState` 감시).

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 현재 상태 문구가 보인다 | 첫 렌더는 알리지 않는다 |
| 진행 중 | 전환 중. 새 문구가 아래 12에서 올라오며 나타난다. 문구는 이미 확정된 값이다 | 바뀐 문구를 Android live region(polite)·iOS 알림 helper로 알린다 |
| 실패 | — 이 구성에는 서버 작업이 없다. 서버 작업과 묶으면 그 Button에 `loading`, 실패는 [저장과 재시도](action-recovery-save.md)를 따른다 | 전환 종료를 작업 완료 신호로 쓰지 않는다 |
| 전환 중 닫힘 | 영역이 즉시 사라진다 | 완료 콜백을 기다리지 않는다 |
| 동작 줄이기 | 문구가 즉시 교체된다 | 진행 중과 같다 |
| 앱 백그라운드 | 진행 중 전환을 멈추고 바로 표시한다 | — |

- 상태→문구 키는 상수 표(`flowStateKey`)로 둔다. 템플릿 문자열 키(`` `flow.state.${id}` ``)는 키 추출·누락 검사가 찾지 못한다.

## 코드 골격

```tsx
// Web
// 없음. Web 스토리는 없고 Web ContentTransition은 같은 stateKey·preset·motion 계약을 쓴다.
```

```tsx
// Native
import { useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Button } from "@hjmds/react-native/actions";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { Heading } from "@hjmds/react-native/heading";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";

const flowStateKey = ["flow.state.ready", "flow.state.review", "flow.state.done"] as const;

function FlowStatus() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false); // 제품 설정이 없으면 토글과 이 state를 두지 않는다
  const { width } = useWindowDimensions();
  return (
    <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
      <Container size="reading" gutter={resolveWindowClass(width) === "compact" ? "compact" : "regular"}>
        <Stack gap="md">
          <Heading level="level5" semanticLevel={2}>{t("flow.title")}</Heading>
          <Text>{t("flow.description")}</Text>
          <Button tone="secondary" selected={reduced} onPress={() => setReduced((value) => !value)}>{t("flow.reduceMotion")}</Button>
          <Stack gap="sm">
            <Button onPress={() => setIndex((value) => (value + 1) % flowStateKey.length)}>{t("flow.next")}</Button>
            <Button tone="secondary" onPress={() => setIndex(0)}>{t("flow.reset")}</Button>
            <Button tone="ghost" onPress={() => setVisible((value) => !value)}>{visible ? t("flow.hide") : t("flow.show")}</Button>
          </Stack>
          {visible ? (
            <ContentTransition stateKey={String(index)} preset="rise" motion={reduced ? "none" : "system"}>
              <StatusText>{t(flowStateKey[index] ?? flowStateKey[0])}</StatusText>{/* 저장과 재시도의 공통 절 helper */}
            </ContentTransition>
          ) : null}
        </Stack>
      </Container>
    </ScrollView>
  );
}
```

상태 목록·문구·동작 줄이기 설정의 저장 위치는 제품 소유다. 제품에 별도 설정이 없으면 토글을 두지 말고 `motion="system"`만 쓴다.
`StatusText`는 [저장과 재시도](action-recovery-save.md#공통-세션과-상태-알림)의 helper(Android live region + iOS active일 때 바뀐 문구 알림)다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 스토리 | 없음 | 있음 |
| 바깥 스크롤 | 문서 스크롤 + `Container` | `ScrollView`(위아래 `spacing.lg`) > `Container` |
| 포커스 복원 | `focusTarget`으로 전환 전 포커스를 복원 | 없음 |
| 상태 알림 | `Text role="status"` | `accessibilityLiveRegion`은 Android만, iOS는 `AccessibilityInfo.announceForAccessibilityWithOptions` |

## 함정

- `stateKey`를 매 렌더 새 값으로 주면 내용이 계속 다시 나타난다. 의미가 바뀔 때만 바꾼다.
- 다음 상태 계산을 전환 완료 콜백에 묶으면 빠른 연속 누름과 중간 닫기에서 상태가 어긋난다.
- ContentTransition은 움직이는 동안 래퍼 밖으로 세로 12만큼 밀려 나온다. 바로 아래 요소와 붙이지 않는다.
- 예제는 `Container gutter="compact"`와 `Stack gap="md"`로 바깥 틀을 공유하고 행동 묶음은 `Stack gap="sm"`으로 둔다. Native 위아래 여백은 `spacing.md` 16이다.
- 제목은 Heading, 동작 줄이기 토글은 secondary, 작업 결과는 iOS 알림도 처리하는 예제 helper를 쓴다. 제품은 같은 계약을 자체 상태 알림에 연결한다.
