# 입력·선택·폼 기능 검수 — 2026-10-13

## 범위와 증거

공유 main 작업 트리의 **source snapshot**을 검토했다. 기존 dirty 변경을 보존하고 아래 source/테스트만 추가 수정했다. 이 보고서는 앞선 `components.md`의 문서/정적 조사를 보완하는 실행 검수다. 모든 조합·모든 분기를 실행했다는 의미는 아니다. Web은 Chromium DOM, Native는 react-test-renderer와 React Native host mock, 계약은 Vitest로 실행했다. Native 기기·OS 키보드·실제 파일 선택기·VoiceOver/TalkBack·게시 패키지·소비 제품·배포는 미실행이다. 최대 OS 글자 조건은 범위에서 제외했다.

Renderer 테스트는 renderer `src`를 import한다. `@hjmds/design-contracts` 소비는 workspace package exports의 dist 경로이므로 순수 계약 source 테스트와 구분한다. 부모가 통합 source build 및 dist 소비 검사를 별도 수행한다. 이 담당자는 build·install·generator·전체 무경로 테스트·커밋을 실행하지 않았다.

## 확인하여 수정한 결함

| ID | 공개 API 재현 조건과 기존 영향 | source 수정 | 확인 방법/결과 |
|---|---|---|---|
| I01 | TagsInput, Web Combobox/Mentions/NumberField에서 IME 조합 중 Enter가 값 확정으로 처리됨 | `react/src/tags-input.tsx:116`, `advanced-forms.tsx:362`, `mentions.tsx:99`, `number-field.tsx:189`: isComposing/229를 소비하지 않음 | Web `input-logic`에서 조합 draft와 콜백 비호출, 정상 Enter는 커밋 확인 |
| I02 | 동일 label의 TagsInput 두 개가 동일 input/listbox id 사용 | `react/src/tags-input.tsx`: useId로 인스턴스별 연결 분리 | 동일 라벨 두 input의 id가 다름 확인 |
| I03 | 열린 TagsInput 추천 후 disabled 전환, Combobox readOnly 전환 시 추천 pointer가 값 변경 가능 | TagsInput commit/추천 및 Combobox 선택/입력/focus/key 경로 잠금 | 실제 DOM pointer 이벤트 뒤 콜백 비호출 |
| I04 | readOnly SearchField의 clear가 값 제거. Native FieldRenderer가 소비자 editable=false/readOnly를 덮고 입력 가능 | 양 renderer Search clear 숨김, Native 입력 editable/변경 guard, OTP editable=false 존중 | Web clear 부재, Native editable=false 및 늦은 onChangeText 차단 확인; OTP 기존 입력 테스트 포함 |
| I05 | busy Select에서 nullable empty row 선택만 잠금 누락 | `react/src/select.tsx:437` empty commit에 busy guard | 열린 busy Select empty-row click 비호출 |
| I06 | Web Mentions Escape keydown으로 닫은 후보가 keyup에서 재오픈. 클릭/keyup callback도 누락; Native readOnly 후보 노출/selection callback 누락 | unavailable 조건, Escape keyup 재탐지 제외, 소비자 click/keyup/selection callback 전달 | Web Escape keydown→keyup 닫힘 유지, 양 renderer readOnly 후보 부재 |
| I07 | Native Combobox ready→loading으로 바뀌어 후보가 숨겨져도 보존된 active option을 hardware Enter로 선택 가능 | `react-native/src/forms.tsx:1035,1238`: async 상태·query 최소길이·현재 결과·가시성·잠금 확인 | ready에서 highlight 후 loading 전환→Enter 콜백 비호출 |
| I08 | Native FilePicker 동일 tick 연속 press 두 번이 picker 두 개 호출. unmount 뒤 완료 callback 전달. StrictMode effect replay 후 busy 해제 누락 | `react-native/src/file-picker.tsx:62–81`: 동기 ref lock, effect setup mounted 복구, mounted callback guard | 연속 press는 1회, unmount 완료 비호출, StrictMode 정상 완료 후 잠금 해제 |
| I09 | Web Calendar 같은 날짜 재활성화가 useControllableState equality guard에 막혀 DateRange의 당일 시작/끝 선택 불가 | `react/src/calendar.tsx:97`: 동일 선택일도 activation callback 전달 | DateRange 동일 날짜 두 번째 클릭으로 범위 완료, 세 번째로 새 범위 시작 |
| I10 | 양 renderer NumberField draft 작성 후 readOnly/disabled 전환과 blur가 겹치면 값 커밋 가능 | 양 `number-field.tsx` commitDraft guard | 양 renderer draft→readOnly→blur 콜백 비호출 |
| I11 | createFormSubmitSession submitting 구독자가 dispose하면 interrupt handle 설치 전이라 제출 진행. 성공 구독자 즉시 retry의 interrupt handle을 이전 settle이 지움 | `design-contracts/src/form.ts:121–146`: interrupt 설치 후 submitting 통지, terminal settle 완료 후 통지 | 구독자 dispose 시 onSubmit 비호출+interrupted, 성공 구독자 retry 후 dispose는 새 retry interrupted |
| I12 | TagsInput Escape가 active id만 지워 추천 목록 자체는 남음(하이라이트 전에는 Escape 처리도 없음) | `react/src/tags-input.tsx:86–137`: dismiss 상태, draft 보존, Arrow/새 입력으로 재열기 | **수정 전 Chromium 1건 RED**: listbox가 null 아님. 수정 후 동일 테스트 PASS, aria-expanded=false 및 재열기 확인 |

