# StreamingAnswer

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [스트림 응답 계약](../../streaming-answer.md), `src/streaming-answer.ts`의 `consumeAnswerStream`, 양 renderer `src/streaming-answer.tsx`
- 스토리북: `배포/구성/피드백과 복구/스트림 응답과 중지`

## 언제 쓰나

AI 응답처럼 제공자가 조각(`delta`)으로 보내는 답을 받는 대로 표시하고, 생성·다시 생성·중지를 한 묶음으로 제공한다.
표시하는 글자는 실제 제공자 이벤트만 따른다. 타이머로 글자를 흘려 쓰는 연출은 이 API에 없다.
상태 흐름은 [스트림 응답과 중지](../compositions/streaming-answer.md) 구성 지침을 함께 본다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 이미 완성된 답만 보여 줄 때 | [Text](text.md) 또는 제품 본문 렌더러 |
| 대화 말풍선 목록 | [ChatMessage](chat-message.md), [ChatScreen](chat-screen.md) |
| 파일 업로드·다운로드 진행 | [TransferTask](transfer-task.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `StreamingAnswer` | 스트림 답 표시와 생성·중지 | `@hjmds/react/streaming-answer` | `@hjmds/react-native/streaming-answer` |

`AnswerStreamEvent`·`AnswerGenerationContext` 타입은 `@hjmds/design-contracts/streaming-answer`에서 가져온다.

## 최소 사용 예

```tsx
// Web
import { StreamingAnswer } from "@hjmds/react/streaming-answer";

<StreamingAnswer answerId={question.id} label={t("answer.title")}
  onGenerate={({ signal, regenerate }) => streamAnswer(question.id, { signal, regenerate })}
  labels={answerLabels} />
```

```tsx
// Native
import { StreamingAnswer } from "@hjmds/react-native/streaming-answer";

<StreamingAnswer answerId={question.id} label={t("answer.title")}
  onGenerate={({ signal, regenerate }) => streamAnswer(question.id, { signal, regenerate })}
  labels={answerLabels} />
```

`streamAnswer`는 `AsyncIterable<{ type: "delta"; text } | { type: "done" }>`를 돌려주고 `signal`을 실제 전송 계층(fetch 등)에 연결해야 한다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `answerId` | string | 필수 | 안정적인 id. 비면 던지고, 바뀌면 상태를 새로 시작한다 |
| `label` | string | 필수 | 답 영역 제목 |
| `onGenerate` | `(context) => AsyncIterable<AnswerStreamEvent> \| Promise<…>` | 필수 | `context`는 `{ signal, previousText, regenerate }` |
| `labels` | `{ generate, regenerate, stop, thinking, streaming, stopping, complete, stopped, error }` | 필수 | 버튼·상태 문구 |
| `initialText` | string | 없음 | 저장된 답. 있으면 `complete` 상태로 시작한다 |
| `thinkingIndicator` | ReactNode | `Progress`(`labels.thinking`) | 첫 조각 전 표시 |
| `renderText` | `(text) => ReactNode` | 기본 `Text` | 마크다운 등 제품 렌더러 |
| `disabled` | boolean | false | 생성·중지를 잠근다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 버튼은 [Button](button.md) 기본 `medium`(높이 44), 본문 폭은 부모를 채운다 | `streaming-answer.tsx` |
| 간격 | 제목·본문·표시기·버튼 줄·상태 사이 `spacing.md` 16, 버튼 사이 `spacing.xs` 8 | `Stack gap="md"`, 버튼 줄 `gap="xs"` |
| 순서·정렬 | 제목 → 답 본문 → (생각 중 표시기, 가로·세로 가운데) → [생성/다시 생성] [중지] → 상태 문구(가운데) | 양 renderer |
| 고정·스크롤 | 자체 스크롤 없음. 긴 답의 스크롤은 놓는 영역이 소유한다 | — |
| 좁은 폭·큰 글자 | 버튼 줄 `wrap`. Web 본문은 `pre-wrap`·`overflowWrap: anywhere`로 줄바꿈 | 양 renderer |

## 꼭 지킬 것

- `onGenerate`는 실제 제공자 스트림을 넘긴다. 제공자 완료 이벤트(`done`) 없이 끝나면 실패로 처리한다.
- `signal`을 전송 계층에 연결한다. 중지 요청만으로 완료로 보지 않으며 `AbortError`로 끝나야 `stopped`다.
- 다시 생성 중에는 첫 조각이 오기 전까지 이전 답을 유지한다.
- 상태 문구는 `role="status"`, 실패는 경고로 알린다. 모든 문구는 제품 i18n에서 만든다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 기본 본문 | `Text` + `whiteSpace: pre-wrap` | `Text` |
| 상태 알림 | `role="status"` / 실패 `role="alert"` | `accessibilityLiveRegion="polite"`, 실패 `accessibilityRole="alert"` |

## 관련 지침

[스트림 응답과 중지](../compositions/streaming-answer.md), [Progress](progress.md), [Button](button.md).
