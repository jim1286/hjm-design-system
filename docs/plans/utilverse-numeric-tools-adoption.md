# Utilverse 계산·변환 UI 채택 계획

2026-10-07. 소비 HEAD fa201bc90e4c94219de0f4f51ac0328987ad1cb2, HJM 6d64fe2.
6개 TSX 전체 소스를 검토했다. 출력이 잘린 UnitConverter 끝부분과 ExpenseSplit import/오류 분기는
별도 읽기로 보완했다. 136개 hash 일치, 누적 97개 source-reviewed / 39개 pending.
소비 소스·의존성 변경 및 runtime 검증은 미실행이다.

## 파일별 판단

| 소스 (apps/mobile/src 기준) | 판단 |
| --- | --- |
| `features/CalculatorScreen.tsx` | Already Grid/Button/TextField. Replace direct Clipboard feedback with existing ResultCopy host and history clear with AlertDialog or rearmed InlineConfirm; preserve expression parser, owner-scoped history and calculation despite storage failure. |
| `features/DiscountScreen.tsx` | Keep string TextField and BigInt result comparison; absorb condition disclosure with Accordion and validation Notice. Preserve discount/coupon ordering, optional cap and result invalidation on edit. |
| `features/UnitPriceScreen.tsx` | Already HJM results; compare FieldGroup/Section for product inputs and Notice for errors. Preserve stable product IDs, 2-8 items, tied best prices, dimension switch clearing amount but retaining price/packs and scroll reset. |
| `features/UnitConverterScreen.tsx` | Replace selected dimension buttons with RadioGroup and unit SearchField/button list with Combobox; retain cross-dimension source search, constrained destination, swap, 6/12/18 precision, absolute-zero and too-small errors, exact string copy. |
| `features/ExpenseSplitScreen.tsx` | Use Select for payer, SegmentedControl for equal/percent, InlineConfirm for local expense deletion and Accordion for breakdown. Preserve immutable editor draft/cancel, participant dependencies, exact percent allocation, anonymized export and no-payment meaning. |
| `features/ExchangeScreen.tsx` | Use Notice/Section for cache and failure states; retain exact string input, origin-scoped cache restore, snapshot-date-bound calculations, JPY basis100, per-currency rounding, tiny-result restrictions and source/date/stale copy-share provenance. |

## 숫자 입력과 표시를 구분

HJM NumberField는 min/max/step과 number|null 값 계약이다. 이 제품의 금액·비율·단위 변환은
문자열과 도메인 연산을 사용하며 18자리 소수, 작성 중인 소수, 큰 금액을 다룬다. Number(...)로
강제 변환하는 교체는 정밀도와 초안 계약을 깨므로 기존 HJM TextField를 유지한다.
결과도 애니메이션 숫자에 맞추기 위해 number로 바꾸지 않는다. 도메인의 반올림·BigInt 비교와
원문 복사 값을 유지하고 표시 계층만 공통 recipe로 정리한다.

## 교체 시 주의할 상호작용

- 계산기는 결과 뒤 연산자를 누르면 이전 식을 괄호로 이어 쓰고 숫자는 새 식을 시작한다. 계산 실패를 0으로 바꾸지 않는다.
- 계산 기록 삭제의 InlineConfirm은 내부 done을 유지한다. 새 기록이 생겼을 때 재확인을 열도록 수명 재설계가 필요하므로 AlertDialog도 비교한다. 저장 Promise 실패를 삼킨 채 성공 처리하지 않는다.
- 할인 조건·정산 상세의 접기는 Accordion 후보다. 조건을 접어도 입력과 계산 의미는 사라지지 않으며 기존 숨은 조건 요약을 유지한다.
- 단위 검색은 from의 검색어가 있을 때만 다른 차원까지 찾는다. 이를 범용 Combobox의 단순 현재 차원 목록으로 축소하지 않는다.
- 정산 지출 편집은 로컬 초안이며 취소하면 원본을 보존한다. payer Select와 equal/percent 전환만 공통 선택기로 옮긴다. 초기 비율의 10000 단위 분배와 나머지 배분 순서를 유지한다.
- 익명 정산 내보내기는 실제 사람 이름을 포함하지 않으며 송금 실행이 아니다. UI 교체로 이 안내를 제거하지 않는다.
- 환율 결과는 fetchedAt/rateDate가 현재 snapshot과 같아야 유효하다. 새 snapshot 도착 후 이전 숫자를 그대로 살려 두지 않는다. 출처·기준일·캐시 경고는 복사/공유에도 남긴다.

## 남은 검증

빈값/작성 중 소수/매우 큰 값/정밀도 18자리, 금액 동률, 상품 차원 변경과 추가·삭제, 정산 초안 취소·
참여자 삭제 제한·비율합·익명 공유, 환율 오프라인·캐시 만료·시계 역행·snapshot 교체·역산,
큰 글자·키보드·다크·제품 테마·스크린리더는 pending이다. 소스 분석을 금융 계산 결과 검증으로 세지 않는다.