I12는 이번 최종 단계에서 수정 전 테스트 실패를 직접 보존한 경우다. I01–I11은 기존 source의 해당 분기 확인 후 수정하고 새/관련 테스트를 실행했으며, 수정 전 버전으로 되돌려 전체 RED 테스트를 실행한 것은 아니다. 테스트 초안 중 유효하지 않은 fixture(textValue 누락/잘못된 추가)는 테스트를 수정했으며 제품 결함으로 세지 않았다. 유효하지 않은 controlled/default 동시 전달 가정은 결함에 넣지 않았다.

## Source inventory

표의 경로는 `packages/` 기준. `W`=`react/src`, `N`=`react-native/src`, `C`=`design-contracts/src`. 각 행은 본문 API·상태/이벤트 분기를 읽은 파일이다. 코드에 문제를 발견하지 않았다는 것은 모든 실행 조합의 무결함 증거가 아니다.

| 파일 | 확인한 기능/분기 | 직접 실행 근거 또는 미실행 경계 |
|---|---|---|
| W/forms.tsx | Field/TextField/TextArea/Search/Password/OTP controlled 값, clear, reveal, OTP focus/검증 | input-logic, password-otp-field |
| W/advanced-forms.tsx | NativeSelect live 옵션/초기값 검증, Combobox highlight/commit/loading/readOnly/IME, Form 검증/비동기 submit | native-select-lifecycle 4건, input-logic, form.keyboard |
| W/selection.tsx | Checkbox/Switch/Radio/그룹/Segmented 키 이동·disabled·readOnly·선택 reconciliation | selection-lifecycle/selection-dynamic: 항목 삭제·readOnly·controlled 거부 후 Radio Space/Checkbox 재시도 실행; 나머지 조합 미실행 |
| W/select.tsx | controlled open/selection, nullable row, busy, close, 키 이동 | input-logic, selection-lifecycle, contract-alignment: busy empty-row, 잠금 close, controlled open 거부/재시도 및 blur 비커밋 |
| W/tags-input.tsx | draft/추천/commit/reject/Backspace 2단계/blur/disabled/IME/Escape | input-logic, p1b |
| W/number-field.tsx | locale draft/정규화/범위/step/blur/readOnly/IME | input-logic, number-field |
| W/date-entry.tsx | controlled draft/parsing/onBlur(별도 commit/Enter API 없음) | date-entry, date-picker-lifecycle의 Enter/blur 중복 변경 비호출 |
| W/date-range.tsx | 시작/끝 partial draft·검증·완료·재시작 | date-range, date-range.keyboard |
| W/date-picker.tsx | popup open/닫힘·Calendar 연결·입력 표시 | date-picker-lifecycle 8건: 잠금·외부 값·동일 날짜·clear·외부 focus/blur·controlled 거부; 모든 조합의 증거 아님 |
| W/calendar.tsx | 날짜 활성화·disabled dates·month·keyboard | calendar, date-range |
| W/file-picker.tsx | native file dialog click/accept/count/reject/reset | file-picker.keyboard; OS dialog 미실행 |
| W/transfer-list.tsx | target membership/체크/양방향 이동/disabled/empty/focus | transfer-list, selection-dynamic: 삭제·재삽입·controlled 거부·잠금·모두비활성 select-all·외부행삭제 focus. 검색 API 없음 |
| W/slider.tsx | 단일/range draft·keyboard/pointer·commit·RTL | slider |
| W/mentions.tsx | caret match/trigger/candidate/IME/Escape/삽입 | mentions, input-logic |
| W/toggle-group.tsx | 다중 선택/삭제항목 reconciliation/disabled | p1b, selection-dynamic: 삭제 후 재삽입·controlled 거부/재시도 |
| W/tree.tsx | 확장/축소/visible focus/typeahead/selection/async | tree, selection-lifecycle: 삭제·외부 collapse 초점복구·외부 focus 보존 |
| W/agreement.tsx | 실제 동의/required 판정 통지, 제거 consent, 잠금/상세 읽기 | agreement-lifecycle, agreement.keyboard |
| N/agreement.tsx | 같은 동의 계약의 Native host 행동 | agreement-lifecycle, agreement.interaction |
| W/color-picker.tsx | 색/alpha/HEX draft/Enter/IME/blur/disabled | color-picker-lifecycle, web-additions의 color-picker 2건 |
| W/clipboard.tsx | async request/generation/lock/unmount/timer | clipboard-lifecycle 5건; 실제 OS clipboard 미실행 |
| W/text-formats.tsx | semantic HTML 표시 분기(입력 상태 없음) | 정적 검토만; 별도 렌더 테스트 미실행 |
| W/duration-field.tsx | 단위별 NumberField 조합·총량 clamp | compound-controls 지정 1건 |
| W/rating.tsx | radio/clear/readOnly/disabled | reference-adoption 지정 2건 |
| W/internal.ts | 값 hook의 equality suppression 및 controlled/uncontrolled 분기 | Calendar 동일 날짜 재활성화 실행으로 영향 확인 |
| N/inputs.tsx | Field/TextArea/Search/Password/OTP, Checkbox/Switch/Radio/그룹/Segmented | input-logic, password-otp-field, native-input-collection-product, selection-lifecycle, radio-group-web-lifecycle(Expo-web gate만 mock한 host props) |
| N/forms.tsx | Form 검증/submit/focus, Select/Combobox async·current query·keyboard | form.interaction, input-logic, native-input-collection-product |
| N/tags-input.tsx | return commit/reject/추천/remove/disabled | stable-core TagsInput 지정 1건; OS IME 미실행 |
| N/number-field.tsx | draft/blur/범위/accessible step/readOnly | number-field, input-logic |
| N/date-entry.tsx | controlled draft/parsing/onBlur(별도 commit API 없음) | date-entry, date-picker-lifecycle 중복 변경 비호출 |
| N/date-range.tsx | partial range/완료/재시작 | date-range-actions |
| N/date-picker.tsx | picker 표시/선택 연결/disabled | date-picker-lifecycle 5건: 잠금·외부 값·동일 날짜·clear focus host action; OS modal/기기 focus 미실행 |
| N/calendar.tsx | 날짜 선택·month 이동·disabled | calendar |
| N/file-picker.tsx | host async picker 중복/완료/unmount/StrictMode | input-logic, file-picker-host-action |
| N/transfer-list.tsx | target membership/양방향 선택/이동/disabled | transfer-list-actions, selection-dynamic: 삭제·재삽입·controlled 거부·모두비활성 select-all. 검색 API 없음 |
| N/slider.tsx | 값/range/drag responder/accessible increment | slider; 실제 gesture 기기 미실행 |
| N/mentions.tsx | caret match/삽입/selection callback/unavailable | mentions-actions, input-logic |
| N/toggle-group.tsx | 다중 선택/disabled/reconciliation | profile-toggle-group, selection-dynamic: 삭제 후 재삽입·controlled 거부/재시도 |
| N/duration-field.tsx | 단위별 clamp | compound-controls 지정 1건 |
| N/rating.tsx | radio actions/readOnly | reference-adoption 지정 2건 |
| N/internal/state.ts | controlled-at-mount invariant/set callback | 소비 입력 테스트로 간접 실행; 잘못된 mode-switch API는 결함으로 보지 않음 |

