# Carousel

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Carousel](../../carousel.md), `CarouselMotion`은 [선택형 어댑터](../../optional-adapters.md), contract `src/carousel.ts`
- 스토리북: `배포/컴포넌트/데이터 표시/캐러셀`

## 언제 쓰나

한 번에 카드 하나만 보이고 사용자가 순서대로 넘겨 보는 유한한 묶음에 쓴다. 오늘 경기 스트립,
소개 카드 몇 장이 여기에 속한다. 끝에서 처음으로 돌아가지 않고, 자동 재생은 `autoplay`를 줄 때만 켜진다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 여러 항목을 한눈에 비교·훑기 | [List](list.md), [Masonry](masonry.md) |
| 항목 수가 많거나 끝이 없음 | [VirtualList](virtual-list.md), [LoadMore](load-more.md) |
| 같은 자리의 보기 전환 | [Tabs](tabs.md), [SegmentedControl](segmented-control.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Carousel` | 기본(추가 peer 없음) | `@hjmds/react`, `/carousel` | `@hjmds/react-native`, `/carousel` |
| `CarouselMotion` | 확장(스와이프 모션, optional-extension) | `/carousel-motion` | `/carousel-motion` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | 필수 | 묶음 전체의 접근성 이름. 비우면 `TypeError` |
| `slides` | `readonly { id: string; label: string }[]` | 필수 | 하나 이상. `label`은 슬라이드 접근성 이름이고 시각 콘텐츠는 `renderSlide`가 그린다 |
| `renderSlide` | `(slide: { id: string; label: string }) => ReactNode` | 필수 | — |
| `composeAccessibleName` | `(info: { position: number; total: number; label: string }) => string` | 필수 | `position`은 1부터 |
| `labels` | `{ previous: string; next: string; pause: string; resume: string; navigation: string }` | 필수 | 다섯 값 모두 비우면 `TypeError` |
| `currentKey` + `onCurrentKeyChange` · `defaultCurrentKey` | 슬라이드 `id`, `(key: string) => void` | 첫 슬라이드 | 제어(둘 다 필수)·비제어 중 하나만 타입이 허용한다. 값은 인덱스가 아니라 `id`다 |
| `autoplay` | `{ intervalMs: number }`(0보다 큼) | 없음 | 주면 일시정지/재개 버튼이 생긴다. 마지막 슬라이드, reduced motion, 사용자 조작 뒤에는 멈추고 명시적인 재개 전까지 다시 돌지 않는다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. Native `style`은 deprecated — layoutStyle 또는 tone/토큰 |
| `CarouselMotion` 선택 | `currentKey: string`, `onCurrentKeyChange(key: string): void` | 필수(항상 제어) | autoplay가 없다. `slides`는 `{ id, label, disabled? }` |
| `CarouselMotion` 라벨 | `label`·`previousLabel`·`nextLabel`, 선택 `composeAccessibleName` | — | `composeAccessibleName`이 없으면 슬라이드 `label`을 쓴다 |
| `CarouselMotion` 크기(Native) | `width`·`height` 측정값 | 필수 | 양수가 아니면 `TypeError`. Web `CarouselMotion`은 `layoutStyle`을 받고 Native는 받지 않는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 부모 폭을 채우고 슬라이드 높이는 내용이 정한다(현재 슬라이드만 보인다). 이전·다음은 ghost Button(medium 44), Web 점은 지름 8에 터치 영역 44(`control.minTouchTarget`) | `carouselRecipe.dot`, `.hjm-carousel__dot` |
| 간격 | 영역 사이(재생 버튼·슬라이드·조작 줄) `spacing.sm` 12, 조작 줄 안 `spacing.xs` 8 | `carouselRecipe.sizes.medium.gap`, `.hjm-carousel__controls` |
| 순서·정렬 | 위→아래 [일시정지/재개(autoplay일 때, 시작 쪽)] → [슬라이드] → [이전][점 · · ·][다음] 가운데 정렬. Native는 점 대신 번호 버튼(현재 `secondary`, 나머지 `ghost`)을 이전·다음 사이에 둔다 | `react/src/carousel.tsx`, `react-native/src/carousel.tsx` |
| 고정·스크롤 | 고정 영역이 없다. 슬라이드 넘김은 버튼·점(또는 `CarouselMotion` 스와이프)으로 하고 가로 스크롤 영역을 만들지 않는다 | `.hjm-carousel__slide[hidden]` |
| 좁은 폭·큰 글자 | 조작 줄은 줄바꿈된다. Web 큰 글자에서는 점이 첫 줄, [이전][다음]이 둘째 줄 두 칸으로 나뉜다 | `.hjm-carousel[data-large-text="true"] .hjm-carousel__controls` |

## 꼭 지킬 것

- `label`, `labels`의 다섯 값, 슬라이드 `label`은 비어 있으면 `TypeError`를 던진다. 모두 i18n 키로 넣는다.
- 슬라이드 id는 유일하고 앞뒤 공백이 없어야 한다. 빈 배열은 던지므로 로딩·빈 상태는 마운트 전에 제품이 처리한다.
- `composeAccessibleName`의 어순·조사는 제품 문구다. HJM은 위치 정보만 넘긴다.
- 슬라이드 안의 시각 콘텐츠(카드·이미지)는 제품 소유다. 컨트롤·점·접근성 구조는 HJM 소유라 다시 만들지 않는다.
- 2026-10-07 [Motion 네 변형 검토](../../../../../docs/qa/2026-10-07-motion-reference-page-review.md)와
  [Cedar Filmstrip 대조](../../../../../docs/qa/2026-10-07-reference-parallel-c.md)에서 여러 카드가
  동시에 보이는 strip은 단일 active panel과 다른 계약임을 확인했다. 현재 Carousel에 임의
  `basis-1/3`/translate 스타일을 덮어 strip을 제공하지 않는다. 선택 버튼의 초점·현재 위치 의미,
  끝 정렬·폭 변경·부분 노출 항목의 초점/읽기 순서를 함께 갖춘 명시적 구성 확장이 필요한 후보다.
- 두 renderer는 숨겨진 슬라이드에도 `renderSlide`를 호출한다. 숨김은 네트워크 요청 취소나
  자식 unmount가 아니다. 권한 확인이 필요한 사진을 현재 페이지만 읽는 제품은 제어된
  `currentKey`와 비교해 선택되지 않은 콘텐츠를 `null`로 반환한다. 2026-10-07 Utilverse의
  선택 페이지 단독 조회·로그아웃 후 캐시 제거 계약을 대조하며 확인한 경계다.
- 배치는 `layoutStyle`로만 한다. Native `style`은 deprecated(개발 모드 1회 경고, 다음 major 제거)다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 | `layoutStyle`(HTML `className`도 전달) | `layoutStyle`(`style`은 deprecated) |
| 위치 표시 | 점 버튼 | 번호 버튼 + 조정 가능(adjustable) 위치 요소 |
| 스와이프 | 없음(`CarouselMotion` 필요) | 기본 가로 스와이프 |
| 자동 재생 정지 조건 | hover, 포커스, 탭 숨김 | 백그라운드, 스크린 리더 켜짐 |
| 키보드 | 컨트롤 영역에서 좌우 화살표(RTL 반전) | 해당 없음 |
| `CarouselMotion` 크기 | 컨테이너 폭 | `width`·`height` 필수(측정값, 양수 아니면 던짐) |
