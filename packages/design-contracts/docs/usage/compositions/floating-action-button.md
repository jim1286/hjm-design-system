# 빠른 메모 작성

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [FloatingActionButton](../../floating-action-button.md), `src/floating-action-button.ts`, `packages/react/src/styles.css` `.hjm-fab`, `showcase/{web/src/patterns,native/src}/FloatingActionButton.stories.tsx`
- 스토리북: `배포/구성/입력과 작성/빠른 메모 작성`

## 언제 쓰나

스크롤되는 기록 목록 위에 떠 있는 생성 버튼으로 짧은 입력 대화상자를 열고, 저장하면 새 항목을 목록 맨 위에 넣을 때 쓴다.
목록을 읽는 중에는 버튼이 원으로 접히고, 위로 돌아오면 라벨이 다시 보인다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| TopBar | 화면 제목 | [TopBar](../components/top-bar.md) |
| Container | 목록 좌우 여백(gutter) | [Container](../components/container.md), [화면 여백](../tokens/layout.md) |
| List + ListRow | 기록 목록(제목·설명) | [List](../components/list.md), [ListRow](../components/list-row.md) |
| EmptyState | 기록이 없을 때 목록 자리(스토리에는 없다) | [EmptyState](../components/empty-state.md) |
| FloatingActionButton | 단일 생성 행동(화면의 주 행동), 스크롤 방향에 따라 접힘 | [FloatingActionButton](../components/floating-action-button.md) |
| `useFloatingActionButtonScroll` | 스크롤로 `layoutMode` 결정 | [FloatingActionButton](../components/floating-action-button.md) |
| Dialog | 작성 대화상자, 주 행동 "기록 추가" | [Dialog](../components/dialog.md) |
| TextArea | 메모 입력 | [TextArea](../components/text-area.md) |
| Notice | 저장 실패(제품이 더한다) | [Notice](../components/notice.md) |

## 배치

