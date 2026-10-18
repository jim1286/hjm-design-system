# ChatMessage

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.17.1
- 검토일: 2026-10-16
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
| `MediaAlbumPageStatus` | `mediaAlbum.renderPage`의 불러오는 중·실패 장(미게시, CommentThreadRow도 같다) | `/screens` | `/screens` |

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

2026-10-16 사용자 결정으로 대화 타임라인의 공통 기준을 카카오톡 iOS 채팅방 실측(@3x 캡처)으로 바꿨다.
묶음 단위 표시·촘촘한 말풍선·시각 위치를 흡수했고 노란 말풍선 같은 브랜드 색은 가져오지 않았다(색은 semantic token).

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `direction` | `"incoming"` · `"outgoing"` | 필수 | 수신은 시작 쪽, 발신은 끝 쪽에 붙는다 |
| `author` | `string` | 필수 | 수신 묶음의 첫 말풍선에서만 그린다. 발신(내 메시지)은 그리지 않는다(Web은 행 이름으로만 쓴다). 1:1 대화처럼 작성자를 숨길 때는 빈 문자열 |
| `groupPosition` | `"single"` · `"first"` · `"middle"` · `"last"` | `"single"` | 미게시. `resolveChatMessageGroups(items)`가 같은 작성자·같은 표시 시각의 연속 메시지를 묶어 돌려준다. 첫 말풍선에만 작성자·아바타·꼬리, 끝 말풍선에만 시각을 그리고 뒤 말풍선은 아바타 폭을 비워 둔다 |
| `timestamp` | `string` | 필수 | 제품이 포맷한 시각. 묶음 판정에도 같은 문자열을 쓴다. 말풍선 아래 끝 옆(수신 오른쪽·발신 왼쪽)에 그린다 |
| `timestampPresentation` | `"always"` · `"swipe"` | `"always"` | `swipe`는 수신은 오른쪽·발신은 왼쪽으로 끄는 동안 반대편 여백에 시각을 보여 주고 놓으면 숨긴다. 이 모드에서는 같은 제스처로 답장을 실행하지 않는다. 시각은 보조기술에서도 읽을 수 있다. |
| `bubbleTail` | `boolean` | `true`(미게시 변경, 이전 `false`) | 묶음 첫 말풍선의 위쪽 모서리(수신 시작 쪽·발신 끝 쪽)에 윗변이 이어지는 삼각 꼬리(`tailWidth` 7 × `tailHeight` 10)를 같은 표면으로 그리고, 그 모서리 radius를 `tailCornerRadius` 4로 줄인다. 행 양쪽 `spacing.xs` 8 여백으로 잘림을 막는다 |
| `deliveryLabel` | `string` | 없음 | 시각 뒤에 ` · `로 붙는 전송 상태 |
| `avatar` | `ReactNode` | 없음 | 버블 옆 아바타. `chatMessageRecipe.avatarSize` 32(`avatarRecipe.sizes.small`) 크기로 넘긴다(Web `size="small"`, Native `size={chatMessageRecipe.avatarSize}`). 묶음 뒤 말풍선에서는 같은 폭을 비워 정렬을 유지한다 |
| `reply` | `ReactNode` | 없음 | 인용 노드. `replyLink`가 없으면 버블 맨 위에 그리고 아래 구분선(1)으로 답장 본문과 나눈다 |
| `replyQuote` | `{ title, excerpt }` | 없음 | 미게시. 말풍선 맨 위에 HJM이 인용을 그린다: 제목(예: "서연에게 답장", 본문 글자) → 원문 한 줄(흐린 글자, 넘치면 말줄임) → 구분선 1 → 답장 본문. 자유 노드 `reply`보다 우선 사용한다 |
| `replyLink` | `{ label, onPress() }` | 없음 | 인용과 같이 주면 말풍선 안 인용을 눌러 원문으로 이동한다(Native는 말풍선의 "원문으로 이동" 접근성 동작도 제공). 이전에는 버블 밖 ghost 버튼이었다 |
| `media` | `{ id, label, preview, aspectRatio?, onPress? }[]` | 없음 | 미게시. 보낸 사진. 폭 `chatMessageRecipe.mediaWidth` 210, 한 장은 `aspectRatio`(기본 1), 여러 장은 정사각 칸(`resolveChatMediaColumns`: 2·4장 2열, 그 외 3열, 간격 2), 바깥 radius 14. 글 없이 사진만 보내면 말풍선 표면·꼬리를 그리지 않는다. `onPress`가 있으면 사진마다 버튼(크게 보기는 제품) |
| `mediaAlbum` | `{ count, renderPage(index), pageLabel(index, count), previousLabel, nextLabel, aspectRatio?, onPress?(index), index?·onIndexChange?·defaultIndex? }` | 없음 | 미게시. 한 장씩 넘기는 사진 묶음. `renderPage`는 화면에 보이는 장에만 호출되어 제품이 그 사진만 조회·디코딩한다(이미지 원본·권한·캐시는 제품). 폭 `mediaWidth` 210, 사진 칸 `aspectRatio`(기본 1)·radius 14, 그 아래 이전 아이콘 · 위치(예: 2/5) · 다음 아이콘 줄(작은 ghost IconButton, `mediaAlbumRecipe`). 글 없이 앨범만 보내면 `media`처럼 말풍선 표면·꼬리를 그리지 않는다. 넘김 버튼이 있어 말풍선은 `interactiveContent`로 다뤄진다. 넘긴 장은 길게 누르기 미리보기에서도 같다. 사진을 아직 못 그리는 장은 `renderPage`(또는 그 안 컴포넌트)에서 `MediaAlbumPageStatus`를 돌려준다(아래). `media`와 함께 주면 `TypeError` |
| `MediaAlbumPageStatus` | `{ kind: "loading", label }` 또는 `{ kind: "error", label, retry?: { label, onPress } }` | 없음 | 미게시, `@hjmds/react(-native)/screens`. 앨범 장의 불러오는 중(스피너, `label`은 접근성 이름)·실패(caption 문구는 alert로 알림 + 작은 secondary 다시 시도 Button) 표시. 칸 가운데에 한 묶음으로 놓인다(`mediaAlbumRecipe.pageStatus` 간격 4·안쪽 여백 8). 표시되는 동안 사진 칸은 접근성 이미지 이름과 `onPress` 열기를 내려놓아 안쪽 내용이 낭독기·포인터에 닿는다. 제품 장 컴포넌트는 상태가 바뀌어도 다시 마운트되지 않는다. 빈 `label`은 `TypeError` |
| `replyAction` | `{ label, onPress(), disabled?, icon? }` | 없음 | `replySwipeDistance` 60px 이상이고 세로 이동의 2배를 넘는 가로 스와이프로 실행(`isReplySwipe`). `reactions`가 있으면 길게 누른 메뉴의 첫 항목으로도 보인다(미게시) |
| `reactions` | `ReactionPickerProps & { closeLabel, menuActions?, reportAction?, menuAction? }` | 없음 | `reactionHoldMs` 450ms 길게 누르면 메뉴가 열린다: 반응 줄(이모지 `typography.title` 18/26, `more`면 +) → 메시지 미리보기 → 카드(맨 위 `timestamp` 정확한 시각 → `replyAction` → `menuActions` → `menuAction` → `reportAction` 빨간 글자). 항목은 높이 44, 아이콘 24 칸. 배치는 `holdMenuRecipe`(인스타그램 DM 실측): 화면 좌우 10 안쪽 전체 폭 반응 줄(높이 60, 48 원형 칸, 이모지 28, 넘칠 때만 가로 스크롤) → 12 → 누른 말풍선 그대로 미리보기(제 쪽 정렬) → 12 → 폭 200·radius 18 동작 카드(행 56, 아이콘 24, `submenu` 행은 ›)를 말풍선 쪽에 붙인다. 보이는 ×는 없고 배경 탭·Escape·VoiceOver 닫기로 닫는다(보조기술 첫 초점용 닫기 대상만 둔다). 같은 반응 재선택은 `null`. `label`은 Web에서 말풍선 이름·Popover 제목, Native에서 접근성 힌트·동작 이름. 시각·동작 카드와 `reportAction`·`menuActions`는 미게시(2026-10-16 인스타그램 DM 길게 누르기 실측 반영) |
| `reactions.menuActions[].tone` | `"neutral"` · `"danger"` | `"neutral"` | 미게시(1.30.0 이후). 길게 누른 메뉴 행의 색. 삭제처럼 되돌릴 수 없는 행은 `danger`(빨간 글자). [Menu](menu.md) 항목 `tone`과 같은 어휘(`MenuItemTone`). `reportAction`은 항상 `danger`이고 맨 끝이다. 댓글(CommentThreadRow) 메뉴도 같다 |
| `reactions.summary` | `{ label, items: { id, emoji, count }[] }` | 없음 | 미게시. 현재 반응 집계를 시각 옆 알약 버튼 하나로 그리고, 누르면 길게 누른 것과 같은 메뉴를 연다. `label`은 버튼의 지역화 접근성 이름(예: "반응 ❤️ 2개, 😂 1개. 반응 메뉴 열기"), `items`는 표시 순서. `count`가 `chatMessageRecipe.reactionSummary.minCount` 2 미만이면 이모지만 보인다. 내 반응(`value`)이 들어 있으면 brand 테두리. 높이 24(Native는 hitSlop으로 44 터치), 좌우 8, 항목 사이 4. 빈 `label`·중복 id·빈 이모지는 `TypeError`, 양의 정수가 아닌 count는 `RangeError`(`resolveChatReactionSummary`). `reactions.disabled`면 버튼도 비활성. 메뉴가 닫히면 Web 초점은 말풍선으로 돌아간다. `readOnly: true`(미게시)면 반응할 수 없는 독자(게스트)용으로 같은 자리에 알약 표면 없는 caption 글자로 그리고 누를 수 없다. 접근성 이름은 `label` 하나(Web 시각적으로 숨긴 글자, Native 단일 text 요소)이므로 "메뉴 열기" 같은 행동 문구를 넣지 않는다 |
| `interactiveContent` | `boolean` | `false` | 사진 앨범·링크처럼 자식이 버튼을 가지면 `true`. 안쪽 버튼·링크의 누름과 Web Enter/Space는 그 컨트롤이 받는다 |
| `actions` | `ReactNode` | 없음 | 시각 옆 슬롯. 반응 집계 배지·재시도는 제품이 넣는다 |
| `children` | `ReactNode` | 필수 | 메시지 본문. Native는 말풍선이 이 텍스트로 읽힌다 |
| Web `layoutStyle` | `HjmCompositionStyleProp` | 없음 | 메시지 행(`article`) 배치. `transform`은 스와이프 오프셋이 소유한다. 1.13.0 변경 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 말풍선 열 최대 폭 `screenPatternRecipe.messageMaxWidth` 84%; 말풍선 radius `chatMessageRecipe.bubbleRadius` 14, 안쪽 padding 세로 6·가로 10, 테두리 없음(수신 `surface`, 발신 `surfaceAccent`); 아바타 32(`avatarRecipe.sizes.small`); 꼬리 10 | `chatMessageRecipe`, Web `.hjm-chat-message*`, Native `ChatMessage` |
| 간격 | 묶음 사이 `groupGap` 12, 같은 묶음 말풍선 사이 `runGap` 6(메시지 행이 위쪽 여백으로 소유하므로 타임라인 목록에는 gap을 주지 않는다); 아바타–버블 `avatarGap` 8; 작성자–버블 `authorGap` 4; 버블–시각 `metaGap` 4; 인용 아래 `spacing.xs` 8 | `chatMessageRecipe`, `resolveChatMessageGroupDisplay` |
| 순서·정렬 | incoming 시작 쪽, outgoing 끝 쪽; (첫 말풍선) 작성자 → (replyLink 인용) → 버블 + 아래 끝 옆 시각·전송 상태·actions | 렌더 순서 |
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
- 반응 **선택 메뉴**와 현재 반응 **집계 버튼**은 다른 행동이다. 집계를 눌러 같은 메뉴를 열 때는
  `reactions.summary`를 쓴다(미게시). 집계를 상태 표시용 Tag로 `actions`에 직접 그리지 않는다. 다른 행동(예: 반응한 사람 목록)을 여는 버튼은
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

