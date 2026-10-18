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
| `imageChoiceRecipe`, `resolveImageChoiceToggle`, `validateImageChoiceItems` | 크기·선택 규칙 |
| `resolveImageChoiceCaptionLines`, `resolveImageChoiceTileHeight`, `resolveImageChoiceColumns`, `resolveImageChoiceOuterSize`, `validateImageChoiceItemLabelLines` | 미게시. 타일 높이·열 수 계산(렌더러가 쓰며 제품이 직접 부를 일은 드물다) | `@hjmds/design-contracts/components/image-choice` | 같음 |

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
| `showItemLabels` | `boolean` | `false` | 미게시. 타일마다 항목 `label`을 그림 아래 한 줄(caption, 넘치면 말줄임)로 보인다. 같은 누름 영역 안에 있고 보조기술은 기존처럼 타일 이름 하나만 읽는다. 사람을 이름으로 알아봐야 하는 받는 사람 선택에 쓴다 |
| `itemLabelLines` | `1` · `2` | `1` | 미게시. 보이는 항목 이름이 말줄임 전까지 감길 줄 수. `2`는 단어를 자르지 않고(Web `keep-all`, iOS `hangul-word`) 두 줄에서 말줄임한다. 그 밖의 값은 `RangeError` |
| `items` | `{ id, label, image, description?, disabled? }[]` | 필수 | id 중복·빈 이름·공백뿐인 `description`이면 `TypeError`. `image`는 칸을 채우는 그림 노드 |
| item `description` | `string` | — | 미게시. 이름 아래 muted caption 한 줄(넘치면 말줄임). 보내기 상태("보냄") 같은 항목별 상태를 이름에 덧붙이지 않고 따로 둔다. 항상 보이며 보조기술은 타일 이름 다음 설명으로 한 번 읽는다(Web `aria-describedby`, Native `accessibilityHint`). 묶음에 설명이 하나라도 있으면 모든 타일이 그 줄을 비워 둔다 |
| `virtualized` | `{ height: number; overscan?: number }` | — | 미게시. 긴 목록(수백 명). 묶음이 `height` 높이의 자체 스크롤 영역이 되고 보이는 줄 근처만 그린다(`overscan` 기본 `virtualListRecipe.overscan` 3줄). 열 수는 잰 폭에 맞는다. 스크롤하는 부모(Native `ScrollView`, 스크롤 Sheet 본문) 안에 넣지 않는다 |
| `selectionMode` | `"single"` · `"multiple"` | 필수 | 단일은 radio, 다중은 checkbox로 읽힌다 |
| `value`·`onValueChange` | 단일 `string \| null` / 다중 `string[]` | 필수 | 제어형. 다중은 누른 순서대로 추가·제거 |
| `disabled` | `boolean` | `false` | 묶음 전체 비활성 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 그림 72 정사각, 바깥 고리 2 + 간격 2(터치 영역 80), radius `radius.md` 12, 체크 원 20 | `imageChoiceRecipe` |
| 간격 | 타일 사이 `spacing.xs` 8(가로·세로), 라벨–타일 8, 그림–항목 라벨 `spacing.xxs` 4. 이름과 설명 사이 0 | `imageChoiceRecipe.gap`, `itemLabelGap` |
| 글자 칸 | 이름 줄(`itemLabelLines`) + 설명 줄(묶음에 설명이 있으면 1)을 caption 행간(16 × 글자 배율)으로 모든 타일이 같은 높이로 비워 둔다. 타일 높이 = 80 + 4 + 줄 수 × 행간(글자 칸이 없으면 80) | `resolveImageChoiceCaptionLines`, `resolveImageChoiceTileHeight` |
| 순서·정렬 | `items` 순서대로 시작 쪽부터 줄바꿈 배치, 체크는 타일 끝 쪽 위 모서리 | 두 렌더러 |
| 고정·스크롤 | 기본은 자체 스크롤 없음(바깥 목록·화면이 스크롤). `virtualized`면 묶음이 `height` 높이로 스스로 스크롤한다. Web은 포커스 테두리가 잘리지 않게 안쪽 여백 4(`virtualViewportInset`), 열 수 = ⌊(폭 + 8) / 88⌋(최소 1) | 두 렌더러, `resolveImageChoiceColumns` |
| 좁은 폭·큰 글자 | 남은 폭에서 줄바꿈, 타일 크기는 유지 | flex wrap |