```text
┌──────────── 상단 안전 영역(TopBar safeAreaTop) ┐
│ 나의 기록 (TopBar, 좌우 16)              │
├─────────── 스크롤 영역(FAB 스크롤 대상) ─┤
│ ←gutter→ Container                ←gutter→ │
│   기억하고 싶은 순간 1 (ListRow)         │
│   기억하고 싶은 순간 2                   │
│   ...                                    │
│   마지막 항목                            │
│ ┄┄┄ 하단 여백 = clearance ┄┄┄┄┄┄┄┄┄┄┄┄┄ │ ← 84 + 하단 inset
│                    ╭──────────────╮      │
│                    │ ＋ 새 기록   │      │ ← FAB(주 행동), 끝 쪽 하단
│                    ╰──────────────╯      │   스크롤 내리면 (＋) 원 52
│                          margin 16 →     │
└──────── 하단 안전 영역 + margin 16 ──────┘

Dialog (열림)
┌──────────────────────────────┐
│ 어떤 순간을 남길까요?   [닫기] │
│ [저장 실패 Notice] (실패 시)  │
│ ┌ 나의 기록 ───────────────┐ │
│ │ TextArea                 │ │
│ └──────────────────────────┘ │
│                  [기록 추가] │ ← 주 행동, 비어 있으면 disabled
└──────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web: 높이 `100dvh`·`overflow-y: auto` 스크롤 요소(FAB hook의 대상). Native: `flex: 1`·`position: "relative"` View > `ScrollView`(`onScroll`, `scrollEventThrottle={16}`) | 화면 전체. 위 안전 영역은 TopBar(`safeAreaTop`, 내비게이션 헤더가 있으면 헤더), 아래는 FAB와 clearance | 스크롤 콘텐츠 아래 padding = `onContentClearanceChange` 값(첫 값 52 + 16×2 + 하단 inset = 84 + inset). 위아래 다른 여백은 두지 않는다(TopBar가 맨 위). 목록 좌우는 `Container gutter`: 폭 600 미만 `compact` 16 · 이상 `regular` 20([화면 여백](../tokens/layout.md)) |
| 제목 | TopBar | 스토리는 스크롤 콘텐츠 맨 위(함께 스크롤). 고정하려면 스크롤 영역 밖에 둔다. Container 밖(가장자리까지) | 최소 높이 52 + 위쪽 안전 영역, 좌우 `spacing.md` 16(TopBar 소유) |
| 목록 | Container > List > ListRow | 스크롤 영역, TopBar 아래 | ListRow 좌우 `spacing.xs` 8은 행 안 여백이고 화면 여백은 Container gutter다 |
| 생성 버튼 | FloatingActionButton | 스크롤 영역 뒤 sibling, 논리적 끝 쪽 하단(RTL은 왼쪽) | 지름 `large` 52, 여백 `spacing.md` 16, 펼침 라벨 좌우 `spacing.lg` 20 |
| 작성 | Dialog `medium` | 화면 가운데 오버레이 | 최대 폭 420. Web padding `spacing.lg` 20, Native `medium` 안쪽 `spacing.xl` 24 |
| 저장 실패 | Notice `tone="danger"` | 대화상자 본문 맨 위(Web), 목록 위(Native, 아래 흐름 5) | 본문 영역 사이 `spacing.md` 16 |

- 한 화면의 주 행동은 FAB 하나다. 대화상자 안 "기록 추가"는 모달 안 행동이라 화면 primary와 따로 센다([Button](../components/button.md)).

## 흐름과 상태

1. 목록을 아래로 스크롤하면 FAB가 원(`collapsed`)으로, 위로 스크롤하면 알약(`expanded`)으로 바뀐다. 같은 버튼 인스턴스라 포커스가 유지된다.
2. FAB를 누르면 Dialog가 열린다.
3. 내용을 쓰면 "기록 추가"가 활성화된다. 누르면 저장한다(비동기면 `busy`).
4. 성공하면 새 항목을 목록 맨 위에 넣고, 대화상자를 닫고, 입력을 비우고, 목록을 맨 위로 스크롤한다. 맨 위로 돌아오면 FAB 라벨이 다시 펼쳐진다.
5. 실패(네트워크·서버 오류)하면 입력을 비우지 않는다. Web은 대화상자를 연 채 본문 맨 위에 Notice를 보이고 "기록 추가"를 다시 누를 수 있다.
   Native Dialog는 `primaryAction`을 누르면 콜백을 부른 뒤 바로 `close-action`을 요청하므로, 열어 두려면 제어형 소유자가
   저장 중 닫기 요청을 무시한다(아래 코드 골격). 재시도도 실패하면 같은 Notice가 한 개만 남는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 목록 + 펼친 FAB(아이콘 + "새 기록" 알약). 스크롤하면 접힌 원 52 | 접근성 이름은 접힘·펼침 모두 전체 `label` |
| 진행 중 | 저장 중. Dialog `busy`(닫기 막음), Web "기록 추가" `loading`, Native 행동 버튼 `disabled` | 포커스는 대화상자 안에 유지 |
| 실패 | 대화상자 열림 유지, 입력 유지, 본문 맨 위 `Notice tone="danger"` `t("notes.compose.failed")` | Web `danger` Notice는 `role="alert"`. Native는 `announcement="assertive"`를 줘야 알린다. 포커스 이동 없음 |
| 입력 비어 있음 | "기록 추가" `disabled` | — |
| 저장 후 | 새 항목이 맨 위, 대화상자 닫힘 | Web Dialog는 닫히며 포커스를 트리거(FAB)로 돌린다. Native는 `returnFocusRef`로 지정한다 |
| 큰 글자 | 라벨이 여러 줄이 되어 clearance가 커진다 | 측정값을 하단 padding에 그대로 반영 |
| 빈 목록 | 목록 자리에 [EmptyState](../components/empty-state.md), FAB는 그대로 | — |
| 목록 불러오기 실패 | 목록 자리에 [EmptyState](../components/empty-state.md)(실패 문구 + `action`에 다시 불러오기 버튼). FAB는 그대로 | EmptyState `announcement`(Native)로 알림 |

## 코드 골격

```tsx
// Web
import { useState } from "react";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Button } from "@hjmds/react/actions";
import { List, ListRow } from "@hjmds/react/display";
import { Notice } from "@hjmds/react/feedback";
import { FloatingActionButton, useFloatingActionButtonScroll, resolveFloatingActionButtonContentClearance } from "@hjmds/react/floating-action-button";
import { TextArea } from "@hjmds/react/forms";
import { Container } from "@hjmds/react/layout";
import { Dialog } from "@hjmds/react/overlays";
import { TopBar } from "@hjmds/react/top-bar";

