# DrawingEditor

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.49.0
- 검토일: 2026-10-27
- 근거: 다에리와 스핀트의 프로필 손그림 편집기가 복제돼 도구·이력·레이아웃이 갈라지는 것을 막으라는 사용자 요청
- 스토리북: `배포/컴포넌트/입력/손그림 편집기`

1.49.0에는 beta로 처음 게시됐으며 stable 판정은 1.50.0부터 적용된다.

## 언제 쓰나

펜·지우개로 그림을 그리고 이미지로 저장하는 전체 편집 화면에 쓴다. 프로필 사진뿐 아니라 사각 그림에도 사용할 수 있다.
도구 배치·그리기 상태·실행 취소·다시 실행·전체 지우기·펜 굵기·최근 색·배경·저장 진행·실패·닫기 확인을 공통으로 제공한다.
사진 선택·자르기에는 제품 이미지 피커를 사용한다. 문서 필기 인식이나 필압·벡터 파일 편집은 제공하지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 사진을 고르거나 촬영 | 제품 이미지 피커 |
| 색상 하나만 선택 | [ColorPicker](color-picker.md) |
| 일반 텍스트 편집 | [EditorScreen](editor-screen.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `DrawingEditor` | 전체 편집 화면 | `@hjmds/react/drawing-editor` | `@hjmds/react-native/drawing-editor` |
| `DrawingEditorProps`, `DrawingEditorLabels`, `DrawingImage` | 공통 타입 | 같은 경로 | 같은 경로 |
| `drawingEditorRecipe`, `drawingReducer`, `drawingInkPath` | 배치·이력·선 생성 계약 | `@hjmds/design-contracts/components/drawing-editor` | 같음 |

루트 barrel로 내보내지 않는다. Web는 기존 optional `lucide-react`, Native는 `react-native-svg`와 `lucide-react-native` peer가 필요하다.
새 라이브러리는 추가하지 않는다. 기존 ColorPicker와 EditorScreen을 합성하며 별도 색상 피커나 화면 셸을 만들지 않는다.

## 최소 사용 예

```tsx
// Native
import { DrawingEditor } from '@hjmds/react-native/drawing-editor';

<DrawingEditor
  labels={localizedLabels}
  cropPreview="circle"
  safeAreaBottom={insets.bottom}
  onCancel={close}
  onSave={async image => {
    // 제품이 계정 세대를 검증하고 서버가 받는 형식으로 변환한다.
    await uploadProfileImage(image);
    close();
  }}
/>
```

```tsx
// Web
import { DrawingEditor } from '@hjmds/react/drawing-editor';

<DrawingEditor labels={localizedLabels} cropPreview="circle"
  onSave={uploadAndClose} onCancel={close} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| labels | `DrawingEditorLabels` | 필수 | 모든 도구·오류·닫기 확인 문구 |
| onSave | `(image: DrawingImage) => Promise<void>` | 필수 | 이미지 업로드 성공/실패를 제품이 확정 |
| onCancel | `() => void` | 필수 | 변경 취소 확인 후 나가기 |
| cropPreview | `circle`, `none` | `none` | 출력에 포함하지 않는 원형 잘림 안내 |
| safeAreaBottom | number | 0 | Native host의 아래 안전 영역 |
| testID | string | `drawing-editor` | 테스트 식별자와 캔버스 접두사 |

## 배치

```text
EditorScreen: 안전 영역 + 닫기/제목
  되돌리기·다시 실행          배경·전체 지우기
  정사각 캔버스(원형 잘림 안내 선택)
  펜 / 지우개
  굵기
  빠른 색상 스트립 · 더 많은 색
EditorScreen: 저장 footer + 아래 안전 영역
```

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 캔버스 최대 400, Native 가용 영역 안 정사각 | `drawingEditorRecipe.maxCanvas` |
| 간격 | Native 도구 묶음 12, Web Stack md | 기존 양 표면의 편집기 배치 보존 |
| 순서·정렬 | 이력 → 캔버스 → 도구 → 저장 | 원형 예고는 캔버스 위 오버레이 |
| 고정·스크롤 | Native 본문 비스크롤, 저장 footer | 세로 획을 부모 스크롤에서 보호 |
| 좁은 폭·큰 글자 | 가용 폭 안에서 캔버스 축소, 색상은 가로 스크롤 | 최대 글자 조건은 전사 지침대로 제외 |

## 꼭 지킬 것

- 그림 도구·이력을 제품에서 다시 조립하지 않는다.
- 저장 실패는 reject하고 성공 후 화면 이동은 제품이 수행한다.
- 업로드 전 계정 세대와 이미지 입력 한도를 검사한다.

## 상태와 제품 경계

`labels`는 모든 문구를 요구한다. 제품은 번역·계정·업로드·형식 변환·성공 후 탐색만 연결한다.
`onSave`가 reject되면 오류를 보이고 그림과 이력을 보존한다. 성공을 HJM이 추정해 화면을 닫지 않는다.
저장 중 반복 저장과 편집을 막으며 비어 있는 기본 배경은 저장할 수 없다. 배경만 바꾼 그림은 저장 가능하다.
이미지는 Native SVG의 PNG 또는 Web Canvas의 JPEG base64와 실제 `mimeType`으로 전달된다. 크기·압축·업로드 한도는 제품 계약에 맞춘다.
계정이 바뀌는 동안 이미지 추출이 끝날 수 있으므로 소비자는 렌더 시점의 계정 세대를 캡처해 업로드 전에 다시 검증한다.

## 레이아웃과 상호작용

상단 이력·배경·지우기 → 정사각 캔버스 → 펜/지우개 → 굵기 → 색상 스트립 순서다. 저장과 닫기는 EditorScreen이 소유한다.
Native는 부모 스크롤이 세로 획을 가져가지 않도록 `scroll="content"`를 사용하고 실제 가용 영역 안에서 캔버스 크기를 정한다.
Web는 pointer capture와 `touch-action: none`을 사용한다. 첫 터치/포인터만 획을 소유한다.
`cropPreview="circle"`은 잘릴 모서리를 표시하지만 출력 이미지에는 포함하지 않는다. 기본값 `none`은 사각 그림이다.
펜과 지우개의 실제 굵기는 슬라이더 값과 같다. 배경 변경 후 지우개 자국도 새 배경을 따른다.

## 확인 범위와 소비 이관

다에리 Native·Web, 스핀트 Native가 이 컴포넌트를 소비한다. 제품의 중복 캔버스·도구·이력 구현과 그 전용 계약 테스트는 제거하고
공통 계약/renderer 테스트로 옮긴다. 제품 테스트는 계정·업로드 실패·탐색 연결을 계속 확인한다.
공개 패키지 설치, 제품 채택과 실기기 검증은 각각 확인한다. 캔버스 획 입력은 포인터·터치 전용이며 키보드로 그리는 기능은 제공하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 획 입력 | pointer capture | 단일 responder 소유 |
| 이미지 | Canvas JPEG | SVG PNG |
| 주변 스크롤 | touch-action none | 비스크롤 본문 |

## 근거

- 공통 소유권: 2026-10-27 사용자 지시로 다에리·스핀트의 복제 편집기를 HJM으로 옮겼다.
- 획 소유권과 스크롤: 기존 다에리의 두 번째 손가락·세로 획 결함 대응을 보존한다.
