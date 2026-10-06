# UploadItem

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [UploadItem](../../upload-item.md), `src/upload-item.ts`(`uploadItemRecipe`)
- 스토리북: `배포/컴포넌트/데이터 표시/업로드 항목`

## 언제 쓰나

사용자가 고른 파일 **한 개**의 업로드 상태(대기·전송 중·완료·실패)를 한 행으로 보여 줄 때 쓴다.
전송 중에는 취소, 실패하면 재시도 버튼이 상태에서 자동으로 정해져 나온다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 파일을 고르는 입력 | [FilePicker](file-picker.md) |
| 파일과 무관한 작업 진행률 | [Progress](progress.md) |
| 업로드가 아닌 일반 목록 행 | [ListRow](list-row.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `UploadItem` | 기본 | `@hjmds/react`, `/display`, `/upload-item` | `@hjmds/react-native`, `/upload-item` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor` | `{ id, name, sizeLabel?, state }` | — (필수) | — |
| `state` | `{ status: "pending" }` · `{ status: "uploading", progress: number \| null, progressLabel? }` · `{ status: "success" }` · `{ status: "error", message: string }` | — | 아래 행 참고 |
| `state.status` | `pending` · `uploading` · `success` · `error` | — | discriminated union. 취소는 `uploading`일 때만, 재시도는 `error`일 때만 나온다. 별도 boolean prop은 없다 |
| `state.progress` | 0~1 비율 · `null` | — | `uploading`에서. 측정 불가면 `null` |
| `state.progressLabel` | 문자열 | — | 있으면 그 문장을 낭독. 없으면 반올림 퍼센트, `progress`가 `null`이면 `labels.uploading` |
| `state.message` | 문자열 | — | `error`에서 필수. 문제와 다음 행동을 함께 적는다 |
| `labels` | `{ pending, uploading, success, cancel, retry }`(모두 `string`) | — (필수) | — |
| `onCancel` / `onRetry` | `(id: string) => void` | — | descriptor `id`를 받는다. `uploading`·`error` 상태에서는 각각 필수 |
| `leading` | `ReactNode` | — | 아이콘·썸네일(장식) |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 행 바깥 배치. Web·Native 모두 |
| `style`(Native) | `StyleProp<ViewStyle>` | — | deprecated — `layoutStyle`. 개발 모드에서 한 번 경고하고 다음 major에서 제거된다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 최소 높이 `layout.rowHeight.twoLine` 68, 위아래 여백 `row.paddingVertical` `spacing.xs` 8(두 플랫폼). 행동 버튼 최소 44×44. 테두리 1px, `radius.md` 12인 카드 모양 | `uploadItemRecipe.row`, `.hjm-upload-item`, `react-native/src/upload-item.tsx` |
| 간격 | 요소 사이 `spacing.sm` 12, 좌우 여백 `spacing.md` 16. 행 사이 간격·목록 틀은 제품이 정한다(HJM 목록 레이아웃 없음) | `uploadItemRecipe.row` |
| 순서·정렬 | `leading`(아이콘·썸네일) → 이름·메타·진행/상태 → 끝의 행동 버튼(취소·재시도). 여러 개면 고른 순서대로 세로로 쌓는다 | `react/src/upload-item.tsx`, `.hjm-upload-item__action`(margin-inline-start: auto) |
| 고정·스크롤 | 파일을 고르는 [FilePicker](file-picker.md) 바로 아래, 본문과 함께 스크롤 | — |
| 좁은 폭·큰 글자 | Web은 본문 블록이 14rem 아래로 줄면 행동 버튼이 다음 줄 끝으로 내려간다. Native는 한 줄을 유지하고 이름이 줄바꿈된다 | `.hjm-upload-item__body`(flex: 1 1 14rem), `.hjm-upload-item`(flex-wrap) |

## 꼭 지킬 것

- `progress`에 100을 곱해 넘기지 않는다. renderer가 내부 Progress에 `value={progress * 100}`으로 바꾼다.
- `uploading` 상태에서 `onCancel`이, `error` 상태에서 `onRetry`가 없으면 렌더 중 `TypeError`가 난다.
- 바이트 포맷(`sizeLabel`)·상태 문구·`message`·업로드 요청·재시도 로직은 제품 소유다. 행 모양·상태 색·액션 결정은 HJM 소유다.
- 목록에서는 `validateUploadItemList`로 id 중복을 막는다. 목록 레이아웃·일괄 재시도는 제품이 조합한다.
- 빈 문자열 문구·이름·id는 `TypeError`다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 루트 | `role="group"`, `aria-label`=파일명, `HTMLAttributes`·`ref`·`layoutStyle` 전달 | 일반 `View`, `layoutStyle`(`style`은 deprecated) |
| 상태 낭독 | 상태 문장 live region | 파일 정보 묶음이 한 요소(`busy` state, value=상태 문장), 액션은 별도 버튼 |
| `leading` | `aria-hidden` | 접근성 트리에서 숨김 |
