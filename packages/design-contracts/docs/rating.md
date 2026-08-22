# Rating — 계약을 만들지 않는다

## 먼저 판정: 필요한가

야잘알(KBO 정보)과 BurnTok 어디에도 별점(리뷰 점수, 만족도 별표) 화면이 없다. 야잘알의
"Overall 레이팅"(선수 능력치를 0–99 척도로 보여주는 기존 기능)은 antd `Rate`가 푸는
문제(사용자가 1~N개의 아이콘 중 몇 개를 채우는가)와 다르다 — 이미 `Statistic`이나
전용 배지로 표시되는 **숫자**이지 별을 세는 입력/표시가 아니다. 측정된 실제 요구가
없다.

## 그래도 "다른 문제인지" 판정한다

측정된 요구가 없어도, antd `Rate`가 실제로 새 semantic을 필요로 하는지는 나눠서 봐야
한다. 두 가지 실사용 형태로 나뉜다.

### 1. 입력으로 쓰일 때 — Slider의 재구성이다

`Rate`를 사용자가 클릭/드래그해 값을 정하는 입력으로 쓰면, 필요한 값 계산은 이미 전부
있다: `min`(보통 0), `max`(아이콘 개수), `step`(정수 1, half-star면 0.5) — `Slider`가
`src/number-field.ts`의 `validateNumericRangeConfig`/`snapToStep`/`clampToRange`를 이미
가져다 쓰고 있고, 이 함수들은 소수 step(0.5)도 이미 지원한다(`stepPrecision`/
`roundToStepPrecision`이 일반화돼 있다) — half-star를 위한 새 수학이 필요 없다는
뜻이다. `Rate`와 `Slider`가 다른 것은 **외형**(연속 트랙+손잡이 vs 아이콘 N개를 줄지어
채움)일 뿐, 값이 어디 있는지·어디까지 갈 수 있는지·어떻게 스냅하는지는 완전히 같은
문제다. Web `role="slider"` + `aria-valuenow`(정수/반정수 step)도 그대로 성립한다 —
새 ARIA 패턴이 필요하지 않다.

### 2. 표시로 쓰일 때 — Statistic의 영역이다

실제로 더 흔한 쓰임은 입력이 아니라 **평균 점수를 보여주기만 하는 것**("4.3점, 별
다섯 개 중 채워진 정도")이다. 이건 `Statistic`이 이미 "제품이 포맷한 값을 받아 보여주기만
한다"는 계약으로 푸는 문제와 같다 — 새 controlled 상태도, 새 접근성 개념도 필요 없다.
채워진 비율을 아이콘 줄로 그리는 것은 순수 시각 표현이라 `resolveSliderFillFraction`과
같은 종류의(이미 존재하는) 0..1 비율 계산이면 충분하다.

## 결론

두 형태 모두 **새 semantic이 없다** — 있다면 기존 계약(Slider의 값 수학, Statistic의
표시 계약) 위에 아이콘 줄이라는 새 **recipe**(외형)만 있으면 된다. 측정된 제품 요구도
없다. `Notification`(→ Toast 설정)·`Dropdown`(→ Menu alias)과 같은 자리다 — 이름이
다른 컴포넌트가 필요한 게 아니라, 필요해지는 순간 기존 계약에 recipe만 얹으면 된다.

`src/rating.ts`, `test/rating.test.ts`는 만들지 않는다. crosswalk의 `Rate → Rating`
(`relationship: "adapted"`)은 범위 추적용으로 그대로 둔다 — target `ComponentId`를 바꿀
필요가 없다(`docs/dropdown.md`의 Dropdown crosswalk 처리와 같다). catalog row(`{ name:
"Rating", category: "input", platform: "shared", status: "planned", aliases: ["Rate"] }`)도
건드리지 않는다 — 지금 채울 계약이 없다는 뜻일 뿐, 이름 자리를 지우자는 게 아니다.

## 뒤집힐 조건

1. 실제 화면에서 별점 **입력**이 필요해지면: `Slider`에 아이콘 기반 recipe 변형(연속
   트랙 대신 N개의 아이콘, 클릭 시 가장 가까운 정수/반정수로 스냅)을 추가한다 — 새
   컴포넌트가 아니라 `sliderRecipe`의 새 variant다.
2. 실제 화면에서 별점 **표시**가 필요해지면: `Statistic`에 아이콘 fill 표현을 추가한
   recipe 변형을 고려한다.
3. 두 형태 중 하나가 기존 값 수학이나 접근성 계약으로 표현할 수 없는 요구(예: 정수도
   반정수도 아닌 자유 분수 표시, 별 모양이 아닌 클릭 불가 장식과 클릭 가능 입력이
   레이아웃까지 완전히 달라야 하는 경우)를 드러내면 이 판정을 다시 연다.
