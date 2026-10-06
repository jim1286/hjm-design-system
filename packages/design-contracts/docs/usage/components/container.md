# Container

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Container contract](../../container.md), recipe `containerRecipe`(`src/container.ts`)
- 스토리북: `배포/컴포넌트/레이아웃/컨테이너`

## 언제 쓰나

화면 본문의 최대 폭과 좌우(논리 방향) 여백을 맞출 때 쓴다. 글 읽기 화면은 `reading`,
일반 제품 화면은 `content`, 지도·갤러리처럼 의도적으로 가득 채우는 영역은 `full`을 고른다.
가운데 정렬은 항상 inline 축 기준이라 RTL에서도 그대로 동작한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면 전체 틀(상단 바·스크롤·하단 행동) | [Layout](layout.md) |
| 자식 사이 간격·정렬 | [Stack](stack.md) |
| 반응형 열 배치 | [Grid](grid.md) |
| 배경·테두리가 있는 영역 | [Surface](surface.md), [Card](card.md) |
| 비율이 고정된 미디어 틀 | [AspectRatio](aspect-ratio.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Container` | 기본 | `@hjmds/react`, `/layout` | `@hjmds/react-native`, `/primitives` |

## 최소 사용 예

```tsx
// Web
import { Container } from "@hjmds/react/layout";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const gutter = resolveWindowClass(window.innerWidth) === "compact" ? "compact" : "regular";

<Container size="reading" gutter={gutter}>
  <article>{body}</article>
</Container>
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { Container } from "@hjmds/react-native/primitives";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const { width } = useWindowDimensions();
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";

<ScrollView>
  <Container size="content" gutter={gutter}>{children}</Container>
</ScrollView>
```

Native는 `ScrollView`가 세로 스크롤을, 그 안의 Container가 좌우 여백을 맡는다. `ScrollView`에 좌우 padding을 직접 주지 않는다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `size` | `"reading"`(최대 720) · `"content"`(최대 1200) · `"full"`(최대 폭 없음) | `"content"` | — |
| `gutter` | `"none"`(0) · `"compact"`(16) · `"regular"`(20) · `"spacious"`(24) | `"regular"` | 구간 객체(`{ compact: … }`)는 받지 않는다. 폭 600 미만(`resolveWindowClass` `compact`)은 `"compact"`, 그 이상은 `"regular"`를 골라 넘긴다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 배치 |
| 허용 값 검사 | — | — | 허용하지 않는 값은 `resolveContainerDescriptor`가 `TypeError`로 막는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 부모 폭을 채우되 최대 폭 `reading` 720(`layout.readingMaxWidth`) · `content` 1200(`layout.contentMaxWidth`) · `full` 제한 없음. 높이는 내용이 정한다 | `containerRecipe.maxWidths` |
| 간격 | 좌우 gutter `none` 0 · `compact` `spacing.md` 16 · `regular` `spacing.lg` 20 · `spacious` `spacing.xl` 24. 위아래 여백·자식 사이 간격은 없다([Stack](stack.md)이 정한다) | `containerRecipe.gutters` |
| 순서·정렬 | 페이지 본문·섹션 바깥에서 가로 가운데 정렬(inline 축, RTL에서도 같다). 글 위주 화면은 `reading`, 목록·대시보드는 `content` | `containerRecipe.alignment` |
| 고정·스크롤 | 고정 영역도 스크롤도 만들지 않는다. 스크롤은 화면이 소유한다 | `.hjm-container` |
| 좁은 폭·큰 글자 | 최대 폭보다 좁으면 부모 폭을 그대로 쓰고 gutter만 남는다. 좁은 폭에서는 `compact` gutter를 고려한다 | `resolveContainerDescriptor` |

## 꼭 지킬 것

- 최대 폭과 여백은 `size`·`gutter`로만 고른다. 임의 px `maxWidth`나 좌우 padding을 제품마다
  새로 정하지 않는다(배제 이유는 [계약](../../container.md#배제한-축)).
- 바깥 배치(margin·flex)는 `layoutStyle`로 한다. `style`로 `maxWidth`·`padding`을 덮으면
  계약 폭이 사라진다(두 renderer 모두 `style`이 recipe 값 뒤에 합쳐진다). Native `style`은 deprecated —
  `layoutStyle` 또는 `size`·`gutter`를 쓴다.
- Container는 배경·테두리·스크롤을 갖지 않는다. 필요하면 바깥 컴포넌트가 맡는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 폭 | `max-inline-size` | `maxWidth` + `width: "100%"` |
| 여백 | `padding-inline` | `paddingHorizontal` |
| 가운데 정렬 | `hjm-container` 스타일 | `alignSelf: "center"` |
| root | `<div>`(ref 전달) | `View` |
