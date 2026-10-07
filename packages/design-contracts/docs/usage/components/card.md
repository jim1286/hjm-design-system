# Card

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: recipe `cardRecipe`(`src/card.ts`), 바탕 `surfaceRecipe`(`src/base-recipes.ts`). 별도 계약 문서는 없다
- 스토리북: `배포/컴포넌트/데이터 표시/카드`

## 언제 쓰나

문서 metadata·미리보기·내보내기 상태는 실험 구성 [DocumentResource](../compositions/document-resource.md)를
먼저 대조한다. 2026-10-07 파일 사례에서 일반 카드만으로 다운로드/저장 상태까지 동등하다고
판단할 수 없음을 확인해 별도 구성으로 연결했다.


제목·설명·본문·행동이 한 덩어리로 읽히는 독립된 콘텐츠 단위에 쓴다. 주문 요약, 설정 묶음,
미리보기처럼 화면 안에서 경계가 보여야 하는 블록이 여기에 속한다. 위에서부터
`media` → `leading`+`title`+`description` → `children` → `actions` 순서가 고정이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 목록의 한 행(누르면 상세로 이동) | [ListRow](list-row.md) |
| 제목 없는 배경·테두리 영역만 필요 | [Surface](surface.md) |
| 숫자 하나가 주인공인 요약 | [Statistic](statistic.md) |
| 비어 있음·결과 안내 | [EmptyState](empty-state.md), [Result](result.md) |
| 접고 펴는 묶음 | [Collapsible](collapsible.md), [Accordion](accordion.md) |
| 화면 섹션 제목과 본문 묶음 | [Section](section.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Card` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |
| `DocumentResource` | 실험 문서 구성 | `@hjmds/react/document-resource` | `@hjmds/react-native/document-resource` |

## 최소 사용 예

```tsx
// Web
import { Card } from "@hjmds/react/display";
import { Button } from "@hjmds/react/actions";

<Card
  title={t("order.summary.title")}
  description={t("order.summary.description")}
  actions={<Button tone="secondary" onClick={openDetail}>{t("order.summary.detail")}</Button>}
>
  {summary}
</Card>
```

```tsx
// Native
import { Card } from "@hjmds/react-native/data-display";
import { Button } from "@hjmds/react-native/actions";

<Card
  title={t("order.summary.title")}
  description={t("order.summary.description")}
  actions={<Button tone="secondary" onPress={openDetail}>{t("order.summary.detail")}</Button>}
>
  {summary}
</Card>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `tone` | `default` · `raised` · `accent` · `sunken` · `subtle`(Surface tone) | `default` | — |
| `bordered` | `boolean` | `true` | Surface 기본 `false`와 다르다 |
| `padding` | spacing 이름 | `md`(16) | — |
| `radius` | radius 이름 | `lg`(foundation 16) | 선택한 designProfile의 같은 radius 역할로 frame과 media clip을 함께 변경 |
| `selected` | `boolean` | `false` | `true`면 tone이 `accent`로 바뀐다(`cardRecipe.selectedTone`) |
| `headingLevel`(Web만) | `2` · `3` · `4` | `3` | 제목이 `h3`로 렌더되므로 문서 위계에 맞춰 고른다 |
| `title` · `description` · `leading` · `media` · `actions` · `children` | `ReactNode` | — | 슬롯. 순서는 HJM이 고정한다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. 두 플랫폼 모두 root Surface에 적용된다 |

Card 자체에는 콜백이 없다. 누름 행동은 `actions`의 Button(Web `onClick: (event: MouseEvent<HTMLButtonElement>) => void`, Native `onPress`)이 갖는다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 부모 폭을 채우고 높이는 내용이 정한다. 모서리 `radius.lg` 16, 테두리 기본 있음. `media` 자식은 폭 100%(비율은 [AspectRatio](aspect-ratio.md)로) | `cardRecipe.defaults`, `.hjm-card__media > *` |
| 간격 | 본문 안쪽 `spacing.md` 16, 본문 요소 사이 `spacing.xs` 8, leading↔제목 `spacing.sm` 12. 행동 영역은 좌우·아래 `spacing.md` 16, 버튼 사이 `spacing.sm` 12. 카드 목록 사이 간격은 부모 [Stack](stack.md)·[Grid](grid.md)이 정한다 | `cardRecipe.body`·`header`·`actions`, `.hjm-card*` |
| 순서·정렬 | 위→아래 `media` → [`leading` + `title`/`description`] → `children` → `actions` 고정. leading은 시작 쪽 위 정렬. 행동은 시작 쪽부터 한 줄로 놓인다 | `cardRecipe.slots`, `.hjm-card__header`·`__actions` |
| 고정·스크롤 | 고정 영역이 없다. 카드 안에서 스크롤 영역을 만들지 않는다(넘치면 `overflow: hidden`으로 잘린다) | `.hjm-card { overflow: hidden }` |
| 좁은 폭·큰 글자 | 제목·설명이 줄바꿈되고, 행동은 줄바꿈된다(`flex-wrap: wrap`) | `.hjm-card__title`, `.hjm-card__actions`, `react-native/src/data-display.tsx` |

## 꼭 지킬 것

- 제목·설명·행동 라벨은 i18n 키로 넣는다. 제품 데이터는 `children`과 `media`에 둔다.
- `media`(대표 이미지·일러스트)는 제품 소유다. 카드 모서리 clip과 구조는 HJM이 맡는다.
- 색·radius·padding은 `tone`·`radius`·`padding` 축으로만 바꾼다. 카드마다 브랜드 색을 칠하지 않는다.
- 배치는 두 플랫폼 모두 `layoutStyle`로 한다. Native `CardProps`에는 `style`이 없다. Web의 `className`·`style`로 recipe 값을 덮지 않는다.
  카드 목록 사이 간격은 바깥 [Stack](stack.md)·[Grid](grid.md)이 정한다.
- Card 자체는 누름 행동이 없다(Native는 `onPress`가 없다). 카드 안 행동은 `actions`의 Button으로 둔다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| root | `<article>` | `View`(Surface) |
| 제목 | `h{headingLevel}` | `Text` + `accessibilityRole="header"`, 수준 지정 없음 |
| 배치 | `layoutStyle` | `layoutStyle` |
| 내용 clip | tone의 `clipsContent`(`raised`는 그림자 때문에 clip 안 함) | 내부 `View`가 항상 clip, 그림자는 바깥에 남는다. frame과 clip이 같은 Provider radius token을 사용 |

## 함정

- `radius="lg"`는 모든 테마에서 16px이라는 뜻이 아니다. foundation에서는 16이고, designProfile이
  등록되면 그 테마의 `tokens.radius.lg`를 쓴다. 2026-10-07 카드 갤러리 비교에서 Native의 바깥
  Surface만 테마를 따르고 내부 media clip은 foundation 값을 쓰는 누락을 발견해 같은 token으로 연결했다.

- `selected`는 tone만 바꾼다. Web은 `data-state="selected"` 속성뿐이고 Native는 접근성 state를
  알리지 않는다. 선택 가능한 카드 목록이라면 선택 상태를 문구나 다른 컨트롤로도 전달한다.
