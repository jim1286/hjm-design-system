# AspectRatio

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [AspectRatio contract](../../aspect-ratio.md), recipe `aspectRatioRecipe`(`src/aspect-ratio.ts`)
- 스토리북: `배포/컴포넌트/레이아웃/화면 비율`

## 언제 쓰나

이미지·동영상·지도처럼 늦게 로드되는 매체의 자리를 미리 잡아 레이아웃 흔들림을 막을 때 쓴다.
폭은 부모를 채우고 높이는 비율로 정해진다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 이미지 로드·실패 상태까지 다룸 | [Image](image.md) (비율 틀이 필요하면 AspectRatio 안에 넣는다) |
| 아이콘·이미지·Lottie를 같은 정사각 액자에 맞춤 | [Asset](asset.md) |
| 프로필 사진 | [Avatar](avatar.md) |
| 비율이 아닌 고정 폭 컬럼 | [Grid](grid.md), [Container](container.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `AspectRatio` | 기본 | `@hjmds/react`, `/layout` | `@hjmds/react-native`, `/primitives` |

## 최소 사용 예

```tsx
// Web
import { AspectRatio } from "@hjmds/react/layout";

<AspectRatio ratio="wide">
  <img src={cover.url} alt={t("post.coverAlt")} style={{ objectFit: "cover" }} />
</AspectRatio>
```

```tsx
// Native
import { Image } from "react-native";
import { AspectRatio } from "@hjmds/react-native/primitives";

<AspectRatio ratio="landscape">
  <Image source={{ uri: cover.url }} accessibilityLabel={t("post.coverAlt")}
    style={{ width: "100%", height: "100%" }} resizeMode="cover" />
</AspectRatio>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `ratio` | `square`(1) · `portrait`(3/4) · `landscape`(4/3) · `wide`(16/9) 또는 양의 유한수(가로/세로) | `wide` | 0·음수·`Infinity`는 `RangeError`, 모르는 preset 이름은 `TypeError`로 렌더 중에 거절한다. Web은 `data-ratio`에 preset 이름 또는 `custom`을 남긴다 |
| `children` | `ReactNode` | — | 매체 하나 |
| Web `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 배치 전용. 비율·`width`는 덮지 않는다 |
| Native `style` | `ViewProps["style"]` | — | layout primitive라 deprecated가 아니다. 배치 key만 넣는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭은 항상 부모를 꽉 채우고(`width: 100%`) 높이는 비율에서 나온다. AspectRatio에 높이를 주지 않는다. 자식은 틀을 100%×100%로 채운다 | `aspectRatioRecipe.sizing`, `.hjm-aspect-ratio`, `react-native/src/primitives.tsx` |
| 간격 | 자체 여백이 없다. 카드 안 썸네일이면 카드의 안쪽 간격을 따른다 | `.hjm-aspect-ratio` |
| 순서·정렬 | 카드·상세의 맨 위 매체 자리에 두고 제목·본문이 아래로 이어진다. 모서리는 감싸는 Card나 자식이 정한다 | `aspectRatioRecipe.slots` |
| 고정·스크롤 | 고정 영역이 없다 | — |
| 좁은 폭·큰 글자 | 비율은 그대로이고 높이만 줄어든다. 세로가 긴 비율(`portrait`, `9 / 16`)은 화면 높이를 넘지 않도록 부모 폭을 제한한다 | `aspectRatioRecipe.ratios` |

## 꼭 지킬 것

- 대체 텍스트, `object-fit`/`resizeMode`, 모서리, 로딩·오류 표시는 자식과 제품이 소유한다. 틀은 비율만 보장한다.
- 숫자 비율은 가로/세로다. 9:16 세로 영상은 `9 / 16`이다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구현 | CSS `aspect-ratio` | `ViewStyle.aspectRatio` + `width: "100%"` |
| 자식 크기 | CSS가 직계 자식을 틀 크기로 늘린다 | 늘리지 않는다. 자식에 `width/height: "100%"`나 `flex: 1`을 준다 |
| 추가 props | `div` 속성 전체(`className`, `style`) + `layoutStyle` | `View` 속성 전체(`style`). `layoutStyle` 없음 |

## 함정

- Native에서 `Image`에 크기를 주지 않으면 틀만 잡히고 그림이 보이지 않는다(위 표).
- Web `style`에 `aspectRatio`를 넣으면 `ratio`를 덮는다(사용자 `style`이 뒤에 펼쳐진다). 비율은 `ratio`로만 주고 배치는 `layoutStyle`로 준다.
  `layoutStyle`은 `aspectRatio`보다 먼저 펼쳐지므로 비율을 덮지 못한다.
