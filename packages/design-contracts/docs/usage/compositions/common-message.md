# 대화 메시지

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [ChatMessage](../components/chat-message.md), [공통 실행과 실패 복구](../../action-session.md), `showcase/web/src/patterns/conversation-previews.tsx`, `showcase/native/src/conversation-previews.tsx`. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/공통 화면/대화 메시지`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/정보 표시/대화 메시지`

## 언제 쓰나

말풍선 하나하나에 반응·답장·원문 이동·전송 실패 후 다시 보내기를 붙일 때 쓴다. ChatMessage의 슬롯과 콜백을 제품 로직에 연결하며 새 데이터 엔진을 만들지 않는다.

2026-10-06 정리 전에는 이 스토리가 [채팅 화면](../screens/common-chat.md)과 같은 화면 전체를 그렸다. 지금은 말풍선 단위 상호작용만 보이고,
대화 목록·하단 입력·불러오는 중·빈·오류·로그인 필요 상태는 채팅 화면이 소유한다. 입력은 [메시지 작성](purpose-input-message.md)을 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `ChatMessage` | 수신·발신 말풍선, 작성자·시각·전송 상태 | [ChatMessage](../components/chat-message.md) |
| `reactions` | 길게 누르기·우클릭·메뉴로 여는 반응 선택 | [ChatMessage](../components/chat-message.md) |
| `reply` + `replyLink` | 답장 인용과 원문 이동 | [ChatMessage](../components/chat-message.md) |
| `actions` + `Button size="small"` secondary | 전송 실패 메시지의 "다시 보내기", 고른 반응 표시 | [Button](../components/button.md) |
| `Avatar` | 수신 메시지 작성자 | [Avatar](../components/avatar.md) |
| `createActionSession` | 다시 보내기 진행·실패 | [계약](../../action-session.md) |

## 배치

```text
┌ 바깥 틀: 채팅 화면 본문(타임라인 스크롤). 단독 예제는 Container ┐
│ (아바타) 서연                                                    │
│ ┌ 수신 말풍선 ───────────┐   ← 시작 쪽, 최대 폭 84%              │
│ └────────────────────────┘                                       │
│ 오후 2:30  ❤️              ← 시각 · actions(고른 반응)            │
│                     [서연 · 원문 발췌]   ← replyLink(ghost)       │
│                ┌ 발신 말풍선 ───────────┐   ← 끝 쪽               │
│                └────────────────────────┘                        │
│                              오후 2:32 · 읽음                    │
│                ┌ 발신 말풍선 ───────────┐                        │
│                └────────────────────────┘                        │
│              오후 2:33 · 전송 실패 [다시 보내기]  ← actions       │
│ 상태 문구(Web role=status, Native live region)                    │
└──────────────────────────────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | [ChatScreen](../components/chat-screen.md) 본문 타임라인. 단독 예제는 Web `Container`, Native `ScrollView` > `Container` | 화면 본문 스크롤 | 좌우 `Container gutter` compact 16 / regular 20, 메시지 사이 `spacing.lg` 20 |
| 말풍선 | `ChatMessage` | incoming 시작 쪽, outgoing 끝 쪽 | 최대 폭 `messageMaxWidth` 84%, 버블 padding `spacing.sm` 12([배치](../components/chat-message.md#배치)) |
| 반응 | `reactions` | 말풍선 위 Popover(Web)·Modal 메뉴(Native) | 길게 누르기 450ms(`reactionHoldMs`) |
| 다시 보내기 | `actions` 슬롯의 `Button size="small"` secondary | 실패한 발신 메시지의 시각 옆 | 높이 36(`control.buttonHitSlop.small` 4로 터치 44), 시각과 `spacing.xs` 8 |
| 상태 | `Text` 상태 문구 | 목록 아래(단독 예제). 화면에서는 Toast 등 화면 단위로 한 번 알린다 | `spacing.lg` 20 |

## 흐름과 상태

1. 말풍선을 길게 누르거나(Web은 우클릭·Enter도) 메뉴를 열어 반응을 고른다. 같은 반응을 다시 고르면 `null`로 해제된다.
2. 가로 스와이프(60px 이상)나 접근성 동작으로 답장을 시작하면 제품이 composer의 답장 대상을 채운다.
3. 답장 인용(`replyLink`)을 누르면 제품이 원문 메시지로 스크롤하고 잠시 강조한다.
4. 전송에 실패한 발신 메시지는 `deliveryLabel`로 실패를 적고 `actions`에 "다시 보내기"를 둔다. 누르면 진행 중 → 전송됨 또는 다시 실패.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 작성자 → 말풍선 → 시각·전송 상태. 반응은 길게 누르기·메뉴로 연 말풍선 위 메뉴에서 고른다 | 말풍선 이름(Web `author`·Native 본문), 반응 이름은 `reactions.label` |
| 진행 중 | 다시 보내기 `loading`, `deliveryLabel` "보내는 중" | 포커스는 버튼에 유지 |
| 실패 | `deliveryLabel` "전송 실패" + 다시 보내기 유지, 메시지 본문 유지 | 상태 문구로 알림, 포커스 이동 없음 |
| 성공 | `deliveryLabel` "전송됨", 다시 보내기 사라짐 | 상태 문구 |

- 전송 상태·반응 문구는 id→문구 키 상수 표로 둔다. 원문 이동·답장 준비·실패 알림은 제품 알림 계층(Toast 등)으로 화면 단위로 한 번 알린다.

## 코드 골격

```tsx
// Web
import { Avatar } from "@hjmds/react/display";
import { ChatMessage } from "@hjmds/react/screens";

