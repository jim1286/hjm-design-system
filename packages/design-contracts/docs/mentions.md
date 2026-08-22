# Mentions contract

## 문제

텍스트 입력 중 트리거 문자(`@`, `#`)를 만나면 후보 목록을 띄우고, 하나를 고르면 트리거부터
현재 커서까지를 선택한 후보로 바꾸며 뒤에 공백 하나를 남긴다. Ant Design `Mentions`와
`direct` crosswalk를 따른다.

## 이게 새 컴포넌트인가

먼저 판정할 것: Mentions는 `TextArea` + `Menu`(또는 Combobox의 collection) 조합으로
완결되는가, 새 계약이 필요한가.

**후보 목록 자체는 완결된다.** 후보를 필터링하고 화살표 키로 훑고 loading/empty/error를
알리는 문제는 `behaviorRegistry.combobox`가 이미 소유한 문제와 다르지 않다 —
`comboboxRecipe`의 popover/listbox anatomy, `AsyncCollectionState`, IME 조합 중 미리
필터링/커밋하지 않는다는 `"ime-composition-does-not-prematurely-filter-or-commit"` 시나리오
전부 그대로 재사용된다. 이 부분에 대해서는 새 recipe나 새 behaviorRegistry entry를 만들지
않는다.

**새 계약이 필요한 지점은 하나뿐이다.** 자유 텍스트 문자열 안에서 "지금 활성 트리거가
있는가, 그 query는 무엇인가, 커밋 시 어느 범위를 무엇으로 바꾸는가"를 결정하는 문제는
TextArea에도 Combobox에도 없다 — Combobox는 입력창 전체가 곧 query이지 텍스트 중간의
트리거를 찾지 않는다. 이 트리거 탐지·삽입 범위 계산이 `src/mentions.ts`가 담는 전부다.

## 일반화한 계약

### 트리거 탐지는 문자열과 커서 오프셋만 본다

`findActiveMentionTrigger(text, cursorPosition, triggers)`는 개별 키 입력 이벤트가 아니라
현재 확정된 텍스트 값과 커서 위치만 읽는다. 커서에서 왼쪽으로 스캔하다 공백을 만나면
즉시 포기(활성 트리거 없음)하고, 트리거 문자를 만나되 그 앞이 시작 위치나 공백이면
활성 매치로 확정한다.

- **`"user@example.com"`처럼 트리거 앞이 공백/시작이 아니면 열리지 않는다** — Slack,
  Discord, GitHub 등 모든 멘션 UI가 공유하는 "트리거는 토큰의 시작에서만 유효하다"는
  관례다. validator를 먼저 이 입력으로 시험한 이유가 이것이다: 순진한 구현은 문자열에
  트리거 문자가 있다는 것만으로 열어버리기 쉽다.
- **공백을 타이핑하면 이미 열린 멘션도 닫힌다** — query가 공백을 건너 무한히 늘어나는
  것을 막는다. 같은 관례.
- **트리거 바로 다음(빈 query)도 유효한 활성 매치다** — `"@"`만 입력한 순간에도 팝업이
  열려야 기본 후보 목록을 보여줄 수 있다.

### 커서 오프셋 기반이라 한글 조합에 특별 처리가 필요 없다

이 계약은 텍스트 값이 확정된 뒤에만 동작하므로, 조합 중인 자모(예: "ㅎ")도 그 순간 문자열
안의 유효한 코드 포인트일 뿐이다. Combobox가 조합 중 필터링을 유예하는 것과 달리, Mentions는
유예할 이유가 없다 — 렌더러가 시각적 안정성을 위해 `compositionend`까지 팝업 리포지션을
미루는 것은 허용되지만, 이 계약이 요구하지는 않는다.

### 삽입은 항상 트리거 문자를 정확히 한 번 포함한다

`resolveMentionInsertion(text, match, cursorPosition, insertedText)`는 트리거를 호출자가
아니라 이 함수가 붙인다 — 잊거나 중복으로 붙이는 실수 자체를 불가능하게 만든다. 교체
범위는 항상 `[match.triggerStart, cursorPosition)`이고, 삽입 뒤 공백 하나를 항상 더해
사용자가 바로 다음 단어를 이어 칠 수 있게 한다.

### 다중 트리거는 문자와 id가 모두 유일해야 한다

`MentionTriggerConfig`는 `@`(사용자 멘션), `#`(해시태그)처럼 여러 트리거를 동시에 지원할
수 있게 하되(antd의 `prefix: string | string[]`가 이미 이 요구를 문서화하고 있다), 트리거
문자 중복과 id 중복을 모두 거부한다 — 어느 후보 소스로 갈지 제품이 `triggerId`로 분기할
수 있어야 하기 때문이다.

## HJM 기본값

- 팝업 anatomy·recipe: `comboboxRecipe`를 그대로 재사용. 새 recipe 없음.
- 팝업 behavior: `behaviorRegistry.combobox`를 그대로 재사용. 새 behaviorRegistry entry
  없음. `mentionsBehaviorScenarios`는 트리거 탐지·삽입 슬라이스만 추가한다.
- 삽입 후 공백 하나: 고정 기본값, 옵션으로 빼지 않았다 — 측정된 대안 요구가 없다.

## 플랫폼 번역

Web과 Native 모두 텍스트 값 + 커서 오프셋이라는 같은 입력으로 동작하므로 이 계약 자체는
플랫폼 중립이다. Web `<textarea>`의 `selectionStart`, RN `TextInput`의 `onSelectionChange`가
각각 `cursorPosition`을 공급하고, 렌더러가 팝업을 caret 근처에 앵커링하는 방법(Web
absolute position 계산 vs RN 측정된 caret rect)만 플랫폼별로 다르다 — 이건 Combobox
popover가 이미 겪는 것과 같은 종류의 렌더러 문제다.

## 검증 화면

아직 없음. `planned → beta` 승격은 실제 제품 vertical slice 이후 리드가 진행한다.
