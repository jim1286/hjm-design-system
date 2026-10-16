# CommentThreadScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.17.1
- 검토일: 2026-10-16
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/소통/댓글`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `CommentThreadScreen` | 화면 조합 | `/screen-flows` | `/screen-flows` |
| `CommentThreadRow` | 가상화 목록에서도 같은 댓글 행 재사용(1.23.0) | `/screen-flows` | `/screen-flows` |
| `CommentThreadItem`(타입) | 댓글 한 개의 데이터 | `/screen-flows` | `/screen-flows` |

루트 barrel에는 없다. optional native peer를 요구하지 않는다.

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

```tsx
// Native — props·콜백 이름은 Web과 같다
import { CommentThreadScreen } from "@hjmds/react-native/screen-flows";
import { MessageComposer } from "@hjmds/react-native/screens";

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

### 제품이 공급하는 것

| prop | 내용 |
| --- | --- |
| `title`(필수), `header`·`leading`·`actions`, `state`·`stateAction`, `notice` | `ScreenLayout`과 같다([ScreenLayout](screen-layout.md)) |
| `items`(필수) | 서버 순서대로 정렬된 `CommentThreadItem[]`. 아래 표 |
| `expandedIds`·`onExpandedChange(id)` | 답글을 펼친 최상위 id 목록과 토글 |
| `onLike(id)`·`onReply(id)` | 기본 좋아요 버튼·답글 버튼의 콜백 |
| `replyLabel`·`repliesLabel(count, expanded)` | 지역화 문구. 복수형·펼침 상태는 제품 i18n이 만든다. 펼침 버튼 이름이 이 문구이므로 `expanded`에 따라 "답글 3개 보기"/"답글 숨기기"처럼 상태가 드러나게 만든다 |
| `composer` | 작성창(보통 `MessageComposer`의 `replyTo`·`sendIcon`). `ready`·`empty`일 때만 보인다 |
| `threadFooter` | 더 보기·커서 페이지네이션 |

`CommentThreadItem`: `id`, `parentId`(`null`이면 최상위), `author`, `body`(노드), `timeLabel`, `likeCountLabel`,
`likeIcon`, `likeLabel`은 필수. 선택은 `bodyText`(작성자와 본문을 한 줄 흐름으로), `avatar`, `likeAction`(기본
좋아요 버튼 교체, `null`이면 생략), `actions`(하트 바로 옆의 더보기 메뉴 등), `canReply`(기본: 최상위만 true), `replyDisabled`.
`reactions`(미게시)를 주면 작성자·본문을 길게 눌러 ChatMessage와 같은 메뉴(반응 줄 → 미리보기 → 시각 → 답글 달기 → `menuActions` → `reportAction` 신고)가 열린다. 답글 달기는 `canReply`일 때 `onReply`로 자동 연결되고, 아이콘은 `reactions.replyIcon`으로 넘긴다. `reactionSummary`는 답글 달기 앞에 놓는 선택된 반응 표시 슬롯이다. 댓글의 기본은 반응 옵션을 비운(`options: []`) 동작 목록 전용 메뉴다(답글 달기 → `menuActions` → 신고, 인스타그램 댓글 길게 누르기 실측). 댓글 이모지는 길게 누르기가 아니라 작성창 쪽 입력으로 다룬다. 반응 줄은 제품이 명시적으로 댓글 반응을 운영할 때만 옵션을 넣는다. 댓글 메뉴에는 시각 제목을 두지 않는다(행에 이미 보인다).
`media`(미게시, 선택)는 본문 아래 사진·스티커이며 최대 폭 `commentThreadRecipe.mediaMaxWidth` 160, radius 12로 감싼다. `likeCountLabel`은 하트 아래 숫자만(예: "15") 넣고 0이면 빈 문자열로 숨긴다. 개수를 포함한 전체 문장은 `likeLabel`에 둔다.

## 배치

2026-10-16 사용자 결정으로 댓글 행의 공통 기준을 인스타그램 iOS 댓글 시트 실측(@3x 캡처)으로 바꿨다.
좋아요 수를 하트 아래로, 답글 달기를 본문 아래 흐린 글자로 옮기고 답글을 부모 글 열에 맞췄다. 미게시 변경이다.


`threadHeader?: ReactNode`는 장소 소개·원문·필터처럼 댓글과 함께 스크롤할 콘텐츠다.
공통 본문 안에서 첫 댓글 앞에 놓이고, `threadFooter`는 마지막 댓글 뒤에 놓인다.
`header`는 뒤로 버튼·짧은 제목 같은 고정 탐색 영역에만 쓴다. 소개 영역 안에 별도 ScrollView를
넣지 않는다. `composer`는 기존 고정 작성 영역을 유지한다. 화면 상태가 본문을 교체하면
threadHeader도 댓글과 함께 숨겨지므로 항상 보여야 하는 안내는 `notice`를 사용한다.

2026-10-08 Spint 실제 화면에서 긴 소개를 고정 header에 넣고 높이를 제한하자 스팟 선택이
잘리고 스크롤이 둘로 나뉘었다. 임의의 댓글 항목에 소개를 끼워 넣으면 댓글 ID·펼침 계약이
오염되므로 두 renderer에 동일한 optional 슬롯을 추가했다. 생략한 기존 호출은 바뀌지 않는다.


| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ScreenLayout 폭(최대 720); 아바타 `commentThreadRecipe.avatarSize` 32, 답글 아바타 `replyAvatarSize` 24(제품은 이 크기로 넘긴다); 본문 열이 남은 폭을 채우고(`flex: 1`, 최소 폭 0) 오른쪽 끝에 좋아요(44 터치 영역)·`actions`를 한 행으로, 좋아요 수는 하트 아래 가운데; 답글·펼침은 흐린 글자 버튼(caption, 굵게) | `commentThreadRecipe`, Web·Native `CommentThreadRow` |
| 간격 | 화면 padding `spacing.md` 16; 댓글 행 사이 `rowGap` 12(최상위·답글 동일); 답글 묶음은 부모 글 열에 맞춰 `replyIndent` 40 들여쓰기; 아바타–본문 `avatarGap` 8; 작성자·본문·답글 줄 사이 `lineGap` 2; 작성자–시각 `spacing.xxs` 4; 좋아요–actions `spacing.xxs` 4 | `commentThreadRecipe` |
| 순서·정렬 | 최상위 댓글(아바타 → 작성자·시각 → 본문 → 답글 달기) + 행 오른쪽 좋아요 → `actions`, 그 아래 좋아요 수 → 답글 펼침 → 펼친 답글 → … → `threadFooter` → composer(footer) | 렌더 순서 |
| 고정·스크롤 | 헤더·composer 고정, 댓글은 본문 화면 스크롤(`scroll` 기본 `"screen"`); composer는 `ready`·`empty`에서만 | `ScreenLayout`, `screen-flows.tsx` |
| 좁은 폭·큰 글자 | 시각·좋아요 수·답글 버튼 줄과 작성자 줄은 줄바꿈(`flexWrap: "wrap"`); 답글은 한 단계만 들여써 좁은 폭에서도 본문 폭을 지킨다 | `screen-flows.tsx` |

## 꼭 지킬 것

- id는 비어 있지 않고 유일해야 하며, 답글의 `parentId`는 `items` 안의 **최상위** 댓글이어야 한다. 아니면 렌더 중
  `TypeError`가 난다. 답글의 답글은 표현하지 않으므로 제품이 최상위로 평탄화한다.
- 모든 문구·시각·좋아요 수 라벨은 제품 i18n에서 만든다. `likeCountLabel`이 빈 문자열이면 그리지 않는다.
- 좋아요 저장·길게 누르기·이모지 선택, 답글 권한(`canReply`/`replyDisabled`)은 제품 데이터로 정한다.
- 기본 `scroll`은 `ScreenLayout`과 같은 `screen`이다. 이 화면 자체는 가상화하지 않는다. 가상화가 필요하면 `ScreenLayout scroll="content"` 안 플랫폼 목록에 `CommentThreadRow`를 연결한다. `scroll="content"`만 바꾼다고 이 화면이 가상화 목록이 되지는 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 | `layoutStyle`, `className` | `layoutStyle` |
| 새로고침·키보드 스크롤 | 없음 | `scrollProps`(`refreshControl`, `keyboardDismissMode` 등), `scrollRef` |
| 답글 펼침 상태 | 펼침 버튼이 `aria-expanded`를 노출한다(1.13.0 변경) | 펼침 버튼이 `accessibilityState.expanded`를 노출한다(1.13.0 변경) |

## 함정

- 펼침 상태는 두 플랫폼 모두 버튼의 expanded 상태로 전한다(2026-10-06 Web `aria-expanded` 추가). 그래도 `repliesLabel(count, expanded)`가
  버튼 이름이므로 문구에서도 펼침 여부가 드러나게 만든다.

- ChatScreen과 CommentThreadScreen 모두 `ready`·`empty`에서 작성창을 보인다.
  `loading`·`error`·`restricted`에서는 둘 다 숨는다.

2026-10-07 사용자 요청으로 댓글의 추가 행동을 본문 아래에서 하트 바로 옆으로 옮겼다.
기존 위치는 답글 행동과 섞였고 세로로 쌓으면 하트와 더보기의 관계가 떨어져 보였다.
두 버튼은 같은 가로 행이며 더보기 glyph는 세로 점3개(`MoreVertical`)를 제품이 Menu
trigger로 공급한다. `actions`는 자유 노드 슬롯을 유지하고 메뉴 권한/항목/전송은 제품 소유다.
순서는 좋아요 → 더보기이며 RTL에서는 논리 방향을 따른다. `likeAction=null`도 그대로 지원한다.
이 배치 수정은 1.16.1 변경이다. 실제 설치 버전과 제품 화면 검증은 별도로 확인한다.

2026-10-12 Spint의 작성자 없는 개발 댓글에서 빈 머리글이 본문을 아래로 밀었다.
`author`와 `timeLabel`이 모두 비면 머리글 행을 생략해 avatar와 본문 시작 높이를 맞춘다. Web·Native 동일하다.

`CommentThreadRow`는 `item`, `onLike`, `onReply`, `replyLabel`을 받으며 화면 내부도 같은 구현을 사용한다. 가상화 host는 항목 ID·페이지·스크롤을 연결하고 댓글 내부 간격·작성자·본문·시각·반응·메뉴 배치를 복제하지 않는다. `bodyText`가 있으면 작성자와 본문을 이어 쓰고 시각을 하단에, 없으면 작성자와 시각을 머리글에 표시한다.
