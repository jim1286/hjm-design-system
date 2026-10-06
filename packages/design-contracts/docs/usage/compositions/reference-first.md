# 첫 작업을 만들고 이어하기

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/시작하기/첫 작업을 만들고 이어하기`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/입력과 작성/첫 작업을 만들고 이어하기`

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
| 바깥 틀 | Steps 또는 포함 Surface | 부모 화면의 해당 슬롯 | [배치](../components/steps.md#배치)에 따른다 |
| 내용 | Steps 내부 슬롯 | 주제 → 입력 → 검토 → 결과 | spacing 토큰과 포함 컴포넌트 recipe |
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

```tsx
// Web
import { Steps } from "@hjmds/react/steps";

<Steps
  descriptor={{
    currentStepId: "team",
    steps: [
      { id: "welcome", label: t("onboarding.welcome") },
      { id: "team", label: t("onboarding.team") },
      { id: "alerts", label: t("onboarding.alerts") },
    ],
  }}
  statusLabels={{
    pending: t("steps.pending"), current: t("steps.current"),
    complete: t("steps.complete"), error: t("steps.error"),
  }}
  composeAccessibleName={({ position, total, label }) => t("steps.name", { position, total, label })}
/>
```

```tsx
// Native
import { Steps } from "@hjmds/react-native/steps";

<Steps
  descriptor={{
    currentStepId: "team",
    steps: [
      { id: "welcome", label: t("onboarding.welcome") },
      { id: "team", label: t("onboarding.team") },
      { id: "alerts", label: t("onboarding.alerts") },
    ],
  }}
  statusLabels={{
    pending: t("steps.pending"), current: t("steps.current"),
    complete: t("steps.complete"), error: t("steps.error"),
  }}
  composeAccessibleName={({ position, total, label }) => t("steps.name", { position, total, label })}
/>
```

제품 데이터·콜백은 주입한다. 위 공개 API 지침에 Web·Native 차이를 유지한다.

## 함정

- 저장 실패는 입력·단계 유지; 메모리 초안은 새로고침 복구를 보장하지 않음.
- 포인터·제스처만으로 기능을 숨기지 않는다. 키보드·단일 탭 경로와 취소 후 복귀도 검증한다.
