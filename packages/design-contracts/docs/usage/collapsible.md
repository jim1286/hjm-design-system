# Collapsible 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Collapsible](../collapsible.md), `FolderPreview`는 [Folder preview](../folder-preview.md),
recipe `collapsibleRecipe`(`src/collapsible.ts`)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Collapsible` | `@hjmds/react`, `/collapsible` | `@hjmds/react-native`, `/collapsible` | 기본 |
| `FolderPreview` | `/folder-preview` | `/folder-preview` | 미리보기 표지가 달린 묶음(optional-extension) |

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

```tsx
// FolderPreview (Web·Native 동일 props)
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

- 상태: `open`+`onOpenChange`(controlled) 또는 `defaultOpen`(기본 `false`). `open`과 `defaultOpen`을 함께 주거나
  `open`만 주고 `onOpenChange`를 빼면 `TypeError`를 던진다.
- `disabled`: 기본 `false`. trigger 옆의 ▸/▾ 표시는 HJM이 그리며 장식으로 숨겨진다.
- `FolderPreview`는 항상 controlled다. `previews`는 앞의 세 개만 그리고, `label`이 비면 `TypeError`를 던진다.

## 꼭 지킬 것

- `trigger`는 무엇이 열리는지 알 수 있는 i18n 문구로 넣는다. trigger 안에 다른 버튼·링크를 넣지 않는다(trigger 자체가 버튼이다).
- 닫힌 내용은 unmount된다. 닫혀도 유지해야 할 입력 상태는 바깥에서 들고 있는다.
- `FolderPreview`의 `previews`는 장식이다(접근성·터치에서 숨김). 항목 이름과 행동은 펼친 `children`에 다시 둔다.
  미리보기 이미지·라벨 문구는 제품 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 | `className`만(`style`·`layoutStyle` 없음) | `style`(`StyleProp<ViewStyle>`, `layoutStyle` 없음) |
| 열린 영역 관계 | `aria-controls` + `role="region"` | 중첩 구조, `accessibilityState.expanded` |
| 문자열 trigger | 그대로 버튼 내용 | HJM `Text`로 감싼다 |
| `FolderPreview` 모션 | CSS transform, reduced motion이면 없음 | `ContentTransition`(`scale`) |
