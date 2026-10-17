# 첫 작업을 만들고 이어하기

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 구성 API 지침 참조
- 검토일: 2026-10-17
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/시작하기/첫 작업을 만들고 이어하기`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/입력과 작성/첫 작업을 만들고 이어하기`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 구성 API가 없는 콘텐츠 묶음은 [CompositionLayout](../components/composition-layout.md)의 제목·배지·행동·본문·상태·footer 슬롯을 사용한다.

## 언제 쓰나

첫 기록을 단계별 작성하고 중단한 초안 이어가기 흐름이 필요할 때 쓴다. Steps의 상태·콜백을 제품 로직에 연결하며 새 데이터 엔진을 만들지 않는다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Steps | 첫 기록을 단계별 작성하고 중단한 초안 이어가기 | [공개 계약](../components/steps.md) |
| Button | 명시 행동·재시도 | [Button](../components/button.md) |

## 배치

```text
부모 화면의 공개 슬롯
└─ 주제 → 입력 → 검토 → 결과
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | 부모 화면 또는 포함 Surface | 부모 화면의 해당 슬롯 | [배치](../components/steps.md#배치)에 따른다 |
| 내용 | Steps와 분리한 입력·요약 슬롯 | 주제 → 입력 → 검토 → 결과 | spacing 토큰과 포함 컴포넌트 recipe |
| 행동 | Button 또는 공개 콜백 | 내용과 가까운 명시 진입점 | 주 행동 하나, 보조 행동과 구분 |

## 흐름과 상태

1. 첫 기록을 단계별 작성하고 중단한 초안 이어가기.
2. 진행 상태와 제품의 실제 확정을 분리한다.
3. 저장 실패는 입력·단계 유지; 메모리 초안은 새로고침 복구를 보장하지 않음.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 주제 → 입력 → 검토 → 결과 | 이름·선택 여부를 보조공학에 노출 |
| 진행 중 | 해당 작업 pending, 입력·기존 결과 보존 | 중복 요청 차단, 로딩에 포커스를 옮기지 않음 |
| 실패 | 저장 실패는 입력·단계 유지; 메모리 초안은 새로고침 복구를 보장하지 않음 | 오류 근처 재시도, 필요할 때만 오류 읽기 |

## 코드 골격

<!-- usage-example: Web ../../../../../showcase/web/src/patterns/reference-flow-previews.tsx -->
<!-- usage-example: Native ../../../../../showcase/native/src/reference-flow-previews.tsx -->

이 이름의 독립 공개 컴포넌트는 없다. 아래는 공개 `createActionSession`과 입력·Steps·Sheet를 조합하는 예제다. Storybook 예제 파일을 제품에서 import하지 않는다.

- [Web 실행 예제](https://github.com/jim1286/hjm-design-system/blob/9fccb921216a06bac2568ca8252bd0b4d7c48d95/showcase/web/src/patterns/reference-flow-previews.tsx)의 `Editor(kind="first")`
- [Native 실행 예제](https://github.com/jim1286/hjm-design-system/blob/9fccb921216a06bac2568ca8252bd0b4d7c48d95/showcase/native/src/reference-flow-previews.tsx)의 `Editor(kind="first")`
- [공통 검증·초안 비교](https://github.com/jim1286/hjm-design-system/blob/9fccb921216a06bac2568ca8252bd0b4d7c48d95/showcase/shared/reference-flows.ts)의 `draftError`, `sameDraft`는 예제 데이터 규칙이며 제품 규칙으로 교체한다.

주제 선택(0) → 입력(1) → 검토(2) → 저장 결과 순서다. 중단은 paused 표시만 바꾸고 draft와 stage를 보존한다. 이어하기는 이를 다시 보여 준다.

```tsx
// Web — Native도 같은 상태 골격을 사용한다. JSX/문구/영속 저장은 각 제품의 기존 화면 슬롯에 연결한다.
import { useState, useSyncExternalStore } from "react";
import { createActionSession } from "@hjmds/design-contracts/action-session";

const [session] = useState(() => createActionSession(initialValue));
const saved = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
const [draft, setDraft] = useState(initialValue);
const [stage, setStage] = useState(0);
const [paused, setPaused] = useState(false);
const busy = saved.status === "pending";
const dirty = !sameDraft(draft, saved.value);

function review() {
  if (busy || draftError(draft)) return; // 오류 문구를 입력에 연결하고 첫 오류 입력으로 이동
  setStage(2);
}
async function save() {
  if (draftError(draft)) return;
  const submitted = { ...draft };
  // pending 중 재호출은 계약이 차단한다. 실패하면 saved.value와 draft를 보존한다.
  const result = await session.run(() => saveToServer(submitted));
  if (result.status === "success") setDraft(result.value);
}
function discard() {
  if (session.getSnapshot().status === "pending") return;
  setDraft(saved.value);
  session.reset(saved.value);
  setPaused(true);
}
```

| 표시/행동 | 연결 |
| --- | --- |
| 진행 단계 | `Steps.descriptor.currentStepId`를 `stage`에서 도출, 저장 실패 시 `currentStepStatus="error"` |
| 편집 | `TextField`/선택 컨트롤은 draft를 편집. pending 동안 disabled이며 이미 큐에 든 입력·이탈·되돌리기 콜백도 최신 session 상태로 차단. 변경 시 오래된 실패 표시를 해제 |
| 검토 | 같은 draft의 요약과 수정 버튼. 요약에서 값을 따로 보관하지 않음 |
| 저장 | `Button.loading=busy`, 성공 결과는 서버 응답에서, 실패는 Notice와 같은 저장 버튼 재시도 |
| 되돌리기 | dirty이며 pending이 아닐 때 저장값 복원. 서버 요청 취소로 설명하지 않음 |
| 중단/이탈 | first/review는 메모리 draft·stage를 유지해 이어하기. settings는 dirty이면 확인 Sheet |
| 확정 이후 | 결과 확인과 새 편집 진입을 구분. 새 편집은 마지막 확정값으로 시작 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 입력/단계 포커스 | DOM 입력·제목 ref | Native 입력 ref와 접근성 포커스 |
| 결과 알림 | role=status | Android live region + iOS 접근성 알림 |
| 이탈 확인 | 공개 Sheet의 dismiss/focus 계약 | 공개 Sheet의 dismiss/키보드/복귀 계약 |

입력 오류는 입력 ref로 복귀한다. 설정 Sheet를 취소하면 실제 이탈 버튼, 변경을 버려 버튼이 사라지면 유지되는 단계 제목으로 복귀한다. Web은 안정적인 단계 제목/입력 ref에 포커스를 옮기고 `role="status"`로 결과를 알린다. Native는 공개 입력 ref와 단계 제목의 접근성 포커스·알림을 연결하며, unmount 때 예약된 포커스 이동을 취소한다. Sheet의 포커스·키보드·dismiss 정책은 기존 계약에 맡긴다. 제품은 validation 결과, 저장 API, 라우터 이탈 이벤트와 확인 Sheet의 연결, i18n 키를 제공한다.

메모리 초안은 이 예제의 mounted 화면 안에서만 유지된다. 새로고침·프로세스 종료·다른 기기 복구와 서버 중복 처리 방지는 제품 저장소와 API 계약이 있어야 한다. `session.reset`은 서버 요청 취소가 아니다.

## 함정

- 저장 실패는 입력·단계 유지; 메모리 초안은 새로고침 복구를 보장하지 않음.
- 포인터·제스처만으로 기능을 숨기지 않는다. 키보드·단일 탭 경로와 취소 후 복귀도 검증한다.
