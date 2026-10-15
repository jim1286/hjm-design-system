# 스트림 응답과 중지 계약

검토일: 2026-10-15 · Lucian 086 · Storybook 배포 · 미게시

`@hjmds/{design-contracts,react,react-native}/streaming-answer` 선택 subpath를 제공한다.
고정 답변을 글자 단위로 재생하거나 타이머로 완료시키지 않고 실제 제공자 이벤트를 소비한다.

## 공개 계약

| 이름 | 역할 |
| --- | --- |
| StreamingAnswer | 실제 응답 대기·delta 표시·중지 요청·재생성·실패 표시 |
| AnswerGenerationContext | 요청 AbortSignal·시작 시점 previousText·regenerate 여부 |
| AnswerStreamEvent | `{type:"delta",text:string}` 또는 `{type:"done"}` |
| consumeAnswerStream | 이벤트 소비·명시적 완료 검사·iterator 정리·부분 텍스트 보존 |
| AnswerStreamResult | 확인된 `complete` 또는 `stopped`와 실제 텍스트 |

`onGenerate(context)`는 AsyncIterable 또는 그것을 담은 Promise를 반환한다. 제품 adapter는 인증·입력·모델·provider protocol·저장·재시도 정책을 소유한다. HJM은 provider SDK를 직접 호출하지 않는다.

## 응답과 완료

1. 생성 버튼은 실제 adapter를 호출하고 `thinking` 상태로 기다린다. 첫 유효 delta 전에는 기존 텍스트를 유지한다.
2. 비어 있지 않은 첫 delta부터 이전 답변을 새 응답으로 교체하고 이후 실제 delta만 이어 붙인다. 새 부분 응답과 이전 전체 답변을 합치지 않는다.
3. 명시적인 `{type:"done"}`이 있어야 성공한다. 정상 iterator 종료만 있고 done 이벤트가 없으면 잘린 응답으로 오류 처리한다.
4. delta 없이 done만 온 성공 응답은 실제 빈 응답이므로 결과를 `""`로 확정한다. 이전 답변을 새 성공 결과처럼 재사용하지 않는다.
5. 제공자 오류 또는 불완전 종료 시 마지막 실제 부분 응답을 보존한다. 새 delta가 오기 전 실패하면 기존 답변을 보존한다. 새 delta를 받은 뒤 실패하면 새 부분 응답을 남긴다.

`initialText`는 해당 answerId 본문의 초기값이다. 같은 ID에서 initialText를 바꾸는 controlled 갱신 API는 아니다. 응답 항목이 바뀌면 제품이 실제 새 `answerId`를 지정한다.

## 중지와 iterator 정리

- 중지 버튼은 실제 요청 signal을 abort하고 `stopping`을 표시한다. 클릭만으로 `stopped`를 확정하지 않는다.
- adapter는 signal을 실제 fetch·provider transport와 `onGenerate`의 초기 대기에도 연결해야 한다. signal을 무시한 채 끝나지 않는 Promise/iterator를 HJM이 완료시킬 수는 없다.
- consumer는 iterator `return()`을 기다린다. finally에서 값을 yield하여 `done:false`가 나온 경우에는 `next()`를 계속 받아 실제 종료까지 정리한다. 정리 중 나오는 delta는 화면에 붙이지 않는다.
- iterator 종료·정리 완료 또는 signal에 대응한 transport AbortError를 확인한 후 중지를 확정한다. 예상하지 못한 정리 오류는 오류로 남긴다.
- 최종 상태가 결정되기 전에는 중복 생성·재생성을 막는다. 중지·실패 후에도 마지막 실제 텍스트를 남겨 사용자가 읽거나 다시 생성할 수 있다.
- answerId 변경·unmount는 이전 signal을 abort하고 이전 응답의 화면 갱신을 무시한다. 실제 서버 작업 취소·비용·저장된 응답 처리는 제품 adapter의 책임이다.

## 재생성

`onGenerate`는 시작 시점의 `previousText`와 `regenerate`를 받는다. 이전 시도/기존 답변이 있으면 재생성 동작으로 표시한다. 제품은 실제 대화·메시지 ID·요청 세대에 연결해 새 생성 요청을 구성한다. 이전 답변을 먼저 삭제하거나 동일 고정 문자열을 타이머로 다시 재생하지 않는다.

## 표시와 접근성

모든 버튼·상태 문구와 제목은 제품이 전달한다. 대기는 해당 구성 영역 중앙에 Progress 또는 선택적 `thinkingIndicator`로 표시한다. 오류·중지·완료 안내도 해당 영역 가운데 정렬한다. Web은 상태/오류 role을, Native는 alert와 live region을 사용한다. 본문은 기본 Text로 표시하며 Web은 줄바꿈과 긴 문자열 줄바꿈을 보존한다. Markdown 등 별도 표현은 `renderText`로 제품이 제공한다.

## 실행 예제의 범위

Web `showcase/web/src/patterns/StreamingAnswer.stories.tsx`와 Native `showcase/native/src/StreamingAnswer.stories.tsx`는 실제 `text/plain` URL을 입력받아 요청한다. Web은 fetch, Native는 `expo/fetch`로 실제 스트림 body를 읽는다. 기본 URL·고정 응답·가짜 지연을 넣지 않는다.

`showcase/shared/streaming-answer-example.ts`의 `readTextAnswer`는 성공한 plain UTF-8 응답을 TextDecoder로 읽고 실제 byte chunk를 delta로 전달한다. 읽기 종료와 decoder flush 뒤에만 done을 보낸다. signal에 reader 취소를 연결하고 finally에서 listener·reader lock을 정리한다.

이 plain-text adapter의 transport 종료는 예제 응답의 완료 조건이다. 이를 AI/SSE/WebSocket 제공자의 완료 조건으로 복사하지 않는다. 실제 제품 adapter는 해당 protocol의 delta·완료·오류 이벤트를 파싱하고 명시적인 provider 완료를 done으로 변환해야 한다. AI 인증·프롬프트·세션·모델 연결·운영 저장·실제 AI 응답 검증은 예제에 포함되지 않는다.

## 근거와 확인 범위

원본 086의 고정 답변 타이머 재생을 실제 AsyncIterable 계약으로 바꾸었다. 계약 검사는 실제 delta·명시적 완료·불완전 종료·빈 재생성·finally-yield 정리를 다룬다. Web browser 검사는 실제 UTF-8 응답 byte 수신·중지·실패 보존을, Native host 검사는 실제 이벤트 처리와 ID 변경 시 abort·늦은 응답 차단을 다룬다. 검사 실행 결과는 도입 기록에 따로 남긴다. Native 기기·실제 AI provider·npm 게시·제품 적용은 별도 확인 범위다.
