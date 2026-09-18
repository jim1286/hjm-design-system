# ToggleGroup contract

**문제.** 여러 개를 동시에 켜고 끄는 버튼 묶음 — 굵게/기울임/밑줄, 여러 개를 함께 거는
필터 칩.

**SegmentedControl과의 경계.** Segmented는 **하나를 고른다**(어떤 화면을 볼지),
ToggleGroup은 **여러 개를 켠다**(무엇을 적용할지). 그래서 Segmented에는 "선택 없음"이
없고 ToggleGroup에는 있다. 한 컴포넌트의 `mode` 축으로 합치면 그 차이가 사라지고
"아무것도 선택되지 않은 Segmented"라는 표현 불가능한 상태가 타입에 생긴다. 이 계약에
single 모드를 넣지 않는 것이 규칙이다.

**CheckboxGroup과의 경계.** CheckboxGroup은 목록 안의 선택이라 각 항목이 자기 줄과
설명을 갖는다. ToggleGroup은 도구 모음이라 한 줄에 붙고 라벨이 짧다. 판정(무엇을 켤 수
있는가, 비활성은 어떻게 되는가)은 같은 `selection-helpers`를 공유한다 — 두 번째 선택
모델을 만들지 않는다.

**상태는 색이 아니라 `aria-pressed`(Native `selected`)가 말한다.** 색은 보강일 뿐이다.

**tab stop.** 각 토글이 자기 tab stop이다. 도구 모음식 roving focus를 쓰지 않는 이유는
묶음이 대개 2~4개로 짧고, roving은 "그룹 안에서 화살표로 이동"이라는 추가 학습을
요구하기 때문이다. 항목이 많아지는 실제 화면이 나오면 그때 축을 연다.