<ChatMessage
  direction={mine ? "outgoing" : "incoming"}
  author={message.authorName}
  timestamp={formatTime(message.sentAt)}
  {...(mine ? { deliveryLabel: t("chat.delivered") } : {})}
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
import { Avatar } from "@hjmds/react-native/data-display";
import { ChatMessage } from "@hjmds/react-native/screens";

<ChatMessage
  direction={mine ? "outgoing" : "incoming"}
  author={message.authorName}
  timestamp={formatTime(message.sentAt)}
  {...(mine ? { deliveryLabel: t("chat.delivered") } : {})}
  avatar={mine ? undefined : <Avatar name={message.authorName} decorative />}
  replyAction={{ label: t("chat.reply"), onPress: () => setReplyTo(message.id) }}
  reactions={{
    label: t("chat.react"), closeLabel: t("common.close"),
    options: reactionOptions, value: message.myReaction, onValueChange: v => react(message.id, v),
  }}
>
  {message.text}
</ChatMessage>
```

제품 데이터·콜백은 주입한다. 위 공개 API 지침에 Web·Native 차이를 유지한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 반응 메뉴 여는 법 | 말풍선 길게 누르기 450ms(`reactionHoldMs`, 10px 넘게 움직이면 취소), 우클릭(`contextmenu`), 말풍선 자체에 포커스 후 Enter·Space(`interactiveContent` 안 버튼·링크의 Enter·Space는 그 컨트롤이 받는다) | 말풍선 길게 누르기 450ms(`delayLongPress`), 접근성 동작 `activate`. `interactiveContent`이면 말풍선 옆 `···` IconButton이 메뉴를 연다 |
| 반응 메뉴 표면 | `Popover`(`placement: "top"`, `align: "start"`) — 충돌 회피·포커스·Escape·바깥 닫기는 Popover 소유. 시각적으로 숨긴 닫기 버튼은 포커스를 받으면 보인다 | 투명 `Modal`, 누른 위치 위쪽에 띄우고 안전 영역 안으로 맞춘다. 너비 최대 320(`reactionMenuWidth`). 닫기 대상은 표준 `activate` 동작에 답해 TalkBack에서도 닫힌다 |
| 메시지 낭독 | 행 이름 `author`, 반응이 있으면 말풍선 이름 `reactions.label` | 말풍선이 본문 텍스트로 읽히고 `reactions.label`은 힌트, 작성자·시각은 별도 요소. 답장·반응은 접근성 동작 |
| Avatar 이름 | `name`만으로 이름을 읽는다 | 작성자 caption이 이미 이름을 읽으므로 `decorative`. 아니면 `accessibilityLabel` 필수 |

## 함정

- 전송 실패를 말풍선 색만으로 알리지 않는다. `deliveryLabel` 글자와 다시 보내기를 함께 둔다.
- 답장은 스와이프만으로 숨기지 않는다. Native 접근성 동작과 Web 키보드·메뉴 경로가 같은 `replyAction`을 부른다.
- 화면 상태(불러오는 중·빈·오류·로그인 필요)를 말풍선 예제에 다시 만들지 않는다. [채팅 화면](../screens/common-chat.md)의 `state`가 소유한다.
- 스토리의 "다음 전송 실패시키기"·350ms 지연은 데모 전용이다.
