# UploadItem 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [UploadItem](../upload-item.md), recipe `uploadItemRecipe`(`src/upload-item.ts`)

## 언제 쓰나

사용자가 고른 파일 **한 개**의 업로드 상태(대기·전송 중·완료·실패)를 한 행으로 보여 줄 때 쓴다.
전송 중에는 취소, 실패하면 재시도 버튼이 상태에서 자동으로 정해져 나온다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 파일을 고르는 입력 | [FilePicker](file-picker.md) |
| 파일과 무관한 작업 진행률 | [Progress](progress.md) |
| 업로드가 아닌 일반 목록 행 | [ListRow](list-row.md) |
| 사진 출처(카메라·앨범) 고르기 | [PhotoSourceSheet](photo-source-sheet.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `UploadItem` | `@hjmds/react`, `/display`, `/upload-item` | `@hjmds/react-native`, `/upload-item` | 기본 |

descriptor 타입과 `validateUploadItemList`는 `@hjmds/design-contracts/components/upload-item`에 있다.

## 최소 사용 예

```tsx
// Web
import { UploadItem } from "@hjmds/react/upload-item";

<UploadItem
  descriptor={{ id: file.id, name: file.name, sizeLabel: file.sizeLabel, state: file.state }}
  labels={{
    pending: t("upload.pending"),
    uploading: t("upload.uploading"),
    success: t("upload.success"),
    cancel: t("upload.cancel"),
    retry: t("upload.retry"),
  }}
  onCancel={cancelUpload}
  onRetry={retryUpload}
/>
```

```tsx
// Native
import { UploadItem } from "@hjmds/react-native/upload-item";

<UploadItem descriptor={descriptor} labels={labels} onCancel={cancelUpload} onRetry={retryUpload} />
```

## 축과 기본값

- `state.status`: `pending` · `uploading` · `success` · `error`(discriminated union).
- `uploading`: `progress`는 0~1 비율 또는 측정 불가면 `null`. `progressLabel`(선택)이 있으면 그 문장을 낭독한다.
  없으면 반올림 퍼센트, `progress`가 `null`이면 `labels.uploading`.
- `error`: `message` 필수. 문제와 다음 행동을 함께 적는다.
- 취소는 `uploading`일 때만, 재시도는 `error`일 때만 나온다. 별도 boolean prop은 없다.

## 꼭 지킬 것

- `progress`에 100을 곱해 넘기지 않는다. renderer가 내부 Progress에 `value={progress * 100}`으로 바꾼다.
- `uploading` 상태에서 `onCancel`이, `error` 상태에서 `onRetry`가 없으면 렌더 중 `TypeError`가 난다.
- 바이트 포맷(`sizeLabel`)·상태 문구·`message`·업로드 요청·재시도 로직은 제품 소유다. 행 모양·상태 색·액션 결정은 HJM 소유다.
- 목록에서는 `validateUploadItemList`로 id 중복을 막는다. 목록 레이아웃·일괄 재시도는 제품이 조합한다.
- 빈 문자열 문구·이름·id는 `TypeError`다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 루트 | `role="group"`, `aria-label`=파일명, `HTMLAttributes`·`ref` 전달 | 일반 `View`, `style`만 |
| 상태 낭독 | 상태 문장 live region | 파일 정보 묶음이 한 요소(`busy` state, value=상태 문장), 액션은 별도 버튼 |
| `leading` | `aria-hidden` | 접근성 트리에서 숨김 |
