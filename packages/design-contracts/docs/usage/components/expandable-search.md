# ExpandableSearch

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [검색·메시지 연결 계약](../../communication.md), `src/communication.ts`의 `SearchResponse`, 양 renderer `src/communication.tsx`
- 스토리북: `배포/구성/선택과 필터/펼치는 상단 검색`

## 언제 쓰나

평소에는 검색 열기 버튼 하나만 두고, 누르면 그 자리에서 검색 입력·제안·최근 검색·결과를 펼칠 때 쓴다.
Lucian 027의 펼침 검색을 기존 `SearchScreen`의 두 단계 검색·debounce·AbortSignal에 연결한 구성이다.
펼침 상태·검색어·최근 검색은 제품이 소유하고, 현재 검색어와 맞는 최신 응답만 표시한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 검색이 화면의 본문 전체 | `SearchScreen` |
| 입력란 하나만 필요 | `SearchField` |
| 명령 실행 팔레트 | `CommandPalette` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ExpandableSearch` | 열기 버튼 ↔ 펼친 검색(입력·제안·결과) | `@hjmds/react/communication` | `@hjmds/react-native/communication` |

`SearchResponse<T>` 타입은 `@hjmds/design-contracts/communication`에 있다. root barrel에는 없다.

## 최소 사용 예

```tsx
// Web
import { ExpandableSearch } from "@hjmds/react/communication";

<ExpandableSearch<Doc[]> expanded={expanded} onExpandedChange={setExpanded} query={query} onQueryChange={setQuery}
  onSearch={(value, { signal }) => api.searchDocs(value, { signal })} // { result, suggestions }
  renderResult={docs => <DocList docs={docs} />}
  onSubmit={value => saveRecent(value)} recentQueries={recentQueries}
  labels={{ title: t("search.title"), open: t("search.open"), cancel: t("search.close"), query: t("search.query"),
    clear: t("search.clear"), searching: t("search.searching"), error: t("search.failed"),
    commit: value => t("search.commit", { value }), suggestionCount: count => t("search.suggestions", { count }) }} />
```

```tsx
// Native
import { ExpandableSearch } from "@hjmds/react-native/communication";

<ExpandableSearch<Doc[]> expanded={expanded} onExpandedChange={setExpanded} query={query} onQueryChange={setQuery}
  onSearch={(value, { signal }) => api.searchDocs(value, { signal })}
  renderResult={docs => <DocList docs={docs} />}
  onSubmit={value => saveRecent(value)} recentQueries={recentQueries}
  labels={searchLabels} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| expanded / onExpandedChange | boolean / fn | 필수 | 펼침 상태(제품 소유) |
| query / onQueryChange | string / fn | 필수 | 검색어(제품 소유) |
| onSearch | (query, { signal }) => Promise\<SearchResponse\<T\>\> | 필수 | 실제 결과와 `suggestions`. 빈 입력은 호출하지 않음 |
| renderResult | (result: T) => ReactNode | 필수 | 현재 검색어의 결과 렌더 |
| onSubmit | (query) => void | 없음 | Enter·제안·최근 검색 확정 시 trim된 값 |
| recentQueries | SearchRecentQueries | 없음 | SearchScreen 최근 검색 슬롯 |
| debounceMs | number | 300 | SearchScreen `searchScreenRecipe.debounceMs` |
| disabled | boolean | false | 열기 버튼 비활성 |
| labels | object | 필수 | title·open·cancel·query·clear·searching·error·commit·suggestionCount |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 접힘: Button(primary) 하나. 펼침: SearchScreen 규격 | 양 renderer |
| 간격 | 세로 sm | 양 renderer |
| 순서·정렬 | 접힘: 열기 버튼. 펼침: 닫기(ghost) → SearchScreen(제목 숨김, 입력·제안·결과) → 오류(가로 중앙) | 양 renderer |
| 고정·스크롤 | 결과 스크롤은 SearchScreen·바깥 host 소유 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | SearchScreen 입력·제안 규칙을 그대로 따름 | SearchScreen |

## 꼭 지킬 것

- `onSearch`는 `signal`을 실제 요청에 전달한다. 신호를 무시해도 늦은 응답은 표시되지 않지만 서버 부하는 남는다.
- 최근 검색 저장·분석은 `onSubmit`에서만 한다. 타이핑 중 자동 기록하지 않는다.
- 닫아도 검색어는 지우지 않는다. 지울지는 제품이 `query`로 정한다.

## 상태와 상호작용

| 상태 | 모습 |
| --- | --- |
| 접힘 | 열기 버튼만 표시. 진행 중 요청은 abort |
| 펼침 | 검색 입력으로 포커스. 입력 변경마다 debounce 뒤 검색 |
| 검색 중 | SearchScreen `searching` 표시 |
| 실패 | 입력 유지, 아래 중앙 오류. 편집·재검색으로 재시도 |
| 닫기 | 요청 abort 후 `onExpandedChange(false)` |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 닫은 뒤 | 열기 버튼으로 포커스 복원 | 키보드를 내림 |
| 입력 | SearchScreen 기본 입력 | `SearchField`(busy 표시, return 키 `search`로 확정) |
| 실패 알림 | `role="alert"` | `accessibilityRole="alert"`·assertive |
