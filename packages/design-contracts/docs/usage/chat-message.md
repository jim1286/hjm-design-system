# ChatMessage 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [반복 화면 조합](../screen-patterns.md), descriptor `ChatMessageDescriptor`·recipe `screenPatternRecipe`(`src/screen-patterns.ts`)

## 언제 쓰나

DM·대화 타임라인의 메시지 한 개에 쓴다. 발신/수신 정렬, 작성자, 아바타, 답장 인용, 시각과 전송 상태,
길게 눌러 여는 반응 메뉴, 좌우 스와이프 답장을 한 번에 합성한다. 별도 보조 기능(supplemental)이라
`/screens` subpath로만 import 한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면 전체(헤더·타임라인·작성창) | [ChatScreen](chat-screen.md) |
| 입력창 | [MessageComposer](message-composer.md) |
| 부모/답글이 있는 댓글 | [CommentThreadScreen](comment-thread-screen.md) |
| 알림 목록의 한 행 | [NotificationItem](notification-item.md) |
| 행을 밀어 버튼을 드러내는 동작 | [SwipeActions](swipe-actions.md) (답장 스와이프와 다른 동작) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `ChatMessage` | `/screens` | `/screens` | 메시지 한 개 |
| `ReactionPicker` | `/reaction-picker` | `/reaction-picker` | `reactions` prop이 받는 타입(`ReactionPickerProps`)의 원본 |

루트 barrel에는 없다. `/screens`는 optional native peer를 요구하지 않는다(Native 반응 메뉴는 core `Modal`).

## 최소 사용 예

```tsx
// Web
import { ChatMessage } from "@hjmds/react/screens";

<ChatMessage
  direction={mine ? "outgoing" : "incoming"}
  author={message.authorName}
  timestamp={formatTime(message.sentAt)}
  deliveryLabel={mine ? t("chat.delivered") : undefined}
  avatar={mine ? undefined : <Avatar name={message.authorName} />}
  replyAction={{ label: t("chat.reply"), onPress: () => setReplyTo(message.id) }}
  reactions={{
    label: t("chat.react"), closeLabel: t("common.close"),
    options: reactionOptions, value: message.myReaction, onValueChange: v => react(message.id, v),
  }}
>
  {message.text}
</ChatMessage>
```

```tsx
// Native
import { ChatMessage } from "@hjmds/react-native/screens";

<ChatMessage direction="incoming" author={message.authorName} timestamp={formatTime(message.sentAt)}
  replyAction={{ label: t("chat.reply"), onPress: () => setReplyTo(message.id) }}>
  <Text>{message.text}</Text>
</ChatMessage>
```

## 축과 기본값

- `direction`: `incoming` · `outgoing`(필수). `author`·`timestamp`(필수 string)는 그룹 안에서 빈 문자열로
  보내면 그 줄을 그리지 않는다. 메시지 폭은 `screenPatternRecipe.messageMaxWidth`(84%).
- `reply`(인용 노드) + `replyLink`를 같이 주면 인용을 버블 밖 ghost 버튼으로 그려 원문 이동에 쓴다. `replyLink`가
  없으면 버블 안 인용으로만 표시한다.
- `replyAction`: 60px 이상, 세로 이동의 2배를 넘는 가로 스와이프로 실행한다(`isReplySwipe`). 보이는 답장 버튼은 없다.
- `reactions`: `ReactionPickerProps` + `closeLabel`, 선택 `menuAction`. 450ms 길게 누르면 열린다. 같은 반응 재선택은 `null`.
- `interactiveContent`: 기본 `false`. 사진 앨범·링크처럼 자식이 버튼을 가지면 `true`로 준다.
- `actions`: 시각 옆 슬롯. 반응 집계 배지·재시도는 여기에 제품이 넣는다.

## 꼭 지킬 것

- 문구(작성자·시각·전송 상태·접근성 이름)는 모두 제품 i18n에서 만든다. 상대시간도 제품이 포맷한다.
- 영수증·반응 저장·재시도·원문 id·삭제된 메시지 안내는 제품 소유다. HJM은 상태를 저장하지 않는다.
- `layoutStyle`·`style`·`className` prop이 없다. 배치는 타임라인 쪽 wrapper가 한다.
- 타임라인 전체를 live region으로 감싸지 않는다(과거 메시지 로딩 때 읽기 순서를 가로챈다).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 반응 메뉴 | Popover(Escape·외부 클릭·포커스 복귀), 우클릭·Enter/Space로도 열림 | 전체 화면 `Modal`, 접근성 activate로도 열림 |
| 키보드·보조기기 답장 | 메시지 포커스 후 Alt+←/→ | 접근성 custom action `reply` |
| `interactiveContent` | 메시지를 group으로 두고 내부 버튼 누름은 무시 | 별도 `···` 메뉴 버튼을 추가 |
| `menuAction` | 즉시 실행 | 모달이 닫힌 뒤 실행(iOS 모달 경합 방지) |

## 함정

- Native는 반응 모달 안에서 `children`을 미리보기로 한 번 더 렌더한다. 자식은 표시용 콘텐츠로 준다
  (부작용·고유 ref를 두지 않는다).
- `reactions`의 `options`와 `more.options`는 id가 합쳐서 유일하고 emoji·label이 비어 있지 않아야 한다. `value`가
  목록에 없는 id면 렌더 중 `TypeError`가 난다(`validateReactions`). 서버가 모르는 반응을 돌려줄 때를 대비한다.
