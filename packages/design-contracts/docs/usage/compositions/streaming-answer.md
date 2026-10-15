# 스트림 응답과 중지

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.20.0 이후)
- 검토일: 2026-10-15
- 근거: [스트림 응답 계약](../../streaming-answer.md), `src/streaming-answer.ts`, 양 renderer `src/streaming-answer.tsx`
- 스토리북: `실험/구성/피드백과 복구/스트림 응답과 중지`

## 언제 쓰나

실제 provider가 보내는 응답 delta를 표시하고 중지·재생성·오류를 같은 영역에서 제공할 때 쓴다. 이미 받은 정적 본문은 Text로 보여 준다. 고정 문자열에 글자 재생 타이머를 붙이거나 HTTP 연결 종료만 보고 AI 생성 완료로 판정하는 용도로 쓰지 않는다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| StreamingAnswer | 실제 스트림과 요청 상태 연결 | [계약](../../streaming-answer.md) |
| Progress | 첫 delta 전 실제 대기 | [Progress](../components/progress.md) |
| Button | 생성·재생성·중지 | [Button](../components/button.md) |
| Text | 실제 본문·상태·오류 | 제품이 문구와 추가 본문 renderer 제공 |

## 배치

```text
[응답 제목]
[이전 답변 또는 실제 새 delta 본문]
[첫 delta 전 대기 표시: 해당 영역 중앙]
[생성 / 다시 생성] [실제 요청 중 중지]
[중지 확인 중 / 완료 / 오류: 구성 내부 중앙]
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 응답 카드·본문 패널 안 | md |
| 제목·본문 | Text 또는 renderText | 위에서 아래로 | 본문 폭, 실제 줄바꿈 보존 |
| 최초 대기 | Progress 또는 thinkingIndicator | 구성 내부 중앙 | 기존 Progress 계약 |
| 행동 | Button | 본문 아래 inline wrap | sm |
| 상태·오류 | Text | 행동 아래 해당 영역 | 가로·세로 중앙 |

## 흐름과 상태

1. 실제 answerId와 초기 본문·지역화 문구·`onGenerate` adapter를 제공한다.
2. adapter는 signal을 실제 요청에 연결하고 `{type:"delta",text}`를 실제 수신 순서로 보낸다. 첫 새 delta 전까지 기존 답변을 남긴다.
3. 명시적 `{type:"done"}`이 있어야 완료한다. delta 없는 done은 실제 빈 새 응답을 확정하며 이전 답변을 새 완료값으로 쓰지 않는다.
4. 중지는 abort 요청이다. iterator return과 finally-yield 정리 종료 또는 transport AbortError를 확인할 때까지 중지 확인 상태를 유지한다.
5. 실패·중지는 마지막 실제 부분 텍스트를 남긴다. 재생성은 시작 시점 previousText·regenerate 정보를 제품 adapter에 넘긴다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 제목·초기 텍스트·생성/재생성 버튼 | 생성은 명시적 버튼 행동 |
| 진행 중 | thinking→실제 delta·중지 행동 | 같은 생성 버튼 로딩, 중복 요청 차단 |
| 중지 확인 중 | 보존된 텍스트·확인 중 문구 | 중지 중복 클릭 차단 |
| 중지됨 | 실제 정리가 끝난 부분 본문 | 상태 안내, 재생성 가능 |
| 완료 | 명시적으로 완료된 실제 응답 | 빈 응답도 새 결과로 확정 |
| 실패 | 마지막 실제 부분 응답·중앙 오류 | Web alert / Native alert·live region |

## 코드 골격

```tsx
// Web
import { StreamingAnswer } from "@hjmds/react/streaming-answer";
<StreamingAnswer answerId={message.id} initialText={message.text} label={answerTitle}
  labels={answerLabels} onGenerate={generateActualProviderAnswer} />;
```

```tsx
// Native
import { StreamingAnswer } from "@hjmds/react-native/streaming-answer";
<StreamingAnswer answerId={message.id} initialText={message.text} label={answerTitle}
  labels={answerLabels} onGenerate={generateActualProviderAnswer} />;
```

`generateActualProviderAnswer`는 `{signal,previousText,regenerate}`를 받아 실제 provider 연결에서 AsyncIterable을 반환한다. SSE 등의 delta·완료·오류를 제품에서 해석한다. provider의 명시적 완료 전에 iterator만 끝나면 성공으로 만들지 않는다.

실행 예제는 Web `showcase/web/src/patterns/StreamingAnswer.stories.tsx`, Native `showcase/native/src/StreamingAnswer.stories.tsx`다. 실제 text/plain URL을 직접 입력해 byte stream을 확인한다. 공유 `showcase/shared/streaming-answer-example.ts`는 plain UTF-8 transport adapter 예제다. AI 인증·모델·프롬프트·SSE protocol 구현·운영 저장은 제품 adapter가 소유한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 기본 본문 | 줄바꿈·긴 문자열 줄바꿈 Text | Native Text |
| URL 실행 예제 | fetch body reader | expo/fetch body reader |
| 상태 전달 | status/alert role | alert·live region |
| provider 연동 | 제품 adapter가 실제 인증·protocol 해석 | 동일, 실제 기기 스트림 지원 별도 확인 |

## 함정

- `initialText`는 해당 ID의 초기값이다. 항목 전환은 실제 새 answerId로 표현한다.
- 재생성 중 새 delta 전 실패하면 기존 본문이 남고, 새 delta 후 실패하면 새 부분 본문이 남는다. 항상 이전 전체 답변으로 되돌리는 계약은 아니다.
- 중지 요청만으로 서버 작업·과금·영속 저장까지 취소되었다고 보고하지 않는다. 실제 provider adapter의 확인이 필요하다.
- plain-text 예제의 실제 EOF를 AI/SSE의 명시적 완료 이벤트로 대신 쓰지 않는다.

## 접근성과 검증

제품이 모든 제목·버튼·상태 문구를 제공한다. 첫 응답 대기는 현재 구성 영역 중앙에 표시하고 실패/중지 상태에서도 본문을 유지한다. 계약 검사는 명시적 완료·빈 재생성·finally-yield 정리를, renderer 검사는 실제 delta·실패 보존·요청 중복·ID 전환을 다룬다. Web UTF-8 stream 검사는 실제 byte decoding의 증거이며 실제 AI provider·Native 기기·게시·제품 적용 완료의 증거는 아니다.
