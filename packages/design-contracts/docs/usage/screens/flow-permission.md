# 권한 안내

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/화면/기본 흐름/권한 안내`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/소개/권한 안내`

## 목적

PermissionScreen을 사용해 권한 안내 흐름을 구성한다. 제품이 데이터·권한·서버 확정·문구를 공급하며, 예제의 메모리 저장을 운영 저장으로 취급하지 않는다.

## 영역 구조

```text
host: 남은 높이·safe area·키보드
└─ 선택적 그림 → 권한 이유 → 상태별 행동
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | PermissionScreen | route 본문 | [API 배치 규칙](../components/permission-screen.md#배치), host 남은 높이 |
| 내용 | 공개 슬롯 | 선택적 그림 → 권한 이유 → 상태별 행동 | 화면 recipe의 sectionGap·itemGap; 슬롯 안은 각 지침 토큰 |
| 상태 | state 또는 해당 API 상태 | 본문 자리·비차단 notice | 입력 중 실패는 본문 높이와 초안을 유지 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 작업 | PermissionScreen 공개 행동 슬롯 | prompt 요청, denied 설정, granted 계속, unavailable 대안 | 같은 표면에 경쟁하는 primary 하나만 |
| 복구 | Button·secondary | 오류 근처 | 재시도할 대상과 범위를 표시 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 선택적 그림 → 권한 이유 → 상태별 행동 | 각 공개 콜백을 제품 상태에 연결 |
| 로딩 | 최초 조회는 본문 상태, 저장은 해당 행동 pending | 중복 제출 차단; 성공을 먼저 표시하지 않음 |
| 빈 | 실제 조회 0건 또는 아직 작성하지 않은 상태 안내 | 시작·조건 해제 등 맥락에 맞는 대안 |
| 오류 | 렌더 시 OS 요청 금지; 설정 복귀 시 제품이 상태 재조회 | 실패 원인과 재시도 경로 제공 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [PermissionScreen](../components/permission-screen.md) | 필수 props·슬롯·플랫폼 차이 |
| [Button](../components/button.md) | 동작·로딩·보조 행동 |
| [ScreenLayout](../components/screen-layout.md) | 화면 높이·본문 교체·스크롤 소유 |

## 코드 골격

```tsx
// Web
import { Text } from "@hjmds/react/layout";
import { PermissionScreen } from "@hjmds/react/screen-flows";

<PermissionScreen
  title={t("permission.camera.title")}
  status={cameraStatus /* navigator.permissions 등으로 제품이 조회한 값 */}
  illustration={cameraArt}
  explanation={<Text>{t("permission.camera.why")}</Text>}
  request={{ label: t("permission.allow"), onAction: requestCamera, pending: requesting }}
  settings={{ label: t("permission.browserSettings"), onAction: showSettingsHelp }}
  continueAction={{ label: t("common.continue"), onAction: goNext }}
  skip={{ label: t("common.later"), onAction: goNext }}
/>
```

```tsx
// Native
import { Text } from "@hjmds/react-native/primitives";
import { PermissionScreen } from "@hjmds/react-native/screen-flows";
import { Linking } from "react-native";

<PermissionScreen
  title={t("permission.camera.title")}
  status={cameraStatus /* 제품이 OS에서 조회한 값 */}
  illustration={cameraArt}
  explanation={<Text>{t("permission.camera.why")}</Text>}
  request={{ label: t("permission.allow"), onAction: requestCamera, pending: requesting }}
  settings={{ label: t("permission.openSettings"), onAction: () => Linking.openSettings() }}
  continueAction={{ label: t("common.continue"), onAction: goNext }}
  skip={{ label: t("common.later"), onAction: goNext }}
/>
```

콜백·데이터·지역화 함수는 제품에서 공급한다. Web·Native import와 필수 props는 위 API 지침에서 확인한다. Web은 브라우저 설정을 코드로 열 수 없으므로 `settings`는 설정 방법 안내로 연결한다. Native는 `Linking.openSettings()`를 쓴다.

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자 | 2배 글자에서 제목·행은 내용 높이로 증가. footer·닫기·입력 필드가 겹치지 않는지 확인 |
| 다크 | semantic 색으로 내용과 표면을 함께 전환; 예제 브랜드 색을 제품 기본값으로 복사하지 않음 |
| 좁은 폭 | 320px부터 한 열로 읽기 순서 유지. 가상화 본문은 scroll=content, 중첩 스크롤 금지 |
| 키보드 | Native host가 safe area와 키보드를 한 번 처리; Web은 포커스된 입력과 footer 가림 확인 |

## 함정

- 렌더 시 OS 요청 금지; 설정 복귀 시 제품이 상태 재조회.
- Storybook은 실제 서버·OS 권한·라우터 연동 증거가 아니다. 기본·다크·큰 글자와 실패/복구를 각각 확인한다.
