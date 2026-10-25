# 댓글

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 구성 API 지침 참조
- 검토일: 2026-10-17
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/화면/공통 화면/댓글`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/소통/댓글`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 화면 API가 없는 제품 콘텐츠는 `ScreenLayout`의 본문에 HJM 구성을 연결한다.

## 목적

CommentThreadScreen을 사용해 댓글 흐름을 구성한다. 제품이 데이터·권한·서버 확정·문구를 공급하며, 예제의 메모리 저장을 운영 저장으로 취급하지 않는다.

## 영역 구조


짧은 뒤로/제목 행은 `header`, 장소 소개·원문·필터는 `threadHeader`, 추가 페이지 버튼은
`threadFooter`, 작성기는 `composer`에 둔다. threadHeader와 댓글은 하나의 본문 스크롤을
공유한다. 소개를 고정 header 안의 별도 스크롤로 제한하지 않는다.


```text
host: 남은 높이·safe area·키보드
└─ 원댓글 → 한 단계 답글 → 더 보기 → 작성창
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | CommentThreadScreen | route 본문 | [API 배치 규칙](../components/comment-thread-screen.md#배치), host 남은 높이 |
| 내용 | 공개 슬롯 | 원댓글 → 한 단계 답글 → 더 보기 → 작성창 | 화면 recipe의 sectionGap·itemGap; 슬롯 안은 각 지침 토큰 |
| 상태 | state 또는 해당 API 상태 | 본문 자리·비차단 notice | 입력 중 실패는 본문 높이와 초안을 유지 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 작업 | CommentThreadScreen 공개 행동 슬롯 | 좋아요와 세로 점 더보기는 댓글 오른쪽의 같은 행(더보기는 `commentMenu`로 HJM이 행 끝에 그린다); 답글은 본문 아래; 보내기는 하단 composer | 같은 표면에 경쟁하는 primary 하나만 |
| 댓글 메뉴 | `commentMenu` 항목 | 세로 점 버튼 → 메뉴(답글 달기 → 신고, 내 댓글이면 삭제는 danger로 끝) | 항목·권한은 제품, 순서·위치·이름 규칙은 HJM |
| 복구 | Button·secondary | 오류 근처 | 재시도할 대상과 범위를 표시 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 원댓글 → 한 단계 답글 → 더 보기 → 작성창 | 각 공개 콜백을 제품 상태에 연결 |
| 로딩 | 최초 조회는 본문 상태, 저장은 해당 행동 pending | 중복 제출 차단; 성공을 먼저 표시하지 않음 |
| 빈 | 조회 성공 0건을 본문 중앙에 표시하고 composer 유지 | 첫 댓글 작성 |
| 오류 | 최초 조회 실패는 본문 오류 상태, 전송 실패는 기존 목록·초안 유지 | 조회 재시도와 전송 재시도를 구분 |


### 댓글 목록과 입력의 독립 복구

| 상황 | 연결 | 유지·복구 |
| --- | --- | --- |
| 답글 접기·펼치기 | expandedIds와 원문 데이터 분리 | 서버 순서를 보존하고 접어도 답글 초안을 지우지 않는다 |
| 목록 추가 조회 실패 | 기존 items + threadFooter 재시도 | 이미 읽던 댓글과 스크롤을 유지한다 |
| 답글 더 보기 | `moreRepliesLabel` + (서버 페이지면) `repliesPage` | 답글은 5개씩 열고 받은 답글을 먼저 보인 뒤 다음 페이지를 요청한다([답글 5개씩](../components/comment-thread-screen.md#답글-5개씩-2026-10-25-정책-미게시)) |
| 첫 댓글 | empty + composer | 최초 로딩 실패와 실제 0건을 구분한다 |
| 전송 실패 | 기존 ready 또는 empty + notice | 초안·답글 대상을 유지한다. 항목별 좋아요 실패는 해당 항목만 복구한다 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [CommentThreadScreen](../components/comment-thread-screen.md) | 필수 props·슬롯·플랫폼 차이 |
| [Button](../components/button.md) | 동작·로딩·보조 행동 |
| [ScreenLayout](../components/screen-layout.md) | 화면 높이·본문 교체·스크롤 소유 |

## 코드 골격

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
// Native
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

콜백·데이터·지역화 함수는 제품에서 공급한다. 필수 props와 플랫폼별 차이는 위 API 지침에서 확인한다.

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자 | 2배 글자에서 제목·행은 내용 높이로 증가. footer·닫기·입력 필드가 겹치지 않는지 확인 |
| 다크 | semantic 색으로 내용과 표면을 함께 전환; 예제 브랜드 색을 제품 기본값으로 복사하지 않음 |
| 좁은 폭 | 320px부터 한 열로 읽기 순서 유지. 가상화 본문은 scroll=content, 중첩 스크롤 금지 |
| 키보드 | Native host가 safe area와 키보드를 한 번 처리; Web은 포커스된 입력과 footer 가림 확인 |

## 함정

- 빈 댓글에서도 작성창 유지; 실패한 전송은 초안 유지.
- Storybook은 실제 서버·OS 권한·라우터 연동 증거가 아니다. 기본·다크·큰 글자와 실패/복구를 각각 확인한다.

두 renderer의 `CommentThreadItem.actions`는 기존 호환 슬롯으로 좋아요 바로 뒤에 남는다. 더보기 메뉴는 `actions`로 조립하지 않고
`commentMenu`를 쓴다. Storybook 예제(`instagram-comments-preview`)는 원댓글에 "답글 달기", 남의 댓글에 "신고",
내 댓글에 "삭제"(danger)를 넣고 기존 controlled callback을 호출한다. 제품의 신고·삭제 권한이나 서버를 예제에서 추정하지 않는다.

## 근거

- 댓글 목록과 입력의 독립 복구 상황 표: 2026-10-13 전수 점검 — 최초 조회와 변경 요청의 상태를 같은 골격으로 설명하던 부분을 구체화했다.
- threadHeader가 댓글과 본문 스크롤 공유: 2026-10-08 Spint에서 고정 header 안의 소개가 잘려 스팟 선택이 숨었다.
- `actions`를 좋아요 바로 뒤에 둠: 2026-10-07 하트 옆 더보기 요청.
- 더보기 메뉴를 HJM `commentMenu`로: 2026-10-17 사용자 결정. 2026-10-15 규칙(메시지·댓글의 공통 구조는 HJM 소유)과 화면 검토 S4#7(예제·제품이 `actions`로 메뉴 버튼을 직접 조립)에 따른다.
