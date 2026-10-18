# 신고와 차단

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 구성 API 지침 참조
- 검토일: 2026-10-18
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/화면/기본 흐름/신고와 차단`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/소통/신고와 차단`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 화면 API가 없는 제품 콘텐츠는 `ScreenLayout`의 본문에 HJM 구성을 연결한다.

## 목적

ModerationScreen을 사용해 신고와 차단 흐름을 구성한다. 제품이 데이터·권한·서버 확정·문구를 공급하며, 예제의 메모리 저장을 운영 저장으로 취급하지 않는다.

## 영역 구조

```text
host: 남은 높이·safe area·키보드
└─ 사유 선택 → 추가 설명 → 신고·차단
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | ModerationScreen | route 본문 | [API 배치 규칙](../components/moderation-screen.md#배치), host 남은 높이 |
| 내용 | 공개 슬롯 | 사유 선택 → 추가 설명 → 신고·차단 | 화면 recipe의 sectionGap·itemGap; 슬롯 안은 각 지침 토큰 |
| 상태 | state 또는 해당 API 상태 | 본문 자리·비차단 notice | 입력 중 실패는 본문 높이와 초안을 유지 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 닫기 | ScreenLayout `exit` `kind="close"` | 헤더 시작 끝 아이콘 버튼 | 1. 신고하지 않고 화면을 닫는다 |
| 작업 | ModerationScreen 공개 행동 슬롯 | 신고는 footer; 차단은 별도 확인 후 실행. 운영자 검토(`variant="review"`)는 결정 버튼을 footer에 세로로 쌓는다 | 같은 표면에 경쟁하는 primary 하나만 |
| 복구 | Button·secondary | 오류 근처 | 재시도할 대상과 범위를 표시 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 사유 선택 → 추가 설명 → 신고·차단 | 각 공개 콜백을 제품 상태에 연결 |
| 로딩 | 최초 조회는 본문 상태, 저장은 해당 행동 pending | 중복 제출 차단; 성공을 먼저 표시하지 않음 |
| 빈 | 실제 조회 0건 또는 아직 작성하지 않은 상태 안내 | 시작·조건 해제 등 맥락에 맞는 대안 |
| 오류 | 신고 실패에 선택 사유·설명 유지; 차단은 성공 후 확정 | 실패 원인과 재시도 경로 제공 |


### 신고와 차단의 서로 다른 결과

| 상황 | 연결 | 유지·복구 |
| --- | --- | --- |
| 사유 미선택 | submit 비활성 | reason은 현재 reasons의 값이어야 한다 |
| 신고 실패 | 선택 사유·설명 유지 + notice | 다시 신고는 같은 대상과 현재 초안으로 한다 |
| 차단 확인 취소 | 기존 차단 상태 유지 | 신고 초안은 별개이므로 지우지 않는다 |
| 차단 실패 | AlertDialog 유지 | Promise 실패를 전달한다. 확인창을 먼저 닫고 성공 처리하지 않는다 |
| 대상 변경 | 대상 id와 초안·요청 묶음 갱신 | 이전 대상의 늦은 응답이 새 대상 상태를 덮지 않게 한다 |

### 편지·카드·Sheet 안에서 신고(1.31.0)

신고가 별도 route가 아니라 편지 아래에 펼쳐지거나 Sheet 안에 열리면 [ModerationForm](../components/moderation-screen.md#moderationform-화면-틀-없는-신고-폼)을 쓴다.
ModerationScreen과 같은 사유 선택·추가 설명·신고/차단 버튼과 규칙을 화면 머리·바깥 여백 없이 그린다.

```text
편지(제품 Surface)
└─ [신고] 제목(선택) → 사유 선택 → 추가 설명 → [신고하기] → [차단] → [취소]
```

| 행동 | 연결 | 규칙 |
| --- | --- | --- |
| 펼친 신고 접기 | `cancel` → 마지막 ghost 버튼 | Sheet 안에서는 Sheet 닫기가 있으므로 생략 가능 |
| 제목 | `title`(구성 제목 `level3`) | 제목 줄이 있는 Sheet·Dialog 안에서는 생략한다 |
| 화면 틀 | ModerationScreen에 `contentInset="none"`·`scroll="content"`를 주어 끄지 않는다 | 머리 띠와 footer 표면이 남는다 |

### 운영자 검토(1.31.0)

신고·이의 신청 처리 화면은 ModerationScreen `variant="review"`다. 신고된 내용(`children`) → 처리 사유 자유 입력 → 결정 버튼(기각·숨기기·유지·번복 등, 문구는 제품) 순이다.

| 상황 | 연결 | 유지·복구 |
| --- | --- | --- |
| 사유 미입력 | 모든 결정 비활성(`decisionReason.required` 기본 `true`) | 공백만 있는 사유는 입력하지 않은 것으로 본다 |
| 되돌리기 어려운 결정 | 결정의 `confirmation`(AlertDialog `confirm`, 보통 `tone: "danger"`) | 버튼은 확인창만 열고 `onConfirm`이 실행한다. 실패는 Promise로 넘겨 확인창을 유지한다 |
| 결정 진행 중 | 그 결정 `pending` | 다른 결정과 사유 입력을 HJM이 잠근다 |
| 이미 처리됨 | `resolution`(예: Notice `success` + 처리 사유) | 사유 입력과 결정 버튼 자리를 대체한다 |
| 처리 결과·충돌 | `notice` 또는 `children` 안 Notice | 서버 확정 후에만 성공을 표시한다 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [ModerationScreen](../components/moderation-screen.md) | 필수 props·슬롯·플랫폼 차이, 운영자 검토 `variant="review"`, 화면 틀 없는 `ModerationForm` |
| [Button](../components/button.md) | 동작·로딩·보조 행동 |
| [ScreenLayout](../components/screen-layout.md) | 화면 높이·본문 교체·스크롤 소유 |

## 코드 골격

```tsx
// Web
import { ModerationScreen } from "@hjmds/react/screen-flows";

