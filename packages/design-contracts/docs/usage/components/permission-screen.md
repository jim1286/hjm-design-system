# PermissionScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/소개/권한 안내`

## 언제 쓰나

카메라·위치·알림 같은 권한이 **왜 필요한지 설명하고 다음 행동을 고르게 하는** 화면에 쓴다.
제품이 넘긴 권한 상태에 따라 하단 주 행동 하나를 고른다.

| `status` | 주 행동 |
| --- | --- |
| `prompt` | `request` |
| `denied` | `settings` |
| `granted` | `continueAction` |
| `unavailable` | 없음(`skip`만 표시 가능) |

PermissionScreen은 **OS 권한을 요청하지도, 조회하지도 않는다.** 소스(`screen-flows.tsx`, 두 renderer)는
`react`·`react-native`의 `View` 외에 권한·설정 API를 import하지 않고, 버튼은 넘겨받은 `onAction`만 호출한다.
실제 권한 요청, 설정 앱 열기, 앱 복귀 후 권한 재조회와 `status` 갱신은 모두 제품이 한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면 일부에 “권한이 꺼져 있음” 안내 | [Notice](notice.md) |
| 접근 제한으로 본문을 대체 | [ScreenLayout](screen-layout.md)의 `state={{ kind: "restricted", ... }}` |
| 사진 앨범·촬영 선택 | [PhotoSourceSheet](photo-source-sheet.md) |
| 여러 단계 첫 실행 소개 | [OnboardingScreen](onboarding-screen.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `PermissionScreen` | supplemental, 루트 barrel에 없음 | `/screen-flows` | `/screen-flows` |

`@hjmds/react/screen-flows`, `@hjmds/react-native/screen-flows`로만 import한다. 추가 optional peer는 없다.

## 최소 사용 예

```tsx
// Web — 브라우저는 설정 화면을 열 수 없으므로 settings는 브라우저 권한 안내로 연결한다
import { Text } from "@hjmds/react/layout";
import { PermissionScreen } from "@hjmds/react/screen-flows";

<PermissionScreen
  title={t("permission.camera.title")}
  status={cameraStatus /* 제품이 navigator.permissions·getUserMedia 결과로 매핑 */}
  illustration={cameraArt}
  explanation={<Text>{t("permission.camera.why")}</Text>}
  request={{ label: t("permission.allow"), onAction: requestCamera, pending: requesting }}
  settings={{ label: t("permission.browserHelp"), onAction: openBrowserPermissionHelp }}
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

### 제품이 공급할 것

| prop | 내용 |
| --- | --- |
| `status` | `prompt` · `denied` · `granted` · `unavailable`. OS 조회 결과를 제품이 매핑한다 |
| `explanation` | 권한이 필요한 이유(필수, 지역화) |
| `illustration` | 선택. 제품 일러스트 |
| `request`, `settings`, `continueAction` | 세 행동 모두 필수 `{ label, onAction, disabled?, pending? }`. 상태에 맞는 하나만 보인다 |
| `skip` | 선택 보조 행동 |
| ScreenLayout props | `title`, `description`, `header`, `leading`, `notice`, `state` 등(`footer` 제외) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ScreenLayout 폭(최대 720); 그림 크기는 `illustration`(제품) 소유; 행동은 `Button` 기본 크기 | `PermissionScreen` |
| 간격 | 화면 padding `spacing.md` 16; 본문 그림–설명 `spacing.xl` 24(가운데 정렬); footer 주 행동–나중에 `spacing.sm` 12 | Web·Native `PermissionScreen` `Stack gap="xl" align="center"`·`gap="sm"` |
| 순서·정렬 | 헤더(제목) → 본문(그림 → 설명, 가운데) → footer(상태별 주 행동 primary → 나중에 ghost) | 렌더 순서, `resolvePermissionAction` |
| 고정·스크롤 | 헤더·footer 고정, 본문 화면 스크롤; OS 권한 창은 제품이 `request.onAction`에서 호출 | `ScreenLayout` |
| 좁은 폭·큰 글자 | 설명은 줄바꿈되고 본문이 스크롤된다; footer 버튼은 세로로 쌓인다; `unavailable`이면 주 행동 없이 `skip`만 남는다 | `PermissionScreen` |

## 꼭 지킬 것

- 설정 앱에서 돌아온 뒤 권한을 다시 조회해 `status`를 갱신한다. HJM은 앱 복귀를 감지하지 않는다.
- 렌더링만으로 권한 요청을 띄우지 않는다. 요청은 사용자가 `request` 버튼을 눌렀을 때만 제품이 실행한다.
- 알 수 없는 `status` 값은 던진다.
- 권한 설명 문구·스토어 심사용 사용 목적 문자열은 제품 소유다.
