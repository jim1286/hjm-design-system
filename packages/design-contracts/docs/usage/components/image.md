# Image

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Image](../../image.md), [GridReveal](../../grid-reveal.md), [ImageViewer](../../optional-adapters.md#behavior-boundaries), recipe `imageRecipe`(`src/image.ts`)
- 스토리북: `배포/컴포넌트/데이터 표시/이미지` · `배포/컴포넌트/시각 효과/격자 등장 효과`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Image` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |
| `GridReveal` | 확장 — 로드 완료 시 4×4 마스크 연출(optional) | `/grid-reveal` | `/grid-reveal` |
| `ImageViewer` | 확장 — 전체 화면 넘겨 보기·확대(optional) | — | `/image-viewer` |

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
    decorative={false} accessibilityLabel={t("gallery.photoAlt", { title: photo.title })}
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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `src`, `width`, `height` | 필수, 양의 유한수 | — | 비율로 자리를 예약하고 루트 폭 기본값은 `width`다 |
| `fit` | `cover` · `contain` · `fill` | `cover` | `fill`은 Native `stretch`로 번역 |
| `decorative` | `true` · `false` | `true` | 기본은 장식이다. 이미지만으로 정보를 전하면 `decorative: false`와 현지화된 `accessibilityLabel`을 함께 준다 |
| `accessibilityLabel` | 현지화 문구 | — | `decorative={false}`일 때만, 필수. Web은 `<img alt>`(실패 대체는 `aria-label`)로 간다. Web도 `alt` prop은 받지 않는다 |
| `fallback` | `ReactNode` | 중립 배경 + 오류 기호 | 시각만 바꾼다 |
| `onLoadStatusChange` | `(status: "loaded" \| "error") => void` | — | 로드 완료·실패를 한 번씩 알린다. GridReveal `ready`를 이 값으로 정한다 |
| `renderImage` | Web `(props: ImageAdapterProps) => ReactElement` · Native `(props: CanonicalImageRenderProps) => ReactNode` | `<img>` · RN `Image` | adapter는 받은 `onLoad`·`onError`를 실제 요소에 넘긴다 |
| Native `sourceAdapter` | `(descriptor: ResolvedImageDescriptor) => ImageSourcePropType` | — | 헤더·캐시가 필요한 원격 이미지 |
| GridReveal `ready` | `true` · `false` | — (필수) | — |
| GridReveal `active` | `true` · `false` | `true` | — |
| ImageViewer `items` | `id`·`uri`·`label` | — | 라벨 6종, `safeAreaInsets`가 필수 |
| ImageViewer `initialIndex` | 0 이상 정수 | `0` | — |
| ImageViewer `onClose` · `onIndexChange` | `() => void` · `(index: number) => void` | `onClose` 필수 | — |
| ImageViewer `safeAreaInsets` | `{ top: number; bottom: number; left?: number; right?: number }` | 필수, 좌우 0 | 버튼·caption·상태 안내를 물리적 좌우 안전 영역 안에 배치. 사진은 전체 갤러리 폭 사용 |
| ImageViewer `supportedOrientations` | RN Modal의 orientation 배열 | RN 기본값 | 제품 manifest·기기 회전 잠금 범위 안에서 허용. Modal은 fullScreen |
| ImageViewer `renderImage` | `(props: ImageViewerImageRenderProps) => ReactNode` | RN Image | Native 전용, 미게시. `item`, 측정된 `width`·`height`, `onReady`·`onError`를 전달. 제품 이미지 host의 캐시·표시 이벤트를 연결 |
| ImageViewer `onImageStatusChange` | `({ item, status }) => void` | 없음 | `loading`·`ready`·`error`. 마운트된 각 이미지 기준이며 비선택 페이지도 포함할 수 있음 |

- 실패하면 중립 배경 위에 오류 기호를 그리고, 정보 이미지의 이름은 그대로 유지한다. `fallback`은 시각만 바꾼다.

## 배치

Native 이미지 프레임은 `imageRecipe.radius` 역할을 Provider의 `tokens.radius`에서 읽는다. intrinsic 치수·대체 상태·접근성 구분은 유지한다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 자리는 `width`·`height` 비율로 미리 잡는다(Web `aspect-ratio`, Native `aspectRatio`). 로드 전후로 높이가 바뀌지 않는다. 모서리는 `radius.md` 12로 잘린다(`imageRecipe.radius`) | `design-contracts/src/image.ts`(`imageRecipe`), `design-contracts/src/foundations.ts`(`radius`), `react/src/supplemental-display.tsx`(Image) |
| 간격 | 카드 안에 넣을 때 카드 padding 안쪽에 둔다 | — |
| 순서·정렬 | 여러 장은 직접 줄 세우지 말고 [Grid](grid.md)·[Masonry](masonry.md)·[Carousel](carousel.md)로 배치한다 | — |
| 고정·스크롤 | ImageViewer는 전체 화면을 덮는다. 상·하단 버튼은 `safeAreaInsets` 안쪽에 그려지므로 호스트가 inset을 넘긴다 | `react-native/src/image-viewer.tsx` |
| 좁은 폭·큰 글자 | Web 루트는 `inline-size: width`, `max-inline-size: 100%`라 부모보다 넓어지지 않는다. Native 루트 폭은 `width` 숫자 그대로이므로 화면 폭 사진은 `layoutStyle={{ width: "100%" }}`로 준다. Grid·Masonry 칸에 채울 때 Web은 `layoutStyle={{ inlineSize: "100%" }}`(루트 `style`도 기본 `inline-size`를 덮는다), Native는 `layoutStyle={{ width: "100%" }}`로 칸 폭에 맞춘다. 원본이 칸보다 작으면 기본값으로는 좁게 남는다 | `react/src/styles.css`(`.hjm-image`), `react-native/src/data-display.tsx`(Image) |

## 꼭 지킬 것

- 장식인데 라벨을 주거나 정보인데 라벨을 빼면 `TypeError`가 난다.
- GridReveal의 `ready`는 `onLoadStatusChange`가 `loaded`일 때만 true, 오류·소스 변경·재시도 전에는 false로 돌린다.
  Native에서 화면이 가려진 채 mounted면 `active={false}`.
- ImageViewer는 `open`으로 제어하고 닫히면 상태를 버린다. 라벨·`id`가 비거나 중복이면 `TypeError`.
- ImageViewer는 불러오는 중(`loadingLabel`)과 실패(`errorLabel`)를 모두 알린다. 실패는 Android assertive live region, iOS는 `announceForAccessibility`다(미게시(1.12.1 이후). 1.12.1은 실패를 알리지 않았다).
- 원격 이미지 권한·URL 수명·캐시는 제품 소유다. HJM은 메타데이터를 가져오지 않는다.

### Native ImageViewer의 제품 이미지 호스트

Utilverse의 사진 결과 확인은 Expo `onDisplay`에 의존한다(ADR-0020). RN Image `onLoad`를
그대로 표시 완료로 간주하지 않도록 기존 optional ImageViewer에 host 슬롯을 추가했다.
HJM에 Expo 의존성을 넣거나 별도 갤러리를 복제하지 않는다. 아래는 Expo를 이미 쓰는 제품의 연결 예다.

```tsx
import { Image as ExpoImage } from "expo-image";
import { ImageViewer } from "@hjmds/react-native/image-viewer";

<ImageViewer {...viewerProps}
  renderImage={({ item, width, height, onReady, onError }) => (
    <ExpoImage source={{ uri: item.uri }} cachePolicy="none" contentFit="contain"
      accessibilityLabel={item.label} style={{ width, height }}
      onDisplay={onReady} onError={onError} />
  )}
  onImageStatusChange={({ item, status }) => recordImageStatus(item.id, status)}
/>
```

`viewerProps`는 위의 open/items/라벨/inset/닫기 props다. host는 이미지의 접근성 이름과
크기를 연결하고 상태 문구·재시도 버튼을 다시 만들지 않는다. 재시도는 host를 새로 마운트한다.
이전 시도의 이벤트와 닫힌 세션의 이벤트는 무시하며 오류는 재시도 전까지 유지한다.
`ready`는 연결한 host 이벤트의 의미일 뿐이다. 기본 경로는 계속 RN onLoad이므로 실제 표시나
사용자의 검토 완료를 뜻하지 않는다. 상태 통지는 렌더링된 페이지마다 발생하므로 현재 선택·
열림·결과 URI·보기 모드·사용자 확인 조건은 제품이 결합해야 한다. 닫을 때 별도의 상태 이벤트를
보내지 않는다. 제품은 닫기/교체에서 검토를 무효화한다. host 변경만으로 세션이 새로 열리지 않는다.
회전을 허용하는 제품은 `supportedOrientations={["portrait", "landscape"]}`와 갱신되는
safeAreaInsets 네 방향을 제공한다. 앱 manifest가 portrait 고정이면 이 prop만으로 회전이 보장되지 않는다.
화면 크기가 바뀌면 버튼을 제외한 남은 갤러리 영역을 다시 측정해 host에 전달한다.
아래 inspection 확장은 미게시이며, Expo 표시 확인·결과 승인 회귀와 Utilverse 채택은 별도 검증한다.

### 결과 검사 크기 계산

`@hjmds/design-contracts/components/image`의 `resolveImageInspectionGeometry`는 원본과
실측 viewport 크기, `fit | double | pixels`를 받아 scale·width·height·panBounds를 반환한다.
fit은 전체가 들어가는 크기, double은 fit의 2배, pixels는 원본 수치와 같은 layout 단위다.
기기의 물리 pixel 배율을 추정하지 않는다. 0 크기는 측정 전 상태이므로 호출을 미룬다.

```ts
import { resolveImageInspectionGeometry } from "@hjmds/design-contracts/components/image";

const geometry = resolveImageInspectionGeometry(
  { width: 600, height: 600 }, { width: 402, height: 454 }, "double",
); // width/height 804, panBounds x=201 y=175 (중앙에서 양방향)
```

### Native 결과 검사 보기 (미게시)

`ImageViewer`의 선택적 `inspection`은 위 계산을 사용한다. 모든 `items`에 실제 출력의
양수 `width`·`height`를 제공한다. 일반 Gallery의 pinch/paging과 별개로 고정 배율의 결과를
검사하는 용도다. `inspection`을 생략하면 기존 Gallery 동작을 유지한다.

```tsx
<ImageViewer {...viewerProps}
  items={[{ id: "result", uri: outputUri, label: resultLabel, width: outputWidth, height: outputHeight }]}
  inspection={{
    mode, onModeChange: next => { invalidateReview(); setMode(next); },
    labels: { mode: "결과 보기", fit: "맞춤", double: "2배", pixels: "출력 크기",
      left: "왼쪽", right: "오른쪽", up: "위", down: "아래", center: "중앙" },
    getPositionText: ({ x, y }) => `위치 ${Math.round(x)}, ${Math.round(y)}`,
  }} />
```

문구는 예시이며 제품 i18n에서 공급한다. 닫기 아래 SegmentedControl, 남은 이미지 viewport,
방향/중앙 버튼과 위치 안내, 이미지 설명 순으로 배치한다. 큰 글자에서는 선택·방향 버튼이
줄바꿈되며 그 아래 실제 남은 viewport로 배율을 다시 계산한다. `renderImage`의 width/height는
이 모드에서 **이미지의 표시 크기**이며 viewport보다 클 수 있다.

- fit은 전체 맞춤, double은 fit의 2배, pixels는 출력 수치와 같은 layout 단위다. 물리 기기 pixel의 1:1 decode를 보장하지 않는다.
- 드래그 또는 방향 버튼으로 양축 끝까지 이동한다. 버튼은 viewport의 80%씩 이동해 20% 문맥을 유지하며 물리 방향은 RTL에서도 뒤집지 않는다. 넘침이 없는 축은 비활성이다.
- 확대/축소 pinch·double tap과 swipe 페이지 전환은 사용하지 않는다. 여러 이미지는 이전/다음 버튼으로 전환하고 한 장이면 두 버튼을 숨긴다.
- 모드·viewport·이미지·재시도가 바뀌면 중앙에서 새 host를 열고 loading부터 시작한다. 폐기된 host/제스처 콜백은 새 상태를 바꾸거나 위치를 알리지 않는다.
- 위치는 이미지 중앙에서 본 viewport의 x/y 오프셋과 maxX/maxY 한계다. `getPositionText`는 비어 있지 않은 지역화 문자열을 반환한다. 화면에서는 한 줄로 제한해 위치 문구 변화가 viewport를 바꾸지 않게 하고 접근성 이름은 전체를 제공한다.
- 위치 알림은 Android live region, iOS 완료된 이동의 announce API를 사용한다. 실제 스크린리더 검증은 남아 있다. 제품의 표시 완료/수동 확인/내보내기 승인 계약은 기존 host 절대로 유지한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 | `layoutStyle`, 루트 `style`/`className`(기본 `inline-size: width`, `max-inline-size: 100%`) | `layoutStyle`(루트 프레임) |
| 정보 이미지 이름 | `accessibilityLabel` → `<img alt>`(`alt` prop은 받지 않는다) | `accessibilityLabel` |
| 이미지 host 스타일 | `imageProps.style`/`className` | `style`(ImageStyle) |
| 다른 이미지 엔진 | `renderImage`(받은 props를 `<img>`까지 전달) | `renderImage`(예: expo-image), `sourceAdapter`(헤더·캐시) |
| 확대 보기 | — | `ImageViewer` |

## 함정

- `renderImage` adapter가 받은 `onLoad`·`onError`를 실제 이미지 요소에 넘기지 않으면 HJM이 실패를 보지 못해
  대체 화면과 GridReveal의 `ready`가 동작하지 않는다.
- Native 루트 폭은 `width` 숫자 그대로다. 화면 폭에 맞추려면 `layoutStyle`로 폭을 준다.
