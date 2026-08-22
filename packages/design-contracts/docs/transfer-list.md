# TransferList contract

## 문제

두 목록 사이로 항목을 옮긴다(권한 있는 사용자 ↔ 권한 없는 사용자, 후보 ↔ 확정 명단).
Ant Design `Transfer`와 `adapted` crosswalk를 따른다(HJM은 `checkbox`/`checkAll` 같은
antd 전용 prop 이름을 옮기지 않고 Collection 기본 계약으로 다시 번역한다).

## 일반화한 계약

### 하나의 항목 집합, membership으로 나뉜 두 패널

두 패널을 서로 다른 배열로 관리하면 이동 시 두 배열이 어긋날 수 있다. 대신 CheckboxGroup의
`ReadonlySet<Id>` 관례를 그대로 따라 **전체 `items` 하나 + `targetKeys: ReadonlySet<Id>`
하나**로 값 하나를 유지한다 — target 패널은 `targetKeys`에 있는 항목, source 패널은 나머지
전부다. `resolveTransferListPanels`가 이 분리를 계산하고, 매번 `items`의 상대 순서를
보존한다(패널을 옮겨도 원래 목록 순서가 흔들리지 않는다).

### 각 패널의 선택은 값이 아니라 이동 전 임시 상태

두 패널 각각 다중 선택(체크박스)을 갖는다. 이 선택은 `targetKeys`처럼 커밋된 값이 아니라
"다음에 무엇을 옮길지"를 가리키는 임시 상태이므로 별도 `TransferListSelection`(패널별
`ReadonlySet<Id>`)으로 분리했다 — Select의 `selectedKey`와 Combobox의 `inputValue`가
독립 축인 것과 같은 이유다.

### 접근성 계약이 본체다 — 이동은 마우스 전용이 될 수 없다

이 컴포넌트가 실제로 계약해야 하는 것은 시각 레이아웃이 아니라 "옮기는 동작이 키보드로
완전히 가능한가"다.

- 각 행은 체크박스 토글이 자신의 유일한 동작이다(Collection 기본 계약의 "interactive
  item 안에 또 다른 button/link 금지"를 지킨다 — 행 안에 별도 이동 버튼을 넣지 않는다).
- 패널 사이에 공유 이동 버튼 두 개(→/←)가 있고, 각 버튼은 해당 패널에 선택된 항목이
  있을 때만 활성화된다. `moveTransferListSelection`은 버튼이 조작하는 다중 선택 이동과
  "선택 하나만 담아 호출"하는 단일 항목 이동을 같은 함수로 표현한다 — 별도 API를 늘리지
  않는다.
- **이동 후 포커스가 어디로 가는지를 이 계약이 직접 정의한다.** 기존 이 저장소 어디에도
  "목록에서 항목이 사라진 뒤 포커스가 어디로 가는가"를 정의한 선례가 없어(Tag 제거, Tree
  노드 제거 계약 모두 이 질문을 다루지 않는다) 이 모듈이 그 첫 자리다.
  `resolveTransferListFocusAfterMove`는 제거된 행의 자리로 밀려 올라온 항목에 포커스를
  주고(제거된 인덱스와 같은 자리, 없으면 마지막 항목), 패널이 통째로 비면 `null`을
  반환해 렌더러가 빈 상태 메시지나 이동 버튼으로 포커스를 넘기게 한다 — 포커스가
  document body로 사라지는 경우를 만들지 않는다.
- **무엇이 낭독되는지도 이 계약이 정의한다.** `moveTransferListSelection`은 실제로 옮겨진
  id 목록(`movedIds`, 원래 패널 순서대로)을 반환한다. HJM은 문자열을 조립하지 않는다
  (Statistic 원칙) — 제품이 이 목록으로 "2명이 선택 명단으로 이동했습니다" 같은 문장을
  만들어 live region에 알린다.

### 비활성 항목은 선택도, 이동도 되지 않는다

`toggleTransferListSelection`은 `toggleCheckboxSelection`을 그대로 재사용해 비활성 항목을
선택 자체에서 막는다. `moveTransferListSelection`은 그래도 선택 집합에 비활성 id가 있는
경우(예: 제품이 `defaultSelectedKeys`로 직접 넣은 경우)를 던지지 않고 건너뛴다 —
`toggleTreeCheckedSelection`의 비활성 스킵과 같은 관례다. 옮겨지지 않은 항목은 선택
상태에 그대로 남는다 — 이동 함수는 "옮겨진 id만" 선택에서 지운다.

### 패널 전체 선택은 DataTable의 tri-state를 그대로 일반화한다

`resolveTransferListSelectAllState`는 `resolveDataTableSelectAllState`가 테이블 헤더에
쓰는 것과 똑같은 규칙(비활성 행은 분모와 카운트 모두에서 제외)을 패널 하나에 적용한다.
`toggleTransferListSelectAll`은 `getCheckboxNextState`의 "mixed는 체크로 처리한다"는
기존 관례를 그대로 쓴다.

## 뺀 것

- **검색.** 각 패널 안에서 후보를 줄이는 문제는 이미 `SearchField`가 있다. 두 컴포넌트를
  조합하는 것(검색 입력이 어떤 패널의 어떤 필터 상태를 갖는지)은 제품의 몫이지 이
  계약이 아니다 — 검색 상태를 여기 넣으면 Combobox의 `queryValue`/`filtering`과 같은
  문제를 또 다른 이름으로 계약하게 된다.
- **페이지네이션.** 같은 이유로 `Pagination`이 이미 있다. 긴 패널에서는 페이지네이션
  대신 `LoadMore`를 조합하는 쪽이 로드맵의 다른 adaptive 컴포넌트(Select/Combobox)와
  일관된다 — 이 판단도 이 계약에 넣지 않는다.

## HJM 기본값

- 행 anatomy: `collectionItemContract`를 그대로 쓴다(Menu/Select/Tree 행과 같은 44-unit
  타겟, hover/selected 배경, focus indicator).
- 패널 프레임: 배경/보더/radius만 있는 가벼운 컨테이너(`transferListRecipe.panel`) —
  `floatingSurfaceContract`의 shadow는 쓰지 않는다. 패널은 떠 있는 표면이 아니라 화면에
  고정된 두 목록이다.

## 플랫폼 번역

Web/Native 모두 두 리스트박스 + 공유 이동 버튼이라는 같은 anatomy를 쓴다. Web은
`role="listbox"`에 `aria-multiselectable`, roving tabindex로 화살표 키 이동과 Space
토글을 구현한다. Native는 리스트 각각을 `accessibilityRole="list"`, 행을
`accessibilityState={{checked}}`로 노출하고 이동 버튼은 일반 버튼이다 — 스와이프
전용 이동 제스처는 열지 않는다(브리프의 "옮기는 동작이 마우스로만 가능하면 안 된다"는
Native의 "터치 전용"에도 같게 적용되므로, 버튼이 항상 스와이프의 대체 경로로 존재해야
한다).

## 검증 화면

아직 없음. `planned → beta` 승격은 실제 제품 vertical slice 이후 리드가 진행한다.
