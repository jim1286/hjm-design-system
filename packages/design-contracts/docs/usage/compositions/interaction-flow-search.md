# 늦은 응답보다 최신 검색 유지

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [공통 실행과 실패 복구](../../action-session.md), [제품 상호작용 품질](../../../../../docs/INTERACTION_QUALITY.md), `src/action-session.ts`, `showcase/web/src/patterns/interaction-flow-previews.tsx`, `showcase/native/src/interaction-flow-previews.tsx`. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/상호작용 예제/늦은 응답보다 최신 검색 유지`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/입력과 작성/늦은 응답보다 최신 검색 유지`

## 언제 쓰나

검색어를 바꿔 다시 검색했을 때 먼저 보낸 요청이 늦게 도착해도 최신 검색 결과를 덮어쓰지 않게 할 때 쓴다.

검색처럼 **읽기 전용** 요청에만 쓴다. 이전 결과를 버려도 서버에 남는 것이 없기 때문이다. 저장·수정 요청이 겹치는 경우는
같은 세션의 중복 실행 차단([저장과 재시도](action-recovery-save.md))으로 다룬다. 이 방식은 서버 요청 취소가 아니다.

같은 `상호작용 예제` 묶음: [선택 후 적용·취소](interaction-flow-apply.md) · [닫았다 열고 초안 이어쓰기](interaction-flow-draft.md) ·
[대표 항목과 묶음 전체 선택](selection-scope.md). 세션 연결과 상태 알림은 [저장과 재시도의 공통 절](action-recovery-save.md#공통-세션과-상태-알림)을 따른다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Container`·`Stack` | 바깥 틀. 구획 사이 `gap="xl"`, 묶음 안 `gap="md"` | [Container](../components/container.md), [Stack](../components/stack.md) |
| `Heading` | 묶음 제목 | [Heading](../components/heading.md) |
| `createActionSession` | 검색 결과 값. 새 검색 전에 `reset`으로 세대를 바꿔 이전 응답을 무시 | [계약](../../action-session.md) |
| `SearchField` | 검색어와 지우기(×). 진행 중에는 Web `loading`, Native `busy`+`busyLabel`로 뒤쪽 자리만 진행 표시로 바뀌고 입력은 그대로 쓸 수 있다. 빈 검색어면 검색 버튼 `disabled`. Web·Native 모두 `onValueChange` | [SearchField](../components/search-field.md) |
| `Button` 검색 / `Button` 다시 검색(secondary) | 검색 실행(primary 하나), 실패했을 때만 보이는 재시도 | [Button](../components/button.md) |
| `Text` | 진행·결과·실패 문구 | [Text](../components/text.md) |

스토리의 "느린 응답으로 검색"(900ms)·"빠른 응답으로 검색"(150ms) 두 버튼은 역순 응답을 재현하는 데모다. 제품은 검색 버튼 하나(또는 입력 중 검색)로 둔다.
`다음 검색 실패시키기`는 실패 경로를 여는 데모 도구다. 스토리는 기본·어두운 테마·큰 글자, `검색 중`, `실패와 다시 검색`, 제품 팔레트 두 가지(`보라 테마`, `초록 테마 · 어둡게`)다.
2026-10-06 같은 SearchField 진행 상태와 팔레트를 보이던 `입력과 작성/검색 입력`을 이 항목으로 합쳤다([옛 링크](../../../../../docs/STORYBOOK_NAVIGATION.md#실험-정리와-합친-항목-2026-10-06)).
검색 입력 칸·결과 목록이 필요한 화면이면 [SearchField](../components/search-field.md)·[List](../components/list.md)에 같은 세대 규칙을 연결한다.

## 배치

```text
┌ 화면 ────────────────────────────────┐
│ Native ScrollView 위아래 16          │
│ (keyboardShouldPersistTaps=handled)  │
│ └ Container gutter 16/20             │
│   Heading 제목                       │
│          ↕ spacing.md 16             │
│   검색어                             │
│   [🔍 입력                    (×)] │ SearchField 높이 44, 진행 중 × 자리 = 진행 표시
│          ↕ spacing.md 16             │
│   [        검색 (primary)          ] │ ← 주 행동
│          ↕ spacing.md 16             │
│   검색 중이에요 / 결과 / 실패 (status)│
│   [ 다시 검색 ] (secondary, 실패 때만)│
└──────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Native: `ScrollView keyboardShouldPersistTaps="handled"` → `Container` → `Stack gap="xl"`. Web: `Container` → `Stack gap="xl"` | 화면 본문. 안전 영역은 화면 셸이 준다. 키보드가 열린 채 검색 버튼을 누를 수 있게 Native 스크롤은 탭을 통과시킨다. 입력이 화면 아래쪽에 있으면 [KeyboardFormScrollView](../components/keyboard-form-scroll-view.md)를 쓴다 | Native `ScrollView` 위아래 `spacing.md` 16, 좌우 `Container` `gutter`(폭 600 미만 `compact` 16, 이상 `regular` 20). 구획 사이 `layout.sectionGap` 24 |
| 제목 | `Heading level="level3"` | 묶음 맨 위 | 24/32(`heading.level3`) |
| 입력 | `SearchField` | 제목 아래 | 높이 `control.fieldHeight` 44, `layout.contentGap` 16 |
| 주 행동 | `Button` 검색 | 입력 아래 | `medium` 44(`control.buttonHeight`), `spacing.md` 16 |
| 결과·상태 | `Text` | 행동 아래 | `spacing.md` 16 |
| 재시도 | `Button tone="secondary"` | 실패 문구 아래, 실패일 때만 | `medium` 44, `spacing.md` 16 |

근거: `src/foundations.ts`(`spacing`, `control`, `layout`, `heading`), `src/action-session.ts`

## 흐름과 상태

1. 사용자가 검색어를 입력하고 검색한다. 앞뒤 공백을 지운 값을 캡처한다.
2. 새 검색 직전에 `session.reset(state.value)`를 부른다. 진행 중이던 이전 요청의 세대가 끝나 그 응답과 재시도는 무시된다.
3. `session.run(() => api.search(submitted), { retryable: true })`. pending 중 상태 문구는 `t("search.pending")`이다.
4. 검색어를 바꿔 다시 검색하면 2~3을 반복한다. 늦게 온 이전 결과는 화면을 바꾸지 않는다.
5. 최신 요청이 끝나면 결과를 보인다. 실패하면 "다시 검색"으로 같은 검색어를 `session.retry()`한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 아직 검색 전이면 `t("search.notYet")`, `reset` 뒤(idle)에는 직전 결과(`state.value`) | — |
| 진행 중 | 이전 결과 대신 `t("search.pending")`. 검색 버튼은 그대로 눌린다(새 검색이 `reset`으로 이전 요청을 떼어 낸다) | 포커스는 입력·버튼에 유지, 진행 알림 |
| 성공 | 최신 검색어의 결과 | 결과 문구 알림 |
| 실패 | 네트워크·서버 실패: `t("search.failed")` + "다시 검색"(secondary). `state.value`는 직전 값이라 이전 결과를 실패 문구 대신 보이지 않는다. 재시도도 실패하면 같은 문구로 다시 error가 된다. 새 검색어로 검색하면 `reset`이 실패 시도를 버린다 | 실패 알림 |

`reset` 없이 run을 다시 부르면 pending 중이라 `blocked`가 되어 새 검색이 실행되지 않는다.
상태→문구 키는 상수 표(`searchStatusKey`)로 둔다. 템플릿 문자열 키는 키 추출·누락 검사가 찾지 못한다.

## 코드 골격

```tsx
// Web
import { useState, useSyncExternalStore } from "react";
import { createActionSession } from "@hjmds/design-contracts/action-session";
import { Button } from "@hjmds/react/actions";
import { SearchField } from "@hjmds/react/forms";
import { Heading } from "@hjmds/react/heading";
import { Container, Stack, Text } from "@hjmds/react/layout";

const searchStatusKey = { idle: "search.notYet", pending: "search.pending", error: "search.failed" } as const;

const [session] = useState(() => createActionSession<Result | null>(null));
const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
const [query, setQuery] = useState("");
const search = () => {
  const submitted = query.trim();
  if (!submitted) return;
  session.reset(state.value); // 이전 응답만 버린다. 서버 요청 취소가 아니다
  void session.run(() => api.search(submitted), { retryable: true });
};
const message = state.status === "pending" || state.status === "error" ? t(searchStatusKey[state.status])
  : state.value ? renderResult(state.value) : t(searchStatusKey.idle);

<Container gutter={gutter}>
  <Stack gap="xl">
    <Stack gap="md">
      <Heading level="level3" semanticLevel={2}>{t("search.title")}</Heading>
      <SearchField label={t("search.label")} clearLabel={t("common.clearSearch")} value={query} onValueChange={setQuery}
        loading={state.status === "pending"} />
      <Button disabled={!query.trim()} onClick={search}>{t("search.action")}</Button>
      <Text role="status">{message}</Text>
      {state.status === "error" ? <Button tone="secondary" onClick={() => void session.retry()}>{t("search.retry")}</Button> : null}
    </Stack>
  </Stack>
</Container>
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { Button } from "@hjmds/react-native/actions";
import { Heading } from "@hjmds/react-native/heading";
import { SearchField } from "@hjmds/react-native/inputs";
import { Container, Stack } from "@hjmds/react-native/primitives";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const { spacing } = useHjmNativeTheme().tokens;
const gutter = resolveWindowClass(useWindowDimensions().width) === "compact" ? "compact" : "regular";

<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: spacing.md }}>
  <Container gutter={gutter}>
    <Stack gap="xl">
      <Stack gap="md">
        <Heading level="level3" semanticLevel={2}>{t("search.title")}</Heading>
        <SearchField label={t("search.label")} clearLabel={t("common.clearSearch")} value={query} onValueChange={setQuery}
          busy={state.status === "pending"} busyLabel={t("search.pending")} />
        <Button disabled={!query.trim()} onPress={search}>{t("search.action")}</Button>
        <StatusText>{message}</StatusText>
        {state.status === "error" ? <Button tone="secondary" onPress={() => void session.retry()}>{t("search.retry")}</Button> : null}
      </Stack>
    </Stack>
  </Container>
</ScrollView>
```

`api.search`·`renderResult`·`Result`·문구 키는 제품 소유다. `StatusText`는 [저장과 재시도의 공통 절](action-recovery-save.md#공통-세션과-상태-알림)의 Native 상태 알림 helper다.
세션·`search`·`message`는 Web과 같다. 네트워크 요청을 실제로 끊어야 하면 제품이 `AbortController` 등을 따로 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 입력 이벤트 | `onValueChange`(문자열 값). DOM 이벤트가 필요할 때만 `onChange`(둘 다 호출된다) | `onValueChange` |
| 상태 알림 | `role="status"` | live region(Android) + iOS 알림 호출 |
| 바깥 틀 | `Container` | `ScrollView`(세로 여백, `keyboardShouldPersistTaps="handled"`) 안 `Container` |
| 검색 중 표시 | SearchField `loading` | SearchField `busy` + `busyLabel`(필수) |

## 함정

- 데모의 인위 지연(150·900ms)을 제품에 최소 대기 시간으로 복사하지 않는다.
- TanStack Query처럼 키별 캐시가 최신 요청을 이미 고르는 앱은 세션을 겹치지 않는다.
- 구획 제목은 Heading으로 표시한다. 이전 Text heading 예제는 2026-10-06 제목 의미 구조를 맞추면서 수정했다.
- 진행 표시를 결과 영역에 따로 두지 않는다. SearchField의 진행 표시와 상태 문구 하나면 된다(흡수한 `검색 입력` 예제의 규칙).
- 실패와 결과 없음은 다른 상태다. 실패는 `다시 검색`(`session.retry()`), 결과 없음은 검색어를 바꾸는 경로를 준다.