Tree와 TextFormat은 Web 표면만 있다. Native에 없는 파일을 Native 검토 완료로 세지 않았다. 화면 파일에 동거하는 MessageComposer는 부모 담당이고 이 목록에 포함하지 않았다.

직접 계약 source 확인: `C/form.ts`, `number-field.ts`, `slider.ts`, `tags-input.ts`, `toggle-group.ts`, `date-entry.ts`, `date-range.ts`, `date-picker.ts`, `calendar.ts`, `file-picker.ts`, `mentions.ts`, `transfer-list.ts`, `duration-field.ts`, `password-field.ts`, `otp-field.ts`, `tree.ts`, `tree-select.ts`, `collection.ts`, `selection-helpers.ts`, `reference-controls.ts`의 Rating 정의, `behaviors.ts`의 선택 validation/reconcile/navigation 범위. 이들은 입력 값 판정과 renderer 상태 동기화의 근거로 확인했다. 공유 recipes/전체 behaviors의 무관한 부분까지 기능 실행한 것으로 세지 않는다.

## 실행 기록

대상 패키지 cwd에서 `pnpm exec vitest run`을 파일/패턴 지정하여 실행했다. Web에는 `--config vitest.browser.config.ts` 추가.

1. Web 14파일 **75건 통과**: `input-logic.browser.test.tsx`(당시 6건), `date-range.browser.test.tsx`, `mentions.browser.test.tsx`, `form.keyboard.browser.test.tsx`, `password-otp-field.browser.test.tsx`, `slider.browser.test.tsx`, `number-field.browser.test.tsx`, `date-entry.browser.test.tsx`, `tree.browser.test.tsx`, `transfer-list.browser.test.tsx`, `file-picker.keyboard.browser.test.tsx`, `calendar.browser.test.tsx`, `date-range.keyboard.browser.test.tsx`, `p1b.browser.test.tsx`.
2. I12 수정 후 Web `input-logic.browser.test.tsx`, `p1b.browser.test.tsx` **2파일 12건 통과**. 위와 중복 결과를 더해 고유 전체 테스트 수로 보고하지 않는다.
3. Native 12파일 **56건 통과**: `input-logic.test.tsx`(당시 5건), `file-picker-host-action.test.tsx`, `mentions-actions.test.tsx`, `form.interaction.test.tsx`, `native-input-collection-product.test.tsx`, `number-field.test.tsx`, `date-entry.test.tsx`, `date-range-actions.test.tsx`, `slider.test.tsx`, `password-otp-field.test.tsx`, `calendar.test.tsx`, `transfer-list-actions.test.tsx`.
4. 계약 **16파일 254건 통과**: `duration-field`, `number-field`, `otp-field`, `date-entry`, `mentions`, `toggle-group-tags-input`, `slider`, `tree`, `transfer-list`, `calendar`, `form`, `date-range`, `date-picker`, `password-field`, `tree-select`, `file-picker`의 `.test.ts`. 명령에 지정했던 `collection.test.ts`는 실제 존재하지 않아 실행 파일 수에 포함되지 않았다. collection 기능은 Tree/선택 소비 경로로 간접 실행됐다.
5. Web `compound-controls.browser.test.tsx`, `reference-adoption.browser.test.tsx`에서 `-t 'composes existing number|uses real radio|keeps read-only averages'`: **3건 통과, 6건 제외**.
6. Native 동일 계열에서 `-t 'disables unavailable hours|exposes native radio|renders average|ToggleGroup'`: **3건 통과, 8건 제외**. profile-toggle-group은 해당 제목 패턴과 맞지 않아 이 실행에서는 제외됐고 아래 지정 재실행에 포함했다.
7. Native `input-logic.test.tsx`, `profile-toggle-group.test.tsx`, `stable-core.test.tsx`에 `-t 'readonly|readOnly|editable|combobox|picker|inherits every preset|closest explicit profile|commits TagsInput'`: **3파일 9건 통과, 21건 제외**. 최종 NumberField readOnly blur 회귀 1건을 포함한다.

