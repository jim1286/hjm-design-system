# ChatMessage

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-07
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/구성/정보 표시/대화 메시지`, `배포/화면/소통/채팅`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ChatMessage` | 메시지 한 개 | `/screens` | `/screens` |
| `ReactionPicker` | `reactions` prop이 받는 타입(`ReactionPickerProps`)의 원본 | `/reaction-picker` | `/reaction-picker` |

루트 barrel에는 없다. `/screens`는 optional native peer를 요구하지 않는다(Native 반응 메뉴는 core `Modal`).

## 최소 사용 예

```tsx
// Web
import { Avatar } from "@hjmds/react/display";
import { ChatMessage } from "@hjmds/react/screens";

<ChatMessage
  direction={mine ? "outgoing" : "incoming"}
  author={message.authorName}
  timestamp={formatTime(message.sentAt)}
  {...(mine ? { deliveryLabel: t("chat.delivered") } : { avatar: <Avatar name={message.authorName} /> })}
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
import { Text } from "@hjmds/react-native/primitives";

<ChatMessage direction="incoming" author={message.authorName} timestamp={formatTime(message.sentAt)}
  replyAction={{ label: t("chat.reply"), onPress: () => setReplyTo(message.id) }}>
  <Text>{message.text}</Text>
</ChatMessage>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `direction` | `"incoming"` · `"outgoing"` | 필수 | 수신은 시작 쪽, 발신은 끝 쪽에 붙는다 |
| `author` | `string` | 필수 | 빈 문자열이면 작성자 줄을 그리지 않는다(연속 메시지 그룹) |
| `timestamp` | `string` | 필수 | 제품이 포맷한 시각. 빈 문자열이고 `deliveryLabel`·`actions`도 없으면 메타 줄을 그리지 않는다 |
| `timestampPresentation` | `"always"` · `"swipe"` | `"always"` | `swipe`는 오른쪽으로 끄는 동안 시각을 보여 주고 놓으면 숨긴다. 이 모드에서는 같은 제스처로 답장을 실행하지 않는다. 시각은 보조기술에서도 읽을 수 있다. |
| `deliveryLabel` | `string` | 없음 | 시각 뒤에 ` · `로 붙는 전송 상태 |
| `avatar` | `ReactNode` | 없음 | 버블 옆 아바타 |
| `reply` | `ReactNode` | 없음 | 인용 노드. `replyLink`가 없으면 버블 안 인용으로 그린다 |
| `replyLink` | `{ label, onPress() }` | 없음 | `reply`와 같이 주면 인용을 버블 밖 ghost 버튼으로 그려 원문 이동에 쓴다 |
| `replyAction` | `{ label, onPress(), disabled? }` | 없음 | `replySwipeDistance` 60px 이상이고 세로 이동의 2배를 넘는 가로 스와이프로 실행(`isReplySwipe`). 보이는 답장 버튼은 없다 |
| `reactions` | `ReactionPickerProps & { closeLabel, menuAction? }` | 없음 | `reactionHoldMs` 450ms 길게 누르면 반응 메뉴가 열린다. 같은 반응 재선택은 `null`. 메뉴 안 picker는 `layout="strip"`(이모지 `typography.title` 18/26). `label`은 Web에서 말풍선 이름·Popover 제목, Native에서 접근성 힌트·동작 이름 |
| `interactiveContent` | `boolean` | `false` | 사진 앨범·링크처럼 자식이 버튼을 가지면 `true`. 안쪽 버튼·링크의 누름과 Web Enter/Space는 그 컨트롤이 받는다 |
| `actions` | `ReactNode` | 없음 | 시각 옆 슬롯. 반응 집계 배지·재시도는 제품이 넣는다 |
| `children` | `ReactNode` | 필수 | 메시지 본문. Native는 말풍선이 이 텍스트로 읽힌다 |
| Web `layoutStyle` | `HjmCompositionStyleProp` | 없음 | 메시지 행(`article`) 배치. `transform`은 스와이프 오프셋이 소유한다. 미게시(1.12.1 이후) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 말풍선 열 최대 폭 `screenPatternRecipe.messageMaxWidth` 84%; 버블 radius `radius.lg`, 테두리 1(발신은 Native에서 테두리 없음) | `screen-patterns.ts`, Web `styles.css` `.hjm-chat-message__bubble`, Native `screens.tsx` |
| 간격 | 아바타–버블 열 `spacing.xs` 8; 작성자·버블·메타 줄 사이 `spacing.xxs` 4; 버블 안 padding `spacing.sm` 12; 버블 안 인용 왼쪽 선 2 + `spacing.xs` 8; 메타 줄 시각–`actions` `spacing.xs` 8 | Web `.hjm-chat-message*`, Native `ChatMessage` |
| 순서·정렬 | incoming 시작 쪽, outgoing 끝 쪽; 작성자 → (replyLink 인용) → 버블 → 시각·전송 상태·actions | 렌더 순서 |
| 고정·스크롤 | 자체 고정 없음, 타임라인(ChatScreen 본문)이 스크롤; 반응 메뉴는 Web Popover · Native 전체 화면 `Modal`; 답장 스와이프 중 가로 이동은 ±72로 제한 | Web·Native `ChatMessage` |
| 좁은 폭·큰 글자 | 버블은 84% 안에서 줄바꿈되고 본문을 자르지 않는다(Web `overflow-wrap: anywhere`, `white-space: pre-wrap`); 반대쪽 16% 여백은 작성자 구분을 위해 남긴다 | Web `.hjm-chat-message__bubble`, Native `maxWidth`·`flexShrink: 1` |

## 꼭 지킬 것

- 문구(작성자·시각·전송 상태·접근성 이름)는 모두 제품 i18n에서 만든다. 상대시간도 제품이 포맷한다.
- 영수증·반응 저장·재시도·원문 id·삭제된 메시지 안내는 제품 소유다. HJM은 상태를 저장하지 않는다.
- Web 배치는 `layoutStyle`로 한다(`transform`은 덮어쓰인다). Native는 `layoutStyle`·`style`이 없어 타임라인 쪽 wrapper가 배치한다.
- Native 말풍선에 `accessibilityLabel`을 덧씌우지 않는다. 말풍선은 자기 텍스트로 읽히고, 작성자·시각은 따로 읽히며,
  답장·반응은 접근성 동작(`reply`·`activate`)으로 남는다. 2026-10-06 리뷰에서 행 이름(`author`)과 반응 이름(`picker.label`)이
  본문을 가려 화면 낭독기가 메시지를 읽지 못했다.
- 타임라인 전체를 live region으로 감싸지 않는다(과거 메시지 로딩 때 읽기 순서를 가로챈다).
- 반응 **선택 메뉴**와 현재 반응 **집계 버튼**은 다른 행동이다. 집계를 눌러 메시지 메뉴를 열 때는
  `actions` 슬롯에 Button을 공급할 수 있다. 본문 안에 집계 버튼을 넣는다면 사진·링크가 없어도
  `interactiveContent=true`가 필요하다. 2026-10-07 Utilverse 소스 대조에서 사진/도구만 검사해
  집계 버튼이 부모 접근성 그룹에 들어갈 수 있는 경로를 발견했다. `actions`에 둘 때도 긴 집계와
  시각이 좁은 폭·큰 글자에서 함께 읽히고 조작 가능한지 확인한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 반응 메뉴 | Popover(Escape·외부 클릭·포커스 복귀), 우클릭·말풍선 자체의 Enter/Space로도 열림. 시각적으로 숨긴 닫기 버튼은 포커스를 받으면 보인다 | 전체 화면 `Modal`, 접근성 activate로도 열림. 닫기 대상은 표준 `activate` 동작에 답해 VoiceOver·TalkBack 모두 닫을 수 있다 |
| 낭독 | 메시지 행 `article`의 이름이 `author`, 말풍선 이름이 `picker.label`(반응이 있을 때) | 말풍선은 본문 텍스트로 읽히고 `picker.label`은 힌트. 작성자·시각은 별도 요소 |
| 키보드·보조기기 답장 | 메시지 포커스 후 Alt+←/→ | 접근성 custom action `reply` |
| `interactiveContent` | 말풍선을 `group`으로 두고, 안쪽 버튼·링크의 누름·Enter/Space는 반응 메뉴가 아니라 그 컨트롤이 받는다 | 반응이 있으면 별도 `···` IconButton이 메뉴를 열고 `reply` 동작도 가진다. 반응이 없으면 `reply` 동작이 시각 caption(시각이 없으면 작성자 caption)에 붙는다 |
| `menuAction` | 즉시 실행 | 모달이 닫힌 뒤 실행(iOS 모달 경합 방지) |

## 함정

- Native는 반응 모달 안에서 `children`을 미리보기로 한 번 더 렌더한다. 자식은 표시용 콘텐츠로 준다
  (부작용·고유 ref를 두지 않는다).
- `reactions`의 `options`와 `more.options`는 id가 합쳐서 유일하고 emoji·label이 비어 있지 않아야 한다. `value`가
  목록에 없는 id면 렌더 중 `TypeError`가 난다(`validateReactions`). 서버가 모르는 반응을 돌려줄 때를 대비한다.


### 고정 아이콘과 큰 글자

2026-10-06 최근 검색 삭제 기호가 큰 글자에서 잘린 재현에 따라 Native 내장 삭제·메뉴 기호는 고정 아이콘 틀의 크기를 유지한다. 주변 제목·라벨은 계속 확대한다. Chip의 체크와 Toast 닫기는 기존 비확대 경로를 유지하며 회귀 검사에 포함한다. 제품이 전달한 아이콘 슬롯은 제품이 같은 조건을 검증한다.

2026-10-09 번뚝 DM 사용자 요청으로 시각 공개 동작을 공용 ChatMessage에 추가했다. 앱별 PanResponder/PointerEvent 복제를 피하고 세로 스크롤·내부 컨트롤 우선권을 유지한다.
