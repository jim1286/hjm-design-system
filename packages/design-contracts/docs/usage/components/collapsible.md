# Collapsible

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Collapsible](../../collapsible.md), `FolderPreview`는 [Folder preview](../../folder-preview.md), recipe `collapsibleRecipe`(`src/collapsible.ts`)
- 스토리북: `배포/컴포넌트/데이터 표시/접기와 펼치기` · `배포/컴포넌트/데이터 표시/폴더 미리보기`

## 언제 쓰나

이웃 없이 혼자 접었다 펴는 한 덩어리에 쓴다. "더 보기", 필터 패널, 접히는 본문이 여기에 속한다.
닫히면 내용은 트리에서 빠진다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 서로 연결된 여러 접이식 항목 | [Accordion](accordion.md) |
| 같은 자리의 보기 전환 | [Tabs](tabs.md) |
| 화면 위에 떠서 열리는 내용 | [Popover](popover.md), [Sheet](sheet.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Collapsible` | 기본 | `@hjmds/react`, `/collapsible` | `@hjmds/react-native`, `/collapsible` |
| `FolderPreview` | 확장(미리보기 표지가 달린 묶음, optional-extension) | `/folder-preview` | `/folder-preview` |

`FolderPreview`는 granular subpath로만 import 된다. 추가 peer는 없다.

## 최소 사용 예

```tsx
// Web
import { Collapsible } from "@hjmds/react/collapsible";

<Collapsible trigger={t("filters.more")} defaultOpen={false}>
  <FilterFields />
</Collapsible>
```

```tsx
// Native
import { Collapsible } from "@hjmds/react-native/collapsible";

<Collapsible trigger={t("post.showMore")} open={expanded} onOpenChange={setExpanded}>
  <PostBody />
</Collapsible>
```

`FolderPreview`는 Web·Native가 같은 props다(Web만 `layoutStyle`을 더 받는다).

```tsx
// Native
import { FolderPreview } from "@hjmds/react-native/folder-preview";

<FolderPreview
  label={t("album.folderLabel", { count: photos.length })}
  open={open}
  onOpenChange={setOpen}
  previews={photos.slice(0, 3).map((photo) => <PhotoThumb key={photo.id} photo={photo} />)}
>
  <PhotoList photos={photos} />
</FolderPreview>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `open` + `onOpenChange` | `boolean` + `(open: boolean) => void` | — | 제어. `open`만 주고 `onOpenChange`를 빼면 `TypeError`를 던진다 |
| `defaultOpen` · `onOpenChange` | `boolean` · `(open: boolean) => void` | `defaultOpen` `false` | 비제어. `open`과 `defaultOpen`을 함께 주면 `TypeError`를 던진다 |
| `trigger` | `ReactNode` | 필수 | 버튼 문구. Native는 문자열이면 HJM `Text`로 감싼다 |
| `disabled` | `boolean` | `false` | trigger 옆의 ▸/▾ 표시는 HJM이 그리며 장식으로 숨겨진다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 배치 |
| `FolderPreview` `open` · `onOpenChange` | `boolean` · `(open: boolean) => void` | 필수(항상 controlled) | — |
| `FolderPreview` `previews` · `label` | `readonly ReactNode[]` · `string` | 필수 | `previews`는 앞의 세 개만 그리고, `label`이 비면 `TypeError`를 던진다 |
| `FolderPreview` `layoutStyle` | margin·width·flex·`alignSelf` | — | Web만 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 트리거는 폭을 꽉 채운다. 트리거 최소 높이 44(`control.minTouchTarget`, 두 플랫폼. Native는 미게시(1.12.1 이후)), Web 위아래 `spacing.xs` 8. `FolderPreview` 표지는 최대 260×160 고정 그림 | `.hjm-collapsible__trigger`, `react-native/src/collapsible.tsx`, `react/src/folder-preview.tsx` |
| 간격 | 트리거↔내용, 트리거 안 문구↔표시 `spacing.xs` 8(Web 트리거 안은 `spacing.sm` 12) | `collapsibleRecipe.gap`, `.hjm-collapsible__trigger` |
| 순서·정렬 | 위→아래 [트리거: 문구 시작 쪽 · ▸/▾ 끝 쪽] → [내용(열렸을 때만)]. `FolderPreview`는 트리거 안에 [표지 그림(가운데)] → [label]이 쌓인다 | `react/src/collapsible.tsx`, `react/src/folder-preview.tsx` |
| 고정·스크롤 | 고정 영역이 없다. 닫히면 내용이 트리에서 빠져 아래 내용이 올라온다 | `react-native/src/collapsible.tsx` 주석 |
| 좁은 폭·큰 글자 | 트리거 문구·내용이 줄바꿈된다(`overflow-wrap: anywhere`). `FolderPreview` 표지는 폭이 260보다 좁으면 줄어든다(`maxWidth: 260`) | `.hjm-collapsible__content`, `folder-preview.tsx` |

## 꼭 지킬 것

- `trigger`는 무엇이 열리는지 알 수 있는 i18n 문구로 넣는다. trigger 안에 다른 버튼·링크를 넣지 않는다(trigger 자체가 버튼이다).
- 닫힌 내용은 unmount된다. 닫혀도 유지해야 할 입력 상태는 바깥에서 들고 있는다.
- `FolderPreview`의 `previews`는 장식이다(접근성·터치에서 숨김). 항목 이름과 행동은 펼친 `children`에 다시 둔다.
  미리보기 이미지·라벨 문구는 제품 소유다.
- 배치는 `layoutStyle`로 한다. Native `style`은 deprecated(개발 모드 1회 경고, 다음 major 제거)다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 | `layoutStyle`(`FolderPreview`도) | `layoutStyle`. `style`은 deprecated — `layoutStyle`을 쓴다. `FolderPreview`는 배치 prop이 없다 |
| 열린 영역 관계 | `aria-controls` + `role="region"` | 중첩 구조, `accessibilityState.expanded` |
| 문자열 trigger | 그대로 버튼 내용 | HJM `Text`로 감싼다 |
| `FolderPreview` 모션 | CSS transform, reduced motion이면 없음 | `ContentTransition`(`scale`) |

## 함정

- 현재 랜딩 스토리(Web·Native `Landing.stories.tsx`)는 FAQ 여러 항목을 `Collapsible` 반복으로 그린다. 서로 연결된
  여러 항목은 [Accordion](accordion.md)이 규칙이다(한 번에 하나 펼침·키보드 이동·heading 위계를 Accordion이 소유한다).
