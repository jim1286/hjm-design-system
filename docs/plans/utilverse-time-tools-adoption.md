# Utilverse 날짜·세계 시계·타이머 채택 계획

2026-10-07. 소비 HEAD fa201bc90e4c94219de0f4f51ac0328987ad1cb2, HJM 7642a54.
3개 TSX 전체 및 HJM DateEntry/DurationField, 제품 timerDuration 제한을 대조했다.
136개 hash 일치. 누적 114개 source-reviewed / 22개 pending. 소비 소스·의존성 변경은 없다.

## 파일별 판단

| 소스 (apps/mobile/src 기준) | 판단 |
| --- | --- |
| `features/CalendarScreen.tsx` | Use DateEntry with product parser for start/end and existing choice controls; preserve civil calendar arithmetic, include-start semantics, before/after offset, D-day formatting, today local timezone and detailed copy output. |
| `features/WorldClockScreen.tsx` | Compare Select for base, Combobox for cities, RadioGroup for repeated-time candidates and DateEntry/time selection. Preserve DST gap/overlap explicit resolution, 2-12 zones, base removal fallback, foreground-only ticks and no network request for clock skew. |
| `features/TimersScreen.tsx` | Compare DurationField seconds adapter min1/max86400 with current string-draft behavior; use shared confirmation and Notice. Retain absolute persisted endsAt, foreground-only250ms display, eight-timer limit, current-time reducer and separate OS alert service. |

## 날짜와 시각 계약

DateEntry는 year/month/day 문자열 초안과 제품 parse 함수를 받는다. 존재하지 않는 날짜를
JavaScript Date의 자동 보정으로 허용하지 않는다. 날짜 계산의 include, D-day, 전후 방향과
copy 상세는 기존 도메인에 맡긴다. 날짜 선택 UI는 값 입력을 바꿀 뿐 계산식을 대체하지 않는다.

세계 시계 resolveClockTime은 후보0개를 gap, 1개를 확정, 복수 후보를 사용자 선택으로 처리한다.
중복 시각 선택지에는 UTC offset과 UTC instant가 같이 표시된다. 이 경우를 일반 시·분 선택기의
첫 결과로 자동 확정하지 않는다. 기준 도시 변경 시 기존 chosen/candidates를 지우고, 기준 도시를
삭제하면 남은 첫 도시를 사용한다. 입력 범위·저장 실패에도 원래 처리를 유지한다.
시계 오차는 저장된 환율 clockSample만 읽는다. UI 채택을 이유로 새 네트워크 호출을 추가하지 않는다.

## 타이머 입력·동작

제품 timerDuration은 문자열 분/초를 검증해 1~86400초를 밀리초로 돌려준다. HJM DurationField는
총 초와 hours/minutes/seconds 입력을 제공한다. 초↔밀리초 어댑터와 새 시 label, min1/max86400을
명시해야 한다. 기존 작성 중 빈값/잘못된 숫자를 즉시 clamp하는 변화는 별도 UX 검증이 필요하다.
공통 필드의 단위 변경이 초안을 보존하지 못하면 기존 TextField를 FieldGroup으로 묶는 경로를
비교하고 숫자 입력이 있다는 이유만으로 강제 치환하지 않는다.

250ms tick은 foreground 표시만 갱신하며 절대 endsAt이 경과를 소유한다. HJM animation/timer로
남은 시간을 따로 세지 않는다. 재설정·삭제 확인은 mutate의 void/오류 삼킴을 그대로 연결하면
저장 전에 성공할 수 있으므로 실제 document.change Promise로 연결한다. 알림 허용·등록·도착은
별도 상태이며 화면 countdown 완료를 OS 알림 성공으로 표시하지 않는다.

## 남은 검증

윤년·월말·역방향/포함일, DST gap/overlap·날짜선·기준 도시 삭제, 시간대 미지원,
타이머 1초/24시간/빈값·백그라운드 복귀·시간 변경·일시정지/재개·저장 실패,
키보드·큰 글자·제품 테마·다크·스크린리더는 pending이다. 실제 API/기기 검증은 수행하지 않았다.
