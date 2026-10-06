# FilePicker 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [FilePicker](../file-picker.md), 판정 `resolveFilePickerSelection`(`@hjmds/design-contracts/components/file-picker`)

## 언제 쓰나

사용자가 업로드할 로컬 파일을 고르게 할 때 쓴다. 받는 형식(`accept`), 최대 크기, 최대 개수를
descriptor로 선언하면 선택 결과가 `{ accepted, rejected }`로 함께 돌아온다. FilePicker는 "무엇을
골랐는가"까지만 소유한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 업로드 진행·성공·실패·재시도 표시 | [UploadItem](upload-item.md) |
| 사진을 카메라·앨범에서 고르는 시트 | [PhotoSourceSheet](photo-source-sheet.md) |
| 고른 미디어를 화면 단위로 고르고 확인 | [MediaSelectionScreen](media-selection-screen.md) |
| 파일이 아닌 텍스트 값 입력 | [Field](field.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `FilePicker` | `@hjmds/react`, `/file-picker`, `/forms` | `@hjmds/react-native`, `/file-picker`, `/inputs` | 기본 |

결과 타입(`FilePickerSelectionResult`, `FilePickerCandidate`)은 `@hjmds/design-contracts/components/file-picker`에 있다.

## 최소 사용 예

```tsx
// Web
import { FilePicker } from "@hjmds/react/file-picker";

<FilePicker
  descriptor={{ mode: "multiple", accept: ["image/*", ".pdf"], maxSizeBytes: 10_000_000, maxCount: 5 }}
  label={t("attach.label")}
  buttonLabel={t("attach.choose")}
  dropzoneLabel={t("attach.drop")}
  existingCount={files.length}
  onSelect={({ accepted, rejected }) => { addFiles(accepted); reportRejected(rejected); }}
/>
```

```tsx
// Native
import { FilePicker } from "@hjmds/react-native/file-picker";

<FilePicker
  descriptor={{ accept: ["application/pdf"], maxSizeBytes: 10_000_000 }}
  label={t("attach.label")}
  buttonLabel={t("attach.choose")}
  onPick={pickWithDocumentPicker} // 제품 adapter: 취소면 null, 아니면 FilePickerCandidate[]
  onPickError={reportPickError}
  onSelect={({ accepted, rejected }) => { addFiles(accepted); reportRejected(rejected); }}
/>
```

## 축과 기본값

- `descriptor.mode`: `single`(기본) · `multiple`. `maxCount`는 `multiple`에서만 쓴다. `single`에 주면 던진다.
- `existingCount` 기본 `0`. 여러 번 나눠 고르는 흐름은 이미 고른 개수를 넘겨야 `maxCount`가 누적으로 판정된다.
- `rejected[].reason`: `unsupported-type`(`accept` 동반) · `too-large`(`maxSizeBytes` 동반) · `count-exceeded`(`maxCount` 동반).
- `disabled` 기본 `false`. `hint`, `error`는 선택 사항이다.

## 꼭 지킬 것

- 라벨·버튼·dropzone 문구와 거부 문장은 제품이 i18n 키로 만든다. 거부 문장은 `reason`과 한계값으로
  만들고 색으로만 알리지 않는다.
- `rejected`가 있어도 `accepted`는 그대로 쓴다. 한 장이 막혔다고 전체 선택을 버리지 않는다.
- FilePicker는 선택 목록을 쌓지 않는다. 고른 파일 목록·업로드 상태는 제품 상태와 UploadItem이 소유한다.
- Native 실제 OS document/image picker 연결(`onPick`)은 제품 책임이다. 패키지는 이를 구현하거나
  기기에서 검증하지 않는다. 제품 릴리스 QA에서 확인한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 파일 진입 | 숨긴 `<input type="file">` + 보이는 버튼 + dropzone | 제품 adapter `onPick`(비동기) |
| 필수 prop 차이 | `dropzoneLabel` | `onPick`, `onPickError` |
| 드래그 앤 드롭 | 있음(버튼과 항상 함께) | 없음 |
| 진행 중 잠금 | 없음 | `onPick` 대기 중 버튼 `busy`·비활성 |
| `label`·`hint`·`error` 타입 | `ReactNode` | `string` |
| 후보 id | `getCandidateId`(기본 `name:size:lastModified:index`) | adapter가 `id`를 채움 |
| 배치 | `className`과 div 속성 | `style`(View) |

## 함정

- Native `onPick`이 reject하면 `onSelect`는 불리지 않고 `onPickError`로만 전달된다. 빈 함수로 두면 피커 실패가 화면에 남지 않는다.
- 브라우저 `accept`와 OS 피커 필터는 힌트일 뿐이다. 거부 판정은 반드시 `onSelect` 결과로 처리한다.
