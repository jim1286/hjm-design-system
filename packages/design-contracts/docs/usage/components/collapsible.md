# Collapsible

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-20
- 근거: [Collapsible](../../collapsible.md), `FolderPreview`는 [Folder preview](../../folder-preview.md), recipe `collapsibleRecipe`(`src/collapsible.ts`)
- 스토리북: `배포/컴포넌트/데이터 표시/접기와 펼치기` · `배포/컴포넌트/데이터 표시/폴더 미리보기`

## 언제 쓰나

이웃 없이 혼자 접었다 펴는 한 덩어리에 쓴다. "더 보기", 필터 패널, 접히는 본문이 여기에 속한다.
기본값에서는 닫히면 내용은 트리에서 빠진다. `keepMounted`는 로컬 입력을 보존하고 hidden/display:none 접근성 경계로 내용을 숨긴다.

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
| `triggerLabel` | `string` | — | 미게시 로컬 소스. 그림뿐인 trigger 또는 보이는 문구보다 자세한 행동 이름. Web aria-label·Native accessibilityLabel에 연결하며 생략하면 기존 자식 문구를 사용한다 |
| `title` | `ReactNode` | — | 미게시 로컬 소스. 버튼 밖 정적 제목. 제목 시작 쪽·펼침 행동 끝 쪽으로 공통 헤더가 배치한다. heading 위계는 제품이 title 슬롯에 지정한다 |
| `pendingLabel` | `string` | — | 미게시 로컬 소스. 준비 중 펼침 버튼을 작은 Spinner로 교체하고 본문을 숨긴다. 제목/최소 높이44는 유지하며 root는 busy다. 완료해도 자동으로 펼치지 않는다 |
| `disabled` | `boolean` | `false` | trigger 옆의 펼침 표시(닫힘 `chevronEnd`·열림 `chevronDown`, glyph.sm 20)는 HJM이 그리며 장식으로 숨겨진다. 닫힘 표시는 RTL에서 읽기 끝 쪽으로 뒤집힌다 |
| `marker` | `end` · `none` | `end` | `none`이면 표시를 그리지 않고, 한 줄이 아닌 trigger가 `CollapsibleMarker`(`open`)를 직접 둔다(FolderPreview가 사용) |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 배치 |
| `FolderPreview` `open` · `onOpenChange` | `boolean` · `(open: boolean) => void` | 필수(항상 controlled) | — |
| `FolderPreview` `previews` · `label` | `readonly ReactNode[]` · `string` | 필수 | `previews`는 앞의 세 개만 그리고, `label`이 비면 `TypeError`를 던진다 |
| `FolderPreview` `layoutStyle` | margin·width·flex·`alignSelf` | — | Web만 |

## 배치

FolderPreview의 Native preview `md`와 앞면 `lg`는 Provider radius를 읽는다. 기존 Collapsible·전환·장식 접근성 제외를 유지한다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 트리거는 폭을 꽉 채운다. 트리거 최소 높이 44(`control.minTouchTarget`, 두 플랫폼. Native는 1.13.0 변경), Web 위아래 `spacing.xs` 8. `FolderPreview` 표지는 최대 260×160 고정 그림 | `.hjm-collapsible__trigger`, `react-native/src/collapsible.tsx`, `react/src/folder-preview.tsx` |
| 간격 | 트리거↔내용, 트리거 안 문구↔표시 `spacing.xs` 8(Web 트리거 안은 `spacing.sm` 12) | `collapsibleRecipe.gap`, `.hjm-collapsible__trigger` |
| 순서·정렬 | 위→아래 [트리거: 문구 시작 쪽 · 펼침 표시 끝 쪽] → [내용(열렸을 때만)]. `FolderPreview`는 트리거 안에 [표지 그림] → [label · 펼침 표시 한 줄]이 가운데 정렬로 쌓이고, 그림과 label 사이는 `spacing.sm` 12다(2026-10-17, label이 시작 쪽·표시가 끝 쪽에 떨어져 있던 것을 고침) | `react/src/collapsible.tsx`, `react/src/folder-preview.tsx` |
| 고정·스크롤 | 고정 영역이 없다. 닫히면 내용이 트리에서 빠져 아래 내용이 올라온다 | `react-native/src/collapsible.tsx` 주석 |
| 좁은 폭·큰 글자 | 트리거 문구·내용이 줄바꿈된다(`overflow-wrap: anywhere`). `FolderPreview` 표지는 폭이 260보다 좁으면 줄어든다(`maxWidth: 260`) | `.hjm-collapsible__content`, `folder-preview.tsx` |

## 꼭 지킬 것

