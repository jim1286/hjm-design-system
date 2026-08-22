# Tree contract

## 문제

계층으로 이루어진 데이터를 펼치고 접으며 탐색하고, 그 안에서 하나 또는 여럿을 고른다.
Ant Design `Tree`와 `direct` crosswalk를 따른다.

## Collection 기본 계약의 확장

로드맵의 「Collection 기본 계약」은 `section → item` 2단 고정 형태다
(`CollectionSource`, `src/collection.ts`). Tree는 임의 깊이가 본질이라 이 고정 2단
형태를 그대로 쓸 수 없다 — section은 애초에 선택 불가능한 라벨일 뿐인데, Tree의 모든
노드(자식이 있든 없든)는 선택 가능한 완전한 item이어야 한다. section을 "자식이 있는
노드"로 재해석하면 Select/Menu의 "section은 값이 아니다"라는 불변식이 깨진다.

그래서 무엇을 재사용하고 무엇을 새로 만들지 판정했다.

**재사용한 것.**

- **필드 자체.** `TreeNodeDescriptor`는 `CollectionItemDescriptor`에서 Menu 전용
  `shortcut`/`tone`을 뺀 나머지(`id`/`label`/`textValue`/`description?`/`disabled?`)에
  `children?`만 얹은 타입이다(`Omit<CollectionItemDescriptor<Id>, "shortcut" | "tone"> &
  { children?: ... }`). 새 필드 어휘를 만들지 않았다.
- **평탄화 뒤의 기본 검증.** `flattenTreeNodes`로 전체 트리를 깊이 우선으로 편 뒤,
  `validateTreeNodes`가 그 결과를 그대로 `validateCollection({ items: flattened })`에
  넘긴다. `TreeNodeDescriptor`가 `CollectionItemDescriptor`의 초집합이라 별도 변환 없이
  통과하고, "라벨/textValue 비어있지 않음", "전체에서 id 유일함" 같은 규칙을 다시 쓰지
  않는다(테스트로 확인: 서로 다른 깊이의 두 노드가 같은 id를 쓰면 이 재사용 경로가
  던진다).
- **위/아래·Home/End·typeahead.** `getCollectionNavigationTarget`과
  `getCollectionTypeaheadMatch`를 그대로 쓴다(`getVisibleTreeNavigationTarget`/
  `getVisibleTreeTypeaheadMatch`는 얇은 래퍼일 뿐이다). 현재 보이는(접힌 하위트리를
  제외한) 노드 배열을 `{ items }`로 넘기면 disabled skip, 경계에서 멈춤, typeahead
  매칭까지 그대로 맞는다 — "보이는 노드만의 선형 목록"이라는 점에서 Menu의 항목
  목록과 다르지 않기 때문이다.
- **선택 모드.** `TreeSelectionModel<Id>`는 `CollectionSelectionModel<Id>`를 그대로
  가리킨다. `expansion-roadmap.md`가 Tree를 Menu/Select/DataTable과 함께 이 모델을
  공유해야 하는 컴포넌트로 이미 명시하고 있다.

**새로 만든 것.** 깊이(`depth`)·형제 위치(`position`/`siblingCount`)·부모 연결
(`parentId`)·펼침 유도(`expanded`)·가시성(`visible`)을 만드는 `resolveTreeDescriptor`의
재귀 walk, 좌/우 화살표 판정(`getTreeArrowKeyIntent`/`getTreeArrowResult`), 빈 배열
`children` 거부, 그리고 재사용 가능한 값으로 정리해 남겨진 것 없이 삭제·복원하는
`reconcileTreeExpansion`(`reconcileCheckboxSelection`과 같은 모양). 이 넷은 antd
`Tree`에도, 이 저장소의 다른 어떤 컴포넌트에도 없는, Tree만의 문제다.

## 일반화한 계약

### 펼침 상태

`expandedKeys: ReadonlySet<Id>`(controlled) / `defaultExpandedKeys?`(uncontrolled) —
CheckboxGroup의 `ReadonlySet` 관례를 따른다. 순수 함수들(`resolveTreeDescriptor` 등)은
Carousel의 `currentKey`와 같은 이유로 이미 해석된 구체적 `ReadonlySet<Id>`만 받는다 —
controlled/uncontrolled 분기는 렌더러가 끝낸다.

### 선택

`TreeSelectionModel<Id>`(= `CollectionSelectionModel<Id>`)로 `none|single|multiple`을
그대로 받는다. 새 모델을 만들지 않았다.

### 비활성 노드는 선택만 막는다

`disabled`는 `CollectionItemDescriptor`처럼 선택 자격만 가린다. 펼침/접힘은 `disabled`와
무관하게 항상 가능하다 — 비활성 노드도 그 아래 무엇이 있는지는 볼 수 있어야 한다(선택
못 하는 것과 탐색 못 하는 것은 다른 문제다).

