# 저장과 재시도

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [공통 실행과 실패 복구](../../action-session.md), `src/action-session.ts`, `showcase/web/src/patterns/action-recovery-previews.tsx`, `showcase/native/src/action-recovery-previews.tsx`. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/공통 동작/저장과 재시도`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/피드백과 복구/저장과 재시도`

## 언제 쓰나

입력한 내용을 서버에 저장하는 폼 한 덩어리에서 저장 중 중복 실행을 막고, 실패하면 입력을 지우지 않은 채 제출했던 값 그대로 다시 보낼 때 쓴다.

확인창 안의 비동기 확인은 AlertDialog 세션이 이미 소유하므로 여기에 쓰지 않는다. 제품이 TanStack Query mutation 등으로
상태를 이미 소유하면 세션을 겹쳐 만들지 않고 같은 규칙만 연결한다.

같은 `공통 동작` 묶음: [즉시 반영과 복구](action-recovery-optimistic.md) · [보관과 실행 취소](action-recovery-undo.md).
세 구성과 [늦은 응답보다 최신 검색 유지](interaction-flow-search.md)가 함께 쓰는 세션 연결·상태 알림은
이 문서의 [공통: 세션과 상태 알림](#공통-세션과-상태-알림)에 있다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `createActionSession` | idle → pending → success/error 상태, 같은 세션의 중복 실행 차단, `retry` | [계약](../../action-session.md) |
| `Heading` | 묶음 제목. 크기 `level3`(24), 문서 단계는 화면 구조에 맞춰 `semanticLevel` | [Heading](../components/heading.md) |
| `TextField` | 저장할 입력. 값은 제품 state(초안)가 소유 | [Field](../components/field.md) |
| `Button` 저장 | 주 행동. `loading`=pending, 입력이 비면 `disabled` | [Button](../components/button.md) |
| `Button` 다시 저장 | error일 때만 나타나는 보조 행동, `tone="secondary"` | [Button](../components/button.md) |
| `Text` | 상태 문구(진행·성공·실패). Web `role="status"`, Native 접근성 알림. 확정 값 줄(선택) | [Text](../components/text.md) |
| `Stack` | 세로 쌓기 `gap="md"` | [Stack](../components/stack.md) |
| `Container` · `ScrollView` | 바깥 틀. 제품 화면이 소유한다 | [Container](../components/container.md), [화면 여백](../tokens/layout.md) |

스토리의 "다음 요청 실패시키기"(secondary 토글)와 350ms 지연은 데모 전용이다. 제품에 넣지 않는다.

## 배치

```text
┌ 화면 바깥 틀(제품 소유) ─────────────────┐
│ Web: 문서 스크롤 · Native: ScrollView    │
│ ↕ Native 위아래 spacing.lg 20            │
│ ←gutter 16|20→ Container ←gutter 16|20→ │
│ ┌ Stack gap="md" ──────────────────────┐ │
│ │ 제목 Heading level3                  │ │
│ │          ↕ spacing.md 16             │ │
│ │ 라벨                                 │ │
│ │ [ 입력                             ] │ │ TextField, 높이 44
│ │          ↕ spacing.md 16             │ │
│ │ [        저장 (primary)            ] │ │ ← 주 행동, 높이 44
│ │          ↕ spacing.md 16             │ │
│ │ [ 실패한 내용 다시 저장 (secondary)] │ │ ← error일 때만
│ │          ↕ spacing.md 16             │ │
│ │ 상태 문구 (role=status)              │ │
│ │ 저장된 내용: state.value (선택)      │ │
│ │ 보조 설명 (제품 소유, 선택)          │ │
│ └──────────────────────────────────────┘ │
│ 하단 안전 영역(Native, 스크롤 끝 여백)    │
└──────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web 문서 스크롤 > `Container size="reading"`. Native `ScrollView`(`keyboardShouldPersistTaps="handled"`) > `Container size="reading"` | 이 구성을 감싸는 제품 화면. 상단 안전 영역은 내비게이션 헤더(또는 [TopBar](../components/top-bar.md))가 맡는다 | 좌우 `Container gutter`: 폭 600 미만 `compact` 16, 이상 `regular` 20([화면 여백](../tokens/layout.md)). Native 위아래는 `contentContainerStyle` `paddingVertical: spacing.lg` 20 |
| 제목 | `Heading level="level3"` | Stack 맨 위, 스크롤 | 아래 `spacing.md` 16 |
| 입력 | `TextField` | 제목 아래, 스크롤 | 높이 `control.fieldHeight` 44 |
| 주 행동 | `Button` 저장(primary) | 입력 바로 아래, 스크롤 | `medium` 44(`control.buttonHeight`), 이웃 `spacing.md` 16. Stack 기본 `align="stretch"`로 꽉 찬 폭이 되므로 `fullWidth`·`layoutStyle`은 필요 없다 |
| 재시도 | `Button tone="secondary"` 다시 저장 | 주 행동 아래, error일 때만 | `medium` 44, `spacing.md` 16. 라벨은 무엇을 다시 하는지 적는다(스토리 "실패한 내용 다시 저장"). 일반 "다시 시도"만 쓰지 않는다 |
| 상태 | `Text` | 행동 아래 | `spacing.md` 16 |
| 확정 값(선택) | `Text` — `state.value` | 상태 문구 아래 | `spacing.md` 16 |

- 모든 간격은 `Stack gap="md"`(`spacing.md` 16) 하나로 맞춘다. `stackRecipe.defaults.gap`도 `md`다.
- 스토리는 좁은 폭 기준 바깥 틀(Web `Container gutter="compact" size="reading"`, Native `ScrollView` > 같은 Container)을 그린다. 넓은 폭에서는 위 표의 첫 행대로 `regular`를 고른다.
  키보드가 입력·저장 버튼을 가리는 Native 폼은 입력이 여러 개면 [KeyboardFormScrollView](../components/keyboard-form-scroll-view.md)
  (peer 필요), peer가 없으면 [KeyboardAvoiding](../components/keyboard-avoiding.md) 기준을 따른다.
- 저장이 화면 하단 고정 행동이면 Button 대신 [BottomCTA](../components/bottom-cta.md)에 두고, 재시도 버튼과 상태 문구는 본문(스크롤)에 남긴다.
- 한 화면의 primary는 하나다([Button](../components/button.md)). 재시도는 `secondary`로 두거나 저장 버튼 하나로 모은다.

근거: `src/component-recipes.ts`(`stackRecipe`), `src/foundations.ts`(`spacing`, `control`, `layout`), `src/container.ts`

## 흐름과 상태

1. 사용자가 입력한다. 입력이 비어 있으면 저장 버튼은 `disabled`다.
2. 저장을 누르면 그 순간의 입력값을 캡처해 `session.run(() => api.save(submitted), { retryable: true })`를 부른다.
3. pending 동안 같은 세션의 새 run·retry는 `blocked`라 작업 함수가 불리지 않는다.
4. 실패(네트워크·서버 오류, 작업 함수의 throw·reject)하면 세션 값은 실행 전 값으로 돌아가고 입력 초안은 그대로 남으며
   재시도 버튼이 나온다. `session.retry()`는 실패한 작업을 캡처한 값으로 다시 부른다.
5. 재시도도 실패하면 다시 error가 되고 재시도 버튼이 남는다(`retryable` 실행은 실패할 때마다 다시 재시도할 수 있다).
   error 중 사용자가 입력을 고쳐 저장을 누르면 새 run이 되고 이전 실패 작업은 버려진다.
6. 성공하면 세션 `state.value`가 서버가 resolve한 값이 된다. 확정 값을 보여 줄 때는 `state.value`를 읽고 입력 초안(draft)은
   덮어쓰지 않는다(스토리의 "저장된 내용" 줄).

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | idle. 저장 버튼만, 상태 문구 `t("save.hint")`. 입력이 비면 저장 `disabled` | 알림 없음(첫 렌더는 알리지 않는다) |
| 진행 중 | pending. 저장 버튼 `loading`(라벨 자리 유지, 중앙 스피너 하나), 상태 문구 `t("save.pending")` | 포커스는 버튼에 유지, 상태 문구 알림 |
| 성공 | success. 상태 문구 `t("save.done")`, 확정 값 줄 갱신 | 상태 문구 알림 |
| 실패 | error. 입력 유지, 재시도 버튼 등장, 상태 문구 `t("save.failed")` | 상태 문구 알림, 포커스 이동 없음 |
| 재시도 실패 | error 유지. 재시도 → pending → error로 문구가 바뀌므로 다시 알린다 | 상태 문구 알림, 포커스 이동 없음 |

- 상태→문구 키는 상수 표(`saveStatusKey`)로 둔다. 템플릿 문자열 키(`` `save.${status}` ``)는 키 추출·누락 검사가 찾지 못하고
  위 표의 키와 어긋난다.
- 상태 문구 `Text`의 tone은 기본값을 쓴다(스토리). 오류를 색으로도 구분하려면 error일 때만 `tone="danger"`를 주되,
  색만으로 의미를 전하지 않도록 문구 자체가 실패를 말해야 한다.
- `retryable` 기본값은 `false`다. 재시도가 안전하다고 제품이 판단한 경우만 켠다.
- 서버가 멱등 키를 지원하면 같은 제출의 재시도에 같은 제품 요청 키를 쓴다. 세션의 `operationId`는 서버 멱등 키가 아니다.
- 오류 문구는 제품이 지역화한다. raw exception(`state.error`)을 그대로 보이지 않는다.

## 코드 골격

```tsx
// Web
import { useState, useSyncExternalStore } from "react";
import { createActionSession } from "@hjmds/design-contracts/action-session";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Heading } from "@hjmds/react/heading";
import { Container, Stack, Text } from "@hjmds/react/layout";

