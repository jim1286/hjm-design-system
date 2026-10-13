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
  재배열하는 일은 하지 않는다. 2026-10-14부터 로컬 배열을 정렬하는 **선택형 helper**
  (`sortDataTableRows`)를 계약이 함께 제공한다. renderer는 여전히 행을 재배열하지 않고,
  제품이 helper를 부르거나 서버에 정렬을 맡긴다([아래](#정렬-helper와-native-renderer--2026-10-14)).
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
- `Pagination`(다른 저작자가 이번 배치에서 계약)과 `LoadMore`(이미 stable)는 DataTable이
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
- **넣지 않은 것(불필요/미측정)**: 열 리사이즈·드래그 재정렬·그룹 헤더(colgroup)는 실제
  제품 요구가 측정되지 않았다. 각각 나중에 vertical slice가 나오면 이 문서를
  갱신하고 새 축을 연다. (2026-10-14 갱신: 처음 목록에 있던 열 고정과 요약(합계) 행은
  Yajalal 기록 표에서 요구가 측정돼 시작 쪽 열 고정 `pinned: "start"`와 renderer의
  `summaryRow` slot으로 열었다.)
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
  자리표시자다. (2026-10-14 갱신: Native renderer가 들어와 `native`는
  roles `button`·`header`, state `selected`, action `activate`가 됐다.)

**검증 화면.** 제품 vertical slice는 필요하지 않다. Renderer 계약을 정렬·tri-state selection·
async 상태와 narrow long-copy 회귀로 확인하고, 소비 제품의 데이터 정렬·페이지네이션은 계속
제품 소유로 둔다. 채택 여부는 [stable 승격 기준](stable-promotion.md)과 별도다.

## Web renderer (2026-09-18)

`@hjmds/react/data-table`의 `DataTable`이 이 계약을 실행한다. Web renderer는 전용 keyboard·
selection·320px long-copy proof를 통과해 2026-09-29 stable로 승격한다. Native는 2026-10-14까지
`unsupported`였다(아래 절).

- **기존 `Table`과 정렬 기능은 공유한다.** 2026-10-01 중복 조사에서 Table도 정렬 버튼과
  ascending/descending 순환을 제공하는데 표시 전용으로 설명했던 불일치를 확인했다.
  Table은 generic row·caption·emptyState와 두 방향 정렬을 제공하고, DataTable은
  ID 기반 row/column·선택·tri-state·async 상태 및 정렬 해제를 포함하는 세 상태 순환을 제공한다.
  정렬 전환은 같은 계약 함수, header button은 같은 내부 renderer를 소비한다.
  caption과 단순 generic row 표는 Table, 행 선택·loading/error와 정렬 해제가 필요한 표는
  DataTable을 선택한다. API를 합치면 caption·emptyState·row 모델 호환성을 잃으므로 두 API를 유지한다.
- **정렬 버튼은 header 안에 있다.** `th` 자체를 버튼으로 만들지 않고, 방향은
  `aria-sort`에 그대로 흘린다. 다음 상태는 `getNextDataTableSortState`가 정하고 실제 정렬은
  제품이 한다.
- **선택은 공용 collection 모델 그대로다.** multiple은 checkbox, single은 radio 의미를
  쓰고, 머리글의 tri-state는 `resolveDataTableSelectAllState`가 파생한다. disabled 행은
  분모·분자 양쪽에서 빠진다. `selectedKey(s)`가 있으면 controlled, `defaultSelectedKey(s)`만 있으면
  renderer가 첫 값을 내부 상태로 보관하고 행·전체 선택으로 갱신한다(2026-10-06 정정: default를 매 렌더 다시
  읽어 클릭 후에도 표시가 바뀌지 않았다. Tree와 같은 결함·같은 수정).
- **셀 하나에 focusable 컨트롤은 최대 하나다.** roving tabindex grid 탐색을 도입하지 않고
  기본 tab 순서를 쓴다.
- **페이지네이션은 표 아래에 조합한다.** `footer` slot은 제품이 채우고 표가 소유하지 않는다.
- 키보드는 표 전체를 하나의 ARIA grid로 만들지 않고 native Tab 순서를 쓴다. 실제 브라우저 입력으로
  select-all·정렬·행 선택 버튼이 Tab 순서에 있고 Space/Enter로 동작하는지 확인한다. 방향키 셀 탐색은
  계약에 없다 — 제품 수요가 확인되지 않은 full grid interaction은 별도 계약으로 다룬다.
- 로컬 검증: `test/data-table.browser.test.tsx` 8개(header 안 정렬 버튼과 aria-sort 3단계,
  tri-state 선택과 disabled 제외, 단일 선택 radio 의미, 비제어 single·multiple 선택 보관과
  controlled 소유자 우선, 셀당 컨트롤 하나와 기본 tab 순서, async 상태 발표와 footer 조합, 44px hit area), `test/data-table.keyboard.browser.test.tsx` 1개(실제 Tab·Enter·Space
  입력), 그리고 `컴포넌트/탐색/Command Palette`의 표 화면.

## 정렬 helper와 Native renderer — 2026-10-14

2026-10-14 사용자 요청("유명한 차트·표 라이브러리를 리버스 엔지니어링해서 … 차트와 표 다 흡수")으로
[Chart](chart.md)와 함께 표의 경계도 다시 그었다. 처음 경계(정렬 실행은 제품 소유)의 결과로 Yajalal의
`RecordTable`과 다른 기록 표가 같은 정렬 규칙(표시 문자열 "0.340"·"36 ⅓"·"13.5억"의 숫자 해석, 빈 값을
아래로, 같은 값의 원래 순서 유지)을 각자 다시 구현했다. 같은 규칙이 반복되므로 helper를 계약이 소유한다.
참고한 개념은 TanStack Table(`sortDescFirst`, `sortUndefined: "last"`, 안정 정렬)과 AG Grid(열 고정)이며
소스는 가져오지 않았다.

**열 옵션 두 개.**

- `sortDescFirst?: boolean` — 첫 누름을 내림차순으로 시작한다. 기록 표는 "높은 값 먼저"로 읽는 열이 많다.
  평균자책점·순위처럼 낮을수록 좋은 열은 끈다. 다음 상태는
  `getNextDataTableSortState(current, columnId, cycle, dataTableFirstSortDirection(column))`로 정한다 —
  `three-state`는 첫 방향 → 반대 방향 → 정렬 없음, `two-state`는 첫 방향 ↔ 반대 방향이다. 네 번째 인자가
  없으면 이전과 같이 오름차순으로 시작한다(호환).
- `pinned?: "start"` — 나머지 열이 가로로 스크롤될 때 그 열을 보이게 둔다(선수 이름 열). 시작 쪽에서
  **끊기지 않고 이어진** 고정 열만 인정한다(`splitPinnedDataTableColumns`). 가운데 열 하나를 고정하면 열 순서가
  화면과 접근성 순서에서 달라지므로 받지 않는다. 끝 쪽 고정은 측정된 요구가 없다.

**정렬 helper(선택형).**

- `toDataTableSortValue(text)` — 표시 문자열을 정렬 키로 바꾼다. "0.340"·".340"·"36 ⅓"·"13.5억"·"61.0%"는 수,
  글자가 둘 이상인 "7승0무3패"·이름은 문자열, "—"·"-"·""는 빈 값이다.
- `compareDataTableValues(a, b, locale?)` — 수는 수로, 문자열은 `localeCompare`로, 수가 문자열보다 앞이다.
- `sortDataTableRows(rows, sort, getValue, { locale })` — 안정 정렬이며 **빈 값은 방향과 상관없이 항상 마지막**이다.
  내림차순에서 빈 값이 맨 위로 올라오면 "기록 없음"이 1위처럼 보이기 때문이다. `sort`가 `null`이면 원래 순서다.
- 서버 정렬 제품은 helper를 쓰지 않고 지금처럼 `getNextDataTableSortState`만 부른다. renderer는 어느 쪽에서도
  행을 재배열하지 않는다(제어 `sortState` 경계 유지).

**요약 행.** renderer prop `summaryRow?: (columnId) => ReactNode`가 표 끝에 합계·평균 행을 그린다(Web `tfoot`).
값 계산과 문구는 제품이 한다. 계약 descriptor 축이 아니라 renderer slot이다.

**Native renderer.** `@hjmds/react-native/data-table`의 `DataTable`이 같은 계약을 실행한다. Web과 같은 이름의 prop
(`columns`·`rows`·`labels.table`·`labels.sortColumn`·`renderCell`·`sortState`/`onSortChange`/`sortCycle`·`asyncState`·
`density`·`footer`·`summaryRow`)을 쓰고, Native 전용으로 `onRowPress?(rowId)`·`selectedRowId?`를 둔다.

- 고정 열은 제자리에 두고 나머지 열은 가로 `ScrollView` 안에 두며 스크롤 가장자리에 흐림(fade)을 표시한다.
  좁은 폭에서 열을 줄이지 않고 가로 스크롤로 보존하는 선택이다 — 기록 표는 열을 빼면 비교 자체가 안 된다.
- 정렬 머리 칸은 `button` role이며 머리 행은 `header`, 행 누름은 `activate`, 선택된 행은 `selected` 상태로 나간다.
- Web의 checkbox/radio 다중 선택 열(`selection`)은 Native에 없다. 행 하나를 고르는 일은 `onRowPress`·`selectedRowId`로
  제품이 소유한다. 다중 선택 일괄 작업의 Native 요구는 측정되지 않았다.
- 2026-10-14 작성 시점에 Native renderer는 구현 중이다. renderer 테스트·Storybook(`배포/컴포넌트/데이터 표시/데이터 표`의
  Native 등록)·기기 확인 결과는 들어온 뒤 이 절에 기록한다. 카탈로그 행의 Native 지원 표시는 그때 함께 바꾼다.
