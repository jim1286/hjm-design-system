# 작성과 수정

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 구성 API 지침 참조
- 검토일: 2026-10-17
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/화면/기본 흐름/작성과 수정`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/콘텐츠/작성과 수정`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 화면 API가 없는 제품 콘텐츠는 `ScreenLayout`의 본문에 HJM 구성을 연결한다.

## 목적

EditorScreen을 사용해 작성과 수정 흐름을 구성한다. 제품이 데이터·권한·서버 확정·문구를 공급하며, 예제의 메모리 저장을 운영 저장으로 취급하지 않는다.

## 영역 구조

```text
host: 남은 높이·safe area·키보드
└─ 제목·취소 → 입력 → 저장
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | EditorScreen | route 본문 | [API 배치 규칙](../components/editor-screen.md#배치), host 남은 높이 |
| 내용 | 공개 슬롯 | 제목·취소 → 입력 → 저장 | 화면 recipe의 sectionGap·itemGap; 슬롯 안은 각 지침 토큰 |
| 상태 | state 또는 해당 API 상태 | 본문 자리·비차단 notice | 입력 중 실패는 본문 높이와 초안을 유지 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 작업 | EditorScreen 공개 행동 슬롯 | 취소는 헤더; 저장은 footer; 수정한 채 이탈하면 확인 | 같은 표면에 경쟁하는 primary 하나만 |
| 복구 | Button·secondary | 오류 근처 | 재시도할 대상과 범위를 표시 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 제목·취소 → 입력 → 저장 | 각 공개 콜백을 제품 상태에 연결 |
| 로딩 | 최초 조회는 본문 상태, 저장은 해당 행동 pending | 중복 제출 차단; 성공을 먼저 표시하지 않음 |
| 빈 | 실제 조회 0건 또는 아직 작성하지 않은 상태 안내 | 시작·조건 해제 등 맥락에 맞는 대안 |
| 오류 | 저장 실패는 입력 유지; 저장 성공 확인 후에만 dirty 해제 | 실패 원인과 재시도 경로 제공 |


### 초안과 서버 확정

| 상황 | 연결 | 유지·복구 |
| --- | --- | --- |
| 새 작성 | ready + 빈 입력 | 빈 초안은 화면 empty가 아니다. 입력을 바로 보여 준다 |
| 저장 시작 | submit.pending + 제출 snapshot | cancel과 이미 열린 초안 버리기 확인을 HJM이 잠근다. 확인창은 종료하며 입력 잠금·추가 요청 차단은 제품이 연결한다 |
| 저장 실패 | ready 유지 + notice | dirty를 해제하거나 입력을 다시 mount하지 않는다 |
| 저장 성공 | 제출 snapshot을 saved로 갱신 | 요청 후 새로 쓴 내용까지 saved로 처리하지 않는다. draftStatus는 실제 임시 저장 성공 때만 표시한다 |
| 브라우저·OS 뒤로 | 제품 router의 이탈 가드 | EditorScreen cancel의 discard와 같은 제품 결정을 공유한다 |

본문이 ready가 아닌 최초 조회·오류·제한 상태에서는 헤더/하단 어느 위치의 저장도 비활성이다. 실패한 저장은
본문을 오류 화면으로 교체하지 않고 위 표처럼 ready + notice로 유지한다.

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [EditorScreen](../components/editor-screen.md) | 필수 props·슬롯·플랫폼 차이 |
| [Button](../components/button.md) | 동작·로딩·보조 행동 |
| [ScreenLayout](../components/screen-layout.md) | 화면 높이·본문 교체·스크롤 소유 |

## 코드 골격

```tsx
// Web
import { EditorScreen } from "@hjmds/react/screen-flows";
import { Text } from "@hjmds/react/layout";
import { TextField } from "@hjmds/react/forms";

<EditorScreen
  title={t("post.edit.title")}
  dirty={draft !== saved}
  submit={{ label: t("post.edit.save"), pending: saving, disabled: !draft.trim(), onAction: save }}
  cancel={{ label: t("post.edit.close"), onAction: close }}
  discard={{
    mode: "confirm",
    title: t("post.discard.title"),
    description: t("post.discard.description"),
    confirmLabel: t("post.discard.confirm"),
    cancelLabel: t("post.discard.keep"),
    tone: "danger",
    fallbackErrorMessage: t("common.error"),
  }}
  draftStatus={draftStatus ? <Text variant="caption" tone="muted">{draftStatus}</Text> : null}
>
  <TextField label={t("post.edit.body")} value={draft} onValueChange={setDraft} />
</EditorScreen>
```

```tsx
// Native
import { EditorScreen } from "@hjmds/react-native/screen-flows";
import { Text } from "@hjmds/react-native/primitives";
import { TextField } from "@hjmds/react-native/inputs";

<EditorScreen
  title={t("post.edit.title")}
  dirty={draft !== saved}
  submit={{ label: t("post.edit.save"), pending: saving, disabled: !draft.trim(), onAction: save }}
  cancel={{ label: t("post.edit.close"), onAction: close }}
  discard={{
    mode: "confirm",
    title: t("post.discard.title"),
    description: t("post.discard.description"),
    confirmLabel: t("post.discard.confirm"),
    cancelLabel: t("post.discard.keep"),
    tone: "danger",
    fallbackErrorMessage: t("common.error"),
  }}
  draftStatus={draftStatus ? <Text variant="caption" tone="muted">{draftStatus}</Text> : null}
>
  <TextField label={t("post.edit.body")} value={draft} onValueChange={setDraft} />
</EditorScreen>
```

콜백·데이터·지역화 함수는 제품에서 공급한다. Web·Native import와 필수 props는 위 API 지침에서 확인한다.

## 다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 다크 | semantic 색으로 내용과 표면을 함께 전환; 예제 브랜드 색을 제품 기본값으로 복사하지 않음 |
| 좁은 폭 | 320px부터 한 열로 읽기 순서 유지. 가상화 본문은 scroll=content, 중첩 스크롤 금지 |
| 키보드 | Native host가 safe area와 키보드를 한 번 처리; Web은 포커스된 입력과 footer 가림 확인 |

## 함정

- 저장 실패는 입력 유지; 저장 성공 확인 후에만 dirty 해제.
- Storybook은 실제 서버·OS 권한·라우터 연동 증거가 아니다. 기본·다크와 실패/복구를 각각 확인한다.

예제 저장 연결: 저장 중 입력은 Web readOnly·Native disabled로 잠그고, 같은 렌더 사이에 들어온 저장 요청도 동기 잠금으로 한 번만 처리한다. 실패 예약은 요청 시작 때 소비하며 진행 중 예약 변경은 무시한다. 실패 후 현재 초안으로 재시도하고, 폐기하면 마지막으로 확정한 snapshot으로 돌아간다. 예제의 400ms 지연과 메모리 저장은 서버 저장 증거가 아니다.

## 근거

- 초안과 서버 확정 상황 표: 2026-10-13 전수 점검 — 최초 조회와 변경 요청의 상태를 같은 골격으로 설명하던 부분을 구체화했다.
- ready가 아닐 때 저장 비활성: 2026-10-13 입력을 표시하지 않는 상태에서도 저장할 수 있던 경로를 수정했다.
- 예제 저장 연결(입력 잠금·동기 잠금·실패 예약 소비): 2026-10-13 실제 예제 연결 검수.
