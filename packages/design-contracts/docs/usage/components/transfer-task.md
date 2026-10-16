# TransferTask

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [실제 전송 계약](../../transfer-task.md), `src/transfer-task.ts`의 `resolveTransferObservation`·`isConfirmedTransferAbort`, 양 renderer `src/transfer-task.tsx`
- 스토리북: `배포/구성/피드백과 복구/전송 진행과 취소`

## 언제 쓰나

업로드·다운로드·동기화처럼 실제 전송 계층이 진행량을 알려 주는 작업에 시작·취소·진행률·결과를 한 묶음으로 붙인다.
진행률은 어댑터가 `report`로 보낸 실제 수치만 쓴다. 총량을 모르면 진행 중 표시만 하고 백분율을 만들지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 파일 고르기 | [FilePicker](file-picker.md) |
| 진행량 없는 짧은 요청 | [Button](button.md)의 `loading` |
| 스트림으로 받는 답 | [StreamingAnswer](streaming-answer.md) |
| 진행 막대만 필요할 때 | [Progress](progress.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `TransferTask` | 전송 시작·취소·진행 | `@hjmds/react/transfer-task` | `@hjmds/react-native/transfer-task` |

`TransferObservation`·`TransferContext` 타입은 `@hjmds/design-contracts/transfer-task`에서 가져온다.

## 최소 사용 예

```tsx
// Web
import { TransferTask } from "@hjmds/react/transfer-task";

<TransferTask labels={uploadLabels}
  onTransfer={({ signal, report }) => uploadFile(file, { signal, onProgress: (completed, total) => report({ completed, total }) })}
  formatProgress={o => o.total === null ? formatBytes(o.completed) : t("upload.progress", { done: formatBytes(o.completed), total: formatBytes(o.total) })} />
```

```tsx
// Native
import { TransferTask } from "@hjmds/react-native/transfer-task";

<TransferTask labels={uploadLabels}
  onTransfer={({ signal, report }) => uploadFile(file, { signal, onProgress: (completed, total) => report({ completed, total }) })}
  formatProgress={o => o.total === null ? formatBytes(o.completed) : t("upload.progress", { done: formatBytes(o.completed), total: formatBytes(o.total) })} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `onTransfer` | `({ signal, report }) => Promise<void>` | 필수 | 실제 전송. `report({ completed, total })`, 총량을 모르면 `total: null` |
| `labels` | `{ start, queued, transferring, cancel, cancelling, cancelled, success, error }` | 필수 | 버튼·상태 문구 |
| `formatProgress` | `(observation) => string` | 필수 | 진행 막대 값 문구 |
| `disabled` | boolean | false | 시작·취소를 잠근다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 버튼은 [Button](button.md) 기본 `medium`(높이 44), 막대는 [Progress](progress.md) 기본 `medium` 두께 8, 부모 폭을 채운다 | `transfer-task.tsx` |
| 간격 | 버튼 줄·막대·상태 사이 `spacing.md` 16, 버튼 사이 `spacing.sm` 12 | `Stack gap="md"`, 버튼 줄 `gap="sm"` |
| 순서·정렬 | [시작] [취소(진행 중만)] → 진행 막대 → 결과 문구(가운데) | 양 renderer |
| 고정·스크롤 | 없음. 놓는 영역이 정한다 | — |
| 좁은 폭·큰 글자 | 버튼 줄이 `wrap`으로 줄바꿈 | `Stack axis="inline" wrap` |

## 꼭 지킬 것

- `signal`을 전송 계층에 연결한다. 취소 요청만으로 취소 완료가 아니며, 어댑터가 `AbortError`로 거부해야 `cancelled`다.
- `completed`는 한 작업 안에서 줄어들 수 없고 `total`을 넘을 수 없다. 어기면 `RangeError`다.
- 총량을 나중에 알게 돼도 완료량을 꾸미지 않는다. 작업이 끝난 뒤의 `report`는 무시된다.
- 결과 문구는 `role="status"`, 실패는 경고로 알린다. 재시도는 같은 시작 버튼이다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 결과 알림 | `role="status"` / 실패 `role="alert"` | `accessibilityLiveRegion="polite"`, 실패 `accessibilityRole="alert"` |

## 관련 지침

[전송 진행과 취소](../compositions/transfer-task.md), [Progress](progress.md), [FilePicker](file-picker.md).
