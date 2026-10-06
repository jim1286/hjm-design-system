# Card 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: recipe `cardRecipe`(`src/card.ts`), 바탕 `surfaceRecipe`(`src/base-recipes.ts`). 별도 계약 문서는 없다.

## 언제 쓰나

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Card` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` | 기본 |

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

- `tone`: `default`(기본) · `raised` · `accent` · `sunken` · `subtle`(Surface tone).
- `bordered`: `true`(기본, Surface 기본 `false`와 다르다). `padding`: `md`(기본, 16). `radius`: `lg`(기본, 16).
- `selected`: `false`(기본). `true`면 tone이 `accent`로 바뀐다(`cardRecipe.selectedTone`).
- `headingLevel`(Web만): `2` · `3`(기본) · `4`. 제목이 `h3`로 렌더되므로 문서 위계에 맞춰 고른다.

## 꼭 지킬 것

- 제목·설명·행동 라벨은 i18n 키로 넣는다. 제품 데이터는 `children`과 `media`에 둔다.
- `media`(대표 이미지·일러스트)는 제품 소유다. 카드 모서리 clip과 구조는 HJM이 맡는다.
- 색·radius·padding은 `tone`·`radius`·`padding` 축으로만 바꾼다. 카드마다 브랜드 색을 칠하지 않는다.
- Native는 배치를 `layoutStyle`로 한다. `CardProps`에 `style`이 없다.
- Web `CardProps`에는 `layoutStyle`이 타입에 없다. 배치는 바깥 [Stack](stack.md)·[Grid](grid.md)로 하고,
  `className`·`style`로 recipe 값을 덮지 않는다.
- Card 자체는 누름 행동이 없다(Native는 `onPress`가 없다). 카드 안 행동은 `actions`의 Button으로 둔다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| root | `<article>` | `View`(Surface) |
| 제목 | `h{headingLevel}` | `Text` + `accessibilityRole="header"`, 수준 지정 없음 |
| 배치 | 바깥 레이아웃 | `layoutStyle` |
| 내용 clip | tone의 `clipsContent`(`raised`는 그림자 때문에 clip 안 함) | 내부 `View`가 항상 clip, 그림자는 바깥에 남는다 |

## 함정

- `selected`는 tone만 바꾼다. Web은 `data-state="selected"` 속성뿐이고 Native는 접근성 state를
  알리지 않는다. 선택 가능한 카드 목록이라면 선택 상태를 문구나 다른 컨트롤로도 전달한다.
