# 글과 사진 한 장

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 구성 API 지침 참조
- 검토일: 2026-11-03
- 근거: 2026-11-03 사용자 지시. Spint 글(`ComposeScreen`)이 버튼·PhotoSourceSheet·Image·ImageViewer·제거 버튼을 직접 조립했고, Diairy 편지에도 같은 사진 한 장 첨부가 필요해 두 제품이 함께 쓰는 구성으로 옮겼다.
- 스토리북: `실험/구성/선택과 필터/글과 사진 한 장`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다.

## 언제 쓰나

글(편지·게시글·댓글)에 선택 사진 **한 장**을 붙이고, 붙인 사진을 글 아래에서 크게 볼 때 쓴다.
여러 장은 [사진 선택과 업로드](../screens/flow-media.md), 채팅 입력의 첨부는 [메시지 작성](purpose-input-message.md)을 쓴다.
`ImageViewer`와 같은 `image-viewer` 하위 경로라 Native는 그 선택 peer(gesture-handler·reanimated·worklets·zoom-toolkit)가 필요하다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| PhotoAttachmentField | 작성: 붙이기 → 출처 시트 → 미리보기 → 크게 보기, 바꾸기·빼기, 업로드 상태 | [Image](../components/image.md) |
| AttachedPhoto | 읽기: 글 아래 사진, 누르면 ImageViewer(아래로 끌어 닫기) | [Image](../components/image.md) |
| PhotoSourceSheet | 앨범·촬영 고르기(내부에서 연다) | [공개 계약](../components/photo-source-sheet.md) |
| UploadItem | 고르자마자 올리는 제품의 진행·재시도·취소 | [UploadItem](../components/upload-item.md) |

## 배치

```text
글 입력(제품: TextArea·편지지)
└─ PhotoAttachmentField
   ├─ [사진 붙이기 | 사진 바꾸기]  secondary     ← 사진이 있으면 이름만 바뀐다
   ├─ hint(caption, muted)                       ← 제품 문구, 선택
   ├─ Notice danger                              ← 고르기 실패 문구(제품), 초안 유지
   ├─ 미리보기 ImageViewerTrigger > Image cover   ← 사진 비율, 3:4보다 길면 3:4로 잘라 보임
   ├─ UploadItem                                 ← 고르자마자 올리는 제품만
   └─ [사진 빼기] ghost small
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | PhotoAttachmentField(Stack) | 글 입력 바로 아래, 제출 행동 위 | 부모 폭, 사이 `photoAttachmentRecipe.gap`(`spacing.xs`) |
| 내용 | 미리보기 Image | 고르기 버튼 아래 | 사진 비율, 최소 3:4(`previewMinAspectRatio`, `resolvePhotoAttachmentPreviewSize`) cover. 크게 보기는 전체 |
| 행동 | Button 고르기·빼기 | 미리보기 위·아래 | 고르기 `secondary`, 빼기 `ghost small` — 연속 버튼 색 구분 |

## 흐름과 상태

1. 고르기 → PhotoSourceSheet에서 앨범·촬영 → 제품 picker(`onSelectSource`). Native는 시트가 닫힌 뒤, Web은 클릭 안에서 부른다(파일 입력의 사용자 활성화 유지).
2. 제품이 기기에서 줄인 사진을 `photo`로 넘긴다. 업로드는 제품이 정한 시점에 한다.
3. 실패·취소·권한 거부에도 글과 붙인 사진을 지우지 않는다. 서버가 확정한 뒤에만 초안을 정리한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 사진 없음은 붙이기 버튼만, 사진 있음은 바꾸기·미리보기·빼기 | 미리보기는 `labels.preview` 이름의 버튼, 누르면 ImageViewer |
| 진행 중 | 고르는 중은 버튼 spinner, 올리는 중은 UploadItem 진행 | 고르기·빼기 잠금, 포커스를 옮기지 않음 |
| 실패 | 고르기 실패는 `error` Notice, 올리기 실패는 UploadItem 재시도 | Notice·UploadItem이 오류를 읽음, 글과 사진 유지 |

행동별 잠금은 `resolvePhotoAttachmentActions`(design-contracts `components/image`)가 정한다.

| 상태 | 고르기 | 빼기 | 미리보기 |
| --- | --- | --- | --- |
| 사진 없음 | `add` 활성 | 없음 | 없음 |
| 사진 있음 | `replace` 활성 | 활성 | 열림 |
| 고르는 중(`picking`) | 잠금 + spinner | 잠금 | 열림 |
| 올리는 중(`upload.status="uploading"`) | 잠금 | 잠금 | 열림, UploadItem 취소 |
| 올리기 실패(`upload.status="error"`) | 활성 | 활성 | 열림, UploadItem 재시도 |
| 제품 잠금(`disabled`: 제출 중·제한) | 잠금 | 잠금 | 열림 |

## 제품이 소유하는 것

- 시스템 사진 선택기·권한·디코드·기기 축소(포트폴리오 MU-02), 서버 업로드와 그 시점, 초안 보존, 모든 문구.
- 업로드를 글 제출 때 하는 제품(Spint)은 `upload`를 넘기지 않고 제출 행동의 진행·실패로 보인다. 고르자마자 올리는 제품만 `upload`·`onRetryUpload`·`onCancelUpload`를 넘긴다.
- 인증이 필요한 사진 주소는 `imageHost`로 제품 이미지 호스트를 넘긴다. Native `sourceAdapter`·`renderImage`(미리보기)와 `renderViewerImage`(크게 보기), Web `renderImage`·`renderViewerImage`.

## 코드 골격

```tsx
// Web
import { AttachedPhoto, PhotoAttachmentField } from "@hjmds/react/image-viewer";

<input ref={input} type="file" accept="image/*" hidden onChange={(e) => attach(e.currentTarget.files?.[0])} />
<PhotoAttachmentField
  photo={draft.photo /* { uri, width, height } | null */}
  disabled={submitting}
  hint={t("photo.hint")}
  error={photoError ? t(photoError) : undefined}
  labels={photoLabels /* add·replace·remove·preview + source + upload */}
  viewerLabels={viewerLabels}
  onSelectSource={() => input.current?.click()}
  onRemove={() => setPhoto(null)}
/>
<AttachedPhoto photo={letter.photo} label={t("photo.view")} viewerLabels={viewerLabels} />
```

```tsx
// Native
import { AttachedPhoto, PhotoAttachmentField } from "@hjmds/react-native/image-viewer";

<PhotoAttachmentField
  photo={draft.photo}
  picking={picking}
  disabled={submitting}
  labels={photoLabels}
  viewerLabels={viewerLabels}
  safeAreaInsets={insets}
  onSelectSource={(source) => void pick(source)}
  onRemove={() => setPhoto(null)}
/>
<AttachedPhoto photo={letter.photo} label={t("photo.view")} viewerLabels={viewerLabels} safeAreaInsets={insets}
  imageHost={{ renderViewerImage: photoViewerRenderer(source) }} />
```
