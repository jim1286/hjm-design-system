# PhotoSourceSheet 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [반복 화면 조합 — 사진 촬영과 앨범 선택](../screen-patterns.md) (supplemental)

## 언제 쓰나

사진 버튼 하나에서 **앨범에서 고르기 / 촬영하기**를 고르게 할 때 쓴다. [Sheet](sheet.md)와 Button 두 개의
조합이며 출처 선택만 한다. 권한 요청·카메라 실행·파일 선택·업로드는 `onSelect`에서 제품이 한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 여러 사진 선택·순서·업로드 상태 | [MediaSelectionScreen](media-selection-screen.md) |
| 파일 일반 선택 | [FilePicker](file-picker.md) |
| 업로드 진행 한 건 | [UploadItem](upload-item.md) |
| 사진을 받지 않는 입력(댓글 등) | 추가하지 않는다 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `PhotoSourceSheet` | `/screen-flows` | `/screen-flows` | supplemental, 루트 barrel에 없음 |

`@hjmds/react/screen-flows`, `@hjmds/react-native/screen-flows`로만 import한다. 추가 optional peer는 없다.
HJM은 Expo·브라우저 카메라 SDK에 의존하지 않는다.

## 최소 사용 예

```tsx
// Native (Web은 import 경로만 @hjmds/react/screen-flows)
import { PhotoSourceSheet } from "@hjmds/react-native/screen-flows";

<PhotoSourceSheet
  open={open}
  onOpenChange={setOpen}
  labels={{
    title: t("photo.source.title"),
    library: t("photo.source.library"),
    camera: t("photo.source.camera"),
    cancel: t("common.cancel"),
  }}
  cameraAvailable={hasCamera}
  onSelect={(source) => (source === "camera" ? takePhoto() : pickFromLibrary())}
/>
```

## 축과 기본값

- `cameraAvailable`: 기본 `true`. `false`면 촬영 버튼을 숨긴다. 기기 카메라 유무는 제품이 판단한다.
- `disabled`: 기본 `false`. 두 버튼을 막고 선택을 무시한다.
- 고르면 시트를 닫고(`onOpenChange(false)`) `onSelect("library" | "camera")`를 호출한다.

## 꼭 지킬 것

- `labels`의 네 문구는 모두 i18n 키로 넣는다. 색은 HJM Provider 테마를 따른다.
- 취소·권한 거부·기기 없음일 때 기존 초안과 첨부를 지우지 않는다. 권한 거부에는 앨범 대안을 안내한다.
- EXIF 제거·크기·개수 제한·업로드는 제품 계약을 따른다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `onSelect` 호출 시점 | 클릭 콜스택 안에서 즉시(브라우저 사용자 활성화 보존) | 시트가 실제로 닫힌 뒤(`Sheet`의 dismiss 완료) |
| `onSelect`에서 할 일 | 숨긴 `input[type=file]` 클릭. 촬영은 `capture="environment"` input을 따로 둔다 | 카메라 권한 요청 후 촬영, 또는 앨범 선택기 실행 |

## 함정

- Web에서 `onSelect` 안의 file input 클릭을 `setTimeout`·애니메이션 뒤로 미루면 브라우저가 거부할 수 있다. 같은 콜스택에서 클릭한다.
- Native에서 닫히는 Modal 위에 카메라·선택기를 띄우면 iOS가 표시하지 못한다. 그래서 dismiss 완료 뒤에 호출되며, 제품이 타이머로 다시 앞당기지 않는다.
- `capture`를 지원하지 않는 브라우저·기기는 OS 파일 선택 화면으로 대체될 수 있어 실제 촬영을 보장하지 않는다. 앨범 input에는 `capture`를 붙이지 않는다.
