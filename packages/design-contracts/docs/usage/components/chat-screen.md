# ChatScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/소통/채팅`

## 언제 쓰나

DM·대화방처럼 헤더, 메시지 타임라인, 하단 작성창으로 이루어진 화면 한 장에 쓴다. `ScreenLayout`에
`composer`를 footer로 고정하고 기본 `scroll="content"`로 제품 타임라인이 스크롤을 갖게 한다.
별도 보조 기능(supplemental)이라 `/screens` subpath로만 import 한다. 새 채팅 데이터 모델이나 전송 엔진은 없다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 메시지 한 개 | [ChatMessage](chat-message.md) |
| 부모/답글 댓글 화면 | [CommentThreadScreen](comment-thread-screen.md) |
| 작성창이 없는 일반 화면 | [ScreenLayout](screen-layout.md) |
| 알림 목록 화면 | [NotificationInboxScreen](notification-inbox-screen.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ChatScreen` | 화면 조합 | `/screens` | `/screens` |
| `ChatMessage`, `MessageComposer`, `ScreenLayout` | 함께 쓰는 조각 | `/screens` | `/screens` |

루트 barrel에는 없다. `/screens`는 optional native peer를 요구하지 않는다.

## 최소 사용 예

```tsx
// Web — host가 실제 남은 높이를 준다(예: height: 100dvh)
import { ChatMessage, ChatScreen, MessageComposer } from "@hjmds/react/screens";

<ChatScreen
  title={t("chat.title")}
  state={query.isPending ? { kind: "loading", title: t("chat.loading") } : { kind: "ready" }}
  composer={<MessageComposer value={draft} label={t("chat.input")} sendLabel={t("chat.send")}
    pending={sending} onValueChange={setDraft} onSend={send} />}
>
  <Timeline messages={messages} renderItem={m => <ChatMessage {...toMessageProps(m)}>{m.text}</ChatMessage>} />
</ChatScreen>
```

```tsx
// Native — 키보드 adapter는 하나만
import { FlatList } from "react-native";
import { KeyboardAvoiding } from "@hjmds/react-native/keyboard";
import { ChatScreen, MessageComposer } from "@hjmds/react-native/screens";

<KeyboardAvoiding>
  <ChatScreen title={t("chat.title")} composer={<MessageComposer value={draft} label={t("chat.input")}
    sendLabel={t("chat.send")} onValueChange={setDraft} onSend={send} />}>
    <FlatList data={messages} renderItem={renderMessage} />
  </ChatScreen>
</KeyboardAvoiding>
```

### 제품이 공급하는 것

| 슬롯·prop | 내용 | 비고 |
| --- | --- | --- |
| `title`(필수) | 지역화한 대화 제목 | `header`를 주면 Web은 `aria-label`로만 쓴다 |
| `header` / `leading` / `actions` / `description` | 기존 navigation 헤더, 또는 뒤로 가기·도구 슬롯 | `header`를 주면 기본 헤더를 그리지 않는다 |
| `children` | 타임라인(가상화 목록 + `ChatMessage`) | 자동 스크롤·새 메시지 배지·이전 메시지 위치는 제품 |
| `composer`(필수) | `MessageComposer` 등 작성창 | `state.kind === "ready"`일 때만 보인다 |
| `state` / `stateAction` | `loading`·`empty`·`error`·`restricted` + 지역화 `title` | ready 외에는 본문을 교체한다 |
| `notice` | 새로고침 실패 같은 비차단 안내 | 초안 유지가 필요하면 `state` 대신 이것 |

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `composer` | `ReactNode` | 필수 | footer에 고정되는 작성창. `state.kind === "ready"`일 때만 보인다 |
| `scroll` | `"content"` · `"screen"` | `"content"` | 가상화 목록이 스크롤을 소유하므로 작은 예제 외에는 바꾸지 않는다 |
| `contentInset` | `"default"` · `"none"` | `"default"` | 이미 gutter를 주는 route 안에서는 `"none"`으로 이중 여백을 막는다 |
| `state` | `ScreenContentState`(`{ kind: "ready" }` 또는 `{ kind, title, description? }`) | `{ kind: "ready" }` | ready 외에는 본문을 교체하고 composer를 숨긴다 |
| `as` (Web) | `"main"` · `"section"` | `"main"` | 제품 shell이 이미 `main`이면 `"section"` |
| 나머지 | `ScreenLayout`과 같음(`footer` 제외) | — | [ScreenLayout](screen-layout.md) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭 최대 `layout.readingMaxWidth` 720, 가운데 정렬; 높이는 host가 준 남은 높이(Web `block-size: 100%`, Native `flex: 1`) | `screenPatternRecipe.maxWidth`, Web `.hjm-screen`, Native `ScreenLayout` |
| 간격 | 헤더·본문·footer padding `spacing.md` 16; 헤더 안 간격 Web 16 / Native `spacing.sm` 12; 메시지 사이 간격은 타임라인(제품) 소유 | `screenPatternRecipe.padding`·`itemGap`, Web `.hjm-screen__header` |
| 순서·정렬 | 헤더 → notice → 타임라인 → composer(footer) | `ScreenLayout` 렌더 순서 |
| 고정·스크롤 | 헤더·composer 고정, 타임라인이 content 스크롤; footer 위 테두리 1, Web은 하단 safe area만큼 padding을 늘린다 | Web `.hjm-screen__footer`, Native footer `borderTopWidth` |
| 좁은 폭·큰 글자 | 제목 열 최소 폭 `headerMinWidth` 120 × 글자 배율, 모자라면 actions가 다음 줄로 내려간다; Native safe area·키보드는 host | `screenPatternRecipe.headerMinWidth` |

## 꼭 지킬 것

- 모든 문구·상태 title은 제품 i18n에서 넘긴다. ready 외 상태에 빈 title을 주면 `TypeError`가 난다.
- 전송 성공 판정과 초안 초기화는 서버 영수증을 받은 제품이 한다. `onSend`는 원문만 넘긴다.
- Native는 safe area와 탭/상단 navigation inset을 host가 먼저 뺀다. `KeyboardAvoiding`과 제품 keyboard adapter를
  동시에 감싸지 않는다.
- 가상화 목록을 `scroll="screen"` 안에 넣어 스크롤 컨테이너를 중첩하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 | `layoutStyle`, `className`(시각 override 금지) | `layoutStyle` |
| 높이 | host가 남은 높이 제공 | `flex: 1` |
| 스크롤 연결 | 없음 | `scrollRef`, `scrollProps`(`refreshControl`, `keyboardDismissMode` 등) — `scroll="screen"`이거나 상태 교체 중일 때만 ScrollView가 있다 |
| 테스트 id | 없음 | `testID` |
