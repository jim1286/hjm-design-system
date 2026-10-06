# Masonry 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Masonry](../masonry.md), geometry `@hjmds/design-contracts/components/masonry`

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
| 사진 선택 화면 | [MediaSelectionScreen](media-selection-screen.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Masonry` | `/masonry` | `/masonry` | 기본 |

루트 entry에는 없다. 추가 peer는 없다.

## 최소 사용 예

```tsx
// Web
import { Masonry } from "@hjmds/react/masonry";

<Masonry label={t("gallery.title")} items={photos} keyExtractor={(p) => p.id}
  width={containerWidth} columns={3}
  getItemHeight={(p, itemWidth) => itemWidth * (p.height / p.width)}
  renderItem={(p) => <PhotoCard photo={p} />}
  empty={<EmptyState /* ... */ />} />
```

```tsx
// Native
import { Masonry } from "@hjmds/react-native/masonry";

<Masonry label={t("gallery.title")} items={photos} keyExtractor={(p) => p.id}
  width={layoutWidth} getItemHeight={(p, itemWidth) => itemWidth * (p.height / p.width)}
  renderItem={(p) => <PhotoCard photo={p} />} />
```

## 축과 기본값

- `width`(필수): 컨테이너 폭. 측정은 소비 화면이 한다(Web ResizeObserver, Native `onLayout` 등).
- `columns`: 기본 2. `gap`: 기본 12.
- `getItemHeight(item, itemWidth)`(필수): 그 열 폭에서 항목의 확정 높이. 루트 높이는 가장 긴 열로 정해진다.
- `label`(필수, 현지화), `empty`: 항목이 없을 때 보일 내용.

## 꼭 지킬 것

- 높이는 추정하지 않고 확정 값을 준다. 긴 문구·큰 글자로 카드 높이가 바뀌면 `getItemHeight`도 다시 계산한다.
  모자라게 주면 항목이 겹친다(절대 위치 배치).
- `keyExtractor`는 유일한 키를 돌려준다. 중복 키·잘못된 크기는 거부된다.
- 화면 폭이 바뀌면 `width`를 다시 넘긴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 목록 의미 | `role="list"`·`listitem` | `accessibilityLabel`만(목록 role 없음) |
| RTL | `insetInlineStart`로 자동 반전 | provider direction이 rtl이면 `right` 기준 |

## 함정

- 모든 항목을 한 번에 그린다. 항목이 많은 무한 피드에서는 렌더 비용이 쌓인다.
- 항목이 없으면 `empty`만 그리고 목록 role이 붙지 않는다.
