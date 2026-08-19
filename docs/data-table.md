# DataTable contract

**문제.** 사용자가 여러 행의 데이터를 표로 훑고, 필요하면 열 기준으로 정렬하거나
행을 골라 배치 작업을 한다. antd `Table`은 이 배치에서 **가장 큰 표면**이다 —
정렬·필터·페이징·선택·확장행·고정열·그룹헤더·요약행을 전부 갖는다. 이 모듈은 그
표면을 옮기지 않는다. antd `Table` → HJM `DataTable`은 **adapted**
관계다(`src/component-references.ts`) — decompose하지 않고 한 컴포넌트로 두되,
문제를 HJM 의미로 다시 번역한다.

**일반화한 계약 — 그리고 계약이 아닌 것.**

- **계약인 것**: 열 정의(`id`·`header`·정렬 가능 여부·정렬 방향·align·width 힌트),
  행 식별(stable `id`, `disabled?`), 행 선택, 비동기 로딩 상태, 정렬 상태의
  toggle 규칙.
- **계약이 아닌 것**: 실제 정렬 실행과 필터링. `Combobox`가 `filtering:
  "local" | "external"`로 실행 방식을 나누고 검색 실행 자체는 항상 제품(로컬 배열이든
  서버 쿼리든)에 맡기는 것과 같은 경계다(`src/combobox.ts`). `getNextDataTableSortState`는
  버튼을 눌렀을 때 **다음 정렬 상태가 무엇이어야 하는지**만 판정하고, 실제 행을
  재배열하는 일은 하지 않는다.
- 행 선택은 `CollectionSelectionModel`(`src/behaviors.ts`)을 **그대로** 재사용한다 —
  `none | single | multiple`, controlled/uncontrolled 쌍 전부 Select/Menu와 같다.
  새 선택 타입을 만들지 않는다.
- 로딩 상태는 `AsyncCollectionState`(`idle | loading | loadingMore | empty | error`,
  각 상태의 message)를 **그대로** 재사용한다.
- 반대로 **`CollectionItemDescriptor`는 재사용하지 않는다.** 그 타입의 `label`/
  `textValue`는 "이 항목을 보이는 한 문장과 검색어로 대표할 수 있다"는 Menu/Select
  전제인데, 표 행은 여러 열의 값으로 이루어져 하나의 대표 문장이 없다. `DataTableRowDescriptor`는
  `id`와 `disabled?`만 가진 훨씬 좁은 타입이다 — Collection 기본 계약 중 실제로
  행에 맞는 부분만 가져오고, 맞지 않는 부분(label/textValue/typeahead)은 그대로
  두었다.
- `Pagination`(다른 저작자가 이번 배치에서 계약)과 `LoadMore`(이미 beta)는 DataTable이
  **소유하지 않고 합성**한다. `asyncState`가 `loadingMore`일 때 그 아래 어느
  컴포넌트를 두는지는 제품 선택이다 — Native 긴 목록에 LoadMore를 쓰듯 Web 표에도
  같은 패턴이 통한다.
- 정렬 값은 `"ascending" | "descending"`이며 `null`이 "정렬 없음"이다 — antd의
  `"ascend"/"descend"` 축약형을 그대로 옮기지 않고 `aria-sort`의 실제 어휘를 썼다.
  Web renderer가 번역표 없이 그대로 속성에 꽂는다(Slider의 `valueText` pass-through와
  같은 선택).
- 헤더 전체 선택 상태는 새 `"none"|"some"|"all"` enum을 만들지 않고 이미 있는
  `CheckboxState`(`boolean | "mixed"`)를 그대로 반환한다 — 헤더 체크박스가 어차피
  check/dash로 그리는 값과 같은 타입이라 recipe가 또 번역할 일이 없다.
- **행 확장(expandable row)은 여기서 소유하지 않는다.** antd Table의 확장행은 문제상
  이미 beta인 `Accordion`의 disclosure 문제와 겹친다 — 확장/축소 축, 트리거,
  `aria-expanded`를 또 계약하면 Tag가 Chip의 `selected`와 별도 `closable` 축을 만들지
  않기로 한 것과 같은 실수가 된다(`docs/dropdown.md`가 Menu/Dropdown에서 이미 같은
  논리를 적용했다). 확장 가능한 상세 행이 필요한 제품은 `disclosureGroup` 행동
  계약을 행 단위로 합성한다.
- **넣지 않은 것(불필요/미측정)**: 열 고정(고정열)과 가로 스크롤 동기화는 렌더러
  기법이다. 열 리사이즈·드래그 재정렬·그룹 헤더(colgroup)·요약(합계) 행은 실제
  제품 요구가 측정되지 않았다. 각각 나중에 vertical slice가 나오면 이 문서를
  갱신하고 새 축을 연다.
- **roving-tabindex 그리드 키보드 탐색을 만들지 않는다.** 정렬 가능한 헤더는
  일반 버튼, 선택 셀은 일반 checkbox/radio native tab stop이다 — ARIA grid의 셀
  단위 방향키 이동은 측정된 요구가 없고 지금 범위보다 훨씬 큰 접근성 표면이라
  넣지 않는다.

**HJM 기본값.** 정렬 헤더 버튼과 선택 셀은 `control.minTouchTarget`(44) 이상을
유지한다. 행 hover/selected 배경은 `collectionItemContract`의 `highlightedBackground`/
`selectedBackground`를 그대로 재사용해 Menu·Select·DataTable이 한 상호작용 색
어휘를 공유한다 — 새 recipe가 새 hover 색을 발명하지 않는다. 기본 정렬 cycle은
`three-state`(ascending → descending → 정렬 없음)로, 사용자가 정렬을 완전히
해제할 수 있는 경로를 항상 남긴다.

**플랫폼 번역.**

- Web: `role="table"`/`"row"`/`"columnheader"`/`"cell"`. **정렬 가능한 헤더는
  `columnheader` 안의 버튼이지, `columnheader` 자체가 인터랙티브해지는 것이
  아니다** — Collection 기본 계약의 "interactive item 안에 또 다른 button/link
  금지"를 뒤집어 표에 적용한 것이다(바깥 컨테이너가 아니라 안쪽 하나의 컨트롤만
  포커스 가능해야 한다). 정렬 방향은 그 `columnheader`의 `aria-sort`로 그대로
  나간다.
- 선택 셀의 checkbox/radio는 CheckboxGroup 선례와 같이 각자 독립 tab stop이다 —
  별도 roving focus를 만들지 않는다.
- Native renderer는 이번 배치에 없다(`platform: "web"`) — `behaviorRegistry`의
  `native` 필드는 breadcrumb·form 같은 다른 Web 전용 계약과 같은 빈 배열
  자리표시자다.

**검증 화면.** 아직 실제 제품 vertical slice가 없다 — catalog는 `planned`으로
남고, `beta` 승격은 로드맵 gate(실제 화면 검증)를 통과한 뒤 리드가 진행한다.