- 사진이 여러 장이고 장마다 권한 확인·조회가 필요하면 `media`에 모든 `preview`를 넘기지 말고 `mediaAlbum`을 쓴다. `media`의 미리보기는 한 번에 모두 마운트된다(2026-10-18 Utilverse 소셜 사진: 대화 행마다 원본 10장을 받지 않으려고 제품 앨범을 따로 만들었다).

- Native는 반응 모달 안에서 `children`을 미리보기로 한 번 더 렌더한다. 자식은 표시용 콘텐츠로 준다
  (부작용·고유 ref를 두지 않는다).
- `reactions`의 `options`와 `more.options`는 id가 합쳐서 유일하고 emoji·label이 비어 있지 않아야 한다. `value`가
  목록에 없는 id면 렌더 중 `TypeError`가 난다(`validateReactions`). 서버가 모르는 반응을 돌려줄 때를 대비한다.


### 고정 아이콘과 큰 글자

2026-10-06 최근 검색 삭제 기호가 큰 글자에서 잘린 재현에 따라 Native 내장 삭제·메뉴 기호는 고정 아이콘 틀의 크기를 유지한다. 주변 제목·라벨은 계속 확대한다. Chip의 체크와 Toast 닫기는 기존 비확대 경로를 유지하며 회귀 검사에 포함한다. 제품이 전달한 아이콘 슬롯은 제품이 같은 조건을 검증한다.

