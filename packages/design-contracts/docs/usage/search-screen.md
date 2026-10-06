# SearchScreen 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
설계: [반복 화면 조합 · 기본 흐름 공개 조합](../screen-patterns.md#기본-흐름-공개-조합-2026-10-05)(상태: 실험, supplemental).
카탈로그 계약은 없다.

## 언제 쓰나

검색어 입력, 필터, 최근 검색, 결과 목록을 갖춘 검색 화면 전체에 쓴다. 입력 debounce(기본 300ms)와
이전 요청 취소(`AbortSignal`)를 공통으로 처리한다. 검색 API, 오류 처리, 필터·정렬, 늦은 응답 무시는 제품 소유다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 다른 화면 안의 검색 입력 하나 | [SearchField](search-field.md) |
| 입력하며 값 하나를 고름 | [Combobox](combobox.md) |
| Web 명령·이동 검색 | [CommandPalette](command-palette.md) |
| 검색 없는 목록·상세 | [ListDetailScreen](list-detail-screen.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `SearchScreen` | `/screen-flows` | `/screen-flows` | supplemental. root에서는 내보내지 않는다 |

## 최소 사용 예

```tsx
// Web — Native는 "@hjmds/react-native/screen-flows"
import { SearchScreen } from "@hjmds/react/screen-flows";

<SearchScreen
  title={t("search.title")}
  queryLabel={t("search.query")}
  query={query}
  onQueryChange={setQuery}
  onSearch={(value, { signal }) => {
    if (!value.trim()) return setResults([]);
    void searchApi(value, { signal })
      .then((result) => { if (!signal.aborted) setResults(result); })
      .catch((error) => { if (!signal.aborted) setError(error); });
  }}
  filters={<ProductFilters />}
  recentSearches={<RecentSearches onPick={setQuery} />}
>
  <ProductResults items={results} />
</SearchScreen>
```

```tsx
// Native — clear·busy가 있는 SearchField를 입력 slot으로
import { SearchScreen } from "@hjmds/react-native/screen-flows";
import { SearchField } from "@hjmds/react-native/inputs";

<SearchScreen
  title={t("search.title")}
  queryLabel={t("search.query")}
  query={query}
  onQueryChange={setQuery}
  onSearch={runSearch}
  queryField={<SearchField label={t("search.query")} clearLabel={t("common.clearSearch")}
    busyLabel={t("common.searching")} value={query} onValueChange={setQuery} busy={isFetching} />}
>
  <ProductResults items={results} />
</SearchScreen>
```

## 축과 기본값

- 필수: `title`, `query`, `queryLabel`, `onQueryChange`, `onSearch(query, { signal })`, `children`.
- `debounceMs`: 기본 `300`. 값이 바뀔 때마다 이전 타이머를 지우고 이전 요청을 abort한다.
- `filters`: 검색창 아래 상단에 고정. `recentSearches`: `query`가 공백일 때만 본문 위에 보인다.
- 나머지는 ScreenLayout과 같다(`state`, `stateAction`, `notice`, `scroll`, `header` 등). `footer`는 받지 않는다.

## 꼭 지킬 것

- `onSearch`는 첫 렌더 뒤와 빈 `query`에도 불린다. 빈 검색어 처리(요청 생략)는 제품이 한다.
- 응답을 반영하기 전에 `signal.aborted`를 확인한다. 취소는 신호만 줄 뿐 늦은 응답을 막지 않는다.
- 검색 실패로 결과가 없으면 `state={{ kind: "error", title }}`, 결과 0건은 `kind: "empty"`로 구분한다.
- 문구(`title`, `queryLabel`, 상태 제목)는 i18n 키로 넣는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `queryField` slot | 타입에는 있으나 **그리지 않는다**. 항상 기본 TextField | 넘기면 기본 TextField 대신 그린다 |
| 기본 입력 | `TextField` + `queryLabel` | `TextField` + `queryLabel` |

## 함정

- Web 1.12.1 renderer는 `queryField`를 받고도 무시한다(설계 문서는 slot을 지원한다고 적는다).
  Web에서 SearchField의 지우기·진행 표시가 필요하면 이 차이가 고쳐질 때까지 기본 입력을 쓰고
  진행 상태는 `notice`로 알린다.
