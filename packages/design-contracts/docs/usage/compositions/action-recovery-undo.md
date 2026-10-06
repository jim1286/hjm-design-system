# 보관과 실행 취소

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [공통 실행과 실패 복구 · 초안과 실행 취소](../../action-session.md#초안과-실행-취소), `src/action-session.ts`, `showcase/web/src/patterns/action-recovery-previews.tsx`, `showcase/native/src/action-recovery-previews.tsx`. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/공통 동작/보관과 실행 취소`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/피드백과 복구/보관과 실행 취소`

## 언제 쓰나

보관·숨기기·목록에서 빼기처럼 제품이 역연산을 제공하는 작업 뒤에, 같은 자리에서 실행 취소를 주고 그 복구 요청이 성공해야 화면을 되돌릴 때 쓴다.

금융 거래·영구 삭제에는 가짜 Undo를 넣지 않는다.

같은 `공통 동작` 묶음: [저장과 재시도](action-recovery-save.md) · [즉시 반영과 복구](action-recovery-optimistic.md).
세션 생성·구독·상태 알림은 [저장과 재시도의 공통 절](action-recovery-save.md#공통-세션과-상태-알림)을 따른다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `createActionSession` | 보관·복구 요청의 진행·실패 상태. 값은 "보관됨" 여부 | [계약](../../action-session.md) |
| `Heading` | 묶음 제목(선택). 크기 `level3`(24), 문서 단계는 화면 구조에 맞춰 `semanticLevel` | [Heading](../components/heading.md) |
| `Text` | 대상의 현재 위치(목록·보관함) | [Text](../components/text.md) |
| `Button` 보관/실행 취소 | 같은 자리의 한 버튼, 라벨이 바뀜. pending 중 `loading` | [Button](../components/button.md) |
| `Button` 다시 시도 | error일 때만 나타나는 보조 행동, `tone="secondary"` | [Button](../components/button.md) |
| `Text` | 상태 문구. Web `role="status"`, Native 접근성 알림 | [Text](../components/text.md) |
| `Stack` | 세로 쌓기 `gap="md"` | [Stack](../components/stack.md) |
| `Toast` `action`(선택) | 행이 사라지는 목록에서 실행 취소 진입점 | [Toast](../components/toast.md) |
| `Container` · `ScrollView` | 바깥 틀. 제품 화면이 소유한다 | [Container](../components/container.md), [화면 여백](../tokens/layout.md) |

Toast의 `action`을 진입점으로 쓰면 토스트는 진입점만, 세션은 진행·실패 상태만 소유한다. Toast 지침대로 그 알림에서만 할 수 있는
행동은 두지 않으므로 보관함 화면 등 다른 곳에도 복구 경로를 둔다. 스토리의 "다음 요청 실패시키기"·350ms 지연은 데모 전용이고,
스토리에는 자동 만료가 없다(만료 시간은 제품이 정한다).

## 배치

```text
┌ 화면 바깥 틀(제품 소유) ─────────────────┐
│ Web: 문서 스크롤 · Native: ScrollView    │
│ ↕ Native 위아래 spacing.lg 20            │
│ ←gutter 16|20→ Container ←gutter 16|20→ │
│ ┌ Stack gap="md" ──────────────────────┐ │
│ │ 제목 Heading level3 (선택)           │ │
│ │          ↕ spacing.md 16             │ │
│ │ 대상: 목록 / 보관함 + 항목 이름      │ │
│ │          ↕ spacing.md 16             │ │
│ │ [ 보관 ]  →  [ 실행 취소 ]           │ │ ← 같은 자리, loading 중 스피너
│ │          ↕ spacing.md 16             │ │
│ │ [ 실패한 작업 다시 시도 (secondary)] │ │ ← error일 때만
│ │          ↕ spacing.md 16             │ │
│ │ 상태 문구 (role=status)              │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
  토스트(선택): 화면 단위 오버레이, action = 실행 취소
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web 문서 스크롤 > `Container`. Native `ScrollView` > `Container` | 이 구성을 감싸는 제품 화면. 상단 안전 영역은 내비게이션 헤더(또는 [TopBar](../components/top-bar.md))가 맡는다 | 좌우 `Container gutter`: 폭 600 미만 `compact` 16, 이상 `regular` 20([화면 여백](../tokens/layout.md)). Native 위아래는 `contentContainerStyle` `paddingVertical: spacing.lg` 20 |
| 제목(선택) | `Heading level="level3"` | Stack 맨 위 | 아래 `spacing.md` 16 |
| 대상 표시 | `Text` | 행동 위, 스크롤 | 아래 `spacing.md` 16 |
| 행동 | `Button` 보관/실행 취소(primary) | 대상 아래, 스크롤 | `medium` 44(`control.buttonHeight`). Stack 기본 `align="stretch"`로 꽉 찬 폭 |
| 재시도 | `Button tone="secondary"` | 행동 아래, error일 때만 | `medium` 44, `spacing.md` 16. 라벨은 무엇을 다시 하는지 적는다(스토리 "실패한 작업 다시 시도") |
| 상태 | `Text` | 맨 아래 | `spacing.md` 16 |
| 토스트(선택) | `Toast` `action` | 화면 단위 오버레이 | action 높이 `control.minTouchTarget` 44 |

- 보관과 실행 취소를 같은 자리의 한 버튼으로 둬서 방금 누른 위치에서 바로 되돌리게 한다.
- 목록 행에서 보관을 시작하면 행 끝 `size="small"` 버튼이나 [SwipeActions](../components/swipe-actions.md)를 쓰고,
  실행 취소는 화면 단위 Toast `action`으로 옮긴다(행이 사라지므로 행 안에 둘 수 없다).
- 한 화면의 primary는 하나다([Button](../components/button.md)). 재시도는 `secondary`로 둔다.

근거: `src/foundations.ts`(`spacing`, `control`, `layout`), [Toast 지침](../components/toast.md)

## 흐름과 상태

1. 대상이 목록에 있을 때 버튼은 `t("archive.action")`이다.
2. 보관을 누르면 `session.run(() => api.archive(id), { retryable: true })`를 부르고 버튼은 `loading`이다. pending 동안 같은 세션의 새 run·retry는 `blocked`다.
3. 성공하면 대상 표시가 보관함으로, 버튼이 `t("archive.undo")`로 바뀐다.
4. 실행 취소를 누르면 같은 버튼으로 `session.run(() => api.unarchive(id), { retryable: true })`를 부른다. 성공해야 목록으로 돌아온다.
5. 어느 쪽이든 실패(네트워크·서버 오류, 역연산 거부)하면 `state.value`는 마지막으로 확인한 상태를 유지하고 재시도 버튼을 보인다.
   재시도도 실패하면 다시 error가 되고 재시도 버튼이 남는다. error 중 같은 자리 버튼을 누르면 새 run이 되고 이전 실패 작업은 버려진다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | idle(목록). 대상 "목록", 버튼 보관, 상태 문구 `t("archive.listed")` | 알림 없음(첫 렌더는 알리지 않는다) |
| 진행 중 | pending. 버튼 `loading`(라벨 자리 유지, 중앙 스피너 하나), `t("archive.pending")` | 포커스는 버튼에 유지, 상태 문구 알림 |
| 보관됨 | success, `state.value === true`. 대상 "보관함", 버튼 실행 취소, `t("archive.done")`(되돌릴 수 있음을 함께) | 상태 문구 알림 |
| 복구됨 | success, `state.value === false`. 대상 "목록", 버튼 보관, `t("archive.listed")` | 상태 문구 알림 |
| 실패 | error. 마지막 확인 상태 유지, 재시도 버튼, `t("archive.failed")` | 상태 문구 알림, 포커스 이동 없음 |
| 재시도 실패 | error 유지. 재시도 → pending → error로 문구가 바뀌므로 다시 알린다 | 상태 문구 알림, 포커스 이동 없음 |

- 상태 문구는 status와 값을 함께 본다. 키는 상수 표(`archiveStatusKey`)에서 고른다. 템플릿 문자열 키(`` `archive.${status}` ``)는
  키 추출·누락 검사가 찾지 못하고 위 표의 키와 어긋난다.
- 권한·만료·대상 버전·복구 데이터 검증은 제품이 한다. UI를 되돌렸다는 이유로 서버 취소 완료를 선언하지 않는다.
- 오류 문구는 제품이 지역화한다. raw exception(`state.error`)을 그대로 보이지 않는다.

## 코드 골격

```tsx
// Web
import { useState, useSyncExternalStore } from "react";
import { createActionSession, type ActionSnapshot } from "@hjmds/design-contracts/action-session";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Button } from "@hjmds/react/actions";
import { Container, Stack, Text } from "@hjmds/react/layout";

const archiveStatusKey = { pending: "archive.pending", error: "archive.failed", archived: "archive.done", listed: "archive.listed" } as const;
const statusKeyOf = (state: ActionSnapshot<boolean>) =>
  state.status === "pending" || state.status === "error" ? archiveStatusKey[state.status] : state.value ? archiveStatusKey.archived : archiveStatusKey.listed;

type ArchiveApi = { archive(id: string): Promise<boolean>; unarchive(id: string): Promise<boolean> };

function ArchiveItem({ id, name, api }: { id: string; name: string; api: ArchiveApi }) {
  const [session] = useState(() => createActionSession(false)); // false = 목록에 있음
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const toggle = () => {
    const next = !state.value;
    void session.run(() => (next ? api.archive(id) : api.unarchive(id)), { retryable: true });
  };
  const gutter = resolveWindowClass(window.innerWidth) === "compact" ? "compact" : "regular";
  return (
    <Container gutter={gutter}>
      <Stack gap="md">
        <Text as="p">{state.value ? t("archive.inArchive", { name }) : t("archive.inList", { name })}</Text>
        <Button loading={state.status === "pending"} onClick={toggle}>
          {state.value ? t("archive.undo") : t("archive.action")}
        </Button>
        {state.status === "error" && <Button tone="secondary" onClick={() => void session.retry()}>{t("archive.retry")}</Button>}
        <Text as="p" role="status">{t(statusKeyOf(state))}</Text>
      </Stack>
    </Container>
  );
}
```

```tsx
// Native
import { useState, useSyncExternalStore } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { createActionSession, type ActionSnapshot } from "@hjmds/design-contracts/action-session";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Button } from "@hjmds/react-native/actions";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";

