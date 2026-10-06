# Container 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Container contract](../container.md), recipe `containerRecipe`(`src/container.ts`)

## 언제 쓰나

화면 본문의 최대 폭과 좌우(논리 방향) 여백을 맞출 때 쓴다. 글 읽기 화면은 `reading`,
일반 제품 화면은 `content`, 지도·갤러리처럼 의도적으로 가득 채우는 영역은 `full`을 고른다.
가운데 정렬은 항상 inline 축 기준이라 RTL에서도 그대로 동작한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면 전체 틀(상단 바·스크롤·하단 행동) | [ScreenLayout](screen-layout.md), [Layout](layout.md) |
| 자식 사이 간격·정렬 | [Stack](stack.md) |
| 반응형 열 배치 | [Grid](grid.md) |
| 배경·테두리가 있는 영역 | [Surface](surface.md), [Card](card.md) |
| 비율이 고정된 미디어 틀 | [AspectRatio](aspect-ratio.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Container` | `@hjmds/react`, `/layout` | `@hjmds/react-native`, `/primitives` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Container } from "@hjmds/react/layout";

<Container size="reading">
  <article>{body}</article>
</Container>
```

```tsx
// Native
import { Container } from "@hjmds/react-native/primitives";

<Container size="content" gutter="compact">
  {children}
</Container>
```

## 축과 기본값

- `size`: `reading`(최대 720) · `content`(기본, 최대 1200) · `full`(최대 폭 없음).
- `gutter`: `none`(0) · `compact`(16) · `regular`(기본, 20) · `spacious`(24).
- 허용하지 않는 값은 `resolveContainerDescriptor`가 `TypeError`로 막는다.

## 꼭 지킬 것

- 최대 폭과 여백은 `size`·`gutter`로만 고른다. 임의 px `maxWidth`나 좌우 padding을 제품마다
  새로 정하지 않는다(배제 이유는 [계약](../container.md#배제한-축)).
- 바깥 배치(margin·flex)는 `layoutStyle`로 한다. `style`로 `maxWidth`·`padding`을 덮으면
  계약 폭이 사라진다(두 renderer 모두 `style`이 recipe 값 뒤에 합쳐진다).
- Container는 배경·테두리·스크롤을 갖지 않는다. 필요하면 바깥 컴포넌트가 맡는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 폭 | `max-inline-size` | `maxWidth` + `width: "100%"` |
| 여백 | `padding-inline` | `paddingHorizontal` |
| 가운데 정렬 | `hjm-container` 스타일 | `alignSelf: "center"` |
| root | `<div>`(ref 전달) | `View` |
