# ConfirmPopover — 별도 컴포넌트를 만들지 않는다

## 문제로 제기된 것

Ant Design `Popconfirm`은 "삭제하시겠습니까?" 같은 확인을 Modal보다 가벼운
inline popover로 보여준다 — 트리거 옆에 바로 뜨고, 배경을 막지 않고, 확인/취소
버튼만 있다. `docs/popover.md`가 Popover를 계약하면서 이미 이 자리를 예약해
뒀다("ConfirmPopover는 Popover 위의 조합이지 셋째 독립 primitive가 아니다").
이 문서는 그 한 줄 판정을 정식으로 완결한다.

## 판정: 만들지 않는다

핵심 질문은 브리프가 준 그대로다 — **"덜 무거운 확인이 파괴적 동작에 적절한가"**.
답은 "아니다"이고, 그 답은 이 저장소가 이미 내린 다른 결정들에서 곧바로 따라
나온다.

### 파괴적 동작의 확인은 이미 AlertDialog가 완결한 문제다

`docs/architecture.md`의 "위험 확인의 생명주기"는 AlertDialog가 삭제·결제처럼
되돌릴 수 없는 side effect를 다루는 유일한 계약이라고 이미 못박는다.
`idle → confirm → busy → success/error → closing → closed`와 `outsideDismiss:
false`, `busy 동안 모든 dismiss 무시`가 그 계약의 본체다.

Popover는 그 반대 축 위에 설계돼 있다(`popoverBehaviorDefaults`):
`outsideDismiss: true`, `escapeDismiss: true`, `focusOutDismiss: true`, 그리고
**`busy` 축 자체가 없다**(`docs/popover.md`: "Popover는 모달이 아니라 '모든
dismiss를 막는 전역 상태'가 성립하지 않는다"). 즉 Popover 안에 확인 버튼을
넣으면:

- 사용자가 확인 버튼을 누른 순간에도 바깥 포인터·Tab 이탈·Escape가 여전히
  surface를 닫을 수 있다 — 삭제 요청이 서버로 나가는 도중에 표면이 사라지는
  경쟁을 막을 방법이 계약에 없다.
- 이 경쟁을 막으려면 Popover에 `busy` 축을 추가해야 하는데, 그건 Popover를
  사실상 모달로 바꾸는 것이다 — 그 순간 AlertDialog가 이미 소유한 문제(모달
  confirm 세션)를 두 번째 이름으로 다시 계약하게 된다.

`docs/dropdown.md`가 "Dropdown을 임의 콘텐츠용으로 다시 정의하면 이미 Popover가
점유한 문제와 구분되지 않는다"고 판정한 것과 정확히 같은 형태의 충돌이다 — 여기서는
ConfirmPopover가 AlertDialog가 이미 점유한 문제(파괴적 동작의 안전한 확인)와
구분되지 않는다.

### 되돌릴 수 있는 동작의 "가벼운 확인"은 새 계약이 필요 없다

그럼 "되돌릴 수 있는 동작이면 Popover 확인이 맞지 않냐"는 질문이 남는다 —
브리프가 정확히 이 경계("되돌릴 수 있으면 Popover, 없으면 AlertDialog")를
제안했다. 하지만 이 갈래를 따라가 봐도 **새로 계약할 축이 없다.**

되돌릴 수 있는 동작에 필요한 전부는 "확인/취소 버튼 두 개가 있는 콘텐츠"이고,
그건 이미 Popover의 정의 그 자체다 — `PopoverDescriptor`는 "임의의 interactive
콘텐츠"를 담는 자리로 계약돼 있고(`docs/popover.md`), 확인/취소 버튼 두 개는
그 임의 콘텐츠의 특수 사례일 뿐이다. 제품이 Popover의 `content` 슬롯에 버튼
두 개를 넣고 하나가 `onOpenChange(false, ...)`를 호출하는 데에는 새로운 상태
축도, 새로운 접근성 개념도 필요하지 않다 — Notification이 "Toast의 설정 값
조합일 뿐 새 계약이 아니다"로 판정된 것과 같은 자리다.

즉 "ConfirmPopover"라는 이름표가 실제로 가리킬 수 있는 두 갈래는 다음과 같다.

| 갈래 | 실제로 필요한 것 | 이미 있는가 |
| --- | --- | --- |
| 파괴적 동작의 확인 | `busy` 축을 가진 모달 confirm 세션 | **있다 — AlertDialog** |
| 되돌릴 수 있는 동작의 가벼운 확인 | 버튼 두 개가 든 non-modal popover 콘텐츠 | **있다 — 그냥 Popover의 콘텐츠 슬롯** |

어느 쪽으로 가도 `src/confirm-popover.ts`가 소유할 독립적인 상태 축이나
접근성 개념이 남지 않는다.

## 만들지 않은 것

`src/confirm-popover.ts`, `test/confirm-popover.test.ts`는 없다. 제품이
"가벼운 확인"을 원하면 Popover 콘텐츠에 두 버튼을 직접 구성하고, "파괴적
동작"이면 AlertDialog를 쓴다 — 둘 사이의 선택 기준은 이 문서와 `docs/popover.md`가
이미 명시한 그대로다: **되돌릴 수 있으면 Popover, 없으면 AlertDialog.**

## catalog 배선 명세 (리드 적용)

crosswalk(`component-references.ts`, `Popconfirm → ConfirmPopover`,
`relationship: "adapted"`)는 antd 범위 추적용 그대로 둔다. catalog의
`ConfirmPopover` planned row(`category: "overlay", platform: "web"`)도
지우지 않는다 — 이름 자리를 없애자는 것이 아니라, 지금 채울 독립 계약이 없다는
것이다. `Dropdown`/`Notification`과 같은 처리를 권한다: catalog row는 남기고,
Component Explorer에서 이 문서로 연결한다.

## 뒤집힐 조건

다음 중 하나가 실제로 측정되면 이 판정을 다시 연다.

1. Popover의 `outsideDismiss`/`escapeDismiss`를 끄지 않고도 안전하게 처리할 수
   있는, 진짜로 되돌릴 수 없지만 AlertDialog의 전체 모달 무게(배경 완전 차단,
   별도 트랜지션 레이어)는 과한 액션이 실제 제품에서 발견된다 — 즉 "가볍지만
   busy를 반드시 막아야 하는" 제3의 자리가 vertical slice로 증명된다.
2. 여러 제품 화면에서 "Popover 콘텐츠에 확인/취소 버튼 두 개"라는 조합이
   반복되어, 그 조합 자체(콜백 규약, 포커스 초기값)를 매번 다시 구현하는 비용이
   측정 가능하게 커진다 — 그때는 새 상태 축이 아니라 **Popover 위의 얇은
   합성 헬퍼**(recipe 없이 콜백 배선만 감싸는 유틸리티) 형태를 먼저 검토한다.
