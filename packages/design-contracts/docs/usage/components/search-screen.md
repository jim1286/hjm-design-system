# SearchScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. `onSubmit`·`filtersOverflow`는 2026-10-06 사용자 요청("검색과 필터 있는 앱 서비스 따라해")의 검색 화면 개편에서 추가. 같은 날 사용자 위임 결정(권장안)으로 미리보기에만 있던 두 단계 검색 로직(`committedQuery`·`recentQueries`·`suggestedQueries`·`suggestions`·`resultSummary`·`appliedFilters`·`filterSheet`)과 `queryLabelVisibility`를, utilverse 적용 조사로 `searching`·`searchingLabel`을 추가([계약 결정 표](../../screen-patterns.md#searchscreen-두-단계-검색)). 1.13.0 utilverse 적용에서 드러난 결함으로 `hostGutter`와 확정 시 키보드 닫기(Web 결과 영역 포커스)를 추가(1.13.1 patch). 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/검색/검색 결과와 필터`

## 언제 쓰나

검색어 입력, 필터, 최근 검색, 결과 목록을 갖춘 검색 화면 전체에 쓴다. 입력 debounce(기본 300ms)와
이전 요청 취소(`AbortSignal`)를 공통으로 처리한다. 검색 API, 오류 처리, 필터·정렬, 늦은 응답 무시는 제품 소유다.
입력 중 제안과 확정 후 결과를 나누는 두 단계 검색은 `committedQuery`+`onSubmit`으로 켠다. 그러면 단계 전환, 모든 확정 경로,
최근·추천 검색어와 제안의 배치, 결과 개수·정렬, 적용 필터 칩, 초안/적용 필터 시트, 0건 원인별 복구, 지운 뒤 포커스, 개수 낭독을
SearchScreen이 맡고 제품은 데이터·요청·문구·아이콘만 넘긴다. 한 줄 가로 스크롤 필터 칩 줄은 `filtersOverflow="scroll"`로 만든다.
화면 전체 배치는 [검색 화면 지침](../screens/common-search.md)을 따른다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 다른 화면 안의 검색 입력 하나 | [SearchField](search-field.md) |
| 입력하며 값 하나를 고름 | [Combobox](combobox.md) |
| Web 명령·이동 검색 | [CommandPalette](command-palette.md) |
| 검색 없는 목록·상세 | [ListDetailScreen](list-detail-screen.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `SearchScreen` | supplemental. root에서는 내보내지 않는다 | `/screen-flows` | `/screen-flows` |

## 최소 사용 예

```tsx
// Web
import { SearchScreen } from "@hjmds/react/screen-flows";

<SearchScreen queryClearLabel={t("common.clearSearch")}
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

<SearchScreen queryClearLabel={t("common.clearSearch")}
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

### 두 단계 검색(최소 연결)

```tsx
// Web
import { SearchScreen } from "@hjmds/react/screen-flows";

<SearchScreen queryClearLabel={t("common.clearSearch")}
  title={t("search.title")}
  queryLabel={t("search.query")}
  queryLabelVisibility="hidden"
  query={query}
  onQueryChange={setQuery}
  onSearch={(value, { signal }) => loadSuggestions(value, signal)} // 입력 중: 제안
  committedQuery={committed}
  onSubmit={(value) => { setCommitted(value); saveRecent(value); }} // 모든 확정: 결과·최근 검색
  suggestions={{
    items: suggestions,
    commitLabel: (q) => t("search.commitRow", { q }),
    countLabel: (n) => t("search.suggestionCount", { n }),
  }}
  resultSummary={{
    count: isFetching ? null : results.length,
    countLabel: (n) => t("search.resultCount", { n }),
    loadingLabel: t("search.loading"),
  }}
>
  <ResultList items={results} />
</SearchScreen>
```

```tsx
// Native
import { SearchScreen } from "@hjmds/react-native/screen-flows";

<SearchScreen queryClearLabel={t("common.clearSearch")}
  title={t("search.title")}
  queryLabel={t("search.query")}
  queryLabelVisibility="hidden"
  query={query}
  onQueryChange={setQuery}
  onSearch={(value, { signal }) => loadSuggestions(value, signal)} // 입력 중: 제안
  committedQuery={committed}
  onSubmit={(value) => { setCommitted(value); saveRecent(value); }} // 모든 확정: 결과·최근 검색
  suggestions={{
    items: suggestions,
    commitLabel: (q) => t("search.commitRow", { q }),
    countLabel: (n) => t("search.suggestionCount", { n }),
  }}
  resultSummary={{
    count: isFetching ? null : results.length,
    countLabel: (n) => t("search.resultCount", { n }),
    loadingLabel: t("search.loading"),
  }}
>
  <ResultList items={results} />
</SearchScreen>
```

최근·추천 검색어, 적용 필터, 필터 시트, 정렬까지 모두 연결한 예는 [검색 화면 지침의 코드 골격](../screens/common-search.md#코드-골격)에 있다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `query` | `string` | 필수 | 제어형 검색어 |
| `queryLabel` | `string` | 필수 | 기본 입력의 label |
| `onQueryChange` | `(value: string) => void` | 필수 | 입력·지우기(`""`) |
| `onSearch` | `(query: string, context: { signal: AbortSignal }) => void` | 필수 | `debounceMs` 뒤 호출. 값이 바뀌면 이전 타이머를 지우고 이전 신호를 abort한다 |
| `queryClearLabel` | `string` | `queryField`가 없으면 필수 | 기본 입력의 지우기 버튼 이름. 비어 있으면 `TypeError` |
| `queryField` | `ReactNode` | 없음 | 기본 `SearchField` 대신 그릴 입력. 지우기 동작을 직접 제공한다 |
| `debounceMs` | `number` | `300` | 0 미만은 0 |
| `filters` | `ReactNode` | 없음 | 검색 입력 아래, 상단에 고정. 두 단계 검색에서는 결과 단계에만, 검색어 때문인 0건에는 숨긴다 |
| `onSubmit` | `(query: string) => void` | 없음 | 확정 신호. 모든 확정에서 키보드를 닫는다(Native `Keyboard.dismiss()`, Web은 고른 항목이면 결과 영역으로 포커스, 미게시(1.13.1 이후)) — 아래 플랫폼 차이. 기본 입력의 Web Enter(`enterKeyHint="search"`, IME 조합 중 Enter는 무시)·Native 키보드 검색 키(`returnKeyType="search"`, `onSubmitEditing`)와 SearchScreen이 그린 확정 행·제안·최근·추천 검색어가 모두 여기로 온다. 앞뒤 공백을 지운 값이고 공백만이면 부르지 않는다. 고른 값이 입력과 다르면 먼저 `onQueryChange`. 대기 중인 `onSearch` debounce는 그대로 둔다. `queryField`를 주면 그 입력의 키는 연결하지 않는다 |
| `committedQuery` | `string` | 없음 | 결과를 보여 줄 확정 검색어. 주면 두 단계 검색(`onSubmit` 필수, 타입). 단계: 검색어 공백 = 검색 전, 확정값과 다름 = 입력 중, 같음 = 결과(앞뒤 공백 무시). `children`은 결과 단계에만 그린다 |
| `queryLabelVisibility` | `visible` · `hidden` | `visible` | `hidden`이면 보이는 label 없이 `queryLabel`을 접근성 이름(Web `aria-label`, Native `accessibilityLabel`)과 placeholder로 쓴다 |
| `searching` · `searchingLabel` | `boolean` · `string` | 없음 | 기본 입력의 진행 표시(Web `loading`, Native `busy`+`busyLabel`). 함께 주거나 함께 생략(타입). 켜져 있으면 `searchingLabel`을 낭독한다 |
| `recentQueries` | `{ items, title, clearAllLabel, onClearAll(), removeLabel(query), onRemove(query), icon?, removeIcon?, maxVisible? }` | 없음 | 검색 전 본문 맨 위. 행 = 확정, 행 끝 × = `onRemove`, 제목 끝 = `onClearAll`. 기본 5행(`searchScreenRecipe.recentVisible`) |
| `suggestedQueries` | `{ title, items: string[] }` | 없음 | 검색 전(최근 검색 아래)과 검색어 때문인 0건 아래 Chip 줄. 누르면 확정 |
| `suggestions` | `{ items: { query, match?: { start, end } }[], commitLabel(query), countLabel(count), icon?, maxVisible? }` | 없음 | 입력 중 본문: 첫 행 `commitLabel`(그대로 확정) + 제안 최대 6행. `match` 범위는 굵게(Web). 개수를 `countLabel`로 낭독 |
| `resultSummary` | `{ count: number \| null, countLabel(count), loadingLabel, sort?, notice?, empty?: { title, description? } }` | 없음 | 결과 머리. `count = null`이면 개수 자리 Skeleton + `children` 대신 로딩 4행. `notice`는 개수 위(이전 결과 유지 오류). `count = 0`이면 개수 대신 `empty`로 EmptyState |
| `resultSummary.sort` | `{ label, triggerLabel, value, options: { id, label }[], onChange(id), icon? }` (Native는 `dismissLabel` 추가) | 없음 | 결과 머리 끝 Menu(single). 바꾸면 본문을 맨 위로 |
| `appliedFilters` | `{ items: { key, label }[], removeLabel(label), onRemove(key), clearAllLabel, onClearAll(), removeIcon? }` | 없음 | 결과 머리 아래 × 칩 + `모두 해제`. 개수는 trigger 이름과 0건 원인 판정에도 쓴다 |
| `filterSheet` | `{ open, onOpenChange(open), title, value, onApply(next), count(draft): number \| null, reset(draft), isDefault(draft), renderContent(draft, setDraft), labels: { close, reset, apply(count) }, size?, trigger? }` | 없음 | 열 때 `value`를 초안으로 복사, 닫히면 초안을 버림, 주 행동에서만 `onApply`. `count = 0`이면 주 행동 비활성, `isDefault`면 초기화 비활성. `trigger`를 주면 칩 줄 맨 앞에 `label(적용 개수)` Chip |
| `filtersOverflow` | `wrap` · `scroll` | `wrap` | `scroll`이면 `filters`를 한 줄 가로 스크롤 영역에 넣고 화면 좌우 여백(`spacing.md` 16, `contentInset="none"`이면 0)에 `hostGutter`를 더한 만큼 가장자리까지 넓힌다. 첫 칩은 검색 입력과 같은 시작선에 놓인다 |
| `hostGutter` | `none` · `compact` · `regular` · `spacious` | `none` | 미게시(1.13.1 이후). 이 화면을 감싼 host가 이미 준 좌우 여백 이름(`containerRecipe.gutters`: 0 · `spacing.md` 16 · `spacing.lg` 20 · `spacing.xl` 24). Container 안이면 그 `gutter`, Sheet 본문 안이면 `regular`(`sheetRecipe.content.paddingHorizontal`과 같은 `spacing.lg`). `scroll` 줄만 이 값을 쓴다 |
| `recentSearches` | `ReactNode` | 없음 | `query`가 공백일 때만 본문 맨 위에 보인다 |
| `children` | `ReactNode` | 필수 | 결과 |
| 나머지 | `ScreenLayout`과 같음(`children`·`footer` 제외) | — | `notice`는 필터 아래에 붙는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ScreenLayout 폭(최대 720); 검색 입력은 padding 안 전체 폭 | `ScreenLayout`, `SearchField` |
| 간격 | 화면 padding `spacing.md` 16(notice 영역은 좌우만); 검색 입력·`filters`·`notice` 사이 `spacing.sm` 12; 본문 최근 검색–결과 `spacing.lg` 20 | Web·Native `SearchScreen` `Stack gap="sm"`·`gap="lg"` |
| 순서·정렬 | 헤더(제목) → 검색 입력 → [`filterSheet.trigger`, `filters`] → `notice` → 본문. 본문은 검색 전: `recentSearches` → `recentQueries` → `suggestedQueries`(사이 `spacing.xl` 24) / 입력 중: 확정 행 → 제안 / 결과: `resultSummary.notice` → 개수·정렬 → 적용 필터(사이 `spacing.sm` 12) → `children`(위 `spacing.lg` 20) | 렌더 순서, `searchScreenRecipe` |
| 고정·스크롤 | 검색 입력·필터는 notice 자리에 고정, 본문만 스크롤; `state`가 바뀌어도 입력·필터는 남는다 | `ScreenLayout` `notice` |
| 좁은 폭·큰 글자 | 입력은 폭을 줄여 맞춘다. `filtersOverflow="wrap"`은 필터가 줄바꿈되어 고정 영역이 줄 수만큼 커진다. `scroll`은 큰 글자에서도 한 줄(Web 2배 글자 실측: 칩 줄 52, 1배 44)로 고정 영역을 묶는다 | `SearchScreen`, `.hjm-search-screen__filters` |

## 꼭 지킬 것

- 검색어가 있으면 오른쪽 ×로 전체를 지우고 입력 포커스를 유지한다. 기본 입력의 `queryClearLabel`은 제품 i18n 문구다. `queryField`를 교체할 때도 동일한 지우기 동작을 제공한다(2026-10-06 사용자 요청). 지우기는 `onQueryChange("")`를 거쳐 기존 debounce·요청 취소 경로로 전달된다.

- `onSearch`는 첫 렌더 뒤와 빈 `query`에도 불린다. 빈 검색어 처리(요청 생략)는 제품이 한다.
- 응답을 반영하기 전에 `signal.aborted`를 확인한다. 취소는 신호만 줄 뿐 늦은 응답을 막지 않는다.
- 실패와 0건을 구분한다. 오류는 이전 결과를 남기고 본문 위 `Notice tone="danger"` + 다시 시도, 0건은 `EmptyState`로 그린다.
- 문구(`title`, `queryLabel`, 상태 제목)는 i18n 키로 넣는다.
- 최근 검색은 `onSubmit`에서만 저장한다. SearchScreen은 모든 확정(키·제안·최근·추천)을 `onSubmit`으로 보내고 debounce된
  `onSearch`는 보내지 않는다. `onSearch`에서 저장하면 "산", "산책"이 따로 쌓인다(2026-10-06 개편 전 공통 검색 예제의 결함).
- 두 단계 검색에서 `children`에는 결과 목록만 넣는다. 제안·로딩 행·0건 EmptyState·개수·정렬을 다시 그리면 SearchScreen이 그린 것과 겹친다.
- 적용 조건은 `appliedFilters`로 넘긴다. 0건 원인(필터면 칩 줄 유지 + `모두 해제`, 검색어면 칩 줄 숨김 + 추천 검색어)을 이 개수로 판정한다.
- 시트 `count`와 결과 개수는 같은 계산에서 나와야 한다. 다르면 "N개 결과 보기"와 적용 뒤 개수가 어긋난다.
- `contentInset="none"`으로 host가 여백을 주는 화면은 `hostGutter`에 그 여백 이름을 넘긴다. 없으면 `scroll` 줄이 host 여백 안에서 잘린다.
- 칩이 여러 개인 필터 줄은 `filtersOverflow="scroll"`로 한 줄에 둔다. 제품이 CSS·ScrollView로 가로 스크롤을 따로 만들지 않는다
  (가장자리 여백·포커스 링 잘림·RTL이 제품마다 갈린다).
- 검색 로딩·0건·오류는 `state`로 본문을 바꾸지 않고 `children` 안에서 그린다(입력·필터·이전 결과를 지키기 위해서다. 2026-10-06 개편 전
  예제는 `state="error"`로 이전 결과까지 지웠다). `state`는 화면 자체를 쓸 수 없는 경우(로그인 필요 등)에만 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `queryField` slot | 넘기면 기본 SearchField 대신 그린다 | 넘기면 기본 SearchField 대신 그린다 |
| 기본 입력 | `SearchField` + `queryLabel`·`queryClearLabel` | `SearchField` + `queryLabel`·`queryClearLabel`, `busyLabel`도 `queryLabel` |
| `onSubmit` | Enter keydown. `isComposing`·keyCode 229(IME 조합)는 무시. Enter로 확정하면 포커스는 입력에 남는다 | `onSubmitEditing`. 한 줄 입력의 기본 blur-on-submit으로 키보드가 닫힌다 |
| 제안·최근·추천을 골라 확정 | 고른 행·칩은 단계가 바뀌며 사라지므로 포커스를 결과 영역(`.hjm-search-screen__results`, `tabIndex=-1`, 테두리 없음)으로 옮긴다. 입력을 떠나므로 모바일 브라우저 키보드도 닫힌다. 개수는 기존 `role="status"`가 읽는다 | `Keyboard.dismiss()`(one-step·two-step 모두). 포커스는 옮기지 않는다(낭독 커서 유지) |
| `queryLabelVisibility="hidden"` | `aria-label` + `placeholder` | `accessibilityLabel` + `placeholder` |
| `searching` | `loading`: 입력 가능, `aria-busy`, 숨긴 `role="status"`로 `searchingLabel` | `busy`+`busyLabel`: 입력 가능, `announceForAccessibilityWithOptions(queue)` |
| 개수 낭독 | 숨긴 `role="status"` 하나 | `announceForAccessibilityWithOptions(…, { queue: true })`, 문구가 바뀔 때만 |
| 지운 뒤 포커스 | 적용 칩·최근 검색 ×: 같은 자리 다음 항목 → 없으면 trigger(최근 검색은 입력) | 옮기지 않는다(낭독 커서 유지) |
| 제안 강조 | `match` 범위 굵게 | ListRow 제목이 문자열이라 강조 없음 |
| 정렬 | Menu 목록, 바꾸면 `.hjm-screen__body` 맨 위 | Menu에 `sort.dismissLabel` 필요, 바꾸면 본문 ScrollView 맨 위(`scrollRef`는 그대로 전달) |
| 필터 시트 | 창 폭 ≥ 960(expanded)이면 옆 시트(`placement="end"`), footer [초기화][주] | 아래 시트 `scrollable`, footer 세로 fullWidth 주 먼저 |
| `filtersOverflow="scroll"` | `div.hjm-search-screen__filters`(overflow-x auto, 스크롤바 숨김, 위아래로 포커스 링 두께만큼 여백, 넓히는 폭은 inline `--hjm-search-filters-bleed`). Tab 이동 시 브라우저가 칩을 보이게 스크롤한다 | 가로 `ScrollView`(`keyboardShouldPersistTaps="handled"`, 표시기 숨김, `marginHorizontal`·`paddingHorizontal`에 같은 폭) |

## 함정

- 기본값(`queryLabelVisibility="visible"`)은 label을 보이게 그려 고정 영역을 1배 약 22, 2배 약 40 더 쓴다(2026-10-06 실측). 검색만 하는 화면은 `hidden`을 쓴다.
- 1.12.1 이하 Native에서는 `searching`인 동안 SearchField `busy`가 입력을 무시해 그동안 친 글자가 사라졌다. 다음 릴리스부터 두 플랫폼 모두 입력을 받으므로 입력 중 제안 조회에도 켤 수 있다. 1.12.1 이하에 머무는 Native 제품은 확정 결과 요청에만 켠다.
- Native 필터 시트는 닫힘 애니메이션이 끝난 뒤에 다시 열린다(Sheet 계약). 닫자마자 `open`을 켜도 바로 보이지 않을 수 있다.
- Web `filters` 안에 `Stack wrap`을 넣어도 `scroll`에서는 한 줄이다(자식 폭을 `max-content`로 잡는다).
- 1.13.0 이하에서는 제안·최근·추천을 골라 확정해도 Native 키보드가 남았고(검색 키만 닫혔다), Web은 고른 행이 사라지며 포커스가 `<body>`로
  떨어졌다. utilverse는 `onSubmit`에서 `Keyboard.dismiss()`를 불렀다(2026-10-06). 1.13.1부터 SearchScreen이 닫으므로 그 호출을 지운다.
- 1.13.0 이하에서는 `contentInset="none"`이면 `scroll` 줄이 전혀 넓어지지 않아 host 여백(Container·Sheet)에서 잘렸다. 1.13.1부터 `hostGutter`로 맞춘다.
- 시트 안 SearchScreen은 Sheet `size`를 `auto` 밖으로 주고 `scrollable` 없이 넣는다. 1.13.0 이하 Native는 이때 화면이 0pt가 됐다([Sheet 함정](sheet.md#함정)).