const saveStatusKey = { idle: "save.hint", pending: "save.pending", success: "save.done", error: "save.failed" } as const;

function SaveNote({ save }: { save(value: string): Promise<string> }) {
  const [session] = useState(() => createActionSession("")); // 렌더마다 새로 만들지 않는다
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const [draft, setDraft] = useState("");
  const gutter = resolveWindowClass(window.innerWidth) === "compact" ? "compact" : "regular";
  return (
    <Container size="reading" gutter={gutter}>
      <Stack gap="md">
        <Heading level="level3" semanticLevel={2}>{t("note.title")}</Heading>
        <TextField label={t("note.body")} value={draft} onValueChange={setDraft} />
        <Button loading={state.status === "pending"} disabled={!draft.trim()}
          onClick={() => { const submitted = draft; void session.run(() => save(submitted), { retryable: true }); }}>
          {t("common.save")}
        </Button>
        {state.status === "error" && <Button tone="secondary" onClick={() => void session.retry()}>{t("save.retry")}</Button>}
        <Text as="p" role="status">{t(saveStatusKey[state.status])}</Text>
        {state.value && <Text as="p">{t("save.savedValue", { value: state.value })}</Text>}
      </Stack>
    </Container>
  );
}
```

```tsx
// Native
import { useState, useSyncExternalStore } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { createActionSession } from "@hjmds/design-contracts/action-session";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Button } from "@hjmds/react-native/actions";
import { Heading } from "@hjmds/react-native/heading";
import { TextField } from "@hjmds/react-native/inputs";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";