### 접근성: 깊이와 형제 위치를 낭독에 남긴다

Web `tree`/`treeitem`/`group` 시맨틱(다열 데이터가 필요해지면 렌더러가 `treegrid`로
바꿀 수 있지만, 이 계약이 보장하는 키보드/aria 축은 둘 다 같다) 위에 `resolveTreeDescriptor`가
각 노드에 `depth`(1-based), `position`/`siblingCount`(형제 안에서, 전체 편평 목록이
아니라 — ARIA `aria-level`/`aria-posinset`/`aria-setsize`가 정의하는 것과 같은 단위),
그리고 제품이 조립한 `accessibleName`을 붙인다. `hasChildren`/`expanded`를 함께 넘겨
"펼쳐짐"/"접힘" 문구를 붙일지, 리프에서 아예 뺄지는 제품이 정한다(Steps/Timeline/
Carousel과 같은 이유로 어순·조사를 여기서 조립하지 않는다).

### 화살표 키는 방향에 따라 뜻이 바뀐다

`getTreeArrowKeyIntent(key, direction)`는 `ArrowRight`/`ArrowLeft`를 `expand`/`collapse`로
바꾸되 `rtl`에서는 뒤집는다 — `getSelectionNavigationIntent`가 CheckboxGroup/RadioGroup
방향키에 이미 적용하는 것과 같은 번역이다. `getTreeArrowResult`는 WAI-ARIA tree 패턴을
그대로 따른다: 접힌 채 자식이 있으면 펼치고, 이미 펼쳐졌으면 첫 자식으로 포커스
이동(둘 다 이미 `resolved` 배열에 있는 `parentId`/`position`으로 찾는다, 트리를 다시
훑지 않는다) — collapse는 그 반대(펼쳐졌으면 접고, 리프거나 이미 접혔으면 부모로).

### 한 노드는 하나의 tab stop이다

펼침/접힘 chevron은 별도 버튼이 아니라 장식이다. 화살표 키(또는 행 클릭)가 펼침을
바꾸고, chevron 자체는 포커스를 받지 않는다 — "선택 행 전체가 하나의 target이며 내부에
또 다른 button/link를 넣지 않는다"는 이 저장소의 기존 규칙(`docs/architecture.md`의
선택 입력 절)을 그대로 따른다.

### 뺀 것

- **드래그 재정렬.** 측정된 요구가 없고, "어느 부모 아래 몇 번째로 옮겼는가"를
  검증하는 계약은 지금 계약보다 훨씬 크다. 실제 화면이 나오면 그때 연다.
- **비동기 자식 지연 로딩(각 노드별 loading 상태).** 트리 전체의
  `AsyncCollectionState`(`TreeAsyncState`, Select/Combobox와 같은 타입)는 열어 두지만,
  "이 노드의 자식만 아직 로딩 중"이라는 노드별 축은 넣지 않았다 — 브리프도 요구하지
  않았고, 실사용처가 확인되지 않은 상태에서 새 축을 추가하면 유령 계약이 된다(Steps의
  판단과 같은 이유).

## HJM 기본값

- `node` 슬롯은 새 시각을 만들지 않고 `collectionItemContract`를 그대로 쓴다(Menu/Select
  항목과 같은 44-unit 행, hover/selected 배경, focus indicator).
- `indentPerLevel`은 `spacing.lg`(20) — 깊이 하나당 이 만큼 들여쓴다.
- toggle 아이콘은 새 글리프를 만들지 않고 기존 `chevronEnd`(접힘)/`chevronDown`(펼침)을
  쓴다. `chevronEnd`는 논리 방향이라 RTL에서 자동으로 뒤집힌다.

## 검증 화면

아직 없음. `planned → beta` 승격은 실제 제품 vertical slice 이후 리드가 진행한다.

## TreeSelect 판정

TreeSelect는 Tree를 계약한 지금도 **만들지 않는다.** 한 줄 판정: TreeSelect는 "Select의
표면(트리거+뜨는 목록, 하나 또는 여럿을 committed value로 커밋) 위에 Tree의 collection을
올린 것"이라 Tree와 별개의 순회/발화 문제를 새로 풀지 않는다 — 지금 이 문서가 정의한
depth/sibling 발화, 화살표 판정, `expandedKeys` 재조정을 그대로 가져다 Select의
popup/sheet 표면에 얹으면 된다. 새 recipe나 새 상태 축이 필요해 보이지 않으므로, 측정된
제품 요구가 나오기 전까지는 `src/tree-select.ts`를 만들지 않는다(`docs/dropdown.md`·
`docs/notification.md`와 같은 판단).
