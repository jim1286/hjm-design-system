# Cascader — 별도 컴포넌트를 만들지 않는다

## 문제로 제기된 것

계층 데이터에서 경로 하나를 고른다(시/도 → 구 → 동). Ant Design `Cascader`와 `direct`
crosswalk를 따른다.

`src/tree-select.ts`와 `docs/tree-select.md`(다른 저작자가 완료)를 직접 읽고 판정한다.
그 문서의 결론: 단일 선택 TreeSelect는 "Select의 표면 + Tree의 collection"만으로
완결되고(`SelectSelection.selectedKey`가 노드 하나), 다중 선택(체크박스)에서 정말
새로 필요했던 조각은 부모의 tri-state 집계뿐이었다 — 그래서 `TreeCheckedKeys<Id> =
ReadonlySet<Id>`는 **리프 id만** 담도록 validator가 강제하고, 부모 자신의 체크 상태는
`resolveTreeCheckedStates`가 항상 유도하며 결코 저장하지 않는다(“부모를 값으로도 저장할
수 있게 하면 antd가 `checkStrictly`로 풀어야 했던 모호함이 생긴다”는 것이 그 판정의
근거). Cascader가 이 완결된 계약 위에 흡수되는지, 아니면 독립된 셋째 계약이 필요한지를
판정한다.

## 판정: TreeSelect의 축 하나로 흡수된다 — 만들지 않는다

Cascader와 TreeSelect가 갈라 보이는 지점은 둘이다. 각각을 조사했다.

### 1. "값이 경로 전체인가, 노드 하나인가" — 흡수된다

antd Cascader의 값은 `(string | number)[]`(루트→선택 노드의 경로)이고, TreeSelect의 값은
노드 id 하나(단일 선택) 또는 leaf id의 집합(다중 선택, 위에서 확인한 대로 항상 리프만)이다.
그런데 경로는 이미 있는 데이터에서 **파생**된다 — `src/tree.ts`의 `resolveTreeDescriptor`가
모든 노드에 `parentId`를 붙이므로, 선택된 노드에서 `parentId`를 따라 루트까지 올라가면
경로가 나온다. 새 상태를 저장할 필요가 없고, `Id | null`을 `readonly Id[] | null`로 바꾸는
값 표현의 문제일 뿐이다 — 새 축 `valueMode: "node" | "path"` 하나로 대응된다.

이 축이 TreeSelect가 방금 닫은 모호함(부모 자신을 값으로 저장할 수 있게 하는 것)을
다시 여는지 확인했다 — **아니다.** `valueMode: "path"`는 이미 커밋된 노드 id(리프든
아니든, 단일 선택 한정)의 조상 사슬을 읽기 전용으로 풀어 보여주는 것일 뿐, "이 부모를
그 자신의 값으로 저장할 수 있는가"라는 질문과는 직교한다 — 다중 선택 체크박스의 리프
전용 저장 규칙을 건드리지 않는다. 즉 `valueMode`는 TreeSelect가 닫아 둔 자리를 다시
열지 않고, TreeSelect가 이미 갖고 있는 `parentId` 파생 능력에 값 표현 축 하나만 얹는다.

### 2. "열 단위로 펼쳐지는가, 들여쓰기로 펼쳐지는가" — 이것도 흡수된다

여기가 진짜 검토할 지점이었다. Cascader의 열(column) 레이아웃은 Tree의 임의 개수
`expandedKeys: ReadonlySet<Id>`(형제 여러 갈래를 동시에 펼칠 수 있음)와 다르게, **한 번에
경로 하나만** 열려 있다 — 어떤 깊이에서든 활성 경로가 정확히 하나뿐이라는 제약이 있다.
이 제약 자체는 새로운 탐색 모델처럼 보였지만, 뜯어보면 "펼침 집합이 항상 루트에서 활성
노드까지의 단일 사슬로 강제된다"는 **`expandedKeys`의 부분집합 제약**이지 새 자료구조가
아니다 — 노드를 고르면 그 노드의 경로만 펼치고 다른 사슬은 접는 함수 하나로 표현된다.