const saveStatusKey = { idle: "save.hint", pending: "save.pending", success: "save.done", error: "save.failed" } as const;

function SaveNote({ save }: { save(value: string): Promise<string> }) {
  const [session] = useState(() => createActionSession(""));
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const [draft, setDraft] = useState("");
  const { width } = useWindowDimensions();
  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: spacing.lg }}>
      <Container size="reading" gutter={resolveWindowClass(width) === "compact" ? "compact" : "regular"}>
        <Stack gap="md">
          <Heading level="level3" semanticLevel={2}>{t("note.title")}</Heading>
          <TextField label={t("note.body")} value={draft} onValueChange={setDraft} />
          <Button loading={state.status === "pending"} disabled={!draft.trim()}
            onPress={() => { const submitted = draft; void session.run(() => save(submitted), { retryable: true }); }}>
            {t("common.save")}
          </Button>
          {state.status === "error" && <Button tone="secondary" onPress={() => void session.retry()}>{t("save.retry")}</Button>}
          <StatusText>{t(saveStatusKey[state.status])}</StatusText>{/* 아래 공통 절의 제품 helper */}
          {state.value ? <Text>{t("save.savedValue", { value: state.value })}</Text> : null}
        </Stack>
      </Container>
    </ScrollView>
  );
}
```

문구 키·저장 API는 제품 소유다.

### 공통: 세션과 상태 알림

- 세션은 엔티티·행동 하나에 하나다. 화면 컴포넌트에서는 `useState(() => createActionSession(initial))`로 한 번 만들고,
  화면보다 오래 살아야 하면 제품의 작업 소유자(store)에 둔다. unmount 시 자동 reset은 기본으로 넣지 않는다.
- 구독은 Web·Native 모두 `useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot)`다. SSR은 요청별 세션을 만든다.
- `reset(value)`는 세대를 바꿔 이전 응답과 재시도를 버린다. 서버 작업을 취소하지는 않는다.
- 상태 문구 알림: Web은 `<Text role="status">`다. Native는 `Text`에 `accessibilityLiveRegion="polite"`(Android)를 주고,
  iOS에서는 문구가 바뀌었고 비어 있지 않을 때만, 앱이 active일 때 `AccessibilityInfo.announceForAccessibilityWithOptions(message, { queue: true })`를 부른다.
  스토리의 `PatternStatus`(`showcase/native/src/pattern-status.tsx`)는 공개 API가 아니므로 제품에서 같은 동작의 helper를 만든다.
  나머지 Text prop은 `Omit<ComponentProps<typeof Text>, ...>`로 받아 그대로 넘긴다(optional prop을 `tone?: …`로 따로 받아 넘기면
  `exactOptionalPropertyTypes`에서 TS2375가 난다).

```tsx
// Native
import { useEffect, useRef, type ComponentProps } from "react";
import { AccessibilityInfo, AppState, Platform } from "react-native";
import { Text } from "@hjmds/react-native/primitives";