const archiveStatusKey = { pending: "archive.pending", error: "archive.failed", archived: "archive.done", listed: "archive.listed" } as const;
const statusKeyOf = (state: ActionSnapshot<boolean>) =>
  state.status === "pending" || state.status === "error" ? archiveStatusKey[state.status] : state.value ? archiveStatusKey.archived : archiveStatusKey.listed;

type ArchiveApi = { archive(id: string): Promise<boolean>; unarchive(id: string): Promise<boolean> };

function ArchiveItem({ id, name, api }: { id: string; name: string; api: ArchiveApi }) {
  const [session] = useState(() => createActionSession(false));
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const { width } = useWindowDimensions();
  const toggle = () => {
    const next = !state.value;
    void session.run(() => (next ? api.archive(id) : api.unarchive(id)), { retryable: true });
  };
  return (
    <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
      <Container gutter={resolveWindowClass(width) === "compact" ? "compact" : "regular"}>
        <Stack gap="md">
          <Text>{state.value ? t("archive.inArchive", { name }) : t("archive.inList", { name })}</Text>
          <Button loading={state.status === "pending"} onPress={toggle}>
            {state.value ? t("archive.undo") : t("archive.action")}
          </Button>
          {state.status === "error" && <Button tone="secondary" onPress={() => void session.retry()}>{t("archive.retry")}</Button>}
          <StatusText>{t(statusKeyOf(state))}</StatusText>
        </Stack>
      </Container>
    </ScrollView>
  );
}
```

`api.archive`·`api.unarchive`(서버가 확정한 boolean을 돌려줌)와 `StatusText`는 제품 소유다([공통 절](action-recovery-save.md#공통-세션과-상태-알림)의 helper).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 이벤트 | `onClick` | `onPress` |
| 바깥 스크롤 | 문서 스크롤 | `ScrollView`(위아래 `spacing.lg`) |
| 상태 알림 | `role="status"` | live region(Android) + iOS 알림 호출 |

## 함정

- 구획 제목은 Heading으로 표시한다. 이전 Text heading 예제는 2026-10-06 제목 의미 구조를 맞추면서 수정했다.
- 재시도는 secondary로 두어 저장과 경쟁하는 primary를 만들지 않는다(2026-10-06 예제 반영).
