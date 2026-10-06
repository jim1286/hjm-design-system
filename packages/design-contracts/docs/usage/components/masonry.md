# Masonry

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Masonry](../../masonry.md), `src/masonry.ts`(`resolveMasonryLayout`, `masonryRecipe`)
- 스토리북: `배포/컴포넌트/레이아웃/높이가 다른 카드 배치`

## 언제 쓰나

높이가 서로 다른 카드(사진 피드, 핀보드, 갤러리)를 여러 열에 빈틈없이 쌓을 때 쓴다. 각 항목 높이를
제품이 계산해 넘기면 가장 짧은 열에 입력 순서대로 놓는다. 읽기 순서는 입력 순서 그대로다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 칸 높이가 같은 격자 | [Grid](grid.md) |
| 한 줄씩 쌓는 목록 | [List](list.md), [ListRow](list-row.md) |
| 고정 높이 행이 매우 많음 | [VirtualList](virtual-list.md) (Masonry는 가상화하지 않는다) |
| 사진을 넘겨 보기 | [Carousel](carousel.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Masonry` | 기본 | `/masonry` | `/masonry` |

루트 entry에는 없다. 추가 peer는 없다.

## 최소 사용 예

```tsx
// Web
import { Masonry } from "@hjmds/react/masonry";
import { EmptyState } from "@hjmds/react/feedback";

<Masonry label={t("gallery.title")} items={photos} keyExtractor={(p) => p.id}
  width={containerWidth} columns={3}
  getItemHeight={(p, itemWidth) => itemWidth * (p.height / p.width)}
  renderItem={(p) => <PhotoCard photo={p} />}
  empty={<EmptyState title={t("gallery.empty.title")} />} />
```

```tsx
// Native
import { Masonry } from "@hjmds/react-native/masonry";

<Masonry label={t("gallery.title")} items={photos} keyExtractor={(p) => p.id}
  width={layoutWidth} getItemHeight={(p, itemWidth) => itemWidth * (p.height / p.width)}
  renderItem={(p) => <PhotoCard photo={p} />} />
```

## 축과 기본값

표의 prop은 Web·Native 공통이다.

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items` | `readonly T[]` | 필수 | 입력 순서가 읽기·포커스 순서다 |
| `keyExtractor` | `(item: T) => string` | 필수 | 유일한 키. 중복이면 `TypeError` |
| `renderItem` | `(item: T, index: number) => ReactNode` | 필수 | 열 폭은 넘기지 않는다. 항목 래퍼가 `getItemHeight` 높이·열 폭으로 고정돼 있어 Web은 일반 레이아웃 div에 `height: "100%", display: "flex"`를 주고 그 안의 Surface에는 `layoutStyle={{ flex: 1 }}`을 준다. Native Surface는 `layoutStyle={{ flex: 1 }}`로 채운다. HJM layoutStyle에 height를 넣지 않는다 |
| `getItemHeight` | `(item: T, itemWidth: number) => number` | 필수 | 그 열 폭에서 항목의 확정 높이(양의 유한수). 루트 높이는 가장 긴 열로 정해진다 |
| `width` | 숫자(> 0) | 필수 | 컨테이너 폭. 측정은 소비 화면이 한다(Web ResizeObserver, Native `onLayout` 등) |
| `columns` | 1~12 정수 | 2 | 열 수 |
| `gap` | 0 이상 숫자 | 12 | 가로·세로 간격 |
| `label` | 문자열 | 필수 | 현지화 |
| `empty` | 노드 | — | 항목이 없을 때 보일 내용 |
| `layoutStyle` | 배치 전용 style 객체 | — | 루트 바깥 배치만. 측정한 `width`·높이가 우선한다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 열 폭 = (`width` − `gap` × (`columns` − 1)) ÷ `columns`. 루트 높이는 가장 긴 열의 끝. `columns` 1~12 | `resolveMasonryLayout`, `masonryRecipe.maxColumns` |
| 간격 | `gap` 기본 12(`spacing.sm`과 같은 값), 가로·세로 같은 값. `width`는 화면 좌우 여백(`layout.pagePadding` compact 16 · regular 20 · spacious 24)을 뺀 본문 폭 | `src/masonry.ts`, `layout.pagePadding` |
| 순서·정렬 | 원본 순서대로 가장 짧은 열에 채운다. 읽기·포커스 순서는 열이 아니라 원본 순서. RTL은 오른쪽 열부터 | `masonryRecipe.readingOrder`, `insetInlineStart`(Web)·`right`(Native) |
| 고정·스크롤 | 본문 스크롤 영역 안에 놓는다. Masonry는 스크롤을 갖지 않는다 | `src/masonry.tsx`(Web·Native) |
| 좁은 폭·큰 글자 | 열 수는 제품이 폭으로 정한다(좁은 폭 2열, `breakpoint.medium` 600 이상에서 늘림). 큰 글자로 카드 높이가 바뀌면 `getItemHeight`를 다시 계산하고, 폭이 바뀌면 `width`를 다시 넘긴다 | `breakpoint` |

## 꼭 지킬 것

- 높이는 추정하지 않고 확정 값을 준다. 긴 문구·큰 글자로 카드 높이가 바뀌면 `getItemHeight`도 다시 계산한다.
  모자라게 주면 항목이 겹친다(절대 위치 배치).
- `keyExtractor`는 유일한 키를 돌려준다. 중복 키는 `TypeError`다.
- `width`가 0 이하이거나 열 폭이 0 이하, `getItemHeight`가 양의 유한수가 아니면 `TypeError`가 난다. 항목이 비어
  `empty`만 그릴 때도 기하 검사를 먼저 하므로 같다. 측정 전(폭 0)에는 Masonry를 렌더하지 않는다.
- 화면 폭이 바뀌면 `width`를 다시 넘긴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 목록 의미 | `role="list"`·`listitem` | `accessibilityLabel`만(목록 role 없음) |
| RTL | `insetInlineStart`로 자동 반전 | provider direction이 rtl이면 `right` 기준 |
| 루트 배치 | `layoutStyle`(측정 `width`·높이가 우선) | `layoutStyle`(측정 `width`·높이가 우선) |

## 함정

- 모든 항목을 한 번에 그린다. 항목이 많은 무한 피드에서는 렌더 비용이 쌓인다.
- 항목이 없으면 `empty`만 그리고 목록 role이 붙지 않는다. Web 빈 분기는 `role="group"` + `label` 이름이다(미게시(1.12.1 이후).
  1.12.1은 role 없는 `<div aria-label>`이라 이름이 노출되지 않았다). 빈 상태 문구는 `empty` 안에 보이는 글로 둔다.
- 다음 페이지는 목록 다음 형제로 [LoadMore](load-more.md)를 둔다. Native에서 FlatList 밖(ScrollView 안 Masonry)이면
  `onEndReached`가 없으므로 `mode="manual"`로 둔다. Web `automatic`은 sentinel로 동작하지만 비가상화라 항목이
  누적되는 비용을 감안해 제품이 고른다.
- 첫 로딩 자리를 Masonry + aria-hidden Skeleton으로 채우면 Web은 "빈 항목 목록"으로 읽힌다. 로딩 동안은 Masonry 대신
  [Skeleton](skeleton.md)의 영역 단위 알림을 쓴다.
