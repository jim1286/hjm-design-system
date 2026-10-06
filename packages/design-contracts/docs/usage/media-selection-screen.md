# MediaSelectionScreen 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 (별도 보조 기능) · 검토일: 2026-10-06 ·
계약: [Screen patterns — 사진 라이브러리와 선택 이후](../screen-patterns.md#사진-라이브러리와-선택-이후의-구분)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `MediaSelectionScreen` | `/screen-flows` | `/screen-flows` | 미디어 선택 검토 화면 |

granular subpath로만 import 된다(루트 entry에 없음). 추가 peer는 없다.

## 최소 사용 예

```tsx
// Native (Web은 같은 prop, import만 @hjmds/react/screen-flows)
import { MediaSelectionScreen } from "@hjmds/react-native/screen-flows";

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

## 축과 기본값

- `items`: `{ descriptor: UploadItemDescriptor, preview? }`. descriptor는 `id`·`name`·선택 `sizeLabel`·`state`
  (`pending` · `uploading`(progress) · `success` · `error`(message)).
- 격자는 compact 2열, expanded 3열이다. `library`를 주면 이 격자 대신 그 슬롯을 그린다.
- `add`는 상단 `actions` 자리(ghost), `done`은 하단 footer(primary)에, `selectionSummary`는 `done` 위에 놓인다.
- `onMove(id, -1 | 1)`. 첫 항목의 위로·마지막 항목의 아래로 버튼은 비활성이다.
- 나머지는 [ScreenLayout](screen-layout.md) prop(`title` 필수, `description`, `notice`, `state` 등)이다.

## 꼭 지킬 것

- `actionLabels`는 짧은 표시 문구, `removeLabel`·`moveUpLabel`·`moveDownLabel`은 사진 이름을 포함한 접근성 이름이다.
  둘 다 현지화한다.
- preview는 작은 leading 아이콘으로 줄이지 않고 큰 썸네일로 둔다.
- 업로드 진행·재시도·취소의 실제 동작과 개수·크기 제한, EXIF 처리는 제품이 한다.

## 함정

- `actions`를 넘겨도 `add` 버튼이 그 자리를 덮는다. 다른 상단 행동은 `leading`이나 `notice`로 둔다.
- `library`를 주면 `items` 격자와 업로드 상태 표시는 그려지지 않는다. 선택 결과는 `selectionSummary`로 보여 준다.
