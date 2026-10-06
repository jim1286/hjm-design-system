# 즉시 반영과 복구

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [공통 실행과 실패 복구](../../action-session.md), `src/action-session.ts`, `showcase/web/src/patterns/action-recovery-previews.tsx`, `showcase/native/src/action-recovery-previews.tsx`. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/공통 동작/즉시 반영과 복구`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/피드백과 복구/즉시 반영과 복구`

## 언제 쓰나

북마크·좋아요·알림 켜기처럼 되돌려도 피해가 없는 저위험 토글을 누르는 즉시 화면에 반영하고, 서버가 실패하면 직전 확인 값으로 되돌릴 때 쓴다.

결제·영구 삭제·권한 변경처럼 실패를 화면만 되돌려 숨기면 안 되는 작업에는 쓰지 않는다. 그때는 [저장과 재시도](action-recovery-save.md)처럼
서버 확인 뒤 표시한다.

같은 `공통 동작` 묶음: [저장과 재시도](action-recovery-save.md) · [보관과 실행 취소](action-recovery-undo.md).
세션 생성·구독·상태 알림은 [저장과 재시도의 공통 절](action-recovery-save.md#공통-세션과-상태-알림)을 따른다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `createActionSession` + `optimisticValue` | pending 동안 새 값을 먼저 보이고, 실패하면 이전 확인 값으로 복구 | [계약](../../action-session.md) |
| `Heading` | 묶음 제목(선택). 크기 `level3`(24), 문서 단계는 화면 구조에 맞춰 `semanticLevel` | [Heading](../components/heading.md) |
| `Button selected` | 켜고 끄는 토글. `selected`=현재(낙관) 값, pending 중 `disabled` | [Button](../components/button.md) |
| `Button` 다시 반영 | error일 때만 나타나는 보조 행동, `tone="secondary"` | [Button](../components/button.md) |
| `Text` | 상태 문구. Web `role="status"`, Native 접근성 알림 | [Text](../components/text.md) |
| `Stack` | 세로 쌓기 `gap="md"` | [Stack](../components/stack.md) |
| `Container` · `ScrollView` | 바깥 틀. 제품 화면이 소유한다 | [Container](../components/container.md), [화면 여백](../tokens/layout.md) |

스토리의 `tone="ghost"` "서버에서 새 상태 불러오기"는 `reset`이 지난 응답을 버리는 것을 보여 주는 데모 버튼이다.
제품에서는 이 동작을 버튼이 아니라 재조회·계정 변경 시점에 연결한다. "다음 요청 실패시키기"와 350ms 지연도 데모 전용이다.

## 배치

```text
┌ 화면 바깥 틀(제품 소유) ─────────────────┐
│ Web: 문서 스크롤 · Native: ScrollView    │
│ ↕ Native 위아래 spacing.lg 20            │
│ ←gutter 16|20→ Container ←gutter 16|20→ │
│ ┌ Stack gap="md" ──────────────────────┐ │
│ │ 제목 Heading level3 (선택)           │ │
│ │          ↕ spacing.md 16             │ │
│ │ [ 북마크 추가 / 해제 (selected) ]    │ │ ← 토글, 높이 44
│ │          ↕ spacing.md 16             │ │
│ │ [ 북마크 다시 반영 (secondary) ]     │ │ ← error일 때만
│ │          ↕ spacing.md 16             │ │
│ │ 상태 문구 (role=status)              │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web 문서 스크롤 > `Container`. Native `ScrollView` > `Container` | 이 구성을 감싸는 제품 화면(대상 콘텐츠 상세 등). 상단 안전 영역은 내비게이션 헤더(또는 [TopBar](../components/top-bar.md))가 맡는다 | 좌우 `Container gutter`: 폭 600 미만 `compact` 16, 이상 `regular` 20([화면 여백](../tokens/layout.md)). Native 위아래는 `contentContainerStyle` `paddingVertical: spacing.lg` 20 |
| 제목(선택) | `Heading level="level3"` | Stack 맨 위 | 아래 `spacing.md` 16 |
| 토글 | `Button selected` | 대상 콘텐츠 아래, 스크롤 | `medium` 44(`control.buttonHeight`), 이웃 `spacing.md` 16. Stack 기본 `align="stretch"`로 꽉 찬 폭 |
| 재시도 | `Button tone="secondary"` | 토글 아래, error일 때만 | `medium` 44, `spacing.md` 16. 라벨은 무엇을 다시 하는지 적는다(`t("bookmark.retry")`) |
| 상태 | `Text` | 행동 아래 | `spacing.md` 16 |

- 토글이 목록 행 끝에 들어가면 Button 지침대로 `size="small"`(36, `control.buttonHitSlop.small` 4로 터치 44)과 `secondary`·`ghost`를 쓴다.
  상태 문구는 행마다 두지 않고 [Toast](../components/toast.md) 등 화면 단위로 한 번 알린다.
- 라벨은 상태에 따라 바뀐다(`t("bookmark.add")` ↔ `t("bookmark.remove")`). 두 라벨 모두 두 줄 안에 들어가야 한다.
- 꺼진 토글(`selected={false}`)은 기본 tone primary로 칠해지고, 켜진 토글은 `selected` 처리로 칠해져 primary 수에 세지 않는다
  ([Button](../components/button.md) 꼭 지킬 것). 그래서 한 화면 primary 하나를 지키려면 재시도는 `secondary`다.

근거: `src/foundations.ts`(`spacing`, `control`, `layout`), `src/action-session.ts`(`optimisticValue`)

## 흐름과 상태

1. 화면은 서버에서 확인한 값으로 토글을 그린다(`createActionSession(serverValue)`).
2. 누르면 `next = !state.value`로 `session.run(() => api.set(next), { optimisticValue: next, retryable: true })`를 부른다.
3. pending 동안 `state.value`가 곧바로 `next`가 되어 토글이 바뀌고, 버튼은 `disabled`다. 같은 세션의 새 run·retry는 `blocked`다.
4. 성공하면 서버가 돌려준 값으로 확정한다.
5. 실패(네트워크·서버 오류, 작업 함수의 throw·reject)하면 `state.value`가 실행 전 확인 값으로 돌아가고 재시도 버튼이 나온다.
   `session.retry()`는 같은 `optimisticValue`로 다시 실행해 토글이 다시 새 값으로 바뀐다. 재시도도 실패하면 다시 이전 값으로 돌아가고
   재시도 버튼이 남는다. error 중 토글을 다시 누르면 새 run이 되고 이전 실패 작업은 버려진다.
6. 재조회·계정 변경 시 `session.reset(serverValue)`를 부르면 늦게 온 이전 응답과 재시도가 무시된다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | idle. 확인된 값의 토글, 상태 문구 `t("bookmark.hint")` | 알림 없음(첫 렌더는 알리지 않는다) |
| 진행 중 | pending. 토글이 새 값으로 바뀌고 `disabled`, 상태 문구 `t("bookmark.pending")` | 포커스는 토글에 유지, 상태 문구 알림 |
| 성공 | success. 서버 값으로 확정, `t("bookmark.saved")` | 상태 문구 알림 |
| 실패 | error. 이전 값으로 복귀, 재시도 버튼, `t("bookmark.reverted")` | 상태 문구 알림, 포커스 이동 없음 |
| 재시도 실패 | error 유지. 재시도 → pending → error로 문구가 바뀌므로 다시 알린다 | 상태 문구 알림, 포커스 이동 없음 |

- 상태→문구 키는 상수 표(`bookmarkStatusKey`)로 둔다. 템플릿 문자열 키(`` `bookmark.${status}` ``)는 키 추출·누락 검사가 찾지 못하고
  위 표의 키와 어긋난다.
- 오래된 요청이 서버에 반영됐을 수 있으면 `reset`만으로 정합성이 보장되지 않는다. 제품이 재조회·캐시 무효화로 맞춘다.
- 객체 값은 불변 데이터로 넘긴다.
- 오류 문구는 제품이 지역화한다. raw exception(`state.error`)을 그대로 보이지 않는다.

## 코드 골격

```tsx
// Web
import { useState, useSyncExternalStore } from "react";
import { createActionSession } from "@hjmds/design-contracts/action-session";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Button } from "@hjmds/react/actions";
import { Container, Stack, Text } from "@hjmds/react/layout";