열 레이아웃 자체도 이 제약된 펼침 상태의 **Web 렌더러 선택**일 뿐이다. antd Cascader도
검색 모드에서는 후보를 "항저우/시후구" 같은 전체 경로 텍스트가 붙은 평평한 목록으로
보여준다 — 이건 이미 Select/Combobox의 listbox 그 자체다. 즉 Cascader에는 "열 UI"가
필수인 지점이 하나도 없다 — 모바일에서는 드릴다운(경로 스택 + 뒤로가기, 한 화면에 한
깊이)으로 번역해도 같은 상태 계약을 만족한다. Select가 Web popup과 Native Sheet로
갈리는 것과 같은 종류의 adaptive 렌더러 선택이다.

## 결론

Cascader가 실제로 풀던 문제는 TreeSelect 계약에 두 축만 더하면 완결된다.

1. `valueMode: "node" | "path"` — 커밋되는 값이 노드 id인지, 루트부터의 경로인지.
   `path`일 때 값 타입은 `readonly Id[] | null`이고 기존 `parentId` 파생으로 채운다.
2. `commitAt: "leaf" | "any"` — antd의 `changeOnSelect`에 대응. 리프에서만 커밋을
   허용할지, 중간 노드에서도 커밋을 허용할지.

`valueMode: "path"`일 때 브라우즈 중 펼침 상태는 항상 활성 노드까지의 단일 사슬로
제한된다는 규칙이 추가로 필요하지만, 이것도 `expandedKeys`를 다시 계산하는 함수 하나로
표현되지 새 상태 축이 아니다. 열 레이아웃 대 들여쓰기 대 드릴다운은 렌더러가 고른다.

`src/cascader.ts`, `test/cascader.test.ts`는 만들지 않는다. `antDesignReferenceComponents`의
`Cascader → Cascader` crosswalk(`relationship: "direct"`)는 리드가 조정할 대상이다 — 아래
배선 제안대로 target을 `tree-select`로 바꾸면 `Dropdown → Menu`, `VirtualList → List`
alias 판정과 같은 자리가 된다.

## 배선 명세 제안 (리드 적용)

- `src/component-references.ts`의 `Cascader` 항목: `targets: ["Cascader"]` →
  `targets: ["tree-select"]`, `relationship: "direct"` → `"adapted"`(같은 문제를 TreeSelect의
  이름과 축으로 번역하는 것이므로).
- `src/catalog.ts`의 `Cascader` planned row: 제거하거나(TreeSelect가 `valueMode`/`commitAt`
  두 축을 얻은 뒤) `aliases: ["Cascader"]`를 TreeSelect row에 추가하는 쪽을 권한다 — 이
  저작자 판단은 후자다, `Dropdown`이 `Menu`의 alias로 흡수된 선례와 같은 이유.
- `src/tree-select.ts`는 이 저작자가 고치지 않는다(다른 저작자의 파일). 그 저작자 또는
  리드가 `valueMode`/`commitAt` 축과 경로 파생 헬퍼(`resolveTreeNodePath` 같은 이름)를
  추가할 자리라는 것만 이 문서에 남긴다.

## 뒤집힐 조건

다음 중 하나가 실제로 측정되면 이 판정을 다시 연다.

1. 실제 제품에서 "여러 사슬을 동시에 펼친 채 경로를 비교/편집"해야 하는 화면이 나와
   `expandedKeys`의 단일-사슬 제약이 부족해진다.
2. 열 레이아웃이 아니면 스크린 리더/키보드 사용자가 감당할 수 없을 만큼 깊이가 깊고
   폭이 넓은 실제 계층 데이터가 나와, "렌더러 선택"이라던 전제가 깨진다.
3. `changeOnSelect`형 중간 노드 커밋이 `commitAt` 하나로 표현하기엔 부족한 추가 규칙
   (예: 중간 노드 커밋 시 하위 요약값 표시)이 실제 화면에서 요구된다.