Web 기존 OTP 및 Rating fixture 일부에서 `act(...)` 경고가 출력됐다. assertion 실패는 없지만 이를 무경고 실행으로 표현하지 않는다. Native `pnpm exec tsc --noEmit`은 통과했다. 중간 Web tsc에서는 입력 테스트의 잘못된 textValue fixture를 수정했고 이후 입력 범위 오류는 없었으나, 다른 담당자가 추가한 data/media 테스트 unused import와 showcase 확장자 오류가 남아 부모에게 전달했다. 최종 통합 타입검사는 부모 기록을 따른다.

## 잔여·정리

- OS 실제 IME 조합은 미실행. Web 테스트는 Chromium KeyboardEvent의 isComposing/229 경계이며 iOS/Android 키보드 동작을 대신하지 않는다.
- 외부 비동기 조회 자체의 취소/요청 식별은 제품 소유다. Native Combobox는 공개 results/current-query 조건과 현재 표시 상태만 검증했다.
- Form/컬렉션/입력의 모든 controlled reject, 외부 값 변경, callback 예외 조합을 전부 실행하지 않았다. 표의 실행 근거 밖은 source 검토 경계다.
- 사용 API/props 추가 없이 기존 잠금·입력·생명주기 계약의 동작을 맞췄다. 미완료 제품 이관이나 배포 완료를 주장하지 않는다.
- 본 담당자가 만든 테스트 실패 screenshot 2개만 제거했다. 공유 dirty, 기존 screenshot, dist, 기타 세션 파일은 보존했다.

## 추가 배정: CounterBadge Hook 후보 확인

부모가 발견한 `react-native/src/data-display.tsx`의 CounterBadge 범위만 확인했다. `count=0`의 `return null` 아래 `useHjmNativeTheme()`가 있어 0↔양수 전환에 따라 Hook 호출이 달라지는 규칙 위반을 확인했다. Hook을 early return 위로 이동했고 같은 파일의 기존 Image 변경은 보존했다.

수정 전에도 현재 React test-renderer에서 0→1→0→2→0 전환은 throw나 Hook 경고 없이 통과했다. 현재 helper가 `useContext`만 호출하는 구성에서 런타임 오류가 재현됐다는 주장은 하지 않는다. 변경 이유는 조건부 Hook 호출 제거다.

`pnpm exec vitest run test/counter-badge-lifecycle.test.tsx test/renderer-recipe-regressions.test.tsx -t 'zero transitions|CounterBadge'`: **2건 통과, 34건 제외**. 새 테스트는 0일 때 subtree 없음, 재등장 시 최신 숫자와 접근성 이름, 반복 전환에서 Hook 경고 부재를 검증한다. 기존 테스트는 decorative subtree와 명시적 빈 접근성 이름 거부를 검증한다. 현재 숨김/표시 및 이름 계약에서 추가 UX 결함은 확인되지 않아 시각 형태는 변경하지 않았다. 기기 스크린리더 실행은 미실행이다.

## 추가 집중 검수: 선택 상태 변경과 초점

후속 요청에 따라 Checkbox/Radio 그룹, Select, Tree 세 군의 선택항목 삭제·readOnly/disabled 변경·controlled open 거부 후 재시도·keyboard/blur 경계를 직접 실행했다.

- **I13 Native Select:** `defaultSelectedKey=b` 상태에서 `b`를 삭제하면 기존 default를 매 render 검증하여 `RangeError: Select selection must match an option` 발생. 최초 default 검증과 live state reconciliation을 분리했다(`react-native/src/forms.tsx`). 삭제 후 남은 `a`로 전환되고 callback이 전달된다. 현재 controlled 값 검증은 유지한다.
- **I14 Tree selection:** uncontrolled multiple에서 삭제된 id가 내부 선택에 남아 다음 callback에 섞이고 재삽입 시 선택이 부활했다. 현재 전체 node ID로 선택을 정리하고, uncontrolled state/콜백에 반영한다(`react/src/tree.tsx`). 여러 선택 및 single 제거→null을 검증했다. 접혀서 보이지 않는 자식은 삭제로 취급하지 않는다.
- **I15 Tree focus UX:** 자식에 초점이 있는 상태에서 부모의 controlled expandedKeys를 외부에서 접으면 초점이 body로 빠졌다. 직전 계층에서 살아 있는 가장 가까운 조상으로 초점/탭 위치를 회복한다. 밖의 버튼으로 초점을 옮긴 상태에서는 초점을 가져오지 않는다(`react/src/tree.tsx`).
- **I16 Web Select 잠금 UX:** 열린 uncontrolled Select에 readOnly를 켜도 선택지 popup이 남아 행동 가능한 것처럼 보였다. disabled/readOnly 전환에 programmatic 닫기를 요청한다(`react/src/select.tsx`). controlled open은 소유자의 응답을 존중한다. busy만 바뀔 때는 기존 상태 표시를 유지한다.