function Notes() {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const layoutMode = useFloatingActionButtonScroll(target);
  const [clearance, setClearance] = useState(resolveFloatingActionButtonContentClearance(0));
  const gutter = resolveWindowClass(window.innerWidth) === "compact" ? "compact" : "regular";
  return (
    <>
      <div ref={setTarget} style={{ blockSize: "100dvh", overflowY: "auto" }}>
        <div style={{ paddingBottom: clearance }}>
          <TopBar title={t("notes.title")} />
          <Container gutter={gutter}>
            <List label={t("notes.recent")}>{notes.map((n) => <ListRow key={n.id} title={n.text} />)}</List>
          </Container>
        </div>
      </div>
      <FloatingActionButton descriptor={{ label: t("notes.new"), icon: { name: "add" }, layoutMode }}
        renderIcon={renderIcon} onContentClearanceChange={setClearance} onClick={() => setOpen(true)} />
      <Dialog title={t("notes.compose.title")} open={open} onOpenChange={setOpen} closeLabel={t("common.close")} busy={saving}
        footer={<Button loading={saving} disabled={!draft.trim()} onClick={save}>{t("notes.compose.save")}</Button>}>
        {failed && <Notice tone="danger" title={t("notes.compose.failed")} />}
        <TextArea label={t("notes.compose.label")} value={draft} onChange={(event) => setDraft(event.currentTarget.value)} />
      </Dialog>
    </>
  );
}
```

```tsx
// Native
import { useRef, useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { List, ListRow } from "@hjmds/react-native/data-display";
import { Notice } from "@hjmds/react-native/feedback";
import { FloatingActionButton, useFloatingActionButtonScroll, resolveFloatingActionButtonContentClearance } from "@hjmds/react-native/floating-action-button";
import { TextArea } from "@hjmds/react-native/inputs";
import { Dialog } from "@hjmds/react-native/overlays";
import { Container } from "@hjmds/react-native/primitives";
import { TopBar } from "@hjmds/react-native/top-bar";

function Notes() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scroll = useRef<ScrollView>(null);
  const submitting = useRef(false); // save()가 동기로 true로 둔다 — Dialog가 곧바로 보내는 close-action을 무시하기 위해
  const { layoutMode, onScroll } = useFloatingActionButtonScroll();
  const [clearance, setClearance] = useState(resolveFloatingActionButtonContentClearance(insets.bottom));
  return (
    <View style={{ flex: 1, position: "relative" }}>
      <ScrollView ref={scroll} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: clearance }}>
        <TopBar title={t("notes.title")} safeAreaTop={insets.top} />
        <Container gutter={resolveWindowClass(width) === "compact" ? "compact" : "regular"}>
          <List label={t("notes.recent")}>{notes.map((n) => <ListRow key={n.id} title={n.text} />)}</List>
        </Container>
      </ScrollView>
      <FloatingActionButton descriptor={{ label: t("notes.new"), icon: { name: "add" }, layoutMode }}
        renderIcon={renderIcon} safeAreaBottomInset={insets.bottom}
        onContentClearanceChange={setClearance} onPress={() => setOpen(true)} />
      <Dialog title={t("notes.compose.title")} open={open} closeLabel={t("common.close")} busy={saving}
        onOpenChange={(next) => { if (!next && submitting.current) return; setOpen(next); }}
        primaryAction={{ label: t("notes.compose.save"), onPress: save, disabled: !draft.trim() }}>
        {failed ? <Notice tone="danger" announcement="assertive" title={t("notes.compose.failed")} /> : null}
        <TextArea label={t("notes.compose.label")} value={draft} onValueChange={setDraft} />
      </Dialog>
    </View>
  );
}
```

`save`는 `saving`(Native는 `submitting.current`도)을 켜고 저장한 뒤 성공이면 항목 추가·닫기·입력 비우기·맨 위로 스크롤,
실패면 `failed`를 켜고 대화상자를 연 채 둔다. 스토리의 18개 예시 기록과 문구, `＋` 글자 아이콘은 제품 데이터·아이콘으로 바꾼다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| FAB 위치 | CSS `position: fixed`, 안전 영역 `env()` 자동 | positioned 부모 안 `absolute`, `safeAreaBottomInset` 직접 전달 |
| 스크롤 hook | `useFloatingActionButtonScroll(target)` → `layoutMode` | `useFloatingActionButtonScroll()` → `{ layoutMode, onScroll }`, `scrollEventThrottle={16}` |
| 대화상자 주 행동 | `footer`에 Button(`loading` 가능) | `primaryAction` 객체. 누르면 콜백 뒤 바로 `close-action` 요청, `loading` 없음(`busy`면 `disabled`) |
| TextArea 값 | DOM `onChange`(Web TextArea에는 `onValueChange`가 없다, 1.12.1) | `onValueChange(value)` |
| 맨 위로 | `target.scrollTo({ top: 0 })` | `scroll.current?.scrollTo({ y: 0 })` |

## 함정

- clearance를 스크롤 콘텐츠 하단 padding에 넣지 않으면 마지막 항목이 FAB 아래에 가려진다. 지름만 예약하지 않는다.
- 한 화면에 FAB는 하나다. 하단 고정 결론 행동이 따로 있으면 [BottomCTA](../components/bottom-cta.md)를 쓴다.
- Native Dialog에서 비동기 저장을 `primaryAction`에 넣고 닫기 요청을 그대로 받으면 실패해도 대화상자가 이미 닫혀 있다. 저장 중 닫기 요청은 소유자가 무시한다.
- 현재 Native 스토리는 `safeAreaBottomInset`·TopBar `safeAreaTop`을 넘기지 않는다. 실제 화면은 inset을 넘긴다.
- 현재 스토리는 List를 Container 없이 화면 가장자리에 둔다(ListRow 좌우 8만 남는다). 제품은 Container gutter 안에 둔다.
- Web TextArea는 TextField와 달리 `onValueChange`가 없다(1.12.1). Web은 `onChange`로 값을 읽는다([TextArea](../components/text-area.md)).
- 현재 스토리는 저장이 동기라 진행 중·실패 상태가 없고 문구가 i18n 키 없는 리터럴이다.
