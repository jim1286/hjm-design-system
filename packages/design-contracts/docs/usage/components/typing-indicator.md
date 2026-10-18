# TypingIndicator

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.31.0
- 검토일: 2026-10-18
- 근거: [반복 화면 조합](../../screen-patterns.md), `src/screen-patterns.ts`의 `typingIndicatorRecipe`·`chatMessageRecipe`; Web·Native `src/screens.tsx`
- 스토리북: `배포/컴포넌트/상태와 알림/입력 중 표시`

## 언제 쓰나

대화 타임라인에서 상대가 지금 입력 중임을 보여 줄 때 쓴다. 수신 말풍선 자리에 점 세 개가 차례로 깜박이는 말풍선을 그리고,
보조기술에는 제품이 준 문구("서연님이 입력 중")를 한 번 알린다. 입력 중 여부(presence) 판단과 표시 시점은 제품이 정한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 내 메시지 전송 중 | [ChatMessage](chat-message.md) `deliveryLabel` |
| 화면·영역 로딩 | [Spinner](spinner.md), ScreenLayout `state` |
| AI 답변 생성 중 | [StreamingAnswer](streaming-answer.md)·[ThinkingOrb](thinking-orb.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `TypingIndicator` | 기본 | `@hjmds/react/screens` | `@hjmds/react-native/screens` |

루트 barrel에는 없다.

## 최소 사용 예

```tsx
// Web
import { ChatMessage, ChatScreen, TypingIndicator } from "@hjmds/react/screens";

<ChatScreen title={peer.name} composer={composer}>
  <div>
    {messages.map(m => <ChatMessage key={m.id} {...toMessageProps(m)}>{m.text}</ChatMessage>)}
    {peerTyping ? <TypingIndicator label={t("chat.typing", { name: peer.name })} /> : null}
  </div>
</ChatScreen>
```

```tsx
// Native — 가상화 목록의 ListFooterComponent로 둔다
import { FlatList } from "react-native";
import { TypingIndicator } from "@hjmds/react-native/screens";

<FlatList data={messages} renderItem={renderMessage}
  ListFooterComponent={peerTyping ? <TypingIndicator label={t("chat.typing", { name: peer.name })} /> : null} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | 필수 | 지역화한 상태 문구. 화면에는 보이지 않고 보조기술 이름·알림이 된다. 빈 문자열은 `TypeError` |
| `avatar` | `ReactNode` | 없음 | 단톡방에서 입력 중인 사람 사진. ChatMessage 아바타와 같은 32(`chatMessageRecipe.avatarSize`)로 넘긴다 |
| `layoutStyle` | `HjmCompositionStyleProp` | 없음 | 행 배치 전용. 색·여백을 덮지 않는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 점 `dotSize` 6(원), 말풍선 최소 높이 = 본문 줄 높이 + 위아래 `bubblePaddingBlock` 6 — 한 줄 수신 말풍선과 같은 높이; radius `bubbleRadius` 14, 표면 `surface` | `typingIndicatorRecipe`, `chatMessageRecipe` |
| 간격 | 점 사이 `dotGap`(`spacing.xxs`) 4, 말풍선 안 좌우 10; 위 `groupGap` 12(새 묶음처럼 떨어진다); 아바타–말풍선 `avatarGap` 8 | `typingIndicatorRecipe`, `chatMessageRecipe` |
| 순서·정렬 | 수신 쪽(시작 쪽) 정렬, 마지막 메시지 뒤. 아바타가 없으면 꼬리 폭 `tailWidth` 7만큼 들여 수신 말풍선과 가장자리를 맞춘다 | Web·Native `TypingIndicator` |
| 고정·스크롤 | 자체 고정 없음. 타임라인 목록 안에서 함께 스크롤한다 | — |
| 좁은 폭·큰 글자 | 점 크기는 고정. 글자 배율과 무관하다 | Web·Native `TypingIndicator` |

## 꼭 지킬 것

- 상대가 실제로 입력 중일 때만 렌더하고, 멈추면 제품이 제거한다. 표시 시간을 HJM이 정하지 않는다.
- 문구는 제품 i18n으로 넘긴다. 점 표시 옆에 같은 문구를 보이는 글자로 다시 쓰지 않는다.
- 움직임: 한 주기 `cycleMs` 1200 동안 점마다 `restOpacity` 0.35 ↔ 1로 깜박이고 점 사이 시작 간격은 `staggerMs` 160이다. 동작 줄이기(Provider `reducedMotion`, Web은 `prefers-reduced-motion`도)에서는 점이 깜박이지 않고 불투명하게 멈춘다.
- 알림은 정중(polite)하다. 나타날 때 한 번 읽고 진행 중인 낭독을 끊지 않는다. 타임라인 전체를 live region으로 감싸지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 알림 | `role="status"` + 숨긴 문구 | 접근성 요소 하나(`accessibilityLabel`), Android polite live region, iOS는 나타날 때 `announceForAccessibilityWithOptions(queue)` |
| 움직임 | CSS keyframes(`hjm-typing-pulse`) | `Animated.loop`(native driver) |

## 근거

- 공통 입력 중 표시: 2026-10-18 번뚝 DM. Web·Native가 각자 점(●●●)과 문구 말풍선을 만들었다(Web `role="status"` 문구, Native 별도 컴포넌트와 Animated 깜박임). 공통 타임라인 구조는 HJM 소유라는 2026-10-15 원칙에 따라 공개 조각으로 옮겼다.
