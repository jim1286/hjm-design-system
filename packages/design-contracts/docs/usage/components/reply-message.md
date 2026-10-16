# ReplyMessage

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [연결 계약](../../communication.md), 양 renderer `src/communication.tsx`(`ChatMessage` 래퍼)
- 스토리북: `배포/구성/입력과 작성/메시지 답장 연결`

## 언제 쓰나

대화 타임라인의 메시지에 실제 메시지 id를 묶은 답장 동작을 붙일 때 쓴다. [ChatMessage](chat-message.md)를 그대로 렌더하고,
`replyAction`을 `messageId`로 만들어 넣는다. 가로 스와이프 한 번의 소유자를 답장 또는 시각 공개 중 하나로 정한다.
답장 대상을 받아 전송하는 쪽은 [ReplyComposer](reply-composer.md)다. 묶음 사용 기준은 [펼치는 검색과 실제 메시지 답장](../compositions/communication.md)이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 답장 기능이 없는 메시지 | [ChatMessage](chat-message.md) |
| 답장 동작을 직접 조합해야 하는 메시지(반응 메뉴 항목 등) | [ChatMessage](chat-message.md)의 `replyAction` |
| 댓글의 답글 | [CommentThreadScreen](comment-thread-screen.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ReplyMessage` | 실제 id를 가진 답장 가능 메시지 | `@hjmds/react/communication` | `@hjmds/react-native/communication` |

루트 barrel에는 없다.

## 최소 사용 예

```tsx
// Web
import { ReplyMessage } from "@hjmds/react/communication";

<ReplyMessage messageId={message.id} direction="incoming" author={message.authorName}
  timestamp={formatTime(message.sentAt)} replyLabel={t("chat.reply")}
  onReply={id => setReplyTarget({ id, author: message.authorName, excerpt: message.text })}>
  {message.text}
</ReplyMessage>
```

```tsx
// Native
import { ReplyMessage } from "@hjmds/react-native/communication";

<ReplyMessage messageId={message.id} direction="incoming" author={message.authorName}
  timestamp={formatTime(message.sentAt)} replyLabel={t("chat.reply")} onReply={selectReplyTarget}>
  {message.text}
</ReplyMessage>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `messageId` | `string` | 필수 | 실제 메시지 id. 비어 있거나 공백뿐이면 렌더 중 `TypeError` |
| `onReply` | `(messageId) => void` | 필수 | 답장 대상으로 고른 id를 제품에 넘긴다 |
| `replyLabel` | `string` | 필수 | 답장 동작 이름(스와이프·접근성 동작·메뉴 항목) |
| `replyDisabled` | `boolean` | `false` | 답장 동작 비활성 |
| `swipeAction` | `"reply"` · `"timestamp"` | `"reply"` | `"timestamp"`면 ChatMessage `timestampPresentation="swipe"`, 아니면 `"always"`. 접근성 답장 동작은 두 모드 모두 남는다 |
| 나머지 | `ChatMessageProps` | — | `replyAction`·`timestampPresentation`을 뺀 ChatMessage props를 그대로 전달 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ChatMessage와 같다 | [ChatMessage 배치](chat-message.md#배치) |
| 간격 | ChatMessage와 같다(묶음 `groupGap` 12, 같은 묶음 `runGap` 6) | `chatMessageRecipe` |
| 순서·정렬 | ChatMessage와 같다(수신 시작 쪽, 발신 끝 쪽) | 래퍼는 배치를 바꾸지 않는다 |
| 고정·스크롤 | 자체 고정 없음, 타임라인 host가 스크롤 | ChatMessage |
| 좁은 폭·큰 글자 | ChatMessage와 같다 | ChatMessage |

## 꼭 지킬 것

- `messageId`에 index나 임시 키를 넣지 않는다. 서버가 아는 실제 id여야 답장 연결이 맞는다.
- 답장 대상의 저자·발췌 보관은 제품 상태다. `onReply`는 id만 넘긴다.
- `swipeAction="timestamp"`이면 같은 스와이프로 답장하지 않는다. 사진 캐러셀처럼 가로 제스처가 있는 메시지는 ChatMessage 지침의 선택을 따른다.

## 상태와 상호작용

답장은 가로 스와이프, Web Alt+←/→, Native 접근성 동작 `reply`로 실행한다(ChatMessage 계약). 길게 누른 반응 메뉴가 있으면 첫 항목으로도 보인다.
