# LoadMore

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [LoadMore](../../load-more.md), `src/component-recipes.ts`(`loadMoreRecipe`), `src/load-more.ts`(상태·controller)
- 스토리북: `배포/컴포넌트/탐색/더 보기`

## 언제 쓰나

이미 그린 항목을 그대로 둔 채 목록 끝에서 다음 페이지를 요청하는 footer에 쓴다. 피드, 댓글, 검색 결과처럼
끝까지 이어 읽는 목록이다. LoadMore는 데이터·cursor를 갖지 않고 footer 상태 표시와 같은 cursor의
중복 요청 방지만 맡는다.

- 목록 본체(한 번에 그림): [List](list.md) + [ListRow](list-row.md)
- 목록 본체(고정 높이 행이 매우 많음): [VirtualList](virtual-list.md)
- 목록 아래 다음 페이지 footer: `LoadMore`

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 페이지 번호로 이동 | [Pagination](pagination.md) |
| 처음 화면을 채우는 로딩 | [Skeleton](skeleton.md), [ListRow](list-row.md) `loading`(Web) |
| 목록이 비었음 | [EmptyState](empty-state.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `LoadMore` | 기본 | `@hjmds/react`, `/navigation` | `@hjmds/react-native`, `/navigation`, `/top-bar` |

## 최소 사용 예

```tsx
// Web — 화면에 보이면 자동 요청(IntersectionObserver)
import { LoadMore } from "@hjmds/react/navigation";
<LoadMore
  descriptor={{ state: footerState, labels: {
    loadMore: t("feed.more"), loading: t("common.loading"),
    retry: t("common.retry"), complete: t("feed.end") } }}
  onLoadMore={({ requestKey }) => fetchNextPage(requestKey)} // query가 끝날 때 settle하는 Promise
/>
```

```tsx
// Native — FlatList의 끝 도달을 ref로 연결
import { useRef } from "react";
import { FlatList } from "react-native";
import { LoadMore, type LoadMoreHandle } from "@hjmds/react-native/navigation";
const loadMore = useRef<LoadMoreHandle>(null);
<FlatList data={items} renderItem={renderRow}
  onEndReached={() => { void loadMore.current?.onEndReached(); }}
  ListFooterComponent={<LoadMore ref={loadMore} descriptor={footer} onLoadMore={fetchNext} />} />
```

## 축과 기본값

표의 prop은 Web·Native 공통이다(`(Web)` 표시만 Web 전용). 타입은 `@hjmds/design-contracts/components/load-more`에서 가져온다.

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor.state` | `LoadMoreState`: `{ status: "ready", requestKey }` · `{ status: "loading", requestKey }` · `{ status: "error", requestKey, message }` · `{ status: "complete" }` | 필수 | `requestKey`는 제품이 cursor·offset으로 만든 안정된 문자열. `message`는 현지화된 오류 문구 |
| `descriptor.labels` | `{ loadMore, loading, retry, complete }`(모두 `string`) | 필수 | 네 문구 모두 필수. renderer는 영어 대체 문구를 만들지 않는다 |
| `onLoadMore` | `(request: { requestKey: string; reason: "viewport" \| "manual" \| "retry" }) => Promise<void>` | 필수 | 실제 요청이 끝날 때 settle해야 같은 `requestKey`의 중복 요청을 막는다 |
| `mode` | `automatic` · `manual` | `automatic` | `automatic`은 화면 도달로도 요청하고 ready 상태엔 수동 버튼도 함께 나온다. `manual`은 버튼만 |
| `density` | `regular` · `compact` | `regular` | 위아래 여백·간격(아래 배치) |
| `onRequestOutcome` | `(outcome: "started" \| "blocked-by-mode" \| "blocked-by-state" \| "already-requesting", reason) => void` | — | 요청 시도 결과 관찰(분석·디버그용) |
| `onRequestError` | `(error: unknown, reason) => void` | — | `onLoadMore`가 reject했을 때. 화면 상태는 여전히 제품이 `error`로 바꾼다 |
| `rootMargin`(Web) | 문자열 | `"200px 0px"` | 자동 요청 감지 여백 |
| `intersectionRoot`(Web) | `Element \| Document \| null` | viewport | 자동 요청 감지 기준 |
| `ref` | Web `HTMLDivElement` · Native `LoadMoreHandle` `{ onEndReached(): Promise<outcome> }` | — | Native는 FlatList `onEndReached`에서 `ref.current?.onEndReached()`를 부른다 |
| `layoutStyle` | 배치 전용 style 객체 | — | 바깥 여백·폭 같은 배치만. 시각 값은 받지 않는다 |

## 배치

Native trigger 모서리는 Provider token에서 `loadMoreRecipe.trigger.radius`를 읽는다. requestKey·중복 요청 방지와 요청 상태는 그대로다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 더 보기·다시 시도 버튼은 최소 높이 `control.minTouchTarget` 44, 좌우 안쪽 `spacing.md` 16, radius `radius.md` 12의 텍스트 버튼. 끝 문구는 `caption` | `loadMoreRecipe.trigger`, `.hjm-load-more__trigger` |
| 간격 | 위아래 여백·줄 간격: `regular` `spacing.lg` 20 · `spacing.sm` 12, `compact` `spacing.sm` 12 · `spacing.xs` 8 | `loadMoreRecipe.density` |
| 순서·정렬 | 목록 마지막 항목 바로 아래, 한 목록에 하나. 내용은 가로 가운데 정렬한 한 열. 오류일 때 Web은 문구와 다시 시도를 한 줄에 두고(모자라면 줄바꿈), Native는 문구 아래에 다시 시도를 쌓는다 | `.hjm-load-more`, `.hjm-load-more__error`, Native `LoadMore` |
| 고정·스크롤 | 목록과 같은 스크롤 영역 안에 둔다. 화면 하단에 고정하지 않는다. Native는 FlatList `ListFooterComponent`, Web은 목록 요소 다음 형제 | — |
| 좁은 폭·큰 글자 | Web 오류 줄은 `flex-wrap`으로 줄을 바꾼다. 버튼은 최소 높이만 있어 큰 글자에서 높이가 늘어난다 | `.hjm-load-more__status`, `.hjm-load-more__error` |

```text
┌─ 스크롤 영역 ─────────────────┐
│ [ListRow]                     │
│ [ListRow]                     │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │ ← padding spacing.lg 20
│        [ 더 보기 ]             │ ← ready: 높이 ≥ 44
│   오류 문구  [ 다시 시도 ]     │ ← error(Web 한 줄, Native 두 줄)
│      t("feed.end")            │ ← complete: caption
└───────────────────────────────┘
```

## 꼭 지킬 것

- `onLoadMore`는 실제 query가 끝날 때 settle되는 Promise를 반환한다. `void fetchNextPage()`처럼 바로 끝나면 같은 cursor가 두 번 돈다.
- 상태는 제품이 바꾼다. 요청 성공 뒤 다음 `requestKey`의 `ready` 또는 `complete`, 실패 뒤 `error`(현지화 message)를 넘긴다.
- 오류가 나도 이미 그린 항목을 숨기지 않는다.
- 로딩 중에는 스피너만 보이고 문구는 접근성 이름으로만 쓴다. 옆에 문구를 따로 붙이지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 자동 감지 | 내부 sentinel + IntersectionObserver | 제품 FlatList `onEndReached` → `ref.onEndReached()` |
| 배치 | `className`, `layoutStyle`(HTML `style`도 받음) | `layoutStyle` |

## 함정

- [VirtualList](virtual-list.md)는 끝 도달 callback을 노출하지 않는다. Native에서 VirtualList 아래 자동 요청은 연결할 수 없으니
  `mode="manual"`로 두거나 제품 FlatList를 쓴다.