const bookmarkStatusKey = { idle: "bookmark.hint", pending: "bookmark.pending", success: "bookmark.saved", error: "bookmark.reverted" } as const;

function BookmarkToggle({ initial, setBookmark }: { initial: boolean; setBookmark(next: boolean): Promise<boolean> }) {
  const [session] = useState(() => createActionSession(initial)); // 렌더마다 새로 만들지 않는다
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const toggle = () => {
    const next = !state.value;
    void session.run(() => setBookmark(next), { optimisticValue: next, retryable: true });
  };
  const gutter = resolveWindowClass(window.innerWidth) === "compact" ? "compact" : "regular";
  return (
    <Container gutter={gutter}>
      <Stack gap="md">
        <Button selected={state.value} disabled={state.status === "pending"} onClick={toggle}>
          {state.value ? t("bookmark.remove") : t("bookmark.add")}
        </Button>
        {state.status === "error" && <Button tone="secondary" onClick={() => void session.retry()}>{t("bookmark.retry")}</Button>}
        <Text as="p" role="status">{t(bookmarkStatusKey[state.status])}</Text>
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
import { Container, Stack } from "@hjmds/react-native/primitives";

const bookmarkStatusKey = { idle: "bookmark.hint", pending: "bookmark.pending", success: "bookmark.saved", error: "bookmark.reverted" } as const;

function BookmarkToggle({ initial, setBookmark }: { initial: boolean; setBookmark(next: boolean): Promise<boolean> }) {
  const [session] = useState(() => createActionSession(initial));
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const { width } = useWindowDimensions();
  const toggle = () => {
    const next = !state.value;
    void session.run(() => setBookmark(next), { optimisticValue: next, retryable: true });
  };
  return (
    <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
      <Container gutter={resolveWindowClass(width) === "compact" ? "compact" : "regular"}>
        <Stack gap="md">
          <Button selected={state.value} disabled={state.status === "pending"} onPress={toggle}>
            {state.value ? t("bookmark.remove") : t("bookmark.add")}
          </Button>
          {state.status === "error" && <Button tone="secondary" onPress={() => void session.retry()}>{t("bookmark.retry")}</Button>}
          <StatusText>{t(bookmarkStatusKey[state.status])}</StatusText>
        </Stack>
      </Container>
    </ScrollView>
  );
}
```

`setBookmark`(서버가 확정한 boolean을 돌려줌)과 `StatusText`는 제품 소유다([공통 절](action-recovery-save.md#공통-세션과-상태-알림)의 helper).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `selected` 알림 | `aria-pressed` | 접근성 state |
| 이벤트 | `onClick` | `onPress` |
| 바깥 스크롤 | 문서 스크롤 | `ScrollView`(위아래 `spacing.lg`) |
| 상태 알림 | `role="status"` | live region(Android) + iOS 알림 호출 |

## 함정

- 구획 제목은 Heading으로 표시한다. 이전 Text heading 예제는 2026-10-06 제목 의미 구조를 맞추면서 수정했다.
- 재시도는 secondary로 두어 저장과 경쟁하는 primary를 만들지 않는다(2026-10-06 예제 반영).
