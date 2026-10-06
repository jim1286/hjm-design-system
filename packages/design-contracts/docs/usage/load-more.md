# LoadMore 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [LoadMore](../load-more.md), recipe `loadMoreRecipe`(`src/component-recipes.ts`), 상태·controller `src/load-more.ts`

## 언제 쓰나

이미 그린 항목을 그대로 둔 채 목록 끝에서 다음 페이지를 요청하는 footer에 쓴다. 피드, 댓글, 검색 결과처럼
끝까지 이어 읽는 목록이다. LoadMore는 데이터·cursor를 갖지 않고 footer 상태 표시와 같은 cursor의
중복 요청 방지만 맡는다.

| 화면 형태 | 쓸 것 |
| --- | --- |
| 목록 본체(한 번에 그림) | [List](list.md) + [ListRow](list-row.md) |
| 목록 본체(고정 높이 행이 매우 많음) | [VirtualList](virtual-list.md) |
| 목록 아래 다음 페이지 footer | `LoadMore` |

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 페이지 번호로 이동 | [Pagination](pagination.md) |
| 처음 화면을 채우는 로딩 | [Skeleton](skeleton.md), [ListRow](list-row.md) `loading`(Web) |
| 목록이 비었음 | [EmptyState](empty-state.md) |
| 화면 전체의 오류 | [ScreenLayout](screen-layout.md)의 `state` |
| 목록·상세 화면 묶음 | [ListDetailScreen](list-detail-screen.md)의 `loadMore`는 단순 버튼이다. 상태 머신이 필요하면 LoadMore를 `list` 안에 둔다 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `LoadMore` | `@hjmds/react`, `/navigation` | `@hjmds/react-native`, `/navigation`, `/top-bar` | 기본 |

## 최소 사용 예

```tsx
// Web — 화면에 보이면 자동 요청(IntersectionObserver)
import { LoadMore } from "@hjmds/react/navigation";

<LoadMore
  descriptor={{ state: footerState, labels: {
    loadMore: t("feed.more"), loading: t("common.loading"),
    retry: t("common.retry"), complete: t("feed.end") } }}
  onLoadMore={({ requestKey }) => fetchNextPage(requestKey)}
/>
```

```tsx
// Native — FlatList의 끝 도달을 ref로 연결
import { LoadMore, type LoadMoreHandle } from "@hjmds/react-native/navigation";

const loadMore = useRef<LoadMoreHandle>(null);
<FlatList data={items} renderItem={renderRow}
  onEndReached={() => { void loadMore.current?.onEndReached(); }}
  ListFooterComponent={<LoadMore ref={loadMore} descriptor={footer} onLoadMore={fetchNext} />} />
```

## 축과 기본값

- `descriptor.state`: `ready`(requestKey) · `loading`(requestKey) · `error`(requestKey, message) · `complete`.
  `requestKey`는 제품이 cursor·offset으로 만든 안정된 문자열이다.
- `descriptor.labels`: `loadMore`·`loading`·`retry`·`complete` 네 문구 모두 필수. renderer는 영어 대체 문구를 만들지 않는다.
- `mode`: `automatic`(기본, 화면 도달로도 요청) · `manual`(버튼만). automatic에서도 ready 상태엔 수동 버튼이 함께 나온다.
- `density`: `regular`(기본) · `compact`. Web `rootMargin` 기본 `"200px 0px"`, `intersectionRoot` 기본 viewport.

## 꼭 지킬 것

- `onLoadMore`는 실제 query가 끝날 때 settle되는 Promise를 반환한다. `void fetchNextPage()`처럼 바로 끝나면 같은 cursor가 두 번 돈다.
- 상태는 제품이 바꾼다. 요청 성공 뒤 다음 `requestKey`의 `ready` 또는 `complete`, 실패 뒤 `error`(현지화 message)를 넘긴다.
- 오류가 나도 이미 그린 항목을 숨기지 않는다.
- 로딩 중에는 스피너만 보이고 문구는 접근성 이름으로만 쓴다. 옆에 문구를 따로 붙이지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 자동 감지 | 내부 sentinel + IntersectionObserver | 제품 FlatList `onEndReached` → `ref.onEndReached()` |
| 배치 | `className`·`style`(HTML 속성) | `layoutStyle` |

## 함정

- [VirtualList](virtual-list.md)는 끝 도달 callback을 노출하지 않는다. Native에서 VirtualList 아래 자동 요청은 연결할 수 없으니
  `mode="manual"`로 두거나 제품 FlatList를 쓴다.
