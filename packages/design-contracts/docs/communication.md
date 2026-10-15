# 검색·메시지 연결 구성 계약

검토일: 2026-10-15 · Lucian 027·028·078 · 실험 · 미게시

`@hjmds/{design-contracts,react,react-native}/communication` 선택 subpath를 제공한다.
기존 `screens`의 MessageComposer에는 선택 속성 `lengthFeedback`만 추가한다.

## ExpandableSearch

- 펼침 상태와 입력값은 `expanded/onExpandedChange`, `query/onQueryChange`로 제품이 소유한다. 최근 검색 목록도 제품 소유다.
- 기존 SearchScreen의 두 단계 검색·제안 선택·최근 검색·debounce·AbortSignal을 재사용한다. 별도 검색 debounce 엔진을 만들지 않는다.
- `onSearch(query,{signal})`는 실제 결과와 제안 목록을 담은 Promise를 반환한다. query·요청 세대·활성 상태·AbortSignal이 모두 현재인 응답만 표시한다. 신호를 무시하는 늦은 Promise도 이전 결과를 덮지 못한다.
- 닫기·입력 변경·unmount는 요청을 abort한다. 빈 입력은 서버 요청을 만들지 않는다. 오류를 보존된 입력 아래 중앙에 표시하고 편집/재검색으로 재시도한다.
- 펼칠 때 검색 입력으로 포커스한다. Web 닫기는 실제 펼침 버튼으로 포커스를 복원하고 Native 닫기는 키보드를 내린다. 검색어를 임의 삭제하거나 최근 검색을 타이핑 중 자동 기록하지 않는다.
- `onSubmit`은 실제 Enter/제안/최근 검색 확정에서만 호출한다. 제품은 이때 최근 검색 저장과 분석을 수행할 수 있다. 결과·추천은 실제 Promise 데이터이며 타이머 재생이 아니다.

## MessageComposer.lengthFeedback

- `{label,formatCount,threshold?}`를 지정한 경우에만 near-limit 원형 Progress와 실제 count를 표시한다. 기존 자동 높이 조절과 전송 동작은 그대로 쓴다.
- 양의 정수 `maxLength`가 필요하고 기본 threshold는 0.8이다. UTF-16 길이는 기존 controlled 문자열/maxLength와 같은 단위다. 이 단위는 사용자에게 보이는 grapheme 수와 다를 수 있으므로 문구는 제품 계약을 따른다.
- threshold 이전에는 추가 UI가 없다. 초과 controlled 값도 자르지 않고 실제 count를 보존하며 전송을 막는다. `lengthFeedback`을 생략하면 기존 maxLength API의 동작을 유지한다.
- 성공 시 초안 삭제를 자동 실행하지 않는다. 실패 후 보존도 기존 controlled 입력 계약을 유지한다.

## ReplyMessage·ReplyComposer

- ReplyMessage의 `messageId`와 ReplyComposer의 `replyTarget.id`는 실제 메시지 식별자여야 한다. 보이는 저자·발췌문에서 ID를 추정하지 않는다.
- ReplyMessage는 기존 ChatMessage의 replyAction에 정확한 ID를 연결한다. `swipeAction="reply"`는 답장, `"timestamp"`는 시간 표시가 드래그를 소유한다. 시간 모드에서도 기존 Web 키보드/Native 접근성 답장 동작은 남는다. 두 드래그를 한 제스처에 중복 실행하지 않는다.
- ReplyComposer는 기존 MessageComposer의 replyTo와 전송을 묶는다. 요청을 시작한 시점의 `{replyToId}`와 실제 입력을 `onSend`에 전달하고 그 Promise 완료를 기다린다. 중복 전송·pending 중 취소/편집은 기존 입력 잠금 계약으로 막는다.
- Promise 실패 시 초안과 답장 대상을 유지하고 중앙 오류를 표시한다. 완료 자체를 서버 배달/읽음으로 해석하거나 초안을 지우지 않는다. 제품이 실제 acknowledgment를 확인하고 controlled 값만 갱신한다.
- 대화·계정이 바뀌면 host를 해당 ID로 key한다. unmount는 내부 늦은 갱신을 무시하지만 외부 서비스 요청을 취소하지 않는다. 제품은 API idempotency와 범위/세대 검증으로 이전 대화의 늦은 완료가 새 초안을 지우지 않게 한다.

## 근거와 확인 범위

원본 027의 펼침 검색을 기존 검색 계약에 연결했고, 028의 높이 조절은 중복하지 않고 실제 near-limit 표시만 추가했다. 078의 가짜 상대 자동 답장을 제거하고 원본 메시지 ID→답장 전송 metadata 경로를 공개한다.
계약·Web browser·Native host targeted 검사는 경쟁 응답/abort·포커스·실제 ID·실패 보존·길이 표시를 확인한다. Native 기기 키보드·실제 검색 서버/채팅 서버·npm 게시·제품 적용은 별도다.
