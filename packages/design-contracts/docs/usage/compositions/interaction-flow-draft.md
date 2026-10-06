# 닫았다 열고 초안 이어쓰기

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [제품 상호작용 품질](../../../../../docs/INTERACTION_QUALITY.md), [공통 실행과 실패 복구 · 초안과 실행 취소](../../action-session.md#초안과-실행-취소), [Sheet 계약](../../sheet.md), `showcase/web/src/patterns/interaction-flow-previews.tsx`, `showcase/native/src/interaction-flow-previews.tsx`. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/상호작용 예제/닫았다 열고 초안 이어쓰기`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/입력과 작성/닫았다 열고 초안 이어쓰기`

## 언제 쓰나

메모·댓글처럼 시트에서 쓰던 글을 저장하지 않고 닫았다가 다시 열었을 때, 쓰던 초안을 그대로 이어 쓰게 할 때 쓴다.

초안을 버리는 것은 명시적인 "초안 버리기" 행동으로만 한다. 이 예제는 화면이 열린 동안만 초안을 보존한다. 앱 종료 뒤 복구·로그아웃 정리·
암호화는 제품 저장소가 결정한다.

같은 `상호작용 예제` 묶음: [선택 후 적용·취소](interaction-flow-apply.md) · [늦은 응답보다 최신 검색 유지](interaction-flow-search.md) ·
[대표 항목과 묶음 전체 선택](selection-scope.md). 시트 흐름의 공통 규칙은 [선택 후 적용·취소의 공통 절](interaction-flow-apply.md#공통-시트-흐름)을 따른다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Container`·`Stack` | 바깥 틀. 구획 사이 `gap="xl"`, 묶음 안 `gap="md"` | [Container](../components/container.md), [Stack](../components/stack.md) |
| `Heading` | 묶음 제목 | [Heading](../components/heading.md) |
| `Button` 트리거 | 작성 시트를 연다. 화면의 primary 하나 | [Button](../components/button.md) |
| `Text` 상태 | 초안 유무 `t("memo.hasDraft")`·`t("memo.noDraft")`, 저장된 메모 | [Text](../components/text.md) |
| `Sheet` | 작성 영역. `closeLabel`이 "초안을 남기고 닫기"라는 의미를 말한다. Native는 `keyboardAvoidance`·`scrollable`, 저장 중 `busy` | [Sheet](../components/sheet.md) |
| `TextField` | 초안 입력. 값은 시트 밖 state. Web·Native 모두 `onValueChange` | [Field](../components/field.md) |
| `Button` 저장 / `Button` 초안 버리기(secondary) | 시트 `footer`. 저장은 빈 초안이면 `disabled`, 저장 중 `loading` | [Button](../components/button.md) |

## 배치

```text
┌ 화면 ────────────────────────────────┐
│ Native ScrollView 위아래 16          │
│ └ Container gutter 16/20             │
│   Heading 제목                       │
│   [ 메모 작성 ]  ← 트리거(primary)    │  Stack gap spacing.md 16
│   작성 중인 초안이 있어요 (status)   │
│   저장된 메모 (제품 소유)            │
└──────────────────────────────────────┘
         ▼ 열림(하단 시트, 모달)
┌ Sheet ───────────────────────────────┐
│ 메모 작성        [× 초안 남기고 닫기]│ ← header 고정
├──────────────────────────────────────┤
│ 메모 내용                            │ ↑ body 스크롤(Native scrollable)
│ [ 입력                             ] │ │ TextField 높이 44
│ 안내 문구 / 저장 실패 문구           │ ↓ 간격 spacing.md 16
├──────────────────────────────────────┤
│ Web:    [초안 버리기] [메모 저장]     │ ← footer 고정, 오른쪽 정렬, gap 12
│ Native: [ 메모 저장 ] / [ 초안 버리기 ]│ ← 세로, 주 행동 먼저
│ ░░ 하단 안전 영역 / 키보드 위 ░░      │
└──────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Native: `ScrollView` → `Container` → `Stack gap="xl"`. Web: `Container` → `Stack gap="xl"` | 화면 본문. 안전 영역은 화면 셸이, 시트 아래 안전 영역은 Sheet가 더한다. 키보드는 입력이 있는 시트가 처리한다(Native `keyboardAvoidance`) | Native `ScrollView` 위아래 `spacing.md` 16, 좌우 `Container` `gutter`(폭 600 미만 `compact` 16, 이상 `regular` 20). 구획 사이 `layout.sectionGap` 24 |
| 제목 | `Heading level="level3"` | 묶음 맨 위 | 24/32(`heading.level3`), 묶음 안 `layout.contentGap` 16 |
| 트리거·상태 | `Button`, `Text` | 제목 아래 | 버튼 `medium` 44, `spacing.md` 16 |
| 시트 머리 | `Sheet` header | 시트 위 고정 | Native 최소 높이 `control.minTouchTarget` 44 |
| 입력 | `TextField` | 시트 body, 스크롤 | 높이 `control.fieldHeight` 44, 간격 `spacing.md` 16(Native `sheetRecipe.body.gap`, Web은 `Stack gap="md"`) |
| 행동 | `Button` 저장·버리기 | 시트 footer, 스크롤 밖 고정 | 간격 `spacing.sm` 12(`sheetRecipe.footer.gap`) |
| 키보드 | `Sheet keyboardAvoidance`(Native) | 시트 전체가 키보드 위로 | 제품 키보드 listener·maxHeight를 두지 않는다 |

- footer 순서는 [Sheet](../components/sheet.md) 배치 규칙을 따른다. Web은 가로 줄 **[버리기][저장]**, Native는 세로 열 **저장(primary) 먼저, 버리기(secondary) 아래**다.
  renderer footer가 간격 12를 주므로 `Stack`으로 다시 감싸지 않는다.
- 버리기가 되돌릴 수 없는 손실이면 `tone="danger"`와 [InlineConfirm](../components/button.md)으로 한 번 더 확인하는 것을 검토한다.

근거: `src/component-recipes.ts`(`sheetRecipe`), `src/foundations.ts`(`control`, `layout`, `heading`), `packages/react/src/styles.css`(`.hjm-sheet__footer`), [Sheet 지침](../components/sheet.md)

## 흐름과 상태

1. 트리거를 누르면 시트가 열리고, 남아 있던 초안이 입력에 그대로 보인다.
2. 입력한다. 초안은 시트 밖 state에 쌓인다.
3. 닫기(×)·바깥 누름·back으로 닫으면 초안은 남고 화면 상태 문구가 "초안 있음"이 된다.
4. 다시 열면 이어 쓴다.
5. 저장하면 저장 값을 갱신하고 초안을 비운 뒤 닫는다. 버리기는 초안을 비우고 닫는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 시트 닫힘, 상태 문구 `t("memo.noDraft")` 또는 `t("memo.hasDraft")` | — |
| 작성 중(열림) | 입력 + footer, 빈 입력이면 저장 `disabled` | 시트로 포커스 이동 |
| 진행 중 | 서버 저장 중: 저장 `loading`, Sheet `busy`로 닫기를 막는다. 입력은 그대로 보인다. 이 예제(로컬 저장)에는 없다 | 시트 안 포커스 유지 |
| 실패 | 저장 실패(네트워크·서버 오류): 시트를 열어 둔 채 초안을 지우지 않고 body 아래 실패 문구(`memo.saveFailed`). 다시 저장을 누르면 재요청하고, 재요청도 실패하면 같은 문구를 다시 알린다 | 실패 문구 알림(Web `role="status"`, Native live region) |
| 초안 남기고 닫힘 | 상태 문구 `t("memo.hasDraft")` | 트리거로 복귀, 상태 문구 알림 |
| 저장 | 저장된 메모 갱신, 초안 비움 | 트리거로 복귀 |

서버 저장이 붙으면 저장 버튼에 [저장과 재시도](action-recovery-save.md)를 합친다. 현재보다 오래된 성공 응답으로 사용자가 새로 쓴 초안을 지우지 않는다.
상태→문구 키는 상수 표(`draftStatusKey`)로 둔다. 템플릿 문자열 키는 키 추출·누락 검사가 찾지 못한다.

## 코드 골격

```tsx
// Web
import { useRef, useState } from "react";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Heading } from "@hjmds/react/heading";
import { Container, Stack, Text } from "@hjmds/react/layout";
import { Sheet } from "@hjmds/react/overlays";

const draftStatusKey = { empty: "memo.noDraft", kept: "memo.hasDraft", failed: "memo.saveFailed" } as const;

const [open, setOpen] = useState(false);
const [draft, setDraft] = useState(""); // 시트 밖에 둬서 닫아도 남는다
const trigger = useRef<HTMLButtonElement>(null);

<Container gutter={gutter}>
  <Stack gap="xl">
    <Stack gap="md">
      <Heading level="level3" semanticLevel={2}>{t("memo.title")}</Heading>
      <Button ref={trigger} onClick={() => setOpen(true)}>{t("memo.write")}</Button>
      <Text role="status">{t(draft ? draftStatusKey.kept : draftStatusKey.empty)}</Text>
    </Stack>
  </Stack>
  <Sheet open={open} onOpenChange={setOpen} title={t("memo.write")} closeLabel={t("memo.closeKeepDraft")}
    returnFocusRef={trigger} busy={saving}
    footer={<>
      <Button tone="secondary" disabled={saving} onClick={() => { setDraft(""); setOpen(false); }}>{t("memo.discard")}</Button>
      <Button disabled={!draft.trim()} loading={saving} onClick={save}>{t("memo.save")}</Button>
    </>}>
    <Stack gap="md">
      <TextField label={t("memo.body")} value={draft} onValueChange={setDraft} />
      {saveFailed ? <Text role="status">{t(draftStatusKey.failed)}</Text> : null}
    </Stack>
  </Sheet>
</Container>
```

```tsx
// Native
import { ScrollView, View, useWindowDimensions } from "react-native";
import { Button } from "@hjmds/react-native/actions";
import { Heading } from "@hjmds/react-native/heading";
import { TextField } from "@hjmds/react-native/inputs";
import { Sheet } from "@hjmds/react-native/overlays";
import { Container, Stack } from "@hjmds/react-native/primitives";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const { spacing } = useHjmNativeTheme().tokens;
const gutter = resolveWindowClass(useWindowDimensions().width) === "compact" ? "compact" : "regular";

<ScrollView contentContainerStyle={{ paddingVertical: spacing.md }}>
  <Container gutter={gutter}>
    <Stack gap="xl">
      <Stack gap="md">
        <Heading level="level3" semanticLevel={2}>{t("memo.title")}</Heading>
        <View ref={trigger} collapsable={false}>
          <Button onPress={() => setOpen(true)}>{t("memo.write")}</Button>
        </View>
        <StatusText>{t(draft ? draftStatusKey.kept : draftStatusKey.empty)}</StatusText>
      </Stack>
    </Stack>
  </Container>
</ScrollView>
<Sheet open={open} onOpenChange={setOpen} title={t("memo.write")} closeLabel={t("memo.closeKeepDraft")}
  returnFocusRef={trigger} keyboardAvoidance scrollable busy={saving}
  footer={<>
    <Button disabled={!draft.trim()} loading={saving} onPress={save}>{t("memo.save")}</Button>
    <Button tone="secondary" disabled={saving} onPress={() => { setDraft(""); setOpen(false); }}>{t("memo.discard")}</Button>
  </>}>
  <TextField label={t("memo.body")} value={draft} onValueChange={setDraft} />
  {saveFailed ? <StatusText>{t(draftStatusKey.failed)}</StatusText> : null}
</Sheet>
```

`save`(성공하면 초안을 비우고 닫고, 실패하면 `saveFailed`만 켠다)·`saving`·문구 키는 제품 소유다. `StatusText`는
[저장과 재시도의 공통 절](action-recovery-save.md#공통-세션과-상태-알림)의 Native 상태 알림 helper다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 키보드 | 브라우저가 처리 | `keyboardAvoidance` + `scrollable`을 함께 켠다 |
| 입력 이벤트 | `onValueChange`(문자열 값). DOM 이벤트가 필요할 때만 `onChange`(둘 다 호출된다) | `onValueChange` |
| 트리거 ref | `Button ref` | `View ref collapsable={false}`로 감쌈 |
| footer | 가로 [버리기][저장] | 세로 [저장] 위 [버리기] 아래 |
| 시트 body 간격 | 없음 → `Stack gap="md"` | `sheetRecipe.body.gap` 16 |
| 상태 알림 | `role="status"` | live region(Android) + iOS 알림 호출 |

## 함정

- 초안 state를 시트 children 안 컴포넌트에 두지 않는다. 닫힌 시트의 내용이 계속 마운트돼 있다고 가정하지 않고, 시트를 여는 화면이 초안을 소유한다.
- 구획 제목은 Heading으로 표시한다. 이전 Text heading 예제는 2026-10-06 제목 의미 구조를 맞추면서 수정했다.
