# BorderBeam — 새 컴포넌트를 만들지 않는다

## 정정

이 문서의 이전 판은 `BorderBeam`이 Ant Design 컴포넌트가 아니라 Magic UI/Aceternity
계열의 장식 컴포넌트가 crosswalk에 잘못 섞여 들어온 것이라고 주장했다. **그 주장은
사실이 아니었다** — antd의 실제 Components Overview를 직접 확인하지 않고 일반
웹검색만으로 판단한 결과였고, 검색 결과가 더 대중적인 Magic UI/Aceternity 쪽으로
쏠려 있어 antd가 별도로 같은 이름의 컴포넌트를 추가했을 가능성을 놓쳤다.

리드가 공식 Overview를 직접 확인해 정정했다: `BorderBeam`은 antd "Other" 섹션에
실재하는 컴포넌트다. `Watermark`도 crosswalk에서 빠지지 않았다 —
`src/component-references.ts:123`에 `category: "feedback"`으로 이미 정확히 잡혀
있다(antd에서 Watermark는 Other가 아니라 Feedback 섹션이다). 섹션별 수(general 4 /
layout 7 / navigation 7 / data-entry 18 / data-display 21 / feedback 11 / other 5 =
73)도 저장소 테스트의 단정과 전부 일치한다. `component-references.ts:127`의
`BorderBeam` 행은 **정확하다** — 제거하지 않는다.

## 판정: 그럼에도 만들지 않는다

crosswalk이 맞다는 것과 이 컴포넌트를 지금 만들 것인가는 별개 질문이다. `BorderBeam`이
실제로 antd에 있다 해도, 그 실체 — 사용자 행동에 반응하지 않는 **상시 반복 이동
애니메이션**(컨테이너 테두리를 따라 빛줄기가 도는 효과) — 은 `docs/identity.md`와
정면으로 충돌한다.

- 첫 문장부터 "HJM은 장식으로 브랜드를 증명하지 않습니다."
- Motion 원칙: "Reduce Motion에서는 이동과 반복을 제거하고 즉시 전환 또는 짧은 opacity로
  대체합니다", "bounce와 spring은 공간 관계를 설명할 때만 사용합니다."
- HJM답지 않은 패턴: "브랜드색을 장식 배경처럼 넓게 사용."

두 질문으로 검증했다:

1. **Reduce Motion에서 무엇이 남는가?** 이동 자체가 이 컴포넌트의 전부이므로, 이동을
   제거하면 정적인 테두리 선(또는 아무것도) 만 남는다 — "즉시 전환"으로 대체할 상태
   변화가 애초에 없다(열림/닫힘/포커스 같은 원인이 없다).
2. **장식이 없어도 화면이 같은 뜻을 전하는가?** 그렇다 — 이 컴포넌트는 어떤 상태·값·
   선택도 표현하지 않는다. 있으나 없으나 화면이 말하는 내용은 똑같고, 차이는 순전히
   "화려함"뿐이다.

두 질문 모두 "이 장식은 정보를 나르지 않는다"로 귀결됐다 — identity가 정확히 배제하는
자리(장식으로 증명하는 브랜드, 원인 없는 반복 모션)다. 이 세 근거는 crosswalk 출처
문제와 무관하게 그대로 성립한다.

## 결론

`src/border-beam.ts`, `test/border-beam.test.ts`는 만들지 않는다.

## 판정이 뒤집힐 조건

BurnTok/Yajalal 중 하나가 실제로 "강조해야 하는 순간"(예: 실시간 방송 중임을 알리는
라이브 표시, 당첨/축하 모멘트)에 은은한 강조 테두리가 필요하다고 판단하면, 그건
`BorderBeam`(상시 반복 장식)이 아니라 그 순간에 한정된 **의미 있는 강조 recipe**(예:
`feedback.attention` 톤의 짧은 1회성 pulse, Toast의 `priority: high`처럼 특정 상태에만
묶인 것)로 다시 계약해야 한다.

## 배선 명세 (리드 적용)

`src/component-references.ts:127`의 `BorderBeam` crosswalk 행은 **정확하므로 바꾸지
않는다.** `src/catalog.ts`의 `{ name: "BorderBeam", category: "utility", platform:
"web", status: "planned" }` 행만 대상이다 — 이 행은 "만들 계획"을 뜻하는 `planned`인데
실제로는 "만들지 않기로 확정"이라 상태가 거짓말을 하고 있다. 이 불일치를 어떻게
표현할지는 `docs/catalog-decision-status.md`에서 별도로 다룬다.

## 출처

- [Ant Design — Components Overview](https://ant.design/components/overview/)