수정 전 새 테스트에서 Web I14/I15 **2건 실패**, I16 **1건 실패**, Native I13 **1건 예외 실패**를 확인했다. Native 테스트 초안의 Web 전용 `emptySelectionLabel` prop은 타입 검사에서 제거하고 유효한 Native 공개 API로 재검사했다(제품 결함으로 세지 않음).

수정 후:

- Web `selection-lifecycle.browser.test.tsx`, `tree.browser.test.tsx`, `input-logic.browser.test.tsx`: **23건 통과**(당시 새 파일 5건).
- Web 새 파일에 single 삭제/disabled Tree와 실제 `userEvent.keyboard` RadioGroup readOnly 경계를 추가한 최종 실행: **7건 통과**. 선택 그룹 제거·잠금과 Select open 거부 후 재시도·blur에서 highlight 비커밋은 추가 source 수정 없이 통과했다.
- Native `selection-lifecycle.test.tsx`, `native-input-collection-product.test.tsx`: **13건 통과**. 새 Native 테스트는 default 항목 제거, controlled open 거부 후 재시도, 그룹 항목 제거/readOnly 변경을 다룬다.
- 변경 source는 `react/src/tree.tsx`, `react/src/select.tsx`, `react-native/src/forms.tsx`. 기존 공유 변경 보존. 새 테스트 두 파일 추가. 실패 screenshot 본 작업 3개만 제거했다.

이 실행도 Chromium과 Native host mock 범위이며 기기 키보드/스크린리더 검증으로 확대하지 않는다. 나머지 선택/비동기 전체 조합의 전수 실행은 주장하지 않는다.

기존 Web `contract-alignment.browser.test.tsx`에서 highlight/commit, deferred controlled close, uncontrolled 항목 제거, open 거부 후 재시도, Radio/CheckboxGroup native semantics 제목을 지정해 **5건 통과, 15건 제외**했다. 최종 Native `pnpm exec tsc --noEmit` 통과. 중간 Web 타입검사는 다른 담당 영역 `advanced-display.tsx` unused import 1건만 남아 부모에 전달했다.

최종 Web `pnpm exec tsc --noEmit` 재실행도 **통과**했다. 앞의 중간 unused import 오류는 최종 결과에 남지 않는다.

## 마감 범위: 독립 DatePicker/DateEntry lifecycle

추가 코드 수정은 양 renderer `date-picker.tsx`뿐이다. 독립 팝업의 다음 경로를 새 `date-picker-lifecycle` 테스트로 실행했다.

- **I17 잠금 전환:** 열린 DatePicker에 readOnly/disabled가 적용돼도 양 표면의 달력이 남았다. uncontrolled는 닫고 controlled는 `programmatic` 닫기 요청을 전달한다. Native trigger도 읽기 전용 상태를 비활성으로 전달한다.
- **I18 Web dismissal:** open 상태에서 onOpenChange를 바꾸면 outside listener가 이전 콜백을 호출했다. 최신 callback으로 listener를 갱신한다. 또한 필드 밖으로 키보드 초점이 이동해도 팝업이 남는 경로를 고치고, outside/blur로 나간 새 초점을 trigger로 빼앗지 않도록 했다.
- **I19 필드 이름/clear 초점:** Web에서 visible label만 제공한 trigger의 접근성 이름에 필드명이 빠졌다. Native와 같은 label+displayValue 조합을 연결했다. 닫힌 상태의 clear 버튼은 선택 제거와 함께 사라지므로 양쪽 모두 trigger 초점을 명시적으로 복구한다(Native는 접근성 focus 요청).

유효 grid fixture로 수정 전 **Web 5건 실패**(잠금 2, stale callback, blur, 필드 이름), **Native 잠금 2건 실패**, 별도 Native closed-clear focus **1건 실패**를 확인했다. 초안의 todayDate 누락은 fixture 오류로 수정했으며 제품 결함에 포함하지 않았다. Web clear 초점은 이름 assertion 뒤에 있어 수정 전 해당 assertion까지는 도달하지 않았고 source 분기 확인→수정 후 실행 근거다.

동일 날짜 재확정·외부 controlled selectedDate 변경·취소·clear 콜백 구분을 실행했다. DateEntry에는 별도 date-commit/Enter API가 없고 `onValueChange`는 draft 편집, `onBlur`는 제품 검증 알림이다. Enter 후 blur에서 새로운 draft 변경은 발생하지 않고 blur 한 번만 전달되는 것을 양쪽에서 확인했다. 이 정상 경로에 불필요한 commit API는 추가하지 않았다.

실행: Web `date-picker-lifecycle.browser.test.tsx` 최종 **8건 통과**. 별도 `calendar.browser.test.tsx`와 picker/DateEntry 제목 패턴은 **10건 통과/12건 제외**(중복 합산하지 않음). Native `date-picker-lifecycle.test.tsx`와 기존 `calendar.test.tsx`의 picker/DateEntry/current-date 제목 패턴은 **7건 통과/6건 제외**. Native 타입검사 통과. Web 중간 타입검사에서 입력 범위 오류는 없고 타담당 `media-effects.browser.test.tsx` 25/35의 fixture 타입 오류 2건을 부모에게 전달했다. 최종 통합 build/타입검사는 부모 담당이다.

OS 달력·실제 Native 스크린리더 실행은 미실행이며 host focus 요청 검사와 구분한다. 이 마감 범위 실패 screenshot 6개만 정리했다. 기존 dirty 변경, generator/dist, 다른 담당자 파일을 보존했다.


## 추가 실행: 선택 항목의 동적 수명과 거부된 요청

