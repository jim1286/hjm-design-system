# Utilverse 로컬 기록·텍스트·비밀번호 도구 채택 계획

2026-10-07. 소비 HEAD fa201bc90e4c94219de0f4f51ac0328987ad1cb2, HJM 5388909.
6개 TSX 전체와 양 TaskList, Native Statistic/InlineConfirm 계약을 읽었다.
136개 hash 일치. 누적 103개 source-reviewed / 33개 pending. 소비 소스는 변경하지 않았다.

## 파일별 판단

| 소스 (apps/mobile/src 기준) | 판단 |
| --- | --- |
| `features/CounterScreen.tsx` | Replace manual reset/remove confirmation and storage feedback; keep increment/decrement/undo enabled while queued writes pending, enforce floor in reducer, and gate structural changes separately. |
| `features/ChecklistScreen.tsx` | Compare TaskList but add or compose a public per-item action slot for deletion without nesting a button in Checkbox. Preserve timestamped completion, limits40/200, list cloning, single undo and storage-confirmed transitions. |
| `features/NotesScreen.tsx` | Already SearchField/SegmentedControl/TextArea. Replace delete/discard prompts and status Notice; keep raw composition persisted through singleton queue, current-ref flush before save, owner reset, view-only sort and filtered export. |
| `components/ScoreNumeral.tsx` | Custom 48/64pt artifact numeral with single HJM textScale and fit-to-width. Statistic currently exposes caption/title/heading density, no display-size axis; do not shrink across-table score or use deprecated valueStyle as adoption. |
| `features/TextToolsScreen.tsx` | Compare StatisticGroup for four counters and CheckboxGroup for cleanup options. Preserve original/preview/apply/undo reducer, empty output vs absent preview, private fixed transition key and text length limits. |
| `features/PasswordScreen.tsx` | Compare CheckboxGroup and preset RadioGroup/NumberField only with explicit custom-length state. Preserve SecretSession generation/copy lifetime, background clear, secure random, hidden non-autofill result and no secret in transition keys; generic ResultCopy is not equivalent. |

## 공통 API 보완 후보

TaskList는 완료 Checkbox와 목록 렌더러를 제공하지만 항목 삭제 슬롯이 없다. renderCollection으로
외부 조립은 가능하나 제품이 다시 행 배치를 만드는 방식보다 공통 per-item action 슬롯을 검토한다.
삭제는 Checkbox와 독립된 focus/press target이어야 하며 선택 토글로 전파되면 안 된다.
현재 기능 일부만 남기는 교체는 하지 않는다. 2026-10-07 후속으로 renderItemAction({item, disabled})를 양 renderer에 구현했다. 체크 아래 별도 행동 줄을 제공하고 custom collection에도 유지한다. Web/Native 회귀 각 2개 통과; 기기 검증과 게시·소비 교체는 남았다.

ScoreNumeral은 테이블 건너편에서 읽는 48/64pt 숫자다. Statistic의 현재 density는 title/heading
범위이며 임의 valueStyle은 deprecated다. 표시 크기 공개 축 또는 전용 결과 숫자 계약을 검토한 뒤
교체한다. 일반 heading으로 축소한 것을 채택 완료로 세지 않는다.

## 저장·복구 보존

카운터 +/-/undo는 pending에도 입력을 받으며 reducer가 마지막 확정 문서에 순서대로 적용한다.
구조 변경만 잠긴다. 일반 loading Button으로 모든 입력을 막으면 빠른 탭이 유실된다.
현재 change helper는 오류를 삼키고 void를 반환한다. InlineConfirm의 onConfirm에 그대로 연결하면
저장 전에 성공 판정할 수 있으므로 실제 document.change Promise를 전달하는 어댑터가 필요하다.

체크리스트 완료 시각, 사용 중인 목록 ID, undo와 clone을 보존한다. 메모는 IME 조합 문자열을
trim하지 않고 저장 큐에 보낸다. 저장 버튼은 current ref의 최종 초안을 먼저 flush하고 save를
적용한다. 검색/정렬은 화면 상태이며 전체 내보내기는 현재 found 목록을 사용한다.

비밀번호는 일반 복사 액션으로 치환하지 않는다. SecretSession의 비동기 수명·배경 전환 초기화·
copy 상태를 보존하며 숨김 출력의 자동완성/컨텍스트 메뉴 차단을 유지한다. 비밀값을 로그·키·
검증 문서에 넣지 않는다. 고정 길이 preset을 RadioGroup으로 바꾸더라도 사용자가 직접 쓴 다른
길이를 강제로 첫 선택지로 바꾸지 않는다.

## 검증 예정

카운터 연속 탭·undo·저장 실패·0 아래 감소, 체크리스트 대량 항목·삭제/undo·계정 변경,
메모 IME·실패 뒤 재시작·저장/폐기 경합·필터된 공유, 텍스트 빈 결과·원본 복구·최대 길이,
비밀번호 생성/복사 중 배경 전환·설정 변경·숨김/표시, 숫자 긴 폭·큰 글자·스크린리더는 pending이다.
