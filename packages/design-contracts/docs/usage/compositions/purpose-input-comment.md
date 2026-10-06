# 댓글 작성

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [MessageComposer](../components/message-composer.md), [공통 실행과 실패 복구](../../action-session.md), `showcase/web/src/patterns/conversation-previews.tsx`, `showcase/native/src/conversation-previews.tsx`. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/입력과 작성/댓글 작성`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/입력과 작성/댓글 작성`

## 언제 쓰나

게시물·기록 아래에서 댓글이나 특정 댓글에 대한 답글을 남기고, 실패하면 글과 답글 대상을 그대로 남겨 다시 등록하게 할 때 쓴다. 새 입력 엔진을 만들지 않고 MessageComposer를 쓴다.

댓글 목록·답글 펼침·더 보기까지 포함한 화면은 [댓글 화면](../screens/common-comments.md)이 소유한다. 이 구성은 그 화면 하단 composer의 진행 중·실패·초안 유지만 따로 보인다.
사진을 함께 보내는 대화는 [메시지 작성](purpose-input-message.md)을 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `MessageComposer` | 입력·전송. `pending`이면 전송 버튼이 스피너만 보이고 접근성 이름은 유지한다 | [MessageComposer](../components/message-composer.md) |
| `replyTo` | 답글을 달 댓글 발췌와 취소 | [MessageComposer](../components/message-composer.md) |
| `context` 슬롯 + `Text tone="danger"` | 실패 문구를 입력 바로 위에 둔다 | [Text](../components/text.md) |
| `Heading level="level5"` | 구획 제목(선택). 화면 composer 슬롯에 넣을 때는 두지 않는다 | [Heading](../components/heading.md) |
| `createActionSession` | 전송 진행·중복 차단·재시도 | [계약](../../action-session.md) |

## 배치

```text
┌ 바깥 틀: Web 문서 스크롤 · Native ScrollView(위아래 spacing.md 16) ┐
│ ← Container gutter 16(폭 600 미만)/20 →                             │
│ ┌ Surface padding lg ────────────────────────────────┐              │
│ │ 댓글 작성                       Heading level5     │              │
│ │ ┌ MessageComposer ───────────────────────────────┐ │              │
│ │ │ context: 실패 문구(실패일 때만)                │ │              │
│ │ │ 답글 대상: 서연 · 발췌 ............ [답글 취소]│ │              │
│ │ │ [ 댓글을 남겨 주세요 (1~5줄)          (↑) ]    │ │ ← circle 등록│
│ │ └────────────────────────────────────────────────┘ │              │
│ │ 등록한 댓글 목록(예제)                             │              │
│ └────────────────────────────────────────────────────┘              │
│ [답글 대상 선택] [다음 전송 실패시키기]  ← 데모 보조 행동             │
└──────────────────────────────────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | 화면의 composer 슬롯(ChatScreen·CommentThreadScreen `composer`). 단독 예제는 Web 문서 스크롤 > `Container`, Native `ScrollView` > `Container` | 화면 하단(footer). 키보드 adapter는 화면 host 하나만 | 좌우 `Container gutter`: 폭 600 미만 `compact` 16, 이상 `regular` 20. Native 위아래 `spacing.md` 16 |
| 제목(선택) | `Heading level5` | Surface 맨 위 | 아래 `spacing.md` 16 |
| composer | `MessageComposer` | 제목 아래 | 입력 1~5줄(`composerMaxLines`), 세로 묶음 `screenPatternRecipe.itemGap` 12(두 플랫폼, 1.12.1 이하 Web은 8)([배치](../components/message-composer.md#배치)) |
| 실패 문구 | `context` | composer 맨 위 | composer 세로 간격 |
| 데모 보조 행동 | `Button` secondary·ghost | Surface 아래 가로 줄 | `spacing.sm` 12. 제품에는 넣지 않는다 |

## 흐름과 상태

1. 사용자가 글을 쓰고 필요하면 답글 대상을 고른 뒤 전송한다(Enter는 줄바꿈).
2. 전송 중에는 `pending`으로 입력과 전송을 잠그고 같은 요청을 다시 보내지 않는다.
3. 서버가 성공을 확정한 뒤에만 글·답글 대상을 지운다.
4. 실패하면 모두 그대로 두고 `context`에 실패 문구를 보인다. 같은 전송 버튼으로 다시 보낸다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 빈 입력, 전송 비활성(글이 없을 때) | 입력 이름 `label` |
| 진행 중 | `pending`: 입력 잠금, 전송 자리 스피너 | 포커스 유지, 중복 요청 차단 |
| 실패 | 글·답글 대상 유지, `context`에 실패 문구 | 실패 문구는 입력 근처, 포커스 이동 없음 |
| 성공 | 초안 정리, 보낸 항목이 목록에 추가 | 포커스는 입력에 남는다 |

## 코드 골격

```tsx
// Web
import { MessageComposer } from "@hjmds/react/screens";
import { Text } from "@hjmds/react/layout";

<MessageComposer
  label={t("comments.input")}
  sendLabel={t("comments.send")}
  value={draft}
  onValueChange={setDraft}
  pending={sending}
  context={failed ? <Text tone="danger">{t("comments.sendFailed")}</Text> : null}
  {...(replyTo ? { replyTo: { author: replyTo.author, excerpt: replyTo.text, cancelLabel: t("comments.cancelReply"), onCancel: () => setReplyTo(null) } } : {})}
  onSend={async (text) => { const ok = await send(text); if (ok) clearDraft(); }}
/>
```

```tsx
// Native
import { MessageComposer } from "@hjmds/react-native/screens";
import { Text } from "@hjmds/react-native/primitives";

<MessageComposer
  label={t("comments.input")}
  sendLabel={t("comments.send")}
  value={draft}
  onValueChange={setDraft}
  pending={sending}
  context={failed ? <Text tone="danger">{t("comments.sendFailed")}</Text> : null}
  {...(replyTo ? { replyTo: { author: replyTo.author, excerpt: replyTo.text, cancelLabel: t("comments.cancelReply"), onCancel: () => setReplyTo(null) } } : {})}
  onSend={async (text) => { const ok = await send(text); if (ok) clearDraft(); }}
/>
```

`send`·`clearDraft`·`replyTo`는 제품 소유다. `onSend`는 문자열만 넘기므로 답글 대상은 제품 상태에서 읽는다.

## 함정

- 실패 시 글·답글 대상을 지우지 않는다. 성공을 먼저 표시하고 지우면 재전송할 내용이 사라진다.
- Enter 전송을 덧붙이지 않는다. IME 조합 중 Enter를 전송으로 가로채면 한글 마지막 글자가 빠진다.
- 스토리의 "다음 전송 실패시키기"·350ms 지연·예제 사진은 로컬 시연이다. 업로드·서버 저장·권한은 제품이 연결한다.