공개 API 경로에서 아래 결함을 수정 전 실행으로 확인했다. 기존 통과한 정적 분류를 전수 행동 통과라고 세지 않고, 이번에 실제 실행한 상태 전이를 추가한다.

- **I20 양 ToggleGroup**: uncontrolled 선택 항목 삭제→재삽입 시 눌림 부활. 렌더에서만 걸러낸 선택을 내부 state에 영구 반영한다.
- **I21 양 TransferList**: uncontrolled target 항목 삭제 때 초기값 검증 재실행으로 예외. 첫 default 검증/controlled 값 검증은 유지하면서 live uncontrolled target을 정리한다.
- **I22 양 TransferList**: 삭제한 행의 이동 대기 체크가 재삽입 시 부활. 정리한 체크를 내부 state에 저장한다.
- **I23 양 TransferList**: controlled 이동 요청을 부모가 거절해도 체크를 지워 재시도 불가. 실제 target 소속이 바뀔 때까지 체크를 보존한다. Web 초점도 실제로 이동하지 않은 행에서 빼앗지 않는다.
- **I24 양 TransferList**: 체크된 행이 모두 disabled면 이동 불가인데 이동 버튼은 활성; 빈/모두 disabled 패널의 select-all도 활성. 현재 이동 가능한 행/선택 가능한 행으로 잠금 상태를 판정하고 Native no-op 이동 callback도 차단한다.
- **I25 Web TransferList**: 초점 행을 외부에서 삭제하면 body로 초점 유실. 다음 가까운 행 또는 빈 패널로 회복하고, 이미 밖으로 이동한 focus는 보존한다.
- **I26 Native RadioGroup의 Expo-web 속성**: checked 항목이 disabled로 바뀌면 모든 row의 tabIndex=-1. 선택값은 보존하되 enabled 행에 Tab 진입점을 배정한다. 이 증거는 webOnly gate만 mock한 host props 실행이며 실제 Expo-web 브라우저/기기 테스트가 아니다.

수정 전 Web 새 파일 처음 6건 중 5 FAIL, Native 처음 5건 모두 FAIL. 추가 Web 외부행삭제/select-all, Native Radio tabstop/select-all도 각각 RED를 확인했다. 수정 후 최종 Web `selection-dynamic.browser.test.tsx` + `transfer-list.browser.test.tsx`에 `-t 'removed|refused|disabled|controlled|reinsertion|focus|select-all|moves a multi-selection'`: **15 PASS, 2 제외**. Native `selection-dynamic.test.tsx`, `radio-group-web-lifecycle.test.tsx`, `transfer-list-actions.test.tsx`: **9 PASS**. Web Radio/Checkbox controlled 거부 후 실제 Space/click 재시도와 양 ToggleGroup controlled 거부는 추가 source 수정 없이 통과했다.

## 추가 실행: Agreement·ColorPicker·ClipboardButton

- **I27 양 Agreement**: controlled 체크 요청을 거절해도 `onStateChange`가 가상의 satisfied=true를 통지했고, 외부 checkedIds/required 변경은 통지하지 않았다. 요청 callback과 실제 파생 상태 통지를 분리하여 실제 수락된 동의로 제출 상태를 알린다. 동일 파생 state 및 체크 집합은 재통지하지 않아 소비자 렌더 루프를 막는다.
- **I28 양 Agreement**: 제거된 uncontrolled 동의가 재삽입 때 부활. 제거 시 내부 동의 및 callback을 영구 정리한다. 두 renderer 모두 새 lifecycle 2건이 수정 전 FAIL → 수정 후 PASS.
- **I29 Web ColorPicker**: IME Enter가 미완료 draft를 확정했고 controlled owner가 값을 늦게 수락하면 Enter→blur가 동일 요청을 2회 발행. 조합 Enter를 건너뛰고 확정된 edit를 blur에서 재발행하지 않는다. 두 경로 RED → PASS. disabled 전환 뒤 blur는 수정 전부터 실제 Chromium에서 PASS였으며 추가 guard도 둔다.
- **ClipboardButton Web**: async single-flight, value generation, unmount, timer cleanup source를 읽고 기존 lifecycle 5건을 실행했다. 거절→busy 복구, pending 중 source 변경 resolve/reject 무시, unmount 완료 무시, source 변경 후 복귀를 검증했다. 이 실행에서 추가 결함은 확인되지 않아 해당 source는 수정하지 않았다. 실제 OS clipboard 권한은 mock이므로 미검증이다.

실행: Web `agreement-lifecycle.browser.test.tsx`, `agreement.keyboard.browser.test.tsx`, `color-picker-lifecycle.browser.test.tsx`, `clipboard-lifecycle.browser.test.tsx`, `web-additions.browser.test.tsx`에 동의/색상/clipboard 제목 지정: **14 PASS, 5 제외**. web-additions는 textScale=1 keyboard 시나리오와 native RGB/alpha/외부값/disabled 2건만 포함한다. Native `agreement-lifecycle.test.tsx` + `agreement.interaction.test.tsx`: **4 PASS**. Web 기존 색상 fixture의 act 경고는 있었다. 기기 UI·OS 선택 UI·배포/게시 검증은 포함하지 않는다.


## 마지막 공개 입력 대조: NativeSelect

