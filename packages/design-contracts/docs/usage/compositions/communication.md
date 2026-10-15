# 펼치는 검색과 실제 메시지 답장

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.20.0 이후)
- 검토일: 2026-10-15
- 근거: [연결 계약](../../communication.md), `src/communication.ts`, 양 renderer `src/communication.tsx`, `src/screens.tsx`
- 스토리북: `배포/구성/선택과 필터/펼치는 상단 검색`, `배포/구성/입력과 작성/메시지 답장 연결`

## 언제 쓰나

상단 검색 버튼에서 검색 영역을 펼치거나 채팅의 실제 메시지를 선택해 답장을 전송할 때 쓴다. 이미 전체 화면으로 제공하는 검색에는 SearchScreen을 바로 쓴다. 입력 자동 높이·채팅 swipe 엔진·최근 검색 저장을 새로 만들지 않는다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| ExpandableSearch | 펼침 상태·실제 요청 Promise·검색 화면 연결 | [계약](../../communication.md) |
| SearchScreen | 제안·확정·최근 검색·debounce | [SearchScreen](../components/search-screen.md) |
| ReplyMessage | 실제 ID와 기존 답장 동작 연결 | [계약](../../communication.md) |
| ReplyComposer | 답장 대상·실제 전송 Promise·실패 보존 | [계약](../../communication.md) |
| MessageComposer | 기존 자동 높이·선택적 near-limit ring/count | [MessageComposer](../components/message-composer.md) |

## 배치

```text
[검색 펼치기] → [검색 닫기]
                [기존 SearchScreen 검색어·제안·결과]
                [오류: 검색 영역 중앙]

[실제 메시지·답장 동작]
[실제 답장 저자/발췌·취소]
[자동 높이 MessageComposer · 전송]
[임박한 길이 ring/count] [실패: 구성 내부 중앙]
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 검색·입력 영역 | sm/md |
| 펼침·닫기 | Button | 상단 | 기존 버튼 계약 |
| 검색 | SearchScreen | 펼친 본문 | 기존 검색 영역 구조 |
| 메시지 | ChatMessage | 기존 timeline | 기존 메시지 구조 |
| 입력 | MessageComposer | timeline 아래 | 기존 자동 높이 유지 |
| 실패 | Text alert | 해당 구성 안 | 내용 묶음 중앙 |

## 흐름과 상태

1. 제품은 펼침·query를 관리하고 실제 검색 Promise를 넘긴다. SearchScreen이 debounce와 제안 확정을 맡는다.
2. 입력 변경·닫기는 이전 요청을 abort하고 늦은 응답을 무시한다. Enter/제안 확정에서만 최근 검색을 기록한다.
3. ReplyMessage는 실제 ID를 제품에 전달한다. 제품은 그 ID를 replyTarget으로 보관한다.
4. ReplyComposer는 전송 시작 시점의 ID와 초안을 실제 전송 callback에 넘긴다. 성공 확인과 controlled 값 삭제는 제품이 맡는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 검색 버튼 또는 메시지·입력 | 기존 버튼·메시지 계약 |
| 펼침 | 기존 검색 화면 | 검색 입력 포커스 |
| 진행 중 | 실제 검색/전송 로딩 | 중복 전송 차단, 동일 입력 보존 |
| 실패 | 입력·대상 보존 | 영역 중앙 alert |
| 임박한 길이 | 실제 ring/count | maxLength와 동일 단위 |

## 코드 골격

```tsx
// Web
import { ExpandableSearch, ReplyMessage, ReplyComposer } from "@hjmds/react/communication";
<ExpandableSearch expanded={expanded} onExpandedChange={setExpanded} query={query} onQueryChange={setQuery}
  onSearch={searchActualDocuments} renderResult={renderDocuments} labels={searchLabels} />;
<ReplyMessage messageId={message.id} direction="incoming" author={message.author} timestamp={message.time}
  replyLabel={replyLabel} onReply={selectActualMessage} swipeAction="reply">{message.body}</ReplyMessage>;
<ReplyComposer value={draft} onValueChange={setDraft} label={inputLabel} sendLabel={sendLabel}
  replyTarget={selectedMessage} onReplyCancel={clearReply} cancelReplyLabel={cancelReplyLabel} errorLabel={errorLabel}
  onSend={sendActualMessage} maxLength={limit} lengthFeedback={lengthLabels} />;
```

```tsx
// Native
import { ExpandableSearch, ReplyMessage, ReplyComposer } from "@hjmds/react-native/communication";
<ExpandableSearch expanded={expanded} onExpandedChange={setExpanded} query={query} onQueryChange={setQuery}
  onSearch={searchActualDocuments} renderResult={renderDocuments} labels={searchLabels} />;
<ReplyMessage messageId={message.id} direction="incoming" author={message.author} timestamp={message.time}
  replyLabel={replyLabel} onReply={selectActualMessage} swipeAction="timestamp">{message.body}</ReplyMessage>;
<ReplyComposer value={draft} onValueChange={setDraft} label={inputLabel} sendLabel={sendLabel}
  replyTarget={selectedMessage} onReplyCancel={clearReply} cancelReplyLabel={cancelReplyLabel} errorLabel={errorLabel}
  onSend={sendActualMessage} maxLength={limit} lengthFeedback={lengthLabels} />;
```

실행 예제는 Web `showcase/web/src/patterns/Communication.previews.tsx`, Native `showcase/native/src/communication-preview.tsx`다. 검색은 실제 로컬 문서를 필터링하고 메시지는 로컬 수신 adapter에서 성공·실패를 확인한다. 원격 서버에 전송한 결과로 해석하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 검색 포커스 | 펼침 입력·닫기 버튼으로 복원 | 입력 focus·닫기 키보드 해제 |
| 답장 대안 | Alt+방향키 | 접근성 reply action |
| 시간 swipe | reply drag 대신 시간 표시 | 동일 |

## 접근성과 검증

실제 메시지 ID와 보이는 발췌를 분리한다. 가로 swipe와 세로 timeline 스크롤은 기존 ChatMessage의 기준을 따른다. `swipeAction`으로 답장/시간 중 드래그 소유자를 정한다. 길이 안내는 선택 속성이고 기존 자동 높이를 대체하지 않는다. 실제 서버 receipt·기기 키보드·제품 데이터와 npm 게시 여부는 소비 단계에서 확인한다.
