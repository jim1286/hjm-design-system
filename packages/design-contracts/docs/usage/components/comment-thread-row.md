# CommentThreadRow

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.23.0
- 검토일: 2026-10-20
- 근거: `src/screen-patterns.ts`의 `commentThreadRecipe`, 양 renderer `src/screen-flows.tsx`의 `CommentThreadRow`·`CommentThreadScreen`
- 스토리북: `배포/컴포넌트/데이터 표시/댓글 행`

## 언제 쓰나

가상화 목록(FlatList·가상 스크롤러)처럼 제품이 댓글 목록을 직접 그려야 할 때 댓글 한 행을 그린다.
`CommentThreadScreen`이 쓰는 것과 같은 행이라 아바타·작성자·본문·답글·좋아요 배치가 화면과 똑같다.
1.23.0에서 가상화 댓글 목록용으로 공개했다. `배포/컴포넌트/데이터 표시/댓글 행`에서 단독 예제를,
`배포/화면/소통/댓글`에서 같은 행을 사용하는 `CommentThreadScreen` 예제를 확인한다.

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
| `timePlacement` | `"auto"` | 미게시. `"auto"`는 `bodyText`가 없으면 시각을 작성자 옆에 둔다. `"actions"`는 글이 아닌 본문(꽃 도장·카드)에서도 시각을 본문 아래 반응 요약·답글과 같은 줄 맨 앞으로 옮긴다 |
| `textActions` | 없음 | 미게시. 답글 줄의 답글 뒤에 붙는 제품 문구 행동 `{ id, label, onPress, disabled? }[]`. 답글과 같은 muted caption 문구 버튼이며 순서대로 놓인다(예: 번역 댓글의 "원본 보기"/"번역 보기"). 문구·상태는 제품이 소유한다 |
| `panel` | 없음 | 미게시. 댓글별 인라인 패널(수정·신고·차단 양식). 답글 줄 아래, 길게 누르기 대상 밖에 `panelGap` 8 간격으로 놓인다. 열림 상태·초점·제출·닫기는 제품이 소유한다 |
| `mediaAlbum` | 없음 | 미게시. 한 장씩 넘기는 사진 묶음 `{ count, renderPage(index), pageLabel(index, count), previousLabel, nextLabel, aspectRatio?, onPress?(index), index?·onIndexChange?·defaultIndex? }`. `renderPage`는 화면에 보이는 장에만 호출되어 제품이 그 사진만 조회·디코딩한다. 불러오는 중·실패 장은 `MediaAlbumPageStatus`(`@hjmds/react(-native)/screens`, [ChatMessage](chat-message.md#축과-기본값))로 그려 안쪽 내용이 낭독기에 닿게 한다. `media`와 함께 주면 `TypeError`. 본문 아래, 길게 누르기 대상 밖에 놓인다 |
| `authorBadge` | 없음 | 미게시. 닉네임 바로 뒤, 같은 줄에 놓는 제품 배지. 간격 `spacing.xxs` 4, 좁은 폭에서는 줄바꿈한다. `bodyText` 모드에서도 작성자·배지·본문 순서로 배치한다. 배지 문구·노출 조건은 제품이 소유한다 |
| `avatar` | 없음 | 제품 아바타. 최상위 32·답글 24 폭 칸에 둔다 |
| `avatarAction` | 없음 | 회원 프로필 이동 `{ label, onPress, disabled? }`. 사진과 **작성자 이름**이 같은 행동을 쓴다(이름은 2026-10-29부터, [Avatar 지침](avatar.md#회원-프로필-이동-2026-10-25)) |
| `canReply` | `parentId === null` | 답글 행동 표시 여부 |
| `replyDisabled` | false | 답글 행동 비활성 |
| `likeAction`·`actions` | 없음 | 기본 좋아요 버튼 대체·옆에 추가 |
| `reactions`·`reactionSummary`·`media` | 없음 | 길게 누르기 메뉴·선택 반응 표시·본문 아래 사진. 제공 버전은 [CommentThreadScreen](comment-thread-screen.md) 지침을 따른다 |
| `timeDateTime` | 없음 | Web `<time dateTime>` 값. Native는 쓰지 않는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 아바타 칸 최상위 32·답글 24, 좋아요 수 칸 폭 44, `media`·`mediaAlbum` 최대 폭 160·radius `radius.md`(앨범은 사진 칸에만 radius, 그 아래 이전 아이콘 · 위치(예: 2/5) · 다음 아이콘 줄, 작은 ghost IconButton) | `commentThreadRecipe`, `mediaAlbumRecipe` |
| 간격 | 아바타·본문·좋아요 열 사이 `spacing.xs` 8, 작성자·본문·행동 줄 사이 `lineGap` = `spacing.xxs` 4, 행동 줄 항목 사이 `spacing.sm` 12, 작성자–시각 `spacing.xxs` 4, `media` 위 4 | `commentThreadRecipe.lineGap`, `Stack gap` |
| 순서·정렬 | 아바타 → (작성자·시각 → 본문 → media 또는 mediaAlbum → 시각/반응 요약/답글 행동 → panel) → 좋아요 버튼·`actions` 아래 좋아요 수. 위 정렬 단, 오른쪽 좋아요·`actions`·더보기 열은 44 터치 영역을 첫 줄(작성자 caption, `bodyText`면 본문 줄)의 가운데에 맞춘다: 열을 (첫 줄 높이 − 44) / 2만큼 올린다(`commentThreadRecipe.actionAnchor`). HJM의 좋아요·더보기가 마지막이면 열 전체가 IconButton 가장자리 오버행(10)만큼 끝으로 나가 아이콘 칸이 행 끝 여백 선(아바타 시작과 같은 선)에 온다. 제품 `actions`가 마지막이면 그 버튼에 `edge="end"`를 준다. 측정 전후(Web 402): 아바타 168 / 작성자 줄 162 / 아이콘 174 → 아이콘 160 = 작성자 줄, 더보기 칸 끝 28 → 16(2026-10-17 실측 감사, [IconButton `edge`](icon-button.md#배치)) | 양 renderer |
| 고정·스크롤 | 행은 스크롤하지 않는다. 목록 스크롤·행 간격(`rowGap` = `spacing.lg` 20)·답글 들여쓰기(`replyIndent` 40)는 host가 준다 | `CommentThreadScreen` |
| 좁은 폭·큰 글자 | 본문 열이 `min-width: 0`으로 줄며 줄바꿈되고 작성자·행동 줄은 `flexWrap`. 좋아요 열은 줄지 않는다 | `.hjm-comment-row__text`, `flexShrink: 0` |

좋아요·더보기 버튼 사이의 추가 간격은 0이다. 각 IconButton의 터치 영역은 유지한다.
2026-10-18 Spint 화면에서 두 아이콘이 멀리 떨어져 보인다는 사용자 피드백으로, 버튼 내부 여백에 더해지던 `xxs` 간격을 제거했다. 미게시 변경이다.

## 꼭 지킬 것

- 가상화 host에서 행 사이 간격(`commentThreadRecipe.rowGap`)과 답글 들여쓰기(`replyIndent`)를 직접 줄 때도 recipe 값을 쓴다. 제품 숫자로 다시 정하지 않는다.
- 답글 펼치기·정렬·권한·좋아요 저장은 제품이 소유한다. 행은 콜백만 호출한다.
- 행 안에 두 번째 레이아웃을 만들지 말고 `actions`·`likeAction`·`media`·`mediaAlbum`·`panel` 슬롯으로 추가한다. 시각·답글 줄을 본문 노드 안에 다시 그리지 말고 `timePlacement: "actions"`와 `canReply`를 쓴다. 답글 옆 문구 행동도 본문에 버튼을 두지 말고 `textActions`로 준다.
- `mediaAlbum`의 사진 조회·권한 확인·캐시 수명은 제품이 `renderPage` 안에서 소유한다. HJM은 보이는 장만 마운트하고 넘김 상태를 행 안에 둔다(제어형은 `index`+`onIndexChange`).

## 상태와 상호작용

답글 행동은 채운 버튼이 아니라 muted caption 문구 버튼이며 `replyDisabled`면 불투명도 0.5로 비활성이다.
`reactions`를 주면 작성자·본문만 길게 누르기 대상이 되고, 답글 가능하면 메뉴에 답글 항목이 자동으로 붙는다.
답글 행동 버튼은 길게 누르기 대상 밖에 남아 자기 버튼 의미를 유지한다.

## 근거

- 2026-10-20 Spint의 “나” 배지가 본문 첫 줄을 차지하던 문제를 해결하기 위해 `authorBadge` 슬롯을 추가했다. 작성자에 붙는 표시는 HJM이 닉네임 옆에 배치하고 제품은 배지 내용만 공급한다. 개발 소스 변경이며 미게시다.

- 2026-10-20 Spint 댓글이 촘촘하다는 사용자 피드백에 따라 공통 행 사이 간격을 12→20, 내부 줄 사이 간격을 2→4로 조정했다. Web·Native가 같은 recipe를 사용한다. 개발 소스 변경이며 미게시다.
- `textActions`: 2026-10-29 Spint 댓글 번역. 사용자가 Instagram처럼 "답글 달기" 옆에 "원본 보기"/"번역 보기"를 두라고 요청했는데, 답글 줄에 제품 행동 자리가 없어 본문 아래 별도 줄로 그리고 있었다.
- `timePlacement`·`panel`·`mediaAlbum`: 2026-10-18 HJM 1.30.0 채택 감사. Spint는 꽃 도장 본문에서 시각을 답글 줄에 두려고 시각·답글 행을 본문 안에 다시 그렸고, Utilverse는 수정·신고·차단 양식을 본문 노드 안(길게 누르기 대상 안)에 넣었으며, 사진 묶음은 선택한 장만 조회하는 제품 앨범을 따로 만들었다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 답글 행동 | `<button class="hjm-comment-row__action">` | `Pressable`, `hitSlop` 8 |
| 시각 | `<time dateTime>` 안 caption | caption `Text` |
| 길게 누르기 반응 | `MessageReactions` 트리거 class `hjm-comment-row__reactions` | `MessageReactions previewSurface` |

### 댓글 더보기 표현 — 개발 소스, 미게시

2026-10-20 메뉴의 대상 연결을 분명히 하자는 결정으로 `commentMenu.presentation`은 Web·Native 모두
`anchored`가 기본이다. `grouped`/`bottom`으로 바꿀 때는 제품 상호작용 이유와 지역화한 `dismissLabel`을 함께 제공한다.
행마다 제품 Menu를 새로 조립하지 않는다. [Menu의 세 표현](menu.md#세-가지-표시-방식--개발-소스-미게시)을 따른다.
