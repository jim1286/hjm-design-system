# Image 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Image](../image.md), [GridReveal](../grid-reveal.md), [ImageViewer](../optional-adapters.md#behavior-boundaries),
recipe `imageRecipe`(`src/image.ts`)

## 언제 쓰나

원본 크기를 아는 사진·차트 이미지를 로드 전에 자리를 잡아 두고, 실패해도 의미를 잃지 않게 보여 줄 때 쓴다.
로드 완료 순간 격자 마스크로 드러내려면 `GridReveal`로 감싸고, Native에서 사진을 크게 넘겨 보며
확대하려면 `ImageViewer`를 연다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 의미 이름으로 고르는 그림 기호 | [Icon](icon.md) |
| 사람·계정 얼굴, 이니셜 대체 | [Avatar](avatar.md) |
| 제품 일러스트·자산 묶음 | [Asset](asset.md) |
| 크기를 모르는 임의 콘텐츠의 비율 고정 | [AspectRatio](aspect-ratio.md) |
| 여러 장을 넘겨 보는 띠 | [Carousel](carousel.md) |
| 높이가 다른 사진 카드 격자 | [Masonry](masonry.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Image` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` | 기본 |
| `GridReveal` | `/grid-reveal` | `/grid-reveal` | 로드 완료 시 4×4 마스크 연출(optional) |
| `ImageViewer` | 없음 | `/image-viewer` | 전체 화면 넘겨 보기·확대(optional) |

`GridReveal`은 추가 peer가 없다. `ImageViewer`는 granular subpath로만 import 되며 optional peer
`react-native-zoom-toolkit` 5.1.1, `react-native-gesture-handler` 2.32.0과 Reanimated·Worklets 설치가 필요하다.
Expo Go로는 검증할 수 없고 개발 클라이언트가 필요하다. tsc·테스트 통과는 peer 설치의 근거가 아니다.

## 최소 사용 예

```tsx
// Web — next/image 같은 adapter는 renderImage로 연결
import { Image } from "@hjmds/react/display";
import { GridReveal } from "@hjmds/react/grid-reveal";

<GridReveal ready={loaded}>
  <Image src={photo.url} width={photo.width} height={photo.height}
    onLoadStatusChange={(status) => setLoaded(status === "loaded")} />
</GridReveal>
```

```tsx
// Native
import { Image } from "@hjmds/react-native/data-display";
import { ImageViewer } from "@hjmds/react-native/image-viewer";

<Image src={chart.url} width={800} height={450}
  decorative={false} accessibilityLabel={t("stats.chartAlt")} layoutStyle={{ width: "100%" }} />

<ImageViewer open={viewerOpen} onClose={() => setViewerOpen(false)} items={photos}
  safeAreaInsets={insets} closeLabel={t("common.close")} previousLabel={t("viewer.prev")}
  nextLabel={t("viewer.next")} loadingLabel={t("common.loading")}
  errorLabel={t("viewer.loadFailed")} retryLabel={t("common.retry")} />
```

## 축과 기본값

- `src`, `width`, `height`(필수, 양의 유한수). 비율로 자리를 예약하고 루트 폭 기본값은 `width`다.
- `fit`: `cover`(기본) · `contain` · `fill`(Native `stretch`로 번역).
- 기본은 장식이다. 이미지만으로 정보를 전하면 `decorative: false`와 현지화된 `accessibilityLabel`을 함께 준다.
- 실패하면 중립 배경 위에 오류 기호를 그리고, 정보 이미지의 이름은 그대로 유지한다. `fallback`은 시각만 바꾼다.
- GridReveal: `ready` 필수, `active` 기본 true. ImageViewer: `items`(`id`·`uri`·`label`), 라벨 6종,
  `safeAreaInsets`가 필수이고 `initialIndex` 기본 0.

## 꼭 지킬 것

- 장식인데 라벨을 주거나 정보인데 라벨을 빼면 `TypeError`가 난다.
- GridReveal의 `ready`는 `onLoadStatusChange`가 `loaded`일 때만 true, 오류·소스 변경·재시도 전에는 false로 돌린다.
  Native에서 화면이 가려진 채 mounted면 `active={false}`.
- ImageViewer는 `open`으로 제어하고 닫히면 상태를 버린다. 라벨·`id`가 비거나 중복이면 `TypeError`.
- 원격 이미지 권한·URL 수명·캐시는 제품 소유다. HJM은 메타데이터를 가져오지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 | 루트 `style`/`className`(기본 `inline-size: width`, `max-inline-size: 100%`) | `layoutStyle`(루트 프레임) |
| 이미지 host 스타일 | `imageProps.style`/`className` | `style`(ImageStyle) |
| 다른 이미지 엔진 | `renderImage`(받은 props를 `<img>`까지 전달) | `renderImage`(예: expo-image), `sourceAdapter`(헤더·캐시) |
| 확대 보기 | 없음 | `ImageViewer` |

## 함정

- `renderImage` adapter가 받은 `onLoad`·`onError`를 실제 이미지 요소에 넘기지 않으면 HJM이 실패를 보지 못해
  대체 화면과 GridReveal의 `ready`가 동작하지 않는다.
- Native 루트 폭은 `width` 숫자 그대로다. 화면 폭에 맞추려면 `layoutStyle`로 폭을 준다.
