# 검색 결과와 필터

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screen-flows.tsx`(`SearchScreen` 두 단계 검색 prop, 2026-10-06 사용자 위임 결정으로 미리보기 로직을 공개 API로 올림), 예제 `showcase/*/search-discovery-preview.tsx`·`showcase/shared/search-discovery.ts`. 2026-10-06 사용자 요청("실험에 있는 검색화면 UI도 개편해. 검색과 필터 있는 앱 서비스 따라해.")에 따라 Material 3 Search·Apple HIG search fields·Baymard·NN/g·eBay Playbook 필터 패턴과 국내 커머스·생활 서비스 모바일 웹의 **구조·상호작용만** 조사해 다시 설계했다(브랜드 색·로고·문구·자산은 가져오지 않았다). 2026-10-06 사용자 승인으로 실험 `공통 화면/검색`을 배포하면서 같은 일을 직접 조립하던 배포 `화면/검색`(내 기록 검색)을 대체했다(Web id `patterns-search` 보존, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/검색/검색 결과와 필터`

## 목적

입력 중 제안 → 확정 → 결과·필터의 두 단계 검색 화면을 SearchScreen 하나로 구성한다. 단계 전환·확정 경로·섹션 배치·필터 시트 초안·0건 복구·포커스·개수 낭독은 SearchScreen이 소유하고 제품은 데이터·요청·문구·아이콘만 공급한다(2026-10-06 전에는 이 모두가 Storybook 미리보기 코드에만 있었다). 스토리는 상태별 정지 화면(`입력 중`·`결과`·`필터 적용`·`필터 시트`·`불러오는 중`·`결과 없음`·`오류`·`로그인 필요`)과 `실패와 복구`(다음 검색 실패 → 다시 시도)를 보여 주고, `어두운 테마`·`큰 글자`는 필터 적용 화면으로 연다. `기본`(검색 전)에서 검색 전 → 입력 → 확정 → 필터 → 상세 → 돌아오기에서 검색어·조건·정렬·스크롤이 남는 흐름을 직접 조작한다. 2026-10-06 같은 예제를 그리던 `기본 흐름/검색과 필터`(복구 흐름)와 `구성/검색/여러 조건 적용과 초기화`(초안·적용 필터 시트)를 이 항목으로 합쳤다([옛 링크](../../../../../docs/STORYBOOK_NAVIGATION.md#실험-정리와-합친-항목-2026-10-06)). 데이터·제안·권한·문구는 제품이 공급하며 예제의 메모리 검색을 운영 검색으로 취급하지 않는다.
배포의 옛 직접 조립 `내 기록 검색`(검색어를 칠 때마다 바로 거르는 SearchField + 카테고리 SegmentedControl + 결과 List + 상세 Sheet 한 세로 스크롤)도 이 항목으로 대체했다. 확정·제안·필터 시트가 필요 없는 수십 개짜리 내 목록을 그 자리에서 거르는 정도라면 화면 대신 [SearchField](../components/search-field.md)와 [SegmentedControl](../components/segmented-control.md)을 목록 위에 직접 두고, 결과 수는 상태 문구로 알린다.

## 영역 구조

좁은 폭(Web < 600, Native) — 결과 + 필터 적용:

```text
┌ safe area(host) ─────────────────────────────┐
│ [←]  검색                                     │ 머리: leading IconButton + 제목. description 없음
│ [🔍 산책                           (×)]       │ ┐ 고정(notice): SearchField medium 44, label 숨김(placeholder)
│               ↕ spacing.sm 12                 │ │
│ [☰ 필터 2][✓사진 있음][저장함][기간: 올해 ▾][종류 ▾] →│ ┘ trigger(HJM) + filters(제품), 한 줄 스크롤
├──────────────────────────────────────────────┤ ── 여기부터 스크롤 ──
│ 결과 5개                       [정렬: 관련도순 ▾]│ Text · Button ghost small → Menu(single)
│ [사진 있음 ×][기간: 올해 ×]  모두 해제          │ 적용 조건 Chip(action, trailing ×) · Button ghost small
│               ↕ spacing.lg 20                 │
│ 산책길에서 찾은 작은 여유                       │ ListRow 두 줄(제목, 종류 · 날짜)
│ 사진 · 10월 6일                                │ 일치 부분은 굵게(Web)
│ …                                             │
│ [더 보기]                                      │ LoadMore manual(8개씩)
└ safe area(host) ─────────────────────────────┘
```

검색 전 · 입력 중:

```text
검색 전(검색어 공백)                      입력 중(확정 전)
│ [←] 검색                         │    │ [←] 검색                         │
│ [🔍 기록 검색              ]     │    │ [🔍 산|                    (×)]  │ ← 칩 줄 없음
├──────────────────────────────────┤    ├──────────────────────────────────┤
│ 최근 검색             전체 삭제  │    │ 🔍 ‘산’ 검색                     │ ← 첫 행 = 그대로 확정
│ 🕘 카페                     (×)  │    │ 🔍 산책                          │ ListRow compact 44 ×≤6
│ 🕘 아침                     (×)  │    │ 🔍 산책 모임 첫날                │
│        ↕ spacing.xl 24           │    │ …                                │
│ 자주 찾는 주제                   │
│ [산책][카페][책][아침][정원]     │ Chip action, 누르면 확정
```

필터 시트와 Web 넓은 폭:

```text
Native · Web < 960: 아래 시트(size large)        Web ≥ 960(expanded): 옆 시트(placement end, 폭 min(28rem,100%))
╭──────────────────────────────╮                ┌──── ScreenLayout max 720 ────┐ ╭──────────────╮
│ 필터                    [×]  │                │ [←] 검색                       │ │ 필터     [×] │
│ 종류  [기록][사진][장소]      │ multiple       │ [🔍 산책              (×)]    │ │ 종류 …       │
│ 기간  [전체][이번 주][✓올해]  │ single         │ [☰ 필터 2][✓사진 있음]…       │ │ 기간 …       │
│ 조건  사진 있는 기록만  (●)   │ Switch row     │ 결과 5개          [정렬 ▾]    │ │ 조건 …       │
│       저장한 기록만     (○)   │                │ …                             │ │              │
├──────────────────────────────┤ footer 고정     └───────────────────────────────┘ │[초기화][5개…]│
│ Web    [초기화] [5개 결과 보기]│ [보조][주]                                        ╰──────────────╯
│ Native [   5개 결과 보기    ] │ 주 먼저, fullWidth
│        [   초기화           ] │
╰──────────────────────────────╯
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | SearchScreen(ScreenLayout) | route 본문, host가 남은 높이·safe area·키보드 처리 | 폭 최대 `layout.readingMaxWidth` 720, 좌우 `spacing.md` 16. Native 본문 `scrollProps={{ keyboardDismissMode: "on-drag" }}` |
| 머리 | `title` + `leading`(IconButton 뒤로) | 맨 위 | `description`은 비운다(고정 영역 한 줄 절약) |
| 검색 입력 | 기본 SearchField(`queryLabel`·`queryLabelVisibility="hidden"`·`queryClearLabel`·`onSubmit`·`searching`) | 머리 아래, 고정 | `medium` 44 |
| 필터 칩 줄 | HJM `filterSheet.trigger` Chip + 제품 `filters`(Stack inline gap `xs` > Chip `small`) | 검색 입력 아래, 고정, 결과 단계에만 | 입력과 `spacing.sm` 12, 칩 36(+Native hitSlop 4), 칩 사이 `spacing.xs` 8. `filtersOverflow="scroll"` |
| 결과 머리 | `resultSummary`: 개수 Text(muted) + 정렬 Menu(Button ghost small) | 본문 첫 줄 | `justify="between"` wrap, 큰 글자에서 두 줄 |
| 적용 조건 | `appliedFilters`: Chip action(trailing ×) + Button ghost small `모두 해제` | 결과 머리 아래 | 머리와 `searchScreenRecipe.headerGap`(`spacing.sm` 12), 칩 사이 `spacing.xs` 8 |
| 결과 | 제품 `children`: ListRow(두 줄 68) + LoadMore `manual` | 적용 조건 아래 | 위 `spacing.lg` 20(SearchScreen 본문 Stack) |
| 최근 검색 | `recentQueries`: Heading level5 + Button ghost small `전체 삭제` + ListRow compact(Web: 옆 IconButton ×, Native: `trailingAction`) | 검색 전 본문 맨 위 | `searchScreenRecipe.recentVisible` 5행 표시(보관 개수는 제품), 섹션 사이 `searchScreenRecipe.sectionGap`(`spacing.xl` 24) |
| 추천 검색어 | `suggestedQueries`: Heading level5 + Chip action wrap | 최근 검색 아래, 검색어 때문인 0건 아래 | 칩 사이 `spacing.xs` 8 |
| 자동완성 | `suggestions`: ListRow compact ×(1 + `searchScreenRecipe.suggestionVisible` 6) | 입력 중 본문 | 행 최소 44 |
| 필터 시트 | `filterSheet`: Sheet(`size` 기본 `large`, 섹션은 제품이 `auto`, Native `scrollable`, Web ≥ 960 `placement="end"`) | 오버레이 | 머리·footer 고정, 섹션은 제품 `renderContent`(섹션 사이 `spacing.xl` 24) |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 검색 확정 | 키보드 Enter·검색 키(`onSubmit`), 제안 첫 행 `‘q’ 검색`, 제안·최근·추천 선택 | 입력·본문 | 확정 때만 결과 조회와 최근 검색 저장 |
| 검색어 지우기 | SearchField × | 입력 끝 | 하나. 별도 "검색어 지우기" 버튼을 두지 않는다 |
| 전체 필터 열기 | `filterSheet.trigger` → Chip action `필터 N`(이름 "필터, N개 적용됨", Web `aria-haspopup="dialog"`) | 칩 줄 맨 앞(HJM이 그린다) | 하나 |
| 빠른 조건 | Chip `multiple` | `필터` 다음 | 즉시 적용·재조회 |
| 항목별 조건 | Chip action `기간: 올해 ▾`(이름 "…, 바꾸기") | 빠른 조건 다음 | 제품이 범위를 정하고 `filterSheet.open`을 켠다. 같은 시트에 그 섹션만 |
| 정렬 | Menu `single`, 트리거 Button ghost small | 결과 머리 끝 | 즉시 적용, 목록 맨 위로 |
| 조건 하나 해제 · 모두 해제 | Chip action(trailing ×) · Button ghost small | 결과 머리 아래 | 칩들 뒤에 `모두 해제` |
| 시트 적용 | Button primary `N개 결과 보기`(0이면 `결과 없음`·비활성) | 시트 footer | Web [초기화][적용], Native 적용 먼저 세로 |
| 시트 초기화 | Button secondary | 시트 footer | 항상 같은 자리, 초안이 기본값이면 비활성. 열린 섹션만 초기화 |
| 최근 검색 삭제 · 전체 삭제 | IconButton ghost × · Button ghost small | 행 끝 · 섹션 제목 끝 | 행마다 하나 |
| 복구 | Notice `danger` action(Button secondary small `다시 시도`) · EmptyState action(Button secondary `모두 해제`) | 결과 위 · 빈 결과 | 하나 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 검색 전(검색어 공백): 머리 · 입력 / 최근 검색(있을 때) · 자주 찾는 주제. 칩 줄 없음 | 최근·주제 선택 = 확정 |
| 입력 중 | 칩 줄 숨김. `‘q’ 검색` 행 + 제안(일치 부분 굵게, Web) | 제안 개수 polite 알림 |
| 결과 | 칩 줄 · `결과 N개` · 정렬 · 목록 · 더 보기 | 결과 개수 알림 |
| 필터 적용 | `필터 N`, 선택된 빠른 칩, 항목 칩 라벨이 값으로, 결과 위 적용 조건 칩 | ×로 하나씩, `모두 해제` |
| 필터 시트 | 초안을 고치는 동안 결과는 그대로, footer 개수가 초안 기준으로 바뀜 | 닫기(×·scrim·Escape·back) = 초안 버림 |
| 로딩 | `resultSummary.count = null`: 입력·칩 줄 유지, 개수 자리 Skeleton + `children` 대신 4행(Web ListRow `loading`, Native Skeleton). `searching`이면 입력 끝 진행 표시와 `searchingLabel` 낭독 | 두 플랫폼 모두 입력을 잠그지 않는다(1.12.1 이하 Native는 잠갔다) |
| 빈 | `결과 없음` 스토리(검색·필터 0건이라 `NoResults`). 필터 때문이면 칩 줄·적용 조건 유지 + EmptyState `모두 해제`. 검색어만으로 0건이면 칩 줄 숨김 + EmptyState + 추천 검색어 | 원인을 지울 수 있는 행동 하나 |
| 오류 | 이전 결과를 남기고 위에 Notice `danger` | `다시 시도` |
| 실패와 복구 | `실패와 복구` 스토리: 다음 검색 실패를 예약한 뒤 검색하면 오류 행이 되고 `다시 시도`로 같은 검색어·조건을 다시 조회 | 검색어·조건·정렬은 그대로 |
| 로그인 필요 | `state={{ kind: "restricted" }}`로 본문 교체 | `stateAction` 로그인 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [SearchScreen](../components/search-screen.md) | 화면 틀, 두 단계 검색 prop 전체, debounce·취소 |
| [SearchField](../components/search-field.md) | 기본 입력·지우기 |
| [Chip](../components/chip.md) | 필터·빠른 조건·적용 조건·추천 검색어 |
| [Sheet](../components/sheet.md) | 필터 시트(초안·적용) |
| [Menu](../components/menu.md) | 정렬 |
| [ListRow](../components/list-row.md) | 최근 검색·제안·결과 행 |
| [EmptyState](../components/empty-state.md) · [Notice](../components/notice.md) · [Skeleton](../components/skeleton.md) | 빈 결과 · 오류 · 로딩 |
| [LoadMore](../components/load-more.md) | 결과 더 보기 |
| [Switch](../components/switch.md) | 시트의 조건 행 |
| [선택 후 적용·취소](../compositions/interaction-flow-apply.md) | 초안·적용 분리 규칙 단독 예제 |
| [늦은 응답보다 최신 검색 유지](../compositions/interaction-flow-search.md) | 취소·늦은 응답 무시 |

## 코드 골격

```tsx
// Web
import { SearchScreen } from "@hjmds/react/screen-flows";

<SearchScreen
  title={t("search.title")}
  queryLabel={t("search.query")}
  queryLabelVisibility="hidden"
  queryClearLabel={t("common.clearSearch")}
  query={query}
  onQueryChange={setQuery}
  onSearch={(value, { signal }) => loadSuggestions(value, signal)} // 입력 중: 제안만
  committedQuery={committed}
  onSubmit={(value) => { setCommitted(value); saveRecent(value); }} // 모든 확정이 여기로 온다
  searching={isFetching}
  searchingLabel={t("search.searching")}
  recentQueries={{
    items: recents, title: t("search.recent"), clearAllLabel: t("search.recentClearAll"), onClearAll: clearRecents,
    removeLabel: (item) => t("search.recentRemove", { item }), onRemove: removeRecent,
  }}
  suggestedQueries={{ title: t("search.topics"), items: topics }}
  suggestions={{
    items: suggestions,
    commitLabel: (q) => t("search.commitRow", { q }),
    countLabel: (n) => t("search.suggestionCount", { n }),
  }}
  resultSummary={{
    count: isFetching ? null : results.length, // null = 불러오는 중(로딩 행)
    countLabel: (n) => t("search.resultCount", { n }),
    loadingLabel: t("search.loading"),
    sort: { label: t("search.sort"), triggerLabel: sortLabel, value: sort, options: sortOptions, onChange: setSort },
    empty: { title: t("search.emptyTitle"), description: t("search.emptyBody") },
  }}
  appliedFilters={{
    items: appliedChips, removeLabel: (label) => t("search.removeFilter", { label }), onRemove: removeFilter,
    clearAllLabel: t("search.clearFilters"), onClearAll: clearFilters,
  }}
  filterSheet={{
    open: sheetOpen, onOpenChange: setSheetOpen, title: t("search.filter"),
    value: filters, onApply: setFilters, count: (draft) => countResults(committed, draft),
    reset: () => defaultFilters, isDefault,
    renderContent: (draft, setDraft) => <FilterSections draft={draft} onChange={setDraft} />,
    labels: { close: t("common.close"), reset: t("search.reset"), apply: (n) => t("search.showResults", { n: n ?? 0 }) },
    trigger: { label: (n) => t("search.filterCount", { n }), accessibilityLabel: (n) => t("search.filterApplied", { n }) },
  }}
  filtersOverflow="scroll"
  filters={<QuickFilterChips />}
>
  <ResultList items={results} />
</SearchScreen>
```

```tsx
// Native — 정렬 Menu에 dismissLabel이 더 필요하다
import { SearchScreen } from "@hjmds/react-native/screen-flows";

<SearchScreen
  title={t("search.title")}
  queryLabel={t("search.query")}
  queryLabelVisibility="hidden"
  queryClearLabel={t("common.clearSearch")}
  query={query}
  onQueryChange={setQuery}
  onSearch={(value, { signal }) => loadSuggestions(value, signal)} // 입력 중: 제안만
  committedQuery={committed}
  onSubmit={(value) => { setCommitted(value); saveRecent(value); }} // 모든 확정이 여기로 온다
  searching={isFetching}
  searchingLabel={t("search.searching")}
  recentQueries={{
    items: recents, title: t("search.recent"), clearAllLabel: t("search.recentClearAll"), onClearAll: clearRecents,
    removeLabel: (item) => t("search.recentRemove", { item }), onRemove: removeRecent,
  }}
  suggestedQueries={{ title: t("search.topics"), items: topics }}
  suggestions={{
    items: suggestions,
    commitLabel: (q) => t("search.commitRow", { q }),
    countLabel: (n) => t("search.suggestionCount", { n }),
  }}
  resultSummary={{
    count: isFetching ? null : results.length, // null = 불러오는 중(로딩 행)
    countLabel: (n) => t("search.resultCount", { n }),
    loadingLabel: t("search.loading"),
    sort: { label: t("search.sort"), triggerLabel: sortLabel, value: sort, options: sortOptions, onChange: setSort, dismissLabel: t("common.close") },
    empty: { title: t("search.emptyTitle"), description: t("search.emptyBody") },
  }}
  appliedFilters={{
    items: appliedChips, removeLabel: (label) => t("search.removeFilter", { label }), onRemove: removeFilter,
    clearAllLabel: t("search.clearFilters"), onClearAll: clearFilters,
  }}
  filterSheet={{
    open: sheetOpen, onOpenChange: setSheetOpen, title: t("search.filter"),
    value: filters, onApply: setFilters, count: (draft) => countResults(committed, draft),
    reset: () => defaultFilters, isDefault,
    renderContent: (draft, setDraft) => <FilterSections draft={draft} onChange={setDraft} />,
    labels: { close: t("common.close"), reset: t("search.reset"), apply: (n) => t("search.showResults", { n: n ?? 0 }) },
    trigger: { label: (n) => t("search.filterCount", { n }), accessibilityLabel: (n) => t("search.filterApplied", { n }) },
  }}
  filtersOverflow="scroll"
  filters={<QuickFilterChips />}
>
  <ResultList items={results} />
</SearchScreen>
```

데이터(`recents`·`topics`·`suggestions`·`results`·`appliedChips`), 요청(`loadSuggestions`·`countResults`), 저장(`saveRecent`)과
`FilterSections`·`QuickFilterChips`·`ResultList`는 제품이 공급한다. 섹션만 여는 패싯 칩은 제품이 자기 범위 상태를 바꾸고
`filterSheet.open`을 켠다(`title`·`reset`·`isDefault`·`renderContent`가 그 범위를 따른다). 검색 결과 개수와 `count(draft)`는
같은 계산(서버 count API 등)에서 나와야 "N개 결과 보기"와 적용 뒤 개수가 어긋나지 않는다.
`searching`은 제안 조회와 확정 결과 요청 모두에 켤 수 있다. 진행 중에도 두 플랫폼이 입력을 받는다(1.12.1 이하 Native는 SearchField `busy`가 입력을 무시해 확정 요청에만 켜야 했다).

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자 | 칩 줄은 줄바꿈 없이 한 줄 가로 스크롤로 남아 고정 영역 = 머리 + 입력 + 칩 한 줄로 묶인다. 2026-10-06 Web 실측(2배, 높이 844): 390 폭 고정 영역 258(머리 96 + 입력·칩 162), 본문 502. 320 폭은 머리가 두 줄(156)로 접혀 고정 318, 본문 442. 결과 머리는 개수·정렬이 두 줄로 접힌다. Switch 행은 1.6배 이상에서 트랙이 아래로 내려간다 |
| 다크 | semantic token만 쓰므로 따로 처리하지 않는다. 일치 강조는 색이 아니라 굵기라 다크·색각 차이에서도 남는다. 예제 색을 제품 기본값으로 복사하지 않는다 |
| 좁은 폭 | 320에서 칩 줄은 화면 끝까지 스크롤, 적용 조건 칩은 줄바꿈, 시트는 아래 전폭 |
| 넓은 폭(Web ≥ 960) | 한 열(최대 720) 유지, 필터 시트는 `placement="end"` 옆 시트로 결과를 가리지 않는다. 상시 왼쪽 필터 패널은 ScreenLayout 폭 계약 밖이라 두지 않는다 |
| 키보드 | Native 본문 ScrollView가 `keyboardShouldPersistTaps="handled"`라 키보드가 떠 있어도 제안 행이 한 번에 눌린다. 검색 키로 확정하면 키보드가 닫힌다 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 확정 신호 | Enter(IME 조합 중 Enter 무시) | 키보드 검색 키 |
| 일치 강조 | `suggestions.items[].match` 범위를 굵게. 결과 행은 제품이 ListRow `title`에 `Text emphasis="strong"` | ListRow `title`이 문자열이라 강조하지 않는다(`match`는 무시) |
| 개수 알림(SearchScreen) | 숨긴 `role="status"` 영역 하나 | `AccessibilityInfo.announceForAccessibilityWithOptions(…, { queue: true })` |
| 조건·최근 검색 삭제 뒤 포커스 | 다음 칩·× → 없으면 `필터` 칩·검색 입력 | 이동하지 않는다(스크린 리더 커서 유지) |
| 상세에서 돌아오기 | 검색을 `hidden`으로 마운트 유지 + 본문 scrollTop 복원 + 누른 행으로 포커스 | `display: "none"`으로 마운트 유지 |
| 정렬 메뉴 | 트리거 옆 목록(`align="end"`) | Menu 표면, `sort.dismissLabel` 필요 |
| 정렬 뒤 맨 위로 | 본문 `.hjm-screen__body` scrollTop 0 | 본문 ScrollView `scrollTo({ y: 0 })`(제품 `scrollRef`도 그대로 받는다) |
| 시트 footer | 오른쪽 정렬 [초기화][N개 결과 보기] | 세로 fullWidth, 주 행동 먼저 |

## 함정

- 최근 검색을 `onSearch`에서 저장하면 debounce된 부분 입력("산", "산책")이 따로 쌓인다. 2026-10-06 개편 전 예제의 결함이다.
- 0건 원인 판정(`resolveSearchEmptyCause`)은 `appliedFilters.items` 개수로 한다. 적용 조건을 `appliedFilters`로 넘기지 않으면 필터 때문인 0건도 검색어 때문으로 보고 칩 줄을 숨긴다.
- 정렬을 필터 시트 안에 넣으면 정렬 하나 바꾸는 데 시트를 열고 적용해야 한다. 결과 머리의 Menu로 즉시 적용한다(개편 전 `검색과 필터` 예제의 문제).
- Web Chip은 `onClick`을 자기 핸들러로 덮어써서 Menu `trigger`로 쓰면 메뉴가 열리지 않는다. 정렬 트리거는 Button을 쓴다.
- `모두 해제`는 적용 조건만 지우고 검색어는 남긴다. 검색어까지 지우는 행동을 두면 이름에 범위를 적는다(`검색어와 조건 초기화`). 닫기·취소는 적용값을 바꾸지 않는다(흡수한 `여러 조건 적용과 초기화`의 규칙).
- `committedQuery`를 주고 `children`에 제안·로딩·0건을 다시 그리면 SearchScreen이 그린 것과 겹친다. 두 단계 검색에서 `children`은 결과 목록만 담는다.
- 최근 검색 저장소를 `onSearch`에 연결하지 않는다. SearchScreen은 확정만 `onSubmit`으로 보내므로 거기서만 저장한다.
- Storybook은 실제 검색 서버·라우터 연동 증거가 아니다. Native 화면은 2026-10-06 개편에서 시뮬레이터로 확인하지 않았다(구조는 렌더 테스트로만 확인).
