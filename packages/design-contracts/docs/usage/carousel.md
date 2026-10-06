# Carousel 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Carousel](../carousel.md), `CarouselMotion`은 [선택형 어댑터](../optional-adapters.md),
contract `src/carousel.ts`

## 언제 쓰나

한 번에 카드 하나만 보이고 사용자가 순서대로 넘겨 보는 유한한 묶음에 쓴다. 오늘 경기 스트립,
소개 카드 몇 장이 여기에 속한다. 끝에서 처음으로 돌아가지 않고, 자동 재생은 `autoplay`를 줄 때만 켜진다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 여러 항목을 한눈에 비교·훑기 | [List](list.md), [Masonry](masonry.md) |
| 항목 수가 많거나 끝이 없음 | [VirtualList](virtual-list.md), [LoadMore](load-more.md) |
| 같은 자리의 보기 전환 | [Tabs](tabs.md), [SegmentedControl](segmented-control.md) |
| 첫 실행 안내 흐름 | [OnboardingScreen](onboarding-screen.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Carousel` | `@hjmds/react`, `/carousel` | `@hjmds/react-native`, `/carousel` | 기본. 추가 peer 없음 |
| `CarouselMotion` | `/carousel-motion` | `/carousel-motion` | 스와이프 모션 확장(optional-extension) |

`CarouselMotion`은 granular subpath로만 import 된다. 필요한 optional peer는 Web `embla-carousel-react`,
Native `react-native-reanimated-carousel`·`react-native-worklets`(직접 import)와 그 라이브러리의 peer인
`react-native-reanimated`·`react-native-gesture-handler`다. 앱에 없으면 tsc·테스트는 통과해도 기기 Metro 번들에서 실패한다.

## 최소 사용 예

```tsx
// Web
import { Carousel } from "@hjmds/react/carousel";

<Carousel
  label={t("home.games.label")}
  slides={games.map((game) => ({ id: game.id, label: game.title }))}
  renderSlide={(slide) => <GameCard gameId={slide.id} />}
  composeAccessibleName={({ position, total, label }) =>
    t("home.games.slideName", { position, total, label })}
  labels={{
    previous: t("carousel.previous"), next: t("carousel.next"),
    pause: t("carousel.pause"), resume: t("carousel.resume"),
    navigation: t("carousel.navigation"),
  }}
/>
```

```tsx
// Native
import { Carousel } from "@hjmds/react-native/carousel";

<Carousel
  label={t("home.games.label")}
  slides={slides}
  currentKey={currentId}
  onCurrentKeyChange={setCurrentId}
  renderSlide={(slide) => <GameCard gameId={slide.id} />}
  composeAccessibleName={composeSlideName}
  labels={carouselLabels}
/>
```

## 축과 기본값

- 선택: `currentKey`+`onCurrentKeyChange`(controlled) 또는 `defaultCurrentKey`(uncontrolled, 기본은 첫 슬라이드).
  값은 인덱스가 아니라 슬라이드 `id`다.
- `autoplay`: 기본 없음. `{ intervalMs }`(0보다 커야 한다)를 주면 일시정지/재개 버튼이 생긴다.
  마지막 슬라이드, reduced motion, 사용자 조작 뒤에는 멈추고 명시적인 재개 전까지 다시 돌지 않는다.
- `CarouselMotion`은 항상 controlled(`currentKey`·`onCurrentKeyChange` 필수)이고 autoplay가 없다.
  라벨은 `label`·`previousLabel`·`nextLabel` 세 개이고 `composeAccessibleName`은 선택이다(없으면 슬라이드 `label`).

## 꼭 지킬 것

- `label`, `labels`의 다섯 값, 슬라이드 `label`은 비어 있으면 `TypeError`를 던진다. 모두 i18n 키로 넣는다.
- 슬라이드 id는 유일하고 앞뒤 공백이 없어야 한다. 빈 배열은 던지므로 로딩·빈 상태는 마운트 전에 제품이 처리한다.
- `composeAccessibleName`의 어순·조사는 제품 문구다. HJM은 위치 정보만 넘긴다.
- 슬라이드 안의 시각 콘텐츠(카드·이미지)는 제품 소유다. 컨트롤·점·접근성 구조는 HJM 소유라 다시 만들지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 | `className`/`style`(HTML 속성) | `style`(`StyleProp<ViewStyle>`, `layoutStyle` 없음) |
| 위치 표시 | 점 버튼 | 번호 버튼 + 조정 가능(adjustable) 위치 요소 |
| 스와이프 | 없음(`CarouselMotion` 필요) | 기본 가로 스와이프 |
| 자동 재생 정지 조건 | hover, 포커스, 탭 숨김 | 백그라운드, 스크린 리더 켜짐 |
| 키보드 | 컨트롤 영역에서 좌우 화살표(RTL 반전) | 해당 없음 |
| `CarouselMotion` 크기 | 컨테이너 폭 | `width`·`height` 필수(측정값, 양수 아니면 던짐) |