<ModerationScreen
  title={t("report.title")}
  exit={{ kind: "close", label: t("common.close"), onClick: closeReport }}
  reasonLabel={t("report.reason")}
  reasons={[
    { value: "spam", label: t("report.reason.spam") },
    { value: "abuse", label: t("report.reason.abuse") },
  ]}
  reason={reason}
  onReasonChange={setReason}
  submit={{ label: t("report.submit"), onAction: submitReport, pending: reporting }}
  block={{
    action: { label: t("report.block"), onAction: () => {} },
    confirmation: {
      mode: "confirm", tone: "danger",
      title: t("block.confirm.title"), description: t("block.confirm.body"),
      confirmLabel: t("block.confirm"), cancelLabel: t("common.cancel"),
      onConfirm: blockUser, fallbackErrorMessage: t("block.error"),
    },
  }}
/>
```

```tsx
// Native
import { ModerationScreen } from "@hjmds/react-native/screen-flows";

<ModerationScreen
  title={t("report.title")}
  exit={{ kind: "close", label: t("common.close"), onPress: closeReport }}
  reasonLabel={t("report.reason")}
  reasons={[
    { value: "spam", label: t("report.reason.spam") },
    { value: "abuse", label: t("report.reason.abuse") },
  ]}
  reason={reason}
  onReasonChange={setReason}
  submit={{ label: t("report.submit"), onAction: submitReport, pending: reporting }}
  block={{
    action: { label: t("report.block"), onAction: () => {} },
    confirmation: {
      mode: "confirm", tone: "danger",
      title: t("block.confirm.title"), description: t("block.confirm.body"),
      confirmLabel: t("block.confirm"), cancelLabel: t("common.cancel"),
      onConfirm: blockUser, fallbackErrorMessage: t("block.error"),
    },
  }}
/>
```

콜백·데이터·지역화 함수는 제품에서 공급한다. Web·Native import와 필수 props는 위 API 지침에서 확인한다.

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자 | 2배 글자에서 제목·행은 내용 높이로 증가. footer·닫기·입력 필드가 겹치지 않는지 확인 |
| 다크 | semantic 색으로 내용과 표면을 함께 전환; 예제 브랜드 색을 제품 기본값으로 복사하지 않음 |
| 좁은 폭 | 320px부터 한 열로 읽기 순서 유지. 가상화 본문은 scroll=content, 중첩 스크롤 금지 |
| 키보드 | Native host가 safe area와 키보드를 한 번 처리; Web은 포커스된 입력과 footer 가림 확인 |

## 함정

- 신고 실패에 선택 사유·설명 유지; 차단은 성공 후 확정.
- Storybook은 실제 서버·OS 권한·라우터 연동 증거가 아니다. 기본·다크·큰 글자와 실패/복구를 각각 확인한다.

## 근거

- 신고와 차단의 서로 다른 결과 상황 표: 2026-10-13 전수 점검 — 최초 조회와 변경 요청의 상태를 같은 골격으로 설명하던 부분을 구체화했다.
- 닫기 `exit`: 2026-10-17 화면 검토(S5)에서 exit 없는 신고 예제가 나갈 길 없는 화면으로 렌더링돼 예제·코드 골격에 추가했다.
