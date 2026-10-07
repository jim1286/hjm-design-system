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

**제품 모서리.** 2026-10-07 테마 소비 점검에서 숫자로 확정된 recipe를 양 renderer가
그대로 사용해 profile 변경이 누락됐다. 가장 가까운 Provider의 `tokens.radius.md`로
표현을 해결하고, profile이 없으면 기존 recipe 12를 유지한다. 선택 모델·눌림/비활성·
키보드 계약은 그대로이며 제품마다 별도 ToggleGroup을 만들 필요가 없다.

**tab stop.** 각 토글이 자기 tab stop이다. 도구 모음식 roving focus를 쓰지 않는 이유는
묶음이 대개 2~4개로 짧고, roving은 "그룹 안에서 화살표로 이동"이라는 추가 학습을
요구하기 때문이다. 항목이 많아지는 실제 화면이 나오면 그때 축을 연다.


### 카테고리 필터 표현

2026-10-06 요청에 따라 단일 선택 카테고리는 `SegmentedControl presentation="pills"`로 제공한다.
복수 선택 ToggleGroup의 계약은 바꾸지 않는다. 필터 UI가 서로 비슷하더라도 선택 개수를 합치면 해제·키보드 의미가 달라지기 때문이다.
자세한 크기·테마·배치는 [SegmentedControl 사용 지침](usage/components/segmented-control.md)을 따른다.

1.13.1 patch(2026-10-06 utilverse 1.13.0 적용 결함): `pills`는 큰 글자에서 세로로 쌓지 않는다(`segmentedControlRecipe.pills.largeTextLayout`
`"wrap"`). 블록 안에서는 줄바꿈하고 가로 스크롤 줄 안에서는 한 줄로 남는다. 쌓기(`adaptive.largeTextLayout` `"stacked"`)는 같은 폭으로
나뉘는 `connected` 트랙의 규칙이다. 내용 폭인 pills까지 쌓아 주제 7개 레일이 accessibility-large에서 약 440pt 기둥이 됐고, 제품은 그 크기부터
Select로 바꿨다. pills 전용 스크롤 prop은 버렸다: 레일은 바깥(SearchScreen `filtersOverflow="scroll"`, 제품 ScrollView)이 소유하고,
그 안에 두 번째 가로 스크롤을 겹치게 된다. 선택(radio)·포커스 이동 의미는 바꾸지 않았다.
