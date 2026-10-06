# FilePicker

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [FilePicker](../../file-picker.md), 판정 `resolveFilePickerSelection`(`@hjmds/design-contracts/components/file-picker`)
- 스토리북: `배포/컴포넌트/입력/파일 선택`

## 언제 쓰나

사용자가 업로드할 로컬 파일을 고르게 할 때 쓴다. 받는 형식(`accept`), 최대 크기, 최대 개수를
descriptor로 선언하면 선택 결과가 `{ accepted, rejected }`로 함께 돌아온다. FilePicker는 "무엇을
골랐는가"까지만 소유한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 업로드 진행·성공·실패·재시도 표시 | [UploadItem](upload-item.md) |
| 파일이 아닌 텍스트 값 입력 | [Field](field.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `FilePicker` | 기본 | `@hjmds/react`, `/file-picker`, `/forms` | `@hjmds/react-native`, `/file-picker`, `/inputs` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor.mode` | `single` · `multiple` | `single` | `maxCount`는 `multiple`에서만 쓴다. `single`에 주면 던진다 |
| `existingCount` | 0 이상 정수 | `0` | 여러 번 나눠 고르는 흐름은 이미 고른 개수를 넘겨야 `maxCount`가 누적으로 판정된다 |
| `descriptor` | `{ mode?, accept?: readonly string[], maxSizeBytes?, maxCount? }` | — | `accept`는 MIME 패턴(`image/*`) 또는 확장자(`.pdf`). 비우면 제한 없음 |
| `onSelect` | `(result: { accepted: readonly FilePickerCandidate[]; rejected: readonly FilePickerRejection[] }) => void` | 필수 | 받아들인 것과 거부한 것을 한 번에 준다 |
| Native `onPick` | `() => Promise<readonly FilePickerCandidate[] \| null>` | 필수 | 제품 adapter. 취소면 `null` |
| Native `onPickError` | `(error: unknown) => void` | 필수 | `onPick`이 reject하면 이쪽으로만 온다 |
| Web `getCandidateId` | `(file: File, index: number) => string` | `name:size:lastModified:index` | 후보 id 규칙 |
| `disabled` | `true` · `false` | `false` | — |
| `hint`, `error` | 문구 | — | 선택 사항이다 |

- `FilePickerCandidate`: `{ id, name, mimeType, sizeBytes }`(`mimeType`은 플랫폼이 못 정하면 `""`).
- `FilePickerRejection`: `{ file, reason: "unsupported-type", accept }` · `{ file, reason: "too-large", maxSizeBytes }` ·
  `{ file, reason: "count-exceeded", maxCount }`. 거부 문장은 `reason`과 함께 오는 한계값으로 만든다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Web 진입부는 dropzone이다. 점선 테두리 1, radius `radius.lg`(16), 안쪽 여백 `spacing.xl`(24), 최소 높이 8rem(128). 폭은 부모를 채운다. 버튼(Native trigger 포함)은 최소 높이 44(`control.minTouchTarget`), 좌우 여백 `spacing.md`(16)다 | `file-picker.ts` `filePickerRecipe`, `styles.css` `.hjm-file-picker__dropzone` |
| 간격 | 항목 간격은 Web `spacing.xs`(8), Native 6이다. dropzone 안 문구와 버튼 사이 간격은 `spacing.sm`(12)이다 | `styles.css` `.hjm-file-picker`, `react-native/src/file-picker.tsx` |
| 순서·정렬 | 위→아래 순서는 라벨 → 진입부 → 도움말 → 오류다. dropzone 안에 문구와 버튼을 가운데 정렬로 쌓는다. Native trigger는 테두리 1·radius 12 상자로 시작 쪽에 붙고(`alignSelf: flex-start`) 내용 폭만큼만 차지한다. 고른 파일 목록은 FilePicker 아래에 [UploadItem](upload-item.md)으로 따로 쌓는다. FilePicker 안에 넣지 않는다 | `react/src/file-picker.tsx`, `react-native/src/file-picker.tsx` |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | — | — |

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
| 배치 | `layoutStyle`(루트), `className`과 div 속성 | `layoutStyle`. `style`은 deprecated(개발 모드 1회 경고, 다음 major 제거) — `layoutStyle` 또는 recipe |

## 함정

- Native `onPick`이 reject하면 `onSelect`는 불리지 않고 `onPickError`로만 전달된다. 빈 함수로 두면 피커 실패가 화면에 남지 않는다.
- 브라우저 `accept`와 OS 피커 필터는 힌트일 뿐이다. 거부 판정은 반드시 `onSelect` 결과로 처리한다.
