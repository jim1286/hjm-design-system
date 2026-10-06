# PermissionScreen 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [반복 화면 조합](../screen-patterns.md) (supplemental), `resolvePermissionAction`(`src/screen-patterns.ts`)

## 언제 쓰나

카메라·위치·알림 같은 권한이 **왜 필요한지 설명하고 다음 행동을 고르게 하는** 화면에 쓴다.
제품이 넘긴 권한 상태에 따라 하단 주 행동 하나를 고른다.

| `status` | 주 행동 |
| --- | --- |
| `prompt` | `request` |
| `denied` | `settings` |
| `granted` | `continueAction` |
| `unavailable` | 없음(`skip`만 표시 가능) |

## HJM이 하지 않는 것

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `PermissionScreen` | `/screen-flows` | `/screen-flows` | supplemental, 루트 barrel에 없음 |

`@hjmds/react/screen-flows`, `@hjmds/react-native/screen-flows`로만 import한다. 추가 optional peer는 없다.

## 최소 사용 예

```tsx
// Native (Web은 import 경로만 @hjmds/react/screen-flows)
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

## 제품이 공급할 것

| prop | 내용 |
| --- | --- |
| `status` | `prompt` · `denied` · `granted` · `unavailable`. OS 조회 결과를 제품이 매핑한다 |
| `explanation` | 권한이 필요한 이유(필수, 지역화) |
| `illustration` | 선택. 제품 일러스트 |
| `request`, `settings`, `continueAction` | 세 행동 모두 필수 `{ label, onAction, disabled?, pending? }`. 상태에 맞는 하나만 보인다 |
| `skip` | 선택 보조 행동 |
| ScreenLayout props | `title`, `description`, `header`, `leading`, `notice`, `state` 등(`footer` 제외) |

## 꼭 지킬 것

- 설정 앱에서 돌아온 뒤 권한을 다시 조회해 `status`를 갱신한다. HJM은 앱 복귀를 감지하지 않는다.
- 렌더링만으로 권한 요청을 띄우지 않는다. 요청은 사용자가 `request` 버튼을 눌렀을 때만 제품이 실행한다.
- 알 수 없는 `status` 값은 던진다.
- 권한 설명 문구·스토어 심사용 사용 목적 문자열은 제품 소유다.
