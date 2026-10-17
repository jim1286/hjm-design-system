# ImageChoiceGroup

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.26.1 이후)
- 검토일: 2026-10-17
- 근거: `src/image-choice.ts`의 `imageChoiceRecipe`·`resolveImageChoiceToggle`; Web `src/image-choice.tsx`, Native `src/image-choice.tsx`
- 스토리북: `배포/화면/계정/프로필`

## 언제 쓰나

아바타 얼굴, 프로필 사진, 모음에 넣을 사진처럼 **그림을 보고 고르는** 단일·다중 선택에 쓴다. `selected`를 준 ghost 버튼으로 흉내 내지 않는다([조립 규칙](../SELECTION.md#조립-규칙필수)).

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 글자 선택지 하나 고르기 | `Chip`(`selectionMode="single"`), `SegmentedControl`, `RadioGroup` |
| 글자 선택지 여러 개 | `Chip`(`selectionMode="multiple"`), `CheckboxGroup` |
| 기기 사진첩에서 새로 고르기 | `MediaPicker`·제품 권한 흐름 |
| 사진을 크게 보기 | `ImageViewer` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ImageChoiceGroup` | 그림 타일 선택 묶음 | `@hjmds/react/image-choice` | `@hjmds/react-native/image-choice` |
| `imageChoiceRecipe`, `resolveImageChoiceToggle`, `validateImageChoiceItems` | 크기·선택 규칙 | `@hjmds/design-contracts/components/image-choice` | 같음 |

## 최소 사용 예

```tsx
// Web
import { ImageChoiceGroup } from "@hjmds/react/image-choice";

<ImageChoiceGroup label={t("profile.face")} selectionMode="single" value={face} onValueChange={setFace}
  items={faces.map(face => ({ id: face.id, label: face.label, image: <img src={face.src} alt="" /> }))} />
```

```tsx
// Native
import { ImageChoiceGroup } from "@hjmds/react-native/image-choice";

<ImageChoiceGroup label={t("collection.photos")} selectionMode="multiple" value={photoIds} onValueChange={setPhotoIds}
  items={photos.map(photo => ({ id: photo.id, label: photo.label, image: <Image source={photo.source} style={{ width: "100%", height: "100%" }} /> }))} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | 필수 | 묶음의 접근성 이름 |
| `showLabel` | `boolean` | `false` | 타일 위에 `label`을 보이는 글자로 둔다 |
| `items` | `{ id, label, image, disabled? }[]` | 필수 | id 중복·빈 이름이면 `TypeError`. `image`는 칸을 채우는 그림 노드 |
| `selectionMode` | `"single"` · `"multiple"` | 필수 | 단일은 radio, 다중은 checkbox로 읽힌다 |
| `value`·`onValueChange` | 단일 `string \| null` / 다중 `string[]` | 필수 | 제어형. 다중은 누른 순서대로 추가·제거 |
| `disabled` | `boolean` | `false` | 묶음 전체 비활성 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 그림 72 정사각, 바깥 고리 2 + 간격 2(터치 영역 80), radius `radius.md` 12, 체크 원 20 | `imageChoiceRecipe` |
| 간격 | 타일 사이 `spacing.xs` 8, 라벨–타일 8 | `imageChoiceRecipe.gap` |
| 순서·정렬 | `items` 순서대로 시작 쪽부터 줄바꿈 배치, 체크는 타일 끝 쪽 위 모서리 | 두 렌더러 |
| 고정·스크롤 | 자체 스크롤 없음. 바깥 목록·화면이 스크롤 | 두 렌더러 |
| 좁은 폭·큰 글자 | 남은 폭에서 줄바꿈, 타일 크기는 유지 | flex wrap |

## 꼭 지킬 것

- 타일마다 그림의 내용을 말하는 지역화 `label`을 준다. 그림 노드 자체는 보조기술에서 숨긴다(`alt=""`, `decorative`).
- 선택 결과의 저장·업로드·권한은 제품이 맡는다. 이 컴포넌트는 선택 상태만 바꾼다.

## 상태와 상호작용

선택된 타일은 브랜드 색 고리와 체크 원으로 구분하고, 비활성 타일은 투명도 0.5다. Web은 버튼마다 Tab으로 이동하고 Space·Enter로 고른다.

## 근거

- 도입 계기: 2026-10-16 구성 예제 점검 — 제품들이 `selected`를 준 ghost 버튼으로 그림 선택을 흉내 내 선택 상태가 일관되지 않았다.