- `trigger`는 무엇이 열리는지 알 수 있는 i18n 문구로 넣는다. trigger 안에 다른 버튼·링크를 넣지 않는다(trigger 자체가 버튼이다).
- 기본 `keepMounted=false`에서는 닫힌 내용이 unmount된다. 다시 열 때 로컬 입력을 유지하려면 `keepMounted`를 쓰거나 입력 상태를 바깥에서 관리한다. 숨겨진 내용의 접근성·초점 차단은 HJM이 유지한다.
- `FolderPreview`의 `previews`는 장식이다(접근성·터치에서 숨김). 항목 이름과 행동은 펼친 `children`에 다시 둔다.
  미리보기 이미지·라벨 문구는 제품 소유다.
- 배치는 `layoutStyle`로 한다. Native `style`은 제거된 속성이다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 | `layoutStyle`(`FolderPreview`도) | `layoutStyle`. `style`은 제거된 속성 — `layoutStyle`을 쓴다. `FolderPreview`는 배치 prop이 없다 |
| 열린 영역 관계 | `aria-controls` + `role="region"` | 중첩 구조, `accessibilityState.expanded` |
| 문자열 trigger | 그대로 버튼 내용 | HJM `Text`로 감싼다 |
| `FolderPreview` 모션 | CSS transform, reduced motion이면 없음 | `ContentTransition`(`scale`) |

## 함정

- 현재 랜딩 스토리(Web·Native `Landing.stories.tsx`)는 FAQ 여러 항목을 `Collapsible` 반복으로 그린다. 서로 연결된
  여러 항목은 [Accordion](accordion.md)이 규칙이다(한 번에 하나 펼침·키보드 이동·heading 위계를 Accordion이 소유한다).

### 프로필 도구의 표현

2026-10-07 테마 전환 시 입력이 사라지는 문제를 피하려고 `presentation="inline"`과 `keepMounted`를 추가했다.
inline은 트리거를 숨기고 항상 내용을 펼친다. 기본 disclosure는 기존 open/defaultOpen 규칙을 유지한다.
keepMounted가 있어도 닫힌 내용은 포커스·스크린리더·터치 대상에서 제외한다. 단순 read-only 내용은 기존 기본값을 쓴다.

Web에서 외부 상태 변경으로 닫힐 때 내부에 있던 초점은 trigger로 돌아간다. 동시에 disabled면 disclosure host로 복구하고, 이미 외부로 이동한 초점은 유지한다. 열린 도구를 trigger로 직접 닫으면 해당 버튼에 초점을 유지하므로 Enter로 다시 열 수 있다.

## 근거

- `edge` 축을 두지 않는다: 2026-10-17 1.27.2 채택 점검. 포트폴리오 사이트 헤더 끝 메뉴 트리거(402)의 펼침 표시 칸 끝은 화면 끝에서 36이었는데, 트리거 자체는 좌우 padding 0이고 표시 칸 끝이 트리거 끝과 같다(Storybook 측정: 표시 칸 끝 = 트리거 끝 = 루트 끝). 36은 제품이 TopBar(자기 여백 16)를 `Container gutter="regular"`(20) 안에 둔 결과다. IconButton/Button `edge`는 frameless 컨트롤의 안쪽 padding만큼 바깥으로 내미는 규칙인데 이 트리거는 내밀 padding이 없어 `edge`는 아무것도 바꾸지 못한다. 위치는 제품의 겹친 여백에서 고친다.
- 2026-10-17 구성 리뷰: 텍스트 표시 ▸가 약 8px로 그려져 트리거가 정적 문구처럼 보였다. 그래서 두 플랫폼 모두 glyph.sm 20 chevron 아이콘으로 바꿨다.

2026-10-20 번뚝 평가 영역의 제목/펼치기·로딩 헤더 복제를 없애기 위해 `title`과 `pendingLabel`을 양 renderer에 제공한다. 제목은 버튼 이름과 분리하고, 준비 중에도 같은 행동 위치·최소 높이를 유지한다. 기존 제목 없는 trigger와 inline은 유지한다. Web에서 열린 내용에 초점이 있는 동안 준비 상태로 바뀌면 trigger도 없으므로 host로 복구한다.


2026-10-20 Spint의 꽃 비율은 제품 그림을 눌러 설명을 펼치면서 자체 Pressable·expanded·조건부 본문을 소유했다. 그림만 있는 trigger의 행동 이름을 `triggerLabel`로 지정하고 `marker="none"`으로 기존 그림을 유지한다. HJM은 최소44 target·펼침 상태·숨긴 본문 경계를 소유하며, 꽃/색상 비율 계산과 햅틱은 제품에 남긴다. 기존 문자열 trigger의 이름은 변하지 않는다.

```tsx
<Collapsible trigger={<DistributionArtwork />} triggerLabel={t(open ? "distribution.hide" : "distribution.show")}
  marker="none" open={open} onOpenChange={setOpen}>
  <DistributionLegend />
</Collapsible>
```