**I30 Web NativeSelect(`advanced-forms.tsx`)**: uncontrolled 선택 옵션을 외부에서 삭제하거나 disabled로 만들면 기존 `defaultValue`가 더 이상 유효하지 않아 RangeError로 폼이 중단됐다. 최초 default 및 매 render controlled 값의 검증은 유지하고, live uncontrolled 값은 placeholder가 있으면 빈 선택, 없으면 첫 enabled 옵션으로 정리한다. 제거한 옵션을 다시 넣어도 과거 선택은 부활하지 않는다.

`native-select-lifecycle.browser.test.tsx`: 수정 전 **3 FAIL / 1 PASS**(삭제·disabled·placeholder 실패, 잘못된 최초/controlled 값 거부 통과) → 수정 후 **4 PASS**. 이번 추가 범위에서 계약 source와 CSS는 바꾸지 않았다. 양 renderer 통합 build/typecheck는 부모가 담당하며 이 보고서의 source 테스트 성공을 dist·기기·게시 성공으로 확대하지 않는다.

이번 후속 실행의 실패 screenshot은 본 담당자가 새로 만든 selection-dynamic/agreement-lifecycle/color-picker-lifecycle/native-select-lifecycle 디렉터리의 PNG 14개만 제거했다. 기존 다른 테스트 산출물과 공유 dirty는 보존했다. 새 브랜치·설치·커밋은 없었다. 새 selection fixture의 빈 Set generic 3곳은 타입 오류 확인 후 `Set<string>`으로 고쳤으며, 마지막 통합 타입 검사 결과는 부모 기록을 따른다.


## UI/UX 후속: 기본 Dialog·AlertDialog Showcase

`usage/components/dialog.md`·`alert-dialog.md`와 양 renderer 공개 props를 확인하고, `showcase/native/src/component-examples.tsx` 및 `showcase/web/src/components/preview-registry.tsx`의 기본 예제를 개선했다. 단순히 닫히던 Save/확인 대신 다음 결과를 직접 관찰할 수 있게 했다.

- Dialog: ‘주말 산책’ 앨범 이름을 편집하며 취소는 저장값을 유지하고, 초안은 지침대로 다시 열어 이어 쓴다. 취소 결과에 이 차이를 명시한다. 저장은 앞뒤 공백을 제거한 이름을 바깥 화면에 반영한다. 빈 이름/변경 없는 이름은 저장을 잠그고 빈 이름 오류를 필드에 연결한다.
- Web은 첫 입력 focus와 form Enter submit을 연결한다. 양쪽은 여는 버튼의 returnFocusRef를 유지한다. Native 키보드 가림·실제 기기 focus는 부모의 별도 점검 범위다.
- AlertDialog: 삭제 대상 이름·목록에서 사라지는 영향·취소/확정 결과를 보여 준다. 다시 만들기는 예제 재체험 행동이며 실제 서버 삭제/복구를 흉내 내지 않는다. Web info-tone 예제는 보존했다.

표적 실행(`--maxWorkers=1`): Web `dialog-showcase.browser.test.tsx` **2 PASS**, Native `dialog-showcase.test.tsx` **2 PASS**. 실제 Showcase source를 import하고 공개 package renderer exports(dist)를 소비한 예제 통합 검사다. 취소/초안보존/빈값잠금/trim 저장반영/삭제취소/삭제확정/재체험 및 Web info variant 열기를 실행했다. 초기 실패는 Web 환경 Provider 누락과 Native AlertDialog 버튼 fixture 탐색 오류였으며 fixture를 수정했다(제품 결함으로 세지 않음). Native는 host mock이고 키보드/스크린리더/시뮬레이터 미실행이다. Web 최초 입력 focus와 Enter 저장은 Chromium에서 확인했다. 전체 테스트·최대 글자·build·Metro·커밋은 실행하지 않았고 기존 shared dirty를 보존했다. 이 fixture가 만든 실패 PNG 2개만 제거했다.

## 브라우저 호환성 후속: WebKit·Firefox

수정된 선택/동의/색상 입력의 동일 회귀 파일을 엔진별 순차 실행했다. `packages/react`에서 `HJM_TEST_BROWSER=webkit` 및 `HJM_TEST_BROWSER=firefox` 각각 `pnpm exec vitest run --config vitest.browser.config.ts --maxWorkers=1`에 다음 5파일을 명시했다.

- `test/selection-dynamic.browser.test.tsx` 10건
- `test/selection-lifecycle.browser.test.tsx` 7건
- `test/agreement-lifecycle.browser.test.tsx` 2건
- `test/native-select-lifecycle.browser.test.tsx` 4건
- `test/color-picker-lifecycle.browser.test.tsx` 3건

결과: **WebKit 5파일 26 PASS**, **Firefox 5파일 26 PASS**. 동적 항목 삭제/재삽입, disabled/readOnly 전환, controlled 거부/재시도, Tree·TransferList 초점 회복과 외부 초점 보존, 실제 Radio 키보드 선택, Agreement 실제 동의 상태 통지, NativeSelect 기본/controlled 값 검증, 색상 IME Enter/blur 중복 방지를 검증했다. 추가 제품 결함은 확인되지 않아 source·fixture 변경은 하지 않았다. 이 파일들은 최대 글자 조건을 포함하지 않고 버튼 Tab 순서를 검사하지 않으므로 Option+Tab helper 적용도 필요 없었다.

부모가 동시에 맡은 `input-logic.browser.test.tsx`와 `date-picker-lifecycle.browser.test.tsx`는 이 실행에서 제외했다. 기본 Chromium 근거와 이번 headless WebKit/Firefox 회귀를 실제 Safari UI·모바일 브라우저·실제 OS IME·Native 기기 검증으로 확대하지 않는다. 설치·Metro·native 조작·전체 테스트·build·commit은 하지 않았으며 이번 실패 산출물은 발생하지 않았다.

