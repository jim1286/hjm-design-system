# ConversationRow

- 단계: 컴포넌트
- 상태: 실험
- 지원: Web · Native
- 적용: 1.24.0
- 검토일: 2026-10-15
- 근거: `src/conversation-row.ts`의 `conversationRowRecipe`
- 스토리북: 별도 예제 미등록

## 언제 쓰나

대화 목록에서 상대, 마지막 메시지, 상대 시각, 안 읽음 점을 표시한다. 2026-10-15 전사 적용 중
제품마다 복제한 DM 행의 배치가 달라져 공개 구성으로 분리했다. 일반 설정 행은 `ListRow`를 쓴다.
이 구성은 큰 아바타와 한 줄 미리보기·시각, 읽지 않은 대화 강조를 보존한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 본문 메시지 | `ChatMessage` |
| 일반 목록 | `ListRow` |
| 댓글 | `CommentThreadRow` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ConversationRow` | 대화 미리보기 | `@hjmds/react/conversation-row` | `@hjmds/react-native/conversation-row` |

## 최소 사용 예

```tsx
// Web
import { ConversationRow } from "@hjmds/react/conversation-row";

<Link href={destination} aria-label={accessibleSummary}>
  <ConversationRow title={name} preview={lastMessage} metadata={relativeTime}
    avatar={avatar} unread={unreadCount > 0} />
</Link>
```

```tsx
// Native
import { ConversationRow } from "@hjmds/react-native/conversation-row";
<Pressable accessibilityRole="link" accessibilityLabel={accessibleSummary} onPress={openConversation}>
  <ConversationRow title={name} preview={lastMessage} metadata={relativeTime}
    avatar={avatar} unread={unreadCount > 0} />
</Pressable>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| title / preview / metadata | string | 필수 | 상대·미리보기·현지화 시각 |
| avatar | ReactNode | 필수 | 제품 아바타 |
| unread | boolean | false | 읽지 않은 대화 강조 |

앱은 라우팅, 접근 가능한 전체 이름, 데이터만 연결한다. 행의 내용은 host 이름과 중복 낭독되지 않는다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 아바타 56, 읽지 않음 점 10 | conversationRowRecipe |
| 간격 | 가로 sm, 세로 10 | 같은 recipe |
| 순서·정렬 | 아바타 → 제목/미리보기·시각 → 읽지 않음 점 | 양 renderer |
| 고정·스크롤 | 바깥 목록 host 소유 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | 가용 폭에서 미리보기 말줄임 | 양 renderer |

메시지가 길어도 시각과 읽지 않음 점은 유지하고 미리보기만 말줄임한다. 앱은 별도 행 padding을 넣지 않는다.

## 꼭 지킬 것

전체 행의 현지화 접근성 이름과 라우팅 host를 함께 제공한다. HJM 내부 색·간격을 제품 CSS로 덮지 않는다.

## 상태와 상호작용

읽지 않음은 제목·미리보기를 강조하고 끝에 점을 표시한다. 클릭·키보드·내부 라우팅은
Next/Expo Link host에 남긴다. 시각 구성은 별도 button이나 link를 생성하지 않는다.

## 접근성

host는 상대·미리보기·시각·읽지 않은 수가 포함된 현지화 이름을 제공한다. 내용은 장식으로 숨겨 중복 낭독을 피한다.

## 제품 연결

앱은 아바타 원본, 미리보기 생성, 시각 형식과 라우팅·읽음 정책을 결정한다. HJM에는 서버 데이터나 제품별 Link를 넣지 않는다.

## 관련 지침

[선택 기준](../SELECTION.md), [ListRow](list-row.md), [ChatScreen](chat-screen.md).
