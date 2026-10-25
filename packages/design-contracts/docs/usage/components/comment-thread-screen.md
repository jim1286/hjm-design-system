# CommentThreadScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.17.1
- 검토일: 2026-10-20
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/컴포넌트/레이아웃/댓글 화면`, `배포/화면/소통/댓글`

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
| `CommentMenu`(타입) | 댓글별 세로 점 더보기 메뉴 설정(미게시) | `/screen-flows` | `/screen-flows` |

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
| `threadFooter` | 최상위 댓글 목록의 더 보기·커서 페이지네이션 |
| `moreRepliesLabel(remaining)`(미게시) | 펼친 답글 묶음의 "더 보기" 문구(예: "답글 7개 더 보기"). 주면 아래 답글 5개 정책이 켜지고, 생략하면 받은 답글을 모두 보이는 이전 동작이다. 포트폴리오 제품은 모두 준다 |
| `revealedReplyId`(미게시) | 방금 보낸 답글·알림 대상처럼 열린 페이지 밖이어도 보여야 하는 답글 id. 묶음 펼침은 여전히 `expandedIds`가 정한다 |
| `commentMenu`(미게시) | 댓글별 더보기 메뉴. `label(item)` 버튼·메뉴의 지역화 접근성 이름(예: "seoyeon 댓글 더 보기"), `items(item)` 그 댓글에 허용된 항목(`{ id, label, tone?: "danger", disabled? }`, Menu·ContextMenu와 같은 항목 어휘), `onAction(item, id)` 메뉴가 닫힌 뒤 호출. Native는 메뉴 시트의 닫기 문구 `dismissLabel`도 받는다. 항목이 비면 그 행에는 버튼을 그리지 않는다. 같은 prop을 `CommentThreadRow`도 받는다 |

`CommentThreadItem`: `id`, `parentId`(`null`이면 최상위), `author`, `body`(노드), `timeLabel`, `likeCountLabel`,
`likeIcon`, `likeLabel`은 필수. 선택은 `bodyText`(작성자와 본문을 한 줄 흐름으로), `avatar`, `likeAction`(기본
좋아요 버튼 교체, `null`이면 생략), `actions`(하트 바로 옆의 더보기 메뉴 등), `canReply`(기본: 최상위만 true), `replyDisabled`.
최상위 항목에는 `repliesCount`·`repliesNotice`·`repliesFooter`를 연결할 수 있다(checkout 변경·미게시).
`repliesCount`는 0 이상 정수인 서버 전체 개수이며 생략하면 받은 답글 수다. 실제 받은 수보다 작으면
받은 수를 표시한다. 원글 본문 뒤 답글 들여쓰기 영역에 펼침 버튼 → (펼쳤을 때) repliesNotice → 답글 행 → repliesFooter 순으로 둔다.
받은 답글이 없어도 전체 개수·복구 안내·더 보기 슬롯으로 답글 영역을 열 수 있다. 접으면 세 영역이 함께 숨는다.
조회·커서·재시도·문구·데이터 보존은 제품이 맡고 오류/페이지 행동은 HJM Notice·Button/LoadMore로 공급한다.
Spint에서 페이지 오류와 더 보기가 원글 body에 들어가 답글을 접어도 남던 2026-10-18 이관이 확장 근거다.

### 답글 5개씩 (2026-10-25 정책, 미게시)

펼친 답글 묶음은 `commentThreadRecipe.replyPageSize`(5)개만 먼저 보이고, 묶음 끝의 흐린 글자 버튼
(`moreRepliesLabel(남은 수)`)이 5개씩 더 연다. 받은 답글이 남아 있으면 HJM이 바로 보이고, 받은 답글을 다 보였는데
`repliesCount`가 더 크면 최상위 항목의 `repliesPage.onLoadMore()`를 불러 제품이 다음 서버 페이지(5개)를 받게 한다.
요청 중에는 `repliesPage.pending`으로 버튼을 막는다. 오류는 `repliesNotice`, 그 밖의 묶음 끝 내용은 `repliesFooter`에 둔다.
열린 개수는 HJM 화면 상태이고, 데이터·커서·정렬·펼침은 제품이 맡는다. 판단 규칙은 `resolveCommentReplyPage`다.
계기: Spint가 답글 더 보기를 가운데 브랜드색 링크로 직접 만들고 번뚝은 답글을 접지 않아, 같은 기능이 앱마다 달랐다.
실행 원본: [Web 답글 복구](../../../../../showcase/web/src/components/comment-thread-replies-preview.tsx),
[Native 답글 복구](../../../../../showcase/native/src/components/comment-thread-replies-preview.tsx).

`reactions`(미게시)를 주면 작성자·본문을 길게 눌러 ChatMessage와 같은 메뉴(반응 줄 → 미리보기 → 시각 → 답글 달기 → `menuActions` → `reportAction` 신고)가 열린다. 답글 달기는 `canReply`일 때 `onReply`로 자동 연결되고, 아이콘은 `reactions.replyIcon`으로 넘긴다. `reactionSummary`는 답글 달기 앞에 놓는 선택된 반응 표시 슬롯이다. 댓글의 기본은 반응 옵션을 비운(`options: []`) 동작 목록 전용 메뉴다(답글 달기 → `menuActions` → 신고, 인스타그램 댓글 길게 누르기 실측). 댓글 이모지는 길게 누르기가 아니라 작성창의 `quickInserts` 이모지 줄로 입력한다. 반응 줄은 제품이 명시적으로 댓글 반응을 운영할 때만 옵션을 넣는다. 댓글 메뉴에는 시각 제목을 두지 않는다(행에 이미 보인다).
`media`(미게시, 선택)는 본문 아래 사진·스티커이며 최대 폭 `commentThreadRecipe.mediaMaxWidth` 160, radius 12로 감싼다. 호스트는 기본 폭 160과 부모 기준 최대 폭 100%를 함께 제공하므로, percentage 폭 이미지도 별도 제품 썸네일 틀 없이 비율을 유지한다. Spint 사진의 본문 내 배치를 media 슬롯으로 옮기면서 확인한 계약이다. 사진 여러 장을 한 장씩 불러와야 하면 `media` 대신 `mediaAlbum`, 시각을 답글 줄로 옮기려면 `timePlacement: "actions"`, 수정·신고·차단 양식은 `panel`을 쓴다(미게시, [CommentThreadRow](comment-thread-row.md#축과-기본값)). `likeCountLabel`은 하트 아래 숫자만(예: "15") 넣고 0이면 빈 문자열로 숨긴다. 개수를 포함한 전체 문장은 `likeLabel`에 둔다.

## 배치

좋아요 수는 하트 아래, 답글 달기는 본문 아래 흐린 글자, 답글은 부모 글 열에 맞춘다. 미게시 변경이다.


`threadHeader?: ReactNode`는 장소 소개·원문·필터처럼 댓글과 함께 스크롤할 콘텐츠다.
공통 본문 안에서 첫 댓글 앞에 놓이고, `threadFooter`는 마지막 댓글 뒤에 놓인다.
`header`는 뒤로 버튼·짧은 제목 같은 고정 탐색 영역에만 쓴다. 소개 영역 안에 별도 ScrollView를
넣지 않는다. `composer`는 기존 고정 작성 영역을 유지한다. 화면 상태가 본문을 교체하면
threadHeader도 댓글과 함께 숨겨지므로 항상 보여야 하는 안내는 `notice`를 사용한다.

임의의 댓글 항목에 소개를 끼워 넣지 않는다. 두 renderer가 같은 optional 슬롯을 제공하며 생략한 기존 호출은 바뀌지 않는다.


| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ScreenLayout 폭(최대 720); 아바타 `commentThreadRecipe.avatarSize` 32, 답글 아바타 `replyAvatarSize` 24(제품은 이 크기로 넘긴다); 본문 열이 남은 폭을 채우고(`flex: 1`, 최소 폭 0) 오른쪽 끝에 좋아요(44 터치 영역)·`actions`를 한 행으로, 좋아요 수는 하트 아래 가운데; 답글·펼침은 흐린 글자 버튼(caption, 굵게) | `commentThreadRecipe`, Web·Native `CommentThreadRow` |
| 간격 | 화면 padding `spacing.md` 16; 댓글 행 사이 `rowGap` = `spacing.lg` 20(최상위·답글 동일); 답글 묶음은 부모 글 열에 맞춰 `replyIndent` 40 들여쓰기; 아바타–본문 `avatarGap` 8; 작성자·본문·답글 줄 사이 `lineGap` = `spacing.xxs` 4; 작성자–시각 `spacing.xxs` 4; 좋아요–actions 추가 간격 0 | `commentThreadRecipe`, [변경 근거](comment-thread-row.md#근거) |
| 순서·정렬 | 최상위 댓글(아바타 → 작성자·시각 → 본문 → 답글 달기) + 행 오른쪽 좋아요 → `actions` → `commentMenu` 세로 점 버튼(끝), 그 아래 좋아요 수 → 답글 펼침 → 펼친 repliesNotice → 답글 → repliesFooter → … → `threadFooter` → composer(footer) | 렌더 순서 |
| 고정·스크롤 | 헤더·composer 고정, 댓글은 본문 화면 스크롤(`scroll` 기본 `"screen"`); composer는 `ready`·`empty`에서만 | `ScreenLayout`, `screen-flows.tsx` |
| 좁은 폭·큰 글자 | 시각·좋아요 수·답글 버튼 줄과 작성자 줄은 줄바꿈(`flexWrap: "wrap"`); 답글은 한 단계만 들여써 좁은 폭에서도 본문 폭을 지킨다 | `screen-flows.tsx` |

## 꼭 지킬 것

- 진입 포커스(`initialFocus`)는 페이지에서 기본 `first-input`이다(1.33.0 정책 변경). 상단·본문 입력만 대상이며 하단 `composer`는 자동 포커스하지 않는다(2026-10-18 후속 요청, checkout 변경·미게시). 하단 시트 안에서는 중첩 화면·작성창 모두 자동 포커스하지 않는다. [진입 포커스](screen-layout.md#진입-포커스)를 따른다.

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

- 펼침 상태는 두 플랫폼 모두 버튼의 expanded 상태로 전한다. 그래도 `repliesLabel(count, expanded)`가
  버튼 이름이므로 문구에서도 펼침 여부가 드러나게 만든다.

- ChatScreen과 CommentThreadScreen 모두 `ready`·`empty`에서 작성창을 보인다.
  `loading`·`error`·`restricted`에서는 둘 다 숨는다.

댓글의 추가 행동은 하트 바로 옆에 둔다. 두 버튼은 같은 가로 행이다. 더보기 메뉴는 `commentMenu`로 HJM이 그린다(미게시):
행 끝의 세로 점 3개 ghost IconButton(44 터치 영역, glyph `commentThreadRecipe.menuGlyphSize` 20, Web SVG·Native 그린 점으로 같은 모양),
지역화 접근성 이름, Web은 버튼에 붙는 Menu 팝오버(`align="end"`), Native는 Menu 시트. `tone: "danger"` 항목(삭제·차단)은
계약 `resolveCommentMenuItems`가 항상 끝으로 옮기고, 메뉴는 위험 표시를 색과 함께 글자 단서로도 붙인다. 제품은 항목·권한·콜백만 공급하고
버튼·메뉴를 `actions`로 다시 조립하지 않는다. `actions`는 기존 호출 호환을 위해 자유 노드 슬롯으로 남고 하트와 메뉴 버튼 사이에 놓인다.
삭제 확인 대화상자는 제품이 `onAction`에서 띄운다(메뉴가 닫힌 뒤 호출되므로 포커스·모달이 겹치지 않는다).
순서는 좋아요 → 더보기이며 RTL에서는 논리 방향을 따른다. `likeAction=null`도 그대로 지원한다.
이 배치 수정은 1.16.1 변경이다. 실제 설치 버전과 제품 화면 검증은 별도로 확인한다.

`author`와 `timeLabel`이 모두 비면 머리글 행을 생략해 avatar와 본문 시작 높이를 맞춘다. Web·Native 동일하다.

`CommentThreadRow`는 `item`, `onLike`, `onReply`, `replyLabel`을 받으며 화면 내부도 같은 구현을 사용한다. 가상화 host는 항목 ID·페이지·스크롤을 연결하고 댓글 내부 간격·작성자·본문·시각·반응·메뉴 배치를 복제하지 않는다. `bodyText`가 있으면 작성자와 본문을 이어 쓰고 시각을 하단에, 없으면 작성자와 시각을 머리글에 표시한다.

## 근거

- 댓글 행 배치(좋아요 수·답글 달기·답글 들여쓰기): 2026-10-16 사용자 결정 — 공통 기준을 인스타그램 iOS 댓글 시트 실측(@3x 캡처)으로 바꿨다.
- `threadHeader`·`threadFooter` 슬롯: 2026-10-08 Spint 실제 화면에서 긴 소개를 고정 header에 넣고 높이를 제한하자 스팟 선택이 잘리고 스크롤이 둘로 나뉘었다. 댓글 항목에 소개를 끼우면 댓글 ID·펼침 계약이 오염된다.
- Web 답글 펼침 `aria-expanded`: 2026-10-06 추가.
- 추가 행동을 하트 옆에: 2026-10-07 사용자 요청 — 본문 아래 위치는 답글 행동과 섞였고 세로로 쌓으면 하트와 더보기의 관계가 떨어져 보였다.
- 작성자·시각이 모두 비면 머리글 생략: 2026-10-12 Spint의 작성자 없는 개발 댓글에서 빈 머리글이 본문을 아래로 밀었다.
- `commentMenu`(HJM 세로 점 더보기): 2026-10-17 사용자 결정. 2026-10-15 규칙(메시지·댓글의 공통 구조는 HJM이 맡고 앱은 데이터·문구·권한만 연결)에 따라, 화면 검토 S4#7에서 제품·예제마다 `actions`로 더보기 버튼·아이콘·메뉴를 직접 조립해 위치와 이름이 갈라진 것을 HJM 공개 prop으로 옮겼다. 위험 항목을 끝에 두는 규칙은 대화 목록 ContextMenu와 같다.

### 댓글 더보기 표현 — 개발 소스, 미게시

2026-10-20 메뉴의 대상 연결을 분명히 하자는 결정으로 `commentMenu.presentation`은 Web·Native 모두
`anchored`가 기본이다. `grouped`/`bottom`으로 바꿀 때는 제품 상호작용 이유와 지역화한 `dismissLabel`을 함께 제공한다.
행마다 제품 Menu를 새로 조립하지 않는다. [Menu의 세 표현](menu.md#세-가지-표시-방식--개발-소스-미게시)을 따른다.

### 회원 프로필 이동 (2026-10-25)

`CommentThreadItem.avatarAction={label,onPress}`로 작성자 사진·이니셜을 회원 프로필에 연결한다. 아바타 버튼은 댓글 hold/답장/좋아요 영역 밖에 위치한다.
