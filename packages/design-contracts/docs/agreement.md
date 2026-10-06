# Agreement contract

검토일: 2026-10-07.

**문제.** 가입·결제 앞에 서는 약관 동의 묶음이다. 전체 동의 한 줄과 개별 항목들,
필수/선택 구분, 각 항목의 전문 보기가 한 덩어리로 움직인다.

**왜 CheckboxGroup으로 충분하지 않은가.** 세 가지가 체크박스 목록이 아니라 절차이기
때문이다.

1. **필수/선택이 제출 가능 여부를 정한다.** CheckboxGroup은 "몇 개 골랐는가"만 알고
   "이 화면이 진행 가능한가"는 모른다. `resolveAgreementState`의 `satisfied`와
   `missingRequiredIds`가 그 판정이고, 제품의 제출 버튼이 그것만 읽는다.
2. **전체 동의는 파생이다.** 저장되는 값은 개별 항목뿐이고 전체 행은 tri-state로
   그려진다 — DataTable 머리글(`resolveDataTableSelectAllState`)·TreeSelect 부모
   (`resolveTreeCheckedStates`)와 같은 관계다. 전체 동의를 별도 값으로 저장하면
   "전체 동의했지만 개별은 두 개만 체크됨" 같은 모순이 표현 가능해진다.
3. **읽을 수 있어야 동의다.** 전문 경로가 없는 동의 항목은 만들 수 없게 두지는 않지만,
   `detail`을 계약된 행동으로 둬서 renderer가 장식 화살표로 처리하지 못하게 한다.
   그 컨트롤은 체크박스와 **다른 tab stop**이고 누르면 절대 체크되지 않는다.

**막아 둔 조합.** 필수이면서 비활성인 항목은 descriptor 단계에서 거절한다. 허용하면
사용자가 영원히 진행할 수 없는 화면이 조용히 만들어지고, "버튼이 왜 안 눌리는가"를
아무도 설명할 수 없다.

**비활성 항목의 회계.** 전체 동의의 분모에서 뺀다 — 사용자가 바꿀 수 없는 것을 "덜
동의했다"고 셀 수 없다. 필수는 비활성일 수 없으므로 `satisfied` 판정에는 이 예외가 없다.

**제품이 소유하는 것.** 문구, 링크 주소, 법적 유효성, 동의 기록의 저장·증빙. HJM은
판정과 배치만 갖는다. 약관 내용을 어디에 보여줄지(링크·시트·새 화면)도 제품 결정이라
`detail.href`는 선택이고, 없으면 renderer가 버튼으로 낸다.

**플랫폼 번역.** Web은 `group` + `checkbox` + 별도 링크/버튼, Native는 checkbox
accessibility state와 `openDetail` action이다. 두 표면 모두 전체 동의 행이 목록의 제목
역할을 하도록 `surface.sunken` 위에 놓는다.

**첫 상태도 알린다(2026-10-06).** `onStateChange`는 마운트 때 한 번 초기 상태로 불리고, 그 뒤 토글마다 불린다.
이전에는 토글에서만 불려 `defaultCheckedIds`·`checkedIds`가 처음부터 필수를 채운 경우 첫 `satisfied: true`가 오지 않아,
이 콜백에 연결한 제출 버튼이 꺼진 채 남았다. 파생 상태가 바뀔 때마다 부르는 대안은 호출 수가 렌더 횟수에 묶여 버렸다.
호출 수를 세던 소비자는 마운트 1회가 늘어난다(Changeset `recipe-parity-followups`).

**제출 중 묶음 잠금(2026-10-07).** Utilverse 가입 화면은 서버 요청 동안 필수 약관의
체크 값을 고정한다. 개별 `required + disabled`를 허용하면 필수/선택 분모 의미가 바뀌므로
`descriptor.disabled`를 별도로 제공한다. 기본 false이며 전체/개별 toggle은 잠겼을 때
동일 selection을 반환하고 renderer는 변경 callback을 발생시키지 않는다. `all`, `satisfied`,
`missingRequiredIds`와 전문 읽기는 그대로다. onStateChange의 마운트/사용자 토글 계약도
그대로이며 제어 값·약관 버전 변경 후 판정은 제품이 resolver로 다시 계산한다. UI 잠금은
서버의 동의 버전 검증·중복 요청 보호를 대신하지 않는다.

## 큰 글자 배치 보완 (2026-10-07)

긴 전문 버튼이 제목 폭을 빼앗아 한국어가 세로로 끊기는 문제를 확인했다. 제목 기준 폭을 70%로 두고 전문 버튼은 줄바꿈한다. Native는 flexBasis만으로 축소를 막지 못하므로 같은 최소 폭을 적용한다. 체크/혼합 표시도 글꼴 문자가 아닌 고정 크기 도형으로 그려 2배 글자에서 원 밖으로 나가지 않는다. 검증 범위는 [약관 QA](../../../docs/qa/2026-10-07-agreement-lock.md)에 기록한다.
