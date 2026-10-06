# 사진 선택과 업로드

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/화면/기본 흐름/사진 선택과 업로드`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/콘텐츠/사진 선택과 업로드`

## 목적

MediaSelectionScreen을 사용해 사진 선택과 업로드 흐름을 구성한다. 제품이 데이터·권한·서버 확정·문구를 공급하며, 예제의 메모리 저장을 운영 저장으로 취급하지 않는다.

## 영역 구조

```text
host: 남은 높이·safe area·키보드
└─ 추가 → 썸네일 격자 → 선택 요약 → 완료
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | MediaSelectionScreen | route 본문 | [API 배치 규칙](../components/media-selection-screen.md#배치), host 남은 높이 |
| 내용 | 공개 슬롯(`library`를 주면 기본 격자 대신 그것을 그린다) | 추가(헤더) → 썸네일 격자 → 선택 요약 → 완료(footer) | 기본 격자는 `Grid` 2열, `breakpoint.expanded` 960 이상 3열, 칸 사이 `spacing.md` 16. 칸 안은 미리보기 → UploadItem → 이동·제거 행(`spacing.xs` 8 세로, 버튼 사이 `spacing.xxs` 4) |
| 상태 | state 또는 해당 API 상태 | 본문 자리·비차단 notice | 입력 중 실패는 본문 높이와 초안을 유지 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 작업 | `add` Button·secondary / `done` Button·primary / 항목 행동 Button·ghost·small | 추가는 헤더 actions, 완료는 footer(선택 요약 아래), 위로·아래로·제거는 각 칸 미리보기 아래 | primary는 완료 하나. 칸마다 위로 → 아래로 → 제거, 첫 칸의 위로·마지막 칸의 아래로는 비활성 |
| 복구 | Button·secondary | 오류 근처 | 재시도할 대상과 범위를 표시 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 추가 → 썸네일 격자 → 선택 요약 → 완료 | 각 공개 콜백을 제품 상태에 연결 |
| 로딩 | 최초 조회는 본문 상태, 저장은 해당 행동 pending | 중복 제출 차단; 성공을 먼저 표시하지 않음 |
| 빈 | 실제 조회 0건 또는 아직 작성하지 않은 상태 안내 | 시작·조건 해제 등 맥락에 맞는 대안 |
| 오류 | 업로드 실패 항목만 재시도, 완료 버튼은 제품 정책으로 제한 | 실패 원인과 재시도 경로 제공 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [MediaSelectionScreen](../components/media-selection-screen.md) | 필수 props·슬롯·플랫폼 차이 |
| [Button](../components/button.md) | 동작·로딩·보조 행동 |
| [ScreenLayout](../components/screen-layout.md) | 화면 높이·본문 교체·스크롤 소유 |

## 코드 골격

```tsx
// Web
import { MediaSelectionScreen } from "@hjmds/react/screen-flows";

<MediaSelectionScreen
  title={t("media.title")}
  items={picked.map((p) => ({ descriptor: { id: p.id, name: p.fileName, state: p.upload },
    preview: <img src={p.uri} alt="" width={p.width} height={p.height} /> }))}
  add={{ label: t("media.add"), onAction: openPicker }}
  done={{ label: t("media.done"), onAction: submit, disabled: uploading }}
  labels={{ pending: t("upload.pending"), uploading: t("upload.uploading"),
    success: t("upload.success"), cancel: t("upload.cancel"), retry: t("upload.retry") }}
  actionLabels={{ remove: t("media.remove"), moveUp: t("media.moveUp"), moveDown: t("media.moveDown") }}
  removeLabel={(item) => t("media.removeNamed", { name: item.descriptor.name })}
  moveUpLabel={(item) => t("media.moveUpNamed", { name: item.descriptor.name })}
  moveDownLabel={(item) => t("media.moveDownNamed", { name: item.descriptor.name })}
  onRemove={remove} onMove={(id, direction) => move(id, direction)}
  onRetry={retryUpload} onCancel={cancelUpload}
/>
```

```tsx
// Native
import { MediaSelectionScreen } from "@hjmds/react-native/screen-flows";
import { Image } from "react-native";

<MediaSelectionScreen
  title={t("media.title")}
  items={picked.map((p) => ({ descriptor: { id: p.id, name: p.fileName, state: p.upload },
    preview: <Image src={p.uri} width={p.width} height={p.height} /> }))}
  add={{ label: t("media.add"), onAction: openPicker }}
  done={{ label: t("media.done"), onAction: submit, disabled: uploading }}
  labels={{ pending: t("upload.pending"), uploading: t("upload.uploading"),
    success: t("upload.success"), cancel: t("upload.cancel"), retry: t("upload.retry") }}
  actionLabels={{ remove: t("media.remove"), moveUp: t("media.moveUp"), moveDown: t("media.moveDown") }}
  removeLabel={(item) => t("media.removeNamed", { name: item.descriptor.name })}
  moveUpLabel={(item) => t("media.moveUpNamed", { name: item.descriptor.name })}
  moveDownLabel={(item) => t("media.moveDownNamed", { name: item.descriptor.name })}
  onRemove={remove} onMove={(id, direction) => move(id, direction)}
  onRetry={retryUpload} onCancel={cancelUpload}
/>
```

콜백·데이터·지역화 함수는 제품에서 공급한다. Web·Native import와 필수 props는 위 API 지침에서 확인한다. 미리보기 이미지는 제품이 공급한다(Web `img`, Native `Image`).

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자 | 2배 글자에서 제목·행은 내용 높이로 증가. footer·닫기·입력 필드가 겹치지 않는지 확인 |
| 다크 | semantic 색으로 내용과 표면을 함께 전환; 예제 브랜드 색을 제품 기본값으로 복사하지 않음 |
| 좁은 폭 | 기본 격자는 `minColumnWidth` 없이 `columns={{ compact: 2, expanded: 3 }}`라 320px에서도 2열이다(한 열로 접지 않는다). 960 미만 2열, 이상 3열. 이동·제거 버튼 행은 줄바꿈된다. 한 열이 필요하면 `library` 슬롯으로 제품 격자를 넘긴다 |
| 키보드 | Native host가 safe area와 키보드를 한 번 처리; Web은 포커스된 입력과 footer 가림 확인 |

## 함정

- 업로드 실패 항목만 재시도, 완료 버튼은 제품 정책으로 제한.
- Storybook은 실제 서버·OS 권한·라우터 연동 증거가 아니다. 기본·다크·큰 글자와 실패/복구를 각각 확인한다.