```text
virtualized (height 320, 폭 368 → 4열)
┌──────────────────────────────┐ ← 묶음 = 스크롤 영역(radiogroup/group 이름 유지)
│ [얼굴][얼굴][얼굴][얼굴]      │
│ 서연  민준  지우  하린        │ ← 이름(1~2줄)
│ 보냄                          │ ← 설명 줄(있으면 모든 타일이 비워 둠)
│ [얼굴][얼굴][얼굴][얼굴]      │ ← 보이는 줄 ± 3줄만 그린다
└──────────────────────────────┘
```

### 긴 목록

```tsx
// Native — 시트 안이면 시트 본문 스크롤을 끄고 이 묶음이 스크롤을 맡는다
<ImageChoiceGroup label={t("share.selectHint")} selectionMode="multiple" showItemLabels virtualized={{ height: 360 }}
  value={selected} onValueChange={setSelected}
  items={people.map(user => ({ id: user.id, label: user.nickname, image: <Avatar user={user} />, ...(sent.has(user.id) ? { description: t("share.sent"), disabled: true } : {}) }))} />
```

## 꼭 지킬 것

- 타일마다 그림의 내용을 말하는 지역화 `label`을 준다. 그림 노드 자체는 보조기술에서 숨긴다(`alt=""`, `decorative`).
- 선택 결과의 저장·업로드·권한은 제품이 맡는다. 이 컴포넌트는 선택 상태만 바꾼다.
- 항목별 상태는 `description`으로 둔다. 이름에 " · 보냄"처럼 붙이면 긴 이름에서 말줄임으로 가려진다.
- 두 줄로도 담기지 않는 제목·설명(카드형 시작 선택지 등)은 타일이 아니라 목록 행·카드 선택이 맞다. 타일 폭 80은 고정이다.
- `virtualized`는 스스로 스크롤한다. Native는 `ScrollView` 안에 FlatList를 넣으면 경고와 함께 가상화가 꺼지므로 시트·화면의 본문 스크롤 밖(또는 스크롤을 끈 본문)에 둔다.

## 상태와 상호작용

선택된 타일은 브랜드 색 고리와 체크 원으로 구분하고, 비활성 타일은 투명도 0.5다. Web은 버튼마다 Tab으로 이동하고 Space·Enter로 고른다.

## 근거

- `description`·`itemLabelLines`·`virtualized`: 2026-10-18 번뚝 1.31 채택 — 공유 받는 사람의 "보냄"을 이름 줄에 붙여 긴 닉네임에서 가려졌고, 만들기 시작 카드의 여러 단어 제목이 한 줄 캡션에서 잘렸고, 서버 상한 200명 목록을 가상 목록 없이 시트 본문에 그렸다. 가상화는 VirtualList의 창 계산(`resolveVirtualWindow`)을 재사용하되 VirtualList 컴포넌트는 쓰지 않는다 — 줄을 목록 항목으로 읽히고 줄 단위로 포커스를 옮겨 radio/checkbox 묶음 의미를 덮기 때문이다(Native는 같은 이유로 FlatList를 직접 쓴다).

- `showItemLabels`: 2026-10-18 번뚝 공유 받는 사람 선택이 이름을 보이려고 링크 버튼에 아바타·체크·이름을 직접 조립했다.
- 도입 계기: 2026-10-16 구성 예제 점검 — 제품들이 `selected`를 준 ghost 버튼으로 그림 선택을 흉내 내 선택 상태가 일관되지 않았다.
