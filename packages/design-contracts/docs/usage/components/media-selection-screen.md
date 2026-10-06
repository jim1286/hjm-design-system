# MediaSelectionScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/콘텐츠/사진 선택과 업로드`

## 언제 쓰나

고른 사진·영상을 큰 썸네일 격자로 보여 주고, 각 항목의 업로드 상태·재시도·취소·순서 이동·삭제와
"추가"·"완료" 행동을 한 화면에 묶을 때 쓴다. 제품이 사진 라이브러리 picker를 직접 그리려면 `library` 슬롯을 쓴다.
실제 picker 실행·권한·이미지 URI 수명·업로드는 제품이 소유한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 앨범·촬영 중 고르는 첫 단계 | [PhotoSourceSheet](photo-source-sheet.md) |
| 파일 선택 컨트롤 하나 | [FilePicker](file-picker.md) |
| 업로드 한 건의 상태 행 | [UploadItem](upload-item.md) |
| 사진 권한 요청·거부 안내 | [PermissionScreen](permission-screen.md) |
| 높이가 다른 사진 피드 보기 | [Masonry](masonry.md) |
| 끌어서 순서 바꾸기 | [SortableCollection](sortable-collection.md) (이 화면은 위·아래 버튼으로 옮긴다) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `MediaSelectionScreen` | 미디어 선택 검토 화면 | `/screen-flows` | `/screen-flows` |

granular subpath로만 import 된다(루트 entry에 없음). 추가 peer는 없다.

## 최소 사용 예

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

Web의 `<img alt="">`는 장식용 미리보기다. 사진 이름은 `removeLabel` 등 접근성 이름과 UploadItem 행이 읽는다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items` | `readonly { descriptor: UploadItemDescriptor; preview?: ReactNode }[]` | 필수 | descriptor는 `id`·`name`·선택 `sizeLabel`·`state`(`pending` · `uploading` · `success` · `error`) |
| `library` | `ReactNode` | 없음 | 주면 `items` 격자 대신 이 슬롯을 그린다 |
| `selectionSummary` | `ReactNode` | 없음 | footer에서 `done` 위 |
| `add` | `ScreenFlowAction`(`{ label, onAction(), disabled?, pending? }`) | 필수 | 상단 `actions` 자리의 ghost 버튼 |
| `done` | `ScreenFlowAction` | 필수 | footer의 primary 버튼 |
| `labels` | `UploadItemLabels`(`{ pending, uploading, success, cancel, retry }`) | 필수 | 각 항목 UploadItem 문구 |
| `actionLabels` | `{ remove, moveUp, moveDown }` | 필수 | 항목 아래 버튼의 짧은 표시 문구 |
| `removeLabel` · `moveUpLabel` · `moveDownLabel` | `(item: MediaSelectionItem) => string` | 필수 | 사진 이름을 포함한 접근성 이름 |
| `onMove` | `(id: string, direction: -1 \| 1) => void` | 필수 | 첫 항목의 위로·마지막 항목의 아래로는 비활성 |
| `onRemove` · `onRetry` · `onCancel` | `(id: string) => void` | 필수 | 삭제, UploadItem 재시도·취소 |
| 나머지 | `ScreenLayout`과 같음(`children`·`footer` 제외) | — | `actions`는 `add`가 덮는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 격자 열 compact(창 0~959) 2열 · expanded(창 960 이상) 3열, 열 폭은 ScreenLayout 폭(최대 720)을 나눈다; 미리보기는 열 폭, 항목 버튼은 `Button size="small"` | `Grid columns={{ compact: 2, expanded: 3 }}`, `breakpoint` |
| 간격 | 화면 padding `spacing.md` 16; 격자 간격 `spacing.md` 16; 항목 안 미리보기–UploadItem–버튼 줄 `spacing.xs` 8; 버튼 사이 `spacing.xxs` 4; footer 요약–완료 `spacing.sm` 12 | Web·Native `MediaSelectionScreen` |
| 순서·정렬 | 헤더(제목 → 추가) → 격자(항목마다 미리보기 → UploadItem → 위로·아래로·삭제) → footer(`selectionSummary` → 완료) | 렌더 순서 |
| 고정·스크롤 | 헤더·footer 고정, 격자는 본문 스크롤(`scroll` 기본 `"screen"`) | `ScreenLayout` |
| 좁은 폭·큰 글자 | 좁은 폭에서도 2열 유지; 항목 버튼 줄은 줄바꿈(`flexWrap: "wrap"`)해 버튼을 자르지 않는다 | `screen-flows.tsx` |

## 꼭 지킬 것

- `actionLabels`는 짧은 표시 문구, `removeLabel`·`moveUpLabel`·`moveDownLabel`은 사진 이름을 포함한 접근성 이름이다.
  둘 다 현지화한다.
- preview는 작은 leading 아이콘으로 줄이지 않고 큰 썸네일로 둔다.
- 업로드 진행·재시도·취소의 실제 동작과 개수·크기 제한, EXIF 처리는 제품이 한다.

## 함정

- `actions`를 넘겨도 `add` 버튼이 그 자리를 덮는다. 다른 상단 행동은 `leading`이나 `notice`로 둔다.
- `library`를 주면 `items` 격자와 업로드 상태 표시는 그려지지 않는다. 선택 결과는 `selectionSummary`로 보여 준다.