type StatusTextProps = Omit<ComponentProps<typeof Text>, "children" | "accessibilityLiveRegion"> & { children: string };

function StatusText({ children, ...props }: StatusTextProps) {
  const previous = useRef(children); // 첫 렌더는 알리지 않는다
  useEffect(() => {
    const changed = previous.current !== children;
    previous.current = children;
    if (changed && children.trim() && Platform.OS === "ios" && AppState.currentState === "active") {
      AccessibilityInfo.announceForAccessibilityWithOptions(children, { queue: true });
    }
  }, [children]);
  return <Text {...props} accessibilityLiveRegion="polite">{children}</Text>;
}
```

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 입력 import·이벤트 | `@hjmds/react/forms`, `onValueChange`(문자열 값, Native와 같은 이름). DOM 이벤트가 필요할 때만 `onChange`(둘 다 호출된다) | `@hjmds/react-native/inputs`, `onValueChange` |
| 버튼 이벤트 | `onClick` | `onPress` |
| 바깥 스크롤 | 문서 스크롤 | `ScrollView`(`keyboardShouldPersistTaps="handled"`, 위아래 `spacing.lg`) |
| 상태 알림 | `role="status"` | live region(Android) + iOS 알림 호출 |
| 로딩 중 포커스 | — | Button이 기본으로 포커스 유지(`disableWhileLoading`으로만 옛 동작) |

## 함정

- 재시도에서 현재 입력 state를 다시 읽으면 실패 뒤 고친 값이 "같은 제출의 재시도"로 나간다. 제출 시점 값을 캡처한다.
- 렌더 중 `createActionSession`을 부르면 매 렌더 새 세션이 생겨 중복 차단이 사라진다.
- 구획 제목은 Heading으로 표시한다. 이전 Text heading 예제는 2026-10-06 제목 의미 구조를 맞추면서 수정했다.
- 재시도는 secondary로 두어 저장과 경쟁하는 primary를 만들지 않는다(2026-10-06 예제 반영).
