# ReplyComposer

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [연결 계약](../../communication.md), `src/communication.ts`의 `validateReplyTarget`, 양 renderer `src/communication.tsx`(`MessageComposer` 래퍼)
- 스토리북: `배포/구성/입력과 작성/메시지 답장 연결`

## 언제 쓰나

답장 대상(실제 메시지 id·저자·발췌)을 가진 작성창에서 실제 전송 Promise를 기다리고, 실패하면 초안을 보존해 다시 보낼 때 쓴다.
[MessageComposer](message-composer.md)를 그대로 렌더하며 `replyTo`·`pending`·`onSend`를 이 구성이 연결한다. 대상 선택은 [ReplyMessage](reply-message.md)가 맡는다.
묶음 사용 기준은 [펼치는 검색과 실제 메시지 답장](../compositions/communication.md)이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 답장·전송 진행 상태를 제품이 직접 관리하는 작성창 | [MessageComposer](message-composer.md) |
| 대화 화면 전체(헤더·타임라인·작성창) | [ChatScreen](chat-screen.md) |
| 댓글 작성 | [CommentThreadScreen](comment-thread-screen.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ReplyComposer` | 답장 대상·실제 전송·실패 보존 작성창 | `@hjmds/react/communication` | `@hjmds/react-native/communication` |

루트 barrel에는 없다. `ReplyTarget` 타입은 `@hjmds/design-contracts/communication`에 있다.

## 최소 사용 예

```tsx
// Web
import { ReplyComposer } from "@hjmds/react/communication";

<ReplyComposer value={draft} onValueChange={setDraft} label={t("chat.input")} sendLabel={t("chat.send")}
  replyTarget={replyTarget} onReplyCancel={() => setReplyTarget(null)}
  cancelReplyLabel={t("chat.replyCancel")} errorLabel={t("chat.sendFailed")}
  onSend={async (value, { replyToId }) => { await sendMessage({ value, replyToId }); setDraft(""); setReplyTarget(null); }} />
```

```tsx
// Native
import { ReplyComposer } from "@hjmds/react-native/communication";

<ReplyComposer value={draft} onValueChange={setDraft} label={t("chat.input")} sendLabel={t("chat.send")}
  replyTarget={replyTarget} onReplyCancel={() => setReplyTarget(null)}
  cancelReplyLabel={t("chat.replyCancel")} errorLabel={t("chat.sendFailed")}
  onSend={sendConfirmed} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `replyTarget` | `{ id, author, excerpt } \| null` | 필수 | `null`이면 답장 없음. id가 비어 있으면 `TypeError`(`validateReplyTarget`) |
| `onReplyCancel` / `cancelReplyLabel` | `() => void` / `string` | 필수 | MessageComposer `replyTo`의 취소 행동·이름 |
| `onSend` | `(value, { replyToId }) => void \| Promise<void>` | 필수 | 전송 시작 시점의 대상 id(없으면 `null`)를 넘긴다. 실제 전송 확인 뒤 resolve, 실패면 reject |
| `errorLabel` | `string` | 필수 | 실패 문구 |
| 나머지 | `MessageComposerProps` | — | `onSend`·`replyTo`·`pending`·`error`를 뺀 props(`value`·`onValueChange`·`label`·`sendLabel`·`maxLength`·`lengthFeedback`·`disabled` 등)를 그대로 전달 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | MessageComposer와 같다 | [MessageComposer](message-composer.md) |
| 간격 | 작성창과 실패 문구 사이 `Stack gap="sm"`(12) | 양 renderer `ReplyComposer` |
| 순서·정렬 | 작성창(답장 대상이 있으면 입력창 위에 대상·취소) → 실패 문구(가운데 정렬) | 렌더 순서, MessageComposer `replyTo` |
| 고정·스크롤 | 자체 고정 없음. 키보드 위 고정은 ChatScreen·KeyboardDock host 소유 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | MessageComposer와 같다. 실패 문구는 줄바꿈된다 | 양 renderer |

## 꼭 지킬 것

- 초안을 지우는 것은 제품이다. 이 구성은 controlled `value`를 비우지 않는다. 전송 확인 뒤 `setDraft("")`·대상 해제를 한다.
- 전송 중 대상이 바뀌어도 `onSend`에는 시작 시점의 `replyToId`가 간다. 늦은 응답 검증은 제품 상태 계층에서 한다.
- `pending`·`error`·`replyTo`를 직접 넘기지 않는다(타입에서 제외).

## 상태와 상호작용

전송 중에는 MessageComposer `pending`으로 중복 전송을 막는다. reject하면 초안과 답장 대상을 유지하고 실패 문구를 표시한다(Web `role="alert"`, Native `accessibilityRole="alert"`·assertive live region).
