# CommentThreadRow

- 단계: 컴포넌트
- 상태: 실험
- 지원: Web · Native
- 적용: 1.23.0
- 검토일: 2026-10-16
- 근거: `src/screen-patterns.ts`의 `commentThreadRecipe`, 양 renderer `src/screen-flows.tsx`의 `CommentThreadRow`·`CommentThreadScreen`
- 스토리북: 별도 예제 미등록

## 언제 쓰나

가상화 목록(FlatList·가상 스크롤러)처럼 제품이 댓글 목록을 직접 그려야 할 때 댓글 한 행을 그린다.
`CommentThreadScreen`이 쓰는 것과 같은 행이라 아바타·작성자·본문·답글·좋아요 배치가 화면과 똑같다.
1.23.0에서 가상화 댓글 목록용으로 공개했다. 행만 단독 예제는 없고 `배포/화면/소통/댓글`의
`CommentThreadScreen` 안에서 같은 행이 렌더된다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 댓글 화면 전체(헤더·답글 펼침·작성창) | [CommentThreadScreen](comment-thread-screen.md) |
| 1:1·그룹 메시지 | [ChatMessage](chat-message.md) |
| 대화 목록 미리보기 | [ConversationRow](conversation-row.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `CommentThreadRow` | 댓글·답글 한 행 | `@hjmds/react/screen-flows` | `@hjmds/react-native/screen-flows` |

행 데이터 타입 `CommentThreadItem`·`CommentReactions`도 같은 entry에서 import한다.

## 최소 사용 예

```tsx
// Web
import { CommentThreadRow } from "@hjmds/react/screen-flows";

<VirtualList items={comments} renderItem={item =>
  <CommentThreadRow item={item} onLike={toggleLike} onReply={startReply} replyLabel={t("comment.reply")} />} />
```

```tsx
// Native
import { CommentThreadRow } from "@hjmds/react-native/screen-flows";

<FlatList data={comments} keyExtractor={item => item.id}
  renderItem={({ item }) =>
    <CommentThreadRow item={item} onLike={toggleLike} onReply={startReply} replyLabel={t("comment.reply")} />} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| item | `CommentThreadItem` | 필수 | 댓글 데이터와 슬롯(아래 표) |
| onLike | `(id) => void` | 필수 | 기본 좋아요 `IconButton` 누름 |
| onReply | `(id) => void` | 필수 | 답글 문구 행동·길게 누르기 메뉴의 답글 항목 |
| replyLabel | string | 필수 | 답글 행동 문구 |
| layoutStyle | ScreenLayout `layoutStyle` | 없음 | 바깥 Stack 배치 보정 |

| `item` 필드 | 기본값 | 설명 |
| --- | --- | --- |
| `id`·`parentId`·`author`·`body`·`timeLabel`·`likeCountLabel`·`likeIcon`·`likeLabel` | 필수 | `parentId`가 `null`이면 최상위 댓글 |
| `bodyText` | 없음 | 주면 `author`와 본문을 한 문장으로, 시각은 아래 행동 줄로 옮긴다 |
| `avatar` | 없음 | 제품 아바타. 최상위 32·답글 24 폭 칸에 둔다 |
| `canReply` | `parentId === null` | 답글 행동 표시 여부 |
| `replyDisabled` | false | 답글 행동 비활성 |
| `likeAction`·`actions` | 없음 | 기본 좋아요 버튼 대체·옆에 추가 |
| `reactions`·`reactionSummary`·`media` | 없음 | 길게 누르기 메뉴·선택 반응 표시·본문 아래 사진. 제공 버전은 [CommentThreadScreen](comment-thread-screen.md) 지침을 따른다 |
| `timeDateTime` | 없음 | Web `<time dateTime>` 값. Native는 쓰지 않는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 아바타 칸 최상위 32·답글 24, 좋아요 수 칸 폭 44, `media` 최대 폭 160·radius `radius.md` | `commentThreadRecipe` |
| 간격 | 아바타·본문·좋아요 열 사이 `spacing.xs` 8, 본문 줄 사이 2, 행동 줄 항목 사이 `spacing.sm` 12, 작성자–시각 `spacing.xxs` 4, `media` 위 4 | `commentThreadRecipe.lineGap`, `Stack gap` |
| 순서·정렬 | 아바타 → (작성자·시각 → 본문 → media → 시각/반응 요약/답글 행동) → 좋아요 버튼·`actions` 아래 좋아요 수. 위 정렬 단, 오른쪽 좋아요·`actions`·더보기 열은 44 터치 영역을 첫 줄(작성자 caption, `bodyText`면 본문 줄)의 가운데에 맞춘다: 열을 (첫 줄 높이 − 44) / 2만큼 올린다(`commentThreadRecipe.actionAnchor`). HJM의 좋아요·더보기가 마지막이면 열 전체가 IconButton 가장자리 오버행(10)만큼 끝으로 나가 아이콘 칸이 행 끝 여백 선(아바타 시작과 같은 선)에 온다. 제품 `actions`가 마지막이면 그 버튼에 `edge="end"`를 준다. 측정 전후(Web 402): 아바타 168 / 작성자 줄 162 / 아이콘 174 → 아이콘 160 = 작성자 줄, 더보기 칸 끝 28 → 16(2026-10-17 실측 감사, [IconButton `edge`](icon-button.md#배치)) | 양 renderer |
| 고정·스크롤 | 행은 스크롤하지 않는다. 목록 스크롤·행 간격(`rowGap` 12)·답글 들여쓰기(`replyIndent` 40)는 host가 준다 | `CommentThreadScreen` |
| 좁은 폭·큰 글자 | 본문 열이 `min-width: 0`으로 줄며 줄바꿈되고 작성자·행동 줄은 `flexWrap`. 좋아요 열은 줄지 않는다 | `.hjm-comment-row__text`, `flexShrink: 0` |

## 꼭 지킬 것

- 가상화 host에서 행 사이 간격(`commentThreadRecipe.rowGap`)과 답글 들여쓰기(`replyIndent`)를 직접 줄 때도 recipe 값을 쓴다. 제품 숫자로 다시 정하지 않는다.
- 답글 펼치기·정렬·권한·좋아요 저장은 제품이 소유한다. 행은 콜백만 호출한다.
- 행 안에 두 번째 레이아웃을 만들지 말고 `actions`·`likeAction`·`media` 슬롯으로 추가한다.

## 상태와 상호작용

답글 행동은 채운 버튼이 아니라 muted caption 문구 버튼이며 `replyDisabled`면 불투명도 0.5로 비활성이다.
`reactions`를 주면 작성자·본문만 길게 누르기 대상이 되고, 답글 가능하면 메뉴에 답글 항목이 자동으로 붙는다.
답글 행동 버튼은 길게 누르기 대상 밖에 남아 자기 버튼 의미를 유지한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 답글 행동 | `<button class="hjm-comment-row__action">` | `Pressable`, `hitSlop` 8 |
| 시각 | `<time dateTime>` 안 caption | caption `Text` |
| 길게 누르기 반응 | `MessageReactions` 트리거 class `hjm-comment-row__reactions` | `MessageReactions previewSurface` |
