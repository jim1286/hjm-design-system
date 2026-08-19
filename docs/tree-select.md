# TreeSelect — 판정 검증과 빠진 한 조각

## 문제

계층 데이터에서 하나 또는 여럿을 골라 Select처럼 트리거+값으로 커밋한다. antd
`TreeSelect`와 `direct` crosswalk를 따른다.

## 기존 판정 검증

`docs/tree.md`의 "TreeSelect 판정"은 이미 다음과 같이 결론지었다: TreeSelect는
Select의 표면(트리거+뜨는 목록, committed value) 위에 Tree의 collection(깊이/형제
발화, 화살표 판정, `expandedKeys` 재조정)을 얹은 것이지 세 번째 primitive가 아니다.

이 판정을 검증했다. **단일 선택(single-select) TreeSelect에는 정확히 맞다** — 노드
하나(리프든 카테고리든)를 값으로 고르는 데는 집계할 것이 없다. `SelectSelection`의
`selectedKey: Id | null`과 Tree의 평평한 항목 목록만으로 완결된다. 새 코드가 필요
없다.

**다중 선택(multiple-select, 체크박스) TreeSelect에는 판정이 불완전했다.** 어느
파일도 "부모 체크박스가 자식 중 일부만 체크됐을 때 세 번째 집계 상태(mixed)를
보여줘야 한다"는 문제를 풀지 않는다. 이것은 새 선택 모델이 아니라
`resolveDataTableSelectAllState`(`src/data-table.ts`)가 이미 한 단계(헤더 ↔ 행)에서
푼 문제를 재귀 깊이(부모 ↔ 모든 자손 리프)로 일반화한 것 — 헤더 체크박스가 이미
쓰는 그 `CheckboxState`(`boolean | "mixed"`)를 그대로 재사용한다. 이 문서와
`src/tree-select.ts`는 **그 한 조각만** 채운다.

## 일반화한 계약

### 체크된 키는 리프만 저장한다

`TreeCheckedKeys<Id> = ReadonlySet<Id>`는 **리프 노드 id만** 담을 수 있다.
`validateTreeCheckedSelection`은 부모 id나 존재하지 않는 id가 섞이면 던진다. 부모
자신의 id를 집합에 넣을 수 있게 하면 "이 부모 자체를 하나의 값으로 고른 것"과
"이 부모의 모든 자식을 골랐다는 표시"가 구분되지 않는 모호함이 생긴다 — antd가
`checkStrictly`라는 별도 옵션으로 풀어야 했던 바로 그 모호함이다. 측정된 요구 없이
그 모호함을 추측해서 풀지 않고, 애초에 표현 불가능하게 만들었다: 부모의 체크
상태는 **항상 유도**되고 **결코 저장되지 않는다** — DataTable 헤더가 `selectedKeys`
안의 한 행이 되는 일이 없는 것과 같은 이유다.

### 집계는 활성 자손 리프 커버리지로 계산한다

`resolveTreeCheckedStates`는 트리 전체를 한 번 훑어 모든 노드의 tri-state를 계산한다
(`resolveTreeDescriptor`가 depth/position을 한 번에 계산하는 것과 같은 모양). 각
노드는 부모로 올라가며 `{ enabled 자손 리프 수, 그중 체크된 수 }`를 합산하고,
`enabled === 0` 이거나 `checked === 0`이면 `false`, `checked === enabled`면 `true`,
그 사이면 `"mixed"`다.

**비활성 리프는 분모와 분자 모두에서 제외된다** —
`resolveDataTableSelectAllState`의 "Disabled rows are excluded from both the
denominator and the count"를 그대로 재귀에 일반화했다. 이게 없으면 비활성이면서
체크 안 된 리프 하나가 있는 순간 그 위의 모든 조상이 영원히 "mixed"에 갇힌다 — 나머지
형제가 전부 체크돼도 부모가 "전부 체크됨"으로 올라가지 못하는 오류다(테스트로
잠갔다). 비활성 리프 자신의 표시 상태(`checkedKeys.has(id)`)는 그대로 유지한다 —
비활성 체크박스도 시각적으로는 체크/미체크를 보여줄 수 있다.

### 부모를 고르면 자식이 함께 고르진다

`toggleTreeCheckedSelection`은 어떤 노드(리프든 부모든)를 토글하면 그 노드의 **활성
자손 리프 전체**를 "완전히 체크됨"의 반대로 맞춘다 — `getCheckboxNextState`가
이미 쓰는 "mixed는 체크로 취급" 관례와 같다. 비활성 리프는 cascade에서 건너뛴다
(`toggleCheckboxSelection`의 disabled guard와 같은 모양). 리프 자신을 토글하면
평범한 Checkbox 토글과 동일하게 동작한다. 대상 리프 자체가 비활성이면
`descendantLeaves`가 그 리프 하나뿐이고 cascade 루프가 건너뛰므로, 별도 분기 없이
자연스럽게 no-op이 된다(`toggleCheckboxSelection`이 비활성 항목에서 no-op하는 것과
같은 결과).

### 뺀 것 — cascade 정책 자체는 열지 않는다

antd `TreeSelect`의 `checkStrictly`(부모/자식을 독립적으로 체크할지, cascade할지
선택하는 옵션)는 만들지 않는다. 리프만 저장한다는 결정 자체가 "부모는 항상 유도"를
강제하므로 애초에 그 모호함이 성립하지 않는다 — 옵션을 열 필요가 없다. 만약 실제
제품이 "이 카테고리 자체를 자식과 무관하게 값으로 저장"해야 하는 화면을 요구하면
그건 이 계약 밖의 요구이며, 그때 이 문서를 갱신한다.

"select all"/"clear all" 같은 편의 UI도 만들지 않았다 — `toggleTreeCheckedSelection`을
루트 노드에 호출하면 이미 그 결과가 나온다(cascading to the root 테스트로 확인),
별도 API가 필요 없다.

## HJM 기본값

새 recipe를 만들지 않는다. 표면은 기존 셋을 그대로 합성한다:

- 트리거/필드 chrome — 기존 `selectRecipe`
- 팝업/시트 안의 각 행 — 기존 `treeRecipe.node`/`.toggle`/`.indentPerLevel`
  (`src/tree.ts`, 다른 저작자가 이미 작성)
- 행의 체크 마크 — 기존 Checkbox recipe, 이 모듈이 유도한 `CheckboxState`로 구동

넷째 recipe를 선언하면 앞의 셋이 이미 가진 토큰을 다시 이름 붙이는 것에 불과하다.

## 플랫폼 번역

새 behaviorRegistry 항목도 만들지 않는다. open/dismiss reason, role, keyboard 모델은
`behaviorRegistry.select`를 그대로 쓴다. Web renderer는 각 행의 체크박스에
`aria-checked="mixed"`를 `resolveTreeCheckedStates`의 결과로 채우고, 토글 시
`toggleTreeCheckedSelection`을 호출해 다음 `checkedKeys`를 얻는다. Tree의 깊이/형제
발화, 화살표 키 판정은 `src/tree.ts`가 이미 정의한 그대로다 — TreeSelect가 다시
정의하지 않는다.

## 검증 화면

아직 없음. `planned → beta` 승격은 실제 제품 vertical slice 이후 리드가 진행한다.