### Dialog 예제의 타입 검사 경계 정리

예제 fixture가 전체 `preview-registry.tsx`/`component-examples.tsx`를 import하면 예제와 무관한 카탈로그까지 renderer 패키지의 엄격한 noUnused·NodeNext 검사에 유입됐다. 검사 제외나 ts-ignore 없이 Web `showcase/web/src/components/dialog-examples.tsx`, Native `showcase/native/src/dialog-examples.tsx`로 두 예제를 추출했다. 갤러리 등록부와 fixture가 같은 작은 모듈을 소비한다. Web fixture는 실제 `HjmProvider`로 감싸며 Showcase 환경 context의 의존이 필요하지 않다. 상호작용과 문구는 변경하지 않았다.

각 프로젝트 cwd의 `pnpm exec tsc --noEmit`: **react, react-native, showcase/web, showcase/native 모두 PASS**. Native Showcase를 renderer 패키지의 다른 버전 tsc로 처음 검사했을 때 Node URL 타입 충돌이 있었으며, 대상 Showcase의 선언된 compiler로 실행한 정식 검사는 통과했다. 예제 표적 테스트를 `--maxWorkers=1`로 순차 재실행하여 **Web 2 PASS, Native 2 PASS**. 새 실패 screenshot은 없고 공유 파일의 기존 변경을 보존했다.


## 파일 선택 UIUX 후속: 취소·재선택·잠금·현재 제한 (2026-10-13)

기존 I08의 동일 tick 중복 실행·unmount 늦은 결과·StrictMode 잠금 검사를 반복하지 않고, `FilePicker` 양 renderer와 직접 `file-picker` 계약/사용 지침을 읽어 남은 선택 경로를 추가했다. 공유 Native FilePicker의 기존 `pickingRef`/mounted 변경을 보존했다.

| ID | 공개 경로의 재현/영향 | 수정/검증 |
| --- | --- | --- |
| FP-01 | Web input change 및 Native pending adapter가 owner disabled 전환 뒤 완료되어도 파일을 선택 콜백으로 전달 | Web `file-picker.tsx:74`, Native `file-picker.tsx:80`에서 완료 시 현재 잠금을 확인. 양쪽 RED→GREEN. Native busy는 종료되고 owner disabled는 유지 |
| FP-02 | Web dragenter 이후 disabled를 적용해도 data-dragging 강조가 남음 | Web `file-picker.tsx:72,97`에서 잠금 시 drag 상태를 정리하고 표시를 즉시 끔. locked drop 차단도 실행. RED→GREEN |
| FP-03 | Web 빈 FileList change가 accepted/rejected 빈 배열의 onSelect를 호출 | 후보 없는 change는 무통지. input 값을 finally에서 비워 같은 파일 재선택 경로 유지. RED→GREEN; Native null 취소는 기존 정상 경로 유지 |
| FP-04 | Native adapter 대기 중 descriptor.maxCount/existingCount/onSelect/onPickError를 바꿔도 시작 당시 판정/콜백 사용 | Native `file-picker.tsx:68`의 최신 committed 입력 ref로 완료를 판정. capacity 2→1, existingCount 0→1이면 count-exceeded; 이전 콜백 비호출. 오류도 최신 onPickError로 전달. 두 RED→GREEN |

추가 실행: Native 취소→재선택→adapter reject→busy 해제→동일 파일 성공 복구. Web count-exceeded 표시 후 외부 파일 제거를 뜻하는 existingCount 1→0으로 재렌더하여 같은 파일 수락·반복 선택, 보이는 선택 버튼 DOM/초점 유지와 오류 표시 제거를 확인했다. file input의 `files` 및 change/drag DOM 이벤트는 Chromium에서 주입했다. 실제 OS dialog 취소/파일 접근/권한 요청/선택 결과를 얻은 검사가 아니다. Native도 controlled Promise와 Pressable host를 사용했으며 실제 DocumentPicker·OS 권한·스크린리더 검증은 미실행이다.

FilePicker는 선택 목록·파일 행·삭제 버튼을 렌더하지 않는다. 따라서 여기서 **행 삭제 자체의 초점 복구를 구현/검증했다고 주장하지 않는다**. 해당 UI는 제품/UploadItem을 배치하는 목록 소유자 범위이며, 이번 검사는 제거 후 `existingCount` 변화와 남아 있는 picker trigger 초점을 확인했다. 공개 API/계약 타입은 추가하지 않고 기존 사용 지침에 완료 시점 판정·취소·목록 소유권만 보강했다.

```sh
pnpm --filter @hjmds/react exec vitest run --config vitest.browser.config.ts test/file-picker-lifecycle.browser.test.tsx --maxWorkers=1
# 1 file, 3 passed; 수정 전 같은 3건 실패
pnpm --filter @hjmds/react-native exec vitest run test/file-picker-lifecycle.test.tsx --maxWorkers=1
# 1 file, 3 passed; 수정 전 같은 3건 실패
```

두 실행은 순차 수행했다. 설치/build/native 조작/전역 검사/커밋 없음. 수정 source는 양 `file-picker.tsx`뿐이고, 재사용 테스트2개는 보존했다. 이번 RED screenshot3개만 결과 기록 후 제거했고 다른 작업 증거는 보존했다. 통합 타입/build는 부모 결과로 별도 확인한다.
