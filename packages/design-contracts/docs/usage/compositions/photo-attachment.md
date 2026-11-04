# 글과 사진 한 장

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 구성 API 지침 참조
- 검토일: 2026-11-03
- 근거: 2026-11-03 사용자 지시. Spint 글(`ComposeScreen`)이 버튼·PhotoSourceSheet·Image·ImageViewer·제거 버튼을 직접 조립했고, Diairy 편지에도 같은 사진 한 장 첨부가 필요해 두 제품이 함께 쓰는 구성으로 옮겼다.
- 스토리북: `배포/구성/선택과 필터/글과 사진 한 장`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다.

## 언제 쓰나

글(편지·게시글·댓글)에 선택 사진 **한 장**을 붙이고, 붙인 사진을 글 아래에서 크게 볼 때 쓴다.
여러 장은 [사진 선택과 업로드](../screens/flow-media.md), 채팅 입력의 첨부는 [메시지 작성](purpose-input-message.md)을 쓴다.
`ImageViewer`와 같은 `image-viewer` 하위 경로라 Native는 그 선택 peer(gesture-handler·reanimated·worklets·zoom-toolkit)가 필요하다.

엽서처럼 사진 미리보기 위에 제품 장식을 그릴 때 `decoratePreview`로 이미지를 감싼다. 확대 뷰어는 원본 사진을 보여 주며 삭제 행동은 HJM이 소유한다. 작성 도구가 사진 선택 행동을 따로 제공하면 `chooseAction="none"`과 `sourceOpen`·`onSourceOpenChange`로 같은 사진 원본 선택 시트를 제어한다.

2026-11-03 사용자 지시로 흔한 작성 화면(Threads·X 글 작성, Slowly 편지)을 참고해 모양을 정했다. 글 아래 작은 아이콘 행동으로 붙이고,
붙인 사진은 미리보기와 모서리 ×로 뺀다. 폭을 채운 버튼과 따로 된 "바꾸기"는 두지 않는다(빼고 다시 붙인다). 안내 문구 자리도 없다(같은 날 사용자 결정).

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| PhotoAttachmentField | 작성: 작은 "사진" 행동 → 출처 시트, 붙인 뒤 미리보기(크게 보기) + 모서리 × | [Image](../components/image.md) |
| AttachedPhoto | 읽기: 글 아래 사진, 누르면 ImageViewer(아래로 끌어 닫기) | [Image](../components/image.md) |
| PhotoSourceSheet | 공통 하단 시트에서 앨범·촬영 고르기(내부에서 연다) | [공개 계약](../components/photo-source-sheet.md) |

## 배치

```text
글 입력(제품: TextArea·편지지)
└─ PhotoAttachmentField
   ├─ [▣ 사진]  ghost small, 시작 끝 정렬          ← 사진이 없을 때만
   ├─ Notice danger                              ← 고르기 실패 문구(제품), 초안 유지
   └─ 미리보기 ImageViewerTrigger > Image cover   ← 사진이 있을 때만, 최소 3:4
      └─ 위·끝 모서리 [×] IconButton secondary small circle (항상 보임)
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | PhotoAttachmentField(Stack) | 글 입력 바로 아래, 제출 행동 위 | 부모 폭, 사이 `photoAttachmentRecipe.gap`(`spacing.xs`) |
| 내용 | 미리보기 Image | 고르기 행동 자리 | 사진 비율, 최소 3:4(`previewMinAspectRatio`, `resolvePhotoAttachmentPreviewSize`) cover. 크게 보기는 전체 |
| 행동 | 고르기 Button ghost small(사진 아이콘) · 빼기 IconButton | 고르기는 글 아래 시작 끝, 빼기는 미리보기 위·끝 모서리 안쪽 `spacing.xs` | `photoAttachmentRecipe.choose*`·`remove*`. 터치 화면을 위해 ×는 마우스 올림 없이 항상 보인다 |

## 흐름과 상태

1. "사진" → 공통 하단 시트(PhotoSourceSheet)에서 앨범·촬영 → 제품 picker(`onSelectSource`). Native는 시트가 닫힌 뒤, Web은 클릭 안에서 부른다(파일 입력의 사용자 활성화 유지).
2. 제품이 기기에서 줄인 사진을 `photo`로 넘긴다. 업로드는 글을 보낼 때 제품이 한다(쓰다 버린 사진을 올리지 않는다).
3. 실패·취소·권한 거부에도 글과 붙인 사진을 지우지 않는다. 서버가 확정한 뒤에만 초안을 정리한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 사진 없음은 "사진" 행동만, 사진 있음은 미리보기 + 모서리 × | 미리보기는 `labels.preview`, ×는 `labels.remove` 이름의 버튼 |
| 진행 중 | 고르는 중은 "사진" 행동 spinner, 보내는 중(`disabled`)은 × 잠금 | 크게 보기는 계속 열린다, 포커스를 옮기지 않음 |
| 실패 | 고르기 실패는 `error` Notice. 올리기 실패는 제품의 제출 행동이 알린다 | Notice가 오류를 읽음, 글과 사진 유지 |

행동별 잠금은 `resolvePhotoAttachmentActions`(design-contracts `components/image`)가 정한다.

## 제품이 소유하는 것

- 시스템 사진 선택기·권한·디코드·기기 축소(포트폴리오 MU-02), 서버 업로드(보낼 때), 초안 보존, 모든 문구.
- 인증이 필요한 사진 주소는 `imageHost`로 제품 이미지 호스트를 넘긴다. Native `sourceAdapter`·`renderImage`(미리보기)와 `renderViewerImage`(크게 보기), Web `renderImage`·`renderViewerImage`.
- 읽기 화면에서 주소가 거부되는 경우는 `AttachedPhoto`의 `onLoadStatusChange`로 받아 제품이 재시도를 보인다.

## 코드 골격

```tsx
// Web
import { AttachedPhoto, PhotoAttachmentField } from "@hjmds/react/image-viewer";

<input ref={input} type="file" accept="image/*" hidden onChange={(e) => attach(e.currentTarget.files?.[0])} />
<PhotoAttachmentField
  photo={draft.photo /* { uri, width, height } | null */}
  disabled={submitting}
  error={photoError ? t(photoError) : undefined}
  labels={{ add: t("photo.add"), remove: t("photo.remove"), preview: t("photo.preview"), source: sourceLabels }}
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
  labels={{ add: t("photo.add"), remove: t("photo.remove"), preview: t("photo.preview"), source: sourceLabels }}
  viewerLabels={viewerLabels}
  safeAreaInsets={insets}
  onSelectSource={(source) => void pick(source)}
  onRemove={() => setPhoto(null)}
/>
<AttachedPhoto photo={letter.photo} label={t("photo.view")} viewerLabels={viewerLabels} safeAreaInsets={insets}
  imageHost={{ renderViewerImage: photoViewerRenderer(source) }} />
```
