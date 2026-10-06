# 사진 촬영과 앨범 선택

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/사진/촬영과 앨범 선택`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/선택과 필터/사진 촬영과 앨범 선택`

## 언제 쓰나

명시적으로 선택 후 플랫폼 picker 실행 흐름이 필요할 때 쓴다. PhotoSourceSheet의 상태·콜백을 제품 로직에 연결하며 새 데이터 엔진을 만들지 않는다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| PhotoSourceSheet | 명시적으로 선택 후 플랫폼 picker 실행 | [공개 계약](../components/photo-source-sheet.md) |
| Button | 명시 행동·재시도 | [Button](../components/button.md) |

## 배치

```text
부모 화면의 공개 슬롯
└─ 제목 → 앨범 → 촬영
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | PhotoSourceSheet 또는 포함 Surface | 부모 화면의 해당 슬롯 | [배치](../components/photo-source-sheet.md#배치)에 따른다 |
| 내용 | PhotoSourceSheet 내부 슬롯 | 제목 → 앨범 → 촬영 | spacing 토큰과 포함 컴포넌트 recipe |
| 행동 | Button 또는 공개 콜백 | 내용과 가까운 명시 진입점 | 주 행동 하나, 보조 행동과 구분 |

## 흐름과 상태

1. 명시적으로 선택 후 플랫폼 picker 실행.
2. 진행 상태와 제품의 실제 확정을 분리한다.
3. 권한 거부·취소는 기존 선택 유지.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 제목 → 앨범 → 촬영 | 이름·선택 여부를 보조공학에 노출 |
| 진행 중 | 해당 작업 pending, 입력·기존 결과 보존 | 중복 요청 차단, 로딩에 포커스를 옮기지 않음 |
| 실패 | 권한 거부·취소는 기존 선택 유지 | 오류 근처 재시도, 필요할 때만 오류 읽기 |

## 코드 골격

```tsx
// Web
import { PhotoSourceSheet } from "@hjmds/react/screen-flows";

const libraryInput = useRef<HTMLInputElement>(null);
const cameraInput = useRef<HTMLInputElement>(null);

<>
  <input ref={libraryInput} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.currentTarget.files)} />
  <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={(e) => addFiles(e.currentTarget.files)} />
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
    onSelect={(source) => (source === "camera" ? cameraInput : libraryInput).current?.click()}
  />
</>
```

```tsx
// Native
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

제품 데이터·콜백은 주입한다. 위 공개 API 지침에 Web·Native 차이를 유지한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `onSelect` 호출 시점 | 버튼 클릭 안에서 동기 호출 — 파일 입력 `click()`이 사용자 활성화 안에 있어야 브라우저가 막지 않는다 | 시트 닫힘이 끝난 뒤(`onDismissComplete`) 호출 — iOS는 닫히는 Modal 위에 카메라·앨범을 띄우지 못한다 |
| picker 실행 | 제품의 `<input type="file">`(촬영은 `capture`) | 제품의 이미지 picker·카메라 모듈 |

## 함정

- 권한 거부·취소는 기존 선택 유지.
- 포인터·제스처만으로 기능을 숨기지 않는다. 키보드·단일 탭 경로와 취소 후 복귀도 검증한다.