2026-10-09 번뚝 DM 사용자 요청으로 시각 공개 동작을 공용 ChatMessage에 추가했다. 앱별 PanResponder/PointerEvent 복제를 피하고 세로 스크롤·내부 컨트롤 우선권을 유지한다.

## 대화 스와이프 복귀 (2026-10-12)

번뚝의 좌우 넘김 개선 요청으로 Native의 이동값은 Animated.Value에 전달하고 놓으면 공통 motion.normal(200ms)로 복귀한다. 매 이동마다 메시지 트리를 다시 렌더링하지 않는다. Web도 드래그 중에는 손가락을 따라가고 놓을 때만 200ms 복귀한다. 동작 줄이기는 즉시 복귀한다. 사진 캐러셀처럼 가로 제스처가 있는 메시지는 제품에서 timestampPresentation="always"를 선택해 사진 넘김과 시간 표시가 경쟁하지 않게 한다.

## 근거

- `reactions.summary`: 2026-10-18 번뚝 DM. 메뉴를 밖에서 열 수 없어 집계를 상태용 Tag로만 `actions`에 그렸다(제품 docs/DESIGN.md에 격차로 기록). 제어형 `open` 대신 HJM이 집계 버튼까지 그려 위치·접근성 이름·메뉴 연결을 공통으로 맡는다.
- `reactions.summary.readOnly`·`MediaAlbumPageStatus`: 2026-10-18 HJM 1.31.0 유틸버스 채택. 게스트는 반응할 수 없는데 집계가 항상 메뉴 버튼이라 제품이 `actions`에 caption을 따로 그렸고, 앨범 장 안의 불러오는 중·다시 시도가 사진 칸의 단일 접근성 이미지에 삼켜져 낭독기로 닿지 않았다.
- `menuActions[].tone`: 2026-10-18 유틸버스 채팅 길게 누르기 메뉴의 삭제 행. 빨간 글자가 `reportAction`에만 있어 삭제가 일반 행으로 보였다.

- 아바타 32: 2026-10-17 정렬 실측. recipe·문서는 36이었지만 Web Avatar 단계(32/40/48/64)에 36이 없어 Web은 36 칸에 32 아바타를, Native는 36 아바타를 그렸다. 카카오톡 참고값 약 34에 가장 가까운 Avatar 단계 `small` 32를 recipe가 직접 읽게 해 두 플랫폼이 같은 값을 쓴다. 작성자 첫 줄과의 위쪽 맞춤(카카오톡 방식)은 유지한다.
