# 전송 진행과 취소

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-15
- 근거: [실제 전송 계약](../../transfer-task.md), `src/transfer-task.ts`, 양 renderer `src/transfer-task.tsx`
- 스토리북: `배포/구성/피드백과 복구/전송 진행과 취소`

## 언제 쓰나

실제 다운로드·업로드·작업의 시작/대기/진행·취소·실패 복구를 한 구성으로 제공할 때 쓴다.
외부에서 관리하는 진행률만 보여 주려면 Progress를 직접 쓴다. TransferList는 두 목록 사이 항목 이동이며 이 작업과 다르다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| TransferTask | 실제 작업의 시작·취소·복구 | [계약](../../transfer-task.md) |
| Button | 원래 크기를 유지하는 실행/취소 | [Button](../components/button.md) |
| Progress | 같은 host의 미정→실제 분모 표시 | [Progress](../components/progress.md) |

## 배치

```text
[작업 시작] [진행 중 취소]
같은 Progress: 대기 → 실제 완료량/알려진 전체량
원시 전송량
종료 상태: 구성 중앙 → 같은 시작 행동으로 재시도
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 기존 본문·패널 안 | md |
| 행동 | Button | inline 시작→취소 | sm wrap |
| 진행 | Progress/Text | 행동 아래 | 기존 Progress 규격 |
| 종료 상태 | Text | 구성 내부 중앙 | 임의 상단 margin 없음 |

## 흐름과 상태

1. onTransfer에서 실제 작업을 시작하고 signal을 실제 취소 경로로 전달한다.
2. 실제 transport event에서 report를 호출한다. 분모가 미정이면 total:null을 쓴다.
3. 실제 Promise 종료로 성공/실패를 표시한다. 100%만으로 성공을 만들지 않는다.
4. 취소 요청은 별도 상태다. AbortError로 확인한 뒤 취소 완료로 표시하고 실제 부분 데이터를 제품에서 정리한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 시작 버튼 | 기존 Button 계약 |
| 진행 중 | 같은 버튼 로딩·취소·실제 Progress | 중복 요청 차단·실제 값 접근성 |
| 실패 | 마지막 전송량 유지·중앙 오류 | Web alert / Native live region, 시작으로 재시도 |

## 코드 골격

```tsx
// Web
import { TransferTask } from "@hjmds/react/transfer-task";
<TransferTask labels={labels} formatProgress={formatBytes}
  onTransfer={async ({ signal, report }) => sendActualFile({ signal, onProgress: report })} />;
```

```tsx
// Native
import { TransferTask } from "@hjmds/react-native/transfer-task";
<TransferTask labels={labels} formatProgress={formatBytes}
  onTransfer={async ({ signal, report }) => sendActualFile({ signal, onProgress: report })} />;
```

실제 수신 예제는 각 플랫폼 TransferTask.stories.tsx와 shared/transfer-task-example.ts다. 제품은 showcase를 import하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 예제 네트워크 | fetch body stream | 기존 Expo의 expo/fetch stream |
| 취소 | AbortSignal | 동일, 실제 adapter 지원 필수 |
| 접근성 | HTML progress·alert/status | 기존 Progress/live region |

## 함정

- setInterval로 완료량을 증가시키지 않는다. total을 모르면 임의 분모를 넣지 않는다.
- 실제 작업 Promise를 기다리지 않고 성공으로 바꾸지 않는다.
- 취소 클릭만으로 취소 완료를 표시하지 않는다. abort 요청과 실제 AbortError를 구분한다.
- 압축 Content-Length와 decoded byte 수를 같은 단위라고 가정하지 않는다.
- 부분 파일 정리·요청 멱등성·저장/서버 확정은 실제 adapter 소유다.
- npm 1.21.0 API다. 수신 성공을 OS 저장·운영 업로드·기기 검증 완료로 표현하지 않는다.
