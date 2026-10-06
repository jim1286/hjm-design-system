# CommentThreadScreen 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [반복 화면 조합 — 기본 흐름 공개 조합](../screen-patterns.md), 검증 `validateCommentThread`(`src/screen-patterns.ts`)

## 언제 쓰나

게시물·콘텐츠 아래의 댓글 화면 한 장에 쓴다. 최상위 댓글과 한 단계 답글, 답글 펼침, 좋아요·답글 버튼,
하단 작성창을 controlled로 합성한다. 별도 보조 기능(supplemental)이라 `/screen-flows` subpath로만 import 한다.
서버 정렬·권한·전송·성공 후 초안 정리는 제품 소유다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 1:1·그룹 대화 타임라인 | [ChatScreen](chat-screen.md) + [ChatMessage](chat-message.md) |
| 작성창만 필요 | [MessageComposer](message-composer.md) |
| 일반 목록/상세 화면 | [ListDetailScreen](list-detail-screen.md) |
| 신고·차단 흐름 | [ModerationScreen](moderation-screen.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `CommentThreadScreen` | `/screen-flows` | `/screen-flows` | 화면 조합 |
| `CommentThreadItem`(타입) | `/screen-flows` | `/screen-flows` | 댓글 한 개의 데이터 |

루트 barrel에는 없다. optional native peer를 요구하지 않는다.

## 제품이 공급하는 것

| prop | 내용 |
| --- | --- |
| `title`(필수), `header`·`leading`·`actions`, `state`·`stateAction`, `notice` | `ScreenLayout`과 같다([ScreenLayout](screen-layout.md)) |
| `items`(필수) | 서버 순서대로 정렬된 `CommentThreadItem[]`. 아래 표 |
| `expandedIds`·`onExpandedChange(id)` | 답글을 펼친 최상위 id 목록과 토글 |
| `onLike(id)`·`onReply(id)` | 기본 좋아요 버튼·답글 버튼의 콜백 |
| `replyLabel`·`repliesLabel(count, expanded)` | 지역화 문구. 복수형·펼침 상태는 제품 i18n이 만든다 |
| `composer` | 작성창(보통 `MessageComposer`의 `replyTo`·`sendIcon`). `ready`·`empty`일 때만 보인다 |
| `threadFooter` | 더 보기·커서 페이지네이션 |

`CommentThreadItem`: `id`, `parentId`(`null`이면 최상위), `author`, `body`(노드), `timeLabel`, `likeCountLabel`,
`likeIcon`, `likeLabel`은 필수. 선택은 `bodyText`(작성자와 본문을 한 줄 흐름으로), `avatar`, `likeAction`(기본
좋아요 버튼 교체, `null`이면 생략), `actions`(신고·수정 등), `canReply`(기본: 최상위만 true), `replyDisabled`.

## 최소 사용 예

```tsx
// Web
import { CommentThreadScreen } from "@hjmds/react/screen-flows";
import { MessageComposer } from "@hjmds/react/screens";

<CommentThreadScreen
  title={t("comments.title")}
  items={comments.map(toCommentItem)}
  expandedIds={expanded}
  onExpandedChange={toggleExpanded}
  onLike={like}
  onReply={id => setReplyTo(id)}
  replyLabel={t("comments.reply")}
  repliesLabel={(count, open) => t(open ? "comments.hideReplies" : "comments.showReplies", { count })}
  composer={<MessageComposer value={draft} label={t("comments.input")} sendLabel={t("comments.send")}
    sendIcon={<ArrowUpIcon />} sendPresentation="circle" onValueChange={setDraft} onSend={send} />}
  threadFooter={hasMore ? <LoadMoreButton /> : null}
/>
```

Native는 import를 `@hjmds/react-native/screen-flows`·`@hjmds/react-native/screens`로 바꾼다. 콜백 이름은 같다.

## 꼭 지킬 것

- id는 비어 있지 않고 유일해야 하며, 답글의 `parentId`는 `items` 안의 **최상위** 댓글이어야 한다. 아니면 렌더 중
  `TypeError`가 난다. 답글의 답글은 표현하지 않으므로 제품이 최상위로 평탄화한다.
- 모든 문구·시각·좋아요 수 라벨은 제품 i18n에서 만든다. `likeCountLabel`이 빈 문자열이면 그리지 않는다.
- 좋아요 저장·길게 누르기·이모지 선택, 답글 권한(`canReply`/`replyDisabled`)은 제품 데이터로 정한다.
- 기본 `scroll`은 `ScreenLayout`과 같은 `screen`이다. 댓글을 가상화 목록으로 그리면 직접 `scroll="content"`를 준다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 | `className` | `layoutStyle` |
| 새로고침·키보드 스크롤 | 없음 | `scrollProps`(`refreshControl`, `keyboardDismissMode` 등), `scrollRef` |

## 함정

- 작성창 노출 조건이 ChatScreen과 다르다. ChatScreen은 `ready`에서만, CommentThreadScreen은 `ready`·`empty`에서 보인다.
  `loading`·`error`·`restricted`에서는 둘 다 숨는다.
