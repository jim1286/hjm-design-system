# PageIndicator

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.31.0
- 검토일: 2026-10-18
- 근거: [Carousel](../../carousel.md), contract `src/carousel.ts`(`resolvePageIndicator`·`getPageIndicatorTarget`), recipe `carouselRecipe.dot`
- 스토리북: `배포/컴포넌트/탐색/페이지 위치 표시`

## 언제 쓰나

제품이 직접 만든 가로 페이저(Native 페이징 `FlatList`, Web scroll-snap 줄) 아래에 지금 몇 번째 페이지인지 점으로 보여 주고,
점을 눌러 그 페이지로 옮길 때 쓴다. Carousel의 위치 점 줄과 같은 부품·같은 recipe다. 홈 화면 런처처럼 페이지 안의 내용과
스크롤을 제품이 소유해 Carousel에 넣을 수 없는 자리다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 카드 묶음을 HJM이 그리고 넘겨도 됨 | [Carousel](carousel.md)(점·이전/다음이 이미 들어 있다) |
| 번호가 있는 결과 페이지 이동 | [Pagination](pagination.md) |
| 같은 화면의 패널 전환 | [Tabs](tabs.md)(페이저와 함께 쓰면 `swipePosition`) |
| 진행 단계 | [Steps](steps.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `PageIndicator` | 기본 | `@hjmds/react`, `/carousel` | `@hjmds/react-native`, `/carousel` |
| `resolvePageIndicator`·`getPageIndicatorTarget` | 보조(계약 함수) | `@hjmds/design-contracts/components/carousel` | 같음 |

## 최소 사용 예

```tsx
// Web
import { PageIndicator } from "@hjmds/react/carousel";

<PageIndicator
  label={t("home.pages")}
  count={pages.length}
  currentIndex={page}
  onCurrentIndexChange={(index) => scrollToPage(index)}
  composeAccessibleName={({ position, total }) => t("home.pageName", { position, total })}
/>
```

```tsx
// Native
import { PageIndicator } from "@hjmds/react-native/carousel";

<PageIndicator
  label={t("homePages")}
  count={pages.length}
  currentIndex={selected}
  onCurrentIndexChange={(index) => pager.current?.scrollToIndex({ index, animated: !reducedMotion })}
  composeAccessibleName={({ position, total }) => t("homePageName", { position, total })}
  labels={{ previous: t("previousPage"), next: t("nextPage") }}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | 필수 | 페이지 묶음의 이름. Web은 group 이름, Native는 `label: 현재 페이지 이름`으로 읽힌다. 비면 `TypeError` |
| `count` | 1 이상 정수 | 필수 | 페이지 수. 밖이면 `RangeError` |
| `maxVisibleDots` | 1 이상 정수 | 전체 | 현재 페이지를 포함하는 연속 창만 표시. 이름·이동은 전체 페이지 기준이며 창 크기는 페이지 수를 넘지 않는다(checkout 미게시) |
| `interactive` | `boolean` | `true` | `false`이면 위치만 표시하며 점은 누름 대상/키보드/조절 행동을 만들지 않는다. 별도 이전·다음 컨트롤이 있는 작은 표시용(checkout 미게시) |
| `currentIndex` | 0부터 `count - 1` | 필수 | 페이저가 확정한 현재 페이지. 컴포넌트는 따로 기억하지 않는다 |
| `onCurrentIndexChange` | `(index: number) => void` | 필수 | 점 누름·Web 화살표 키·Native 조절 동작이 요청한 페이지. 처음·끝에서는 같은 값이 다시 올 수 있다(넘어가지 않고 멈춘다) |
| `composeAccessibleName` | `({ position, total }) => string` | 필수 | 점 하나의 이름. 숫자 문법은 제품 문구다. 빈 문자열은 `TypeError` |
| Native `labels` | `{ previous: string; next: string }` | 필수 | 조절(adjustable) 동작 이름 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 배치 전용 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 점 지름 8, 점마다 누름 영역 44×44(`control.minTouchTarget`). 현재 점 `content.brand`, 나머지 `border.strong` | `carouselRecipe.dot` |
| 간격 | Web 점 사이 `spacing.xs` 8(`.hjm-page-indicator`). Native는 44 누름 영역끼리 붙여 둔다(Carousel과 같다) | `styles.css`, `react-native/src/carousel.tsx` |
| 순서·정렬 | 점은 페이지 순서대로 가운데 정렬한다. RTL에서는 줄이 뒤집히고 Web 화살표 키도 읽는 방향을 따른다 | `PageIndicator` |
| 고정·스크롤 | 스크롤하지 않는다. 보통 페이저 바로 아래에 둔다 | — |
| 좁은 폭·큰 글자 | 점이 많으면 다음 줄로 넘어간다(`flex-wrap`). 글자가 없어 글자 배율의 영향이 없다 | `styles.css`, `carousel.tsx` |

## 꼭 지킬 것

- `currentIndex`는 페이저의 실제 위치로 넘긴다. 스크롤이 멈춘 페이지(예: `onScroll`의 반올림 index)를 그대로 쓴다.
- `onCurrentIndexChange`에서 페이저를 그 페이지로 옮긴다. 이 컴포넌트는 스크롤하지 않는다.
- 숨은 페이지의 내용은 제품 페이저가 접근성 트리에서 뺀다(`accessibilityElementsHidden`·`importantForAccessibility`).
- 점의 색·크기를 덮지 않는다. Carousel과 같은 recipe를 쓴다.
- 제한 창의 대화형 점이 이동하면서 현재 초점의 점을 제거하면 Web은 현재 점으로 초점을 복구한다. 다른 컨트롤로 이동한 초점은 유지한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 접근성 | `role="group"` 안의 점 버튼(현재 점 `aria-disabled`·`data-current`) | 줄 하나가 adjustable 요소(값 `position / total`, increment·decrement 동작) |
| 키보드 | 점에서 ←/→가 한 페이지씩 요청 | — |
| `labels` | 없음 | 필수(조절 동작 이름) |
| ref | `forwardRef`(`div`) | 없음 |

## 근거

- PageIndicator 추가: 2026-10-18 Utilverse 홈 런처가 Native 페이저 아래 점을 직접 그렸다(HJM 1.30.0 감사 "HJM gap"). Carousel 점 줄을 공개 부품으로 빼서 같은 recipe·같은 이동 규칙을 쓰게 했다.


## 별도 이동 컨트롤이 있는 작은 위치 표시

번뚝처럼 이전·다음 버튼과 페이저를 이미 제공하는 화면은 `interactive={false}`와
`maxVisibleDots={5}`를 사용한다. 8px 점과 8px 간격은 그대로이며 44px 버튼을 작게 만들지 않는다.
Web은 현재 페이지 이름을 갖는 `img`, Native는 같은 이름의 `image`이다. 이동은 별도 공통
IconButton 또는 제품 페이저가 소유한다. `interactive`를 생략하면 기존 점 선택·키보드·Native 조절이 유지된다.
이 옵션은 2026-10-19 번뚝 앱·웹에 각각 있던 5개 점 창과 직접 스타일을 제거하기 위해 추가했으며 미게시다.
