# 오버레이·탐색 기능 검수 — 2026-10-13

현재 checkout의 source를 검토하고 재현 테스트를 먼저 실패시킨 뒤 수정했다. 기존 dirty navigation/bottom-navigation 및 다른 담당자의 변경은 보존했다. 아래 실행은 Chromium 및 React Native mock host 환경이다. 실기기·시뮬레이터·배포 검증으로 해석하지 않는다. 최대 OS 글자 및 이를 모사하는 확대 검증은 제외했다.

## 재현 결함과 수정

| ID | 근거 및 트리거 | 수정 전 실제 결과·영향 | 수정 및 검증 |
|---|---|---|---|
| O-01 | `packages/react/src/command-palette.tsx:184`; IME 조합 중 Enter | `onActivate("write", "keyboard")`가 실행되어 입력 확정이 명령 실행으로 바뀜. **확정** | `isComposing` 및 Safari 계열 keyCode 229를 입력 소유로 유지. 신규 browser test에서 두 경로 모두 실행되지 않음 |
| O-02 | `packages/react/src/command-palette.tsx:175`; controlled owner가 open=true를 유지 | 팔레트가 남아 있는데 `onActivateAfterDismiss` 실행. **확정** | pending activation을 실제 open=false 커밋까지 보관, modal focus cleanup 뒤 호출. 닫힘 전 0회/닫힘 후 1회 테스트 |
| O-03 | `packages/react/src/modal.tsx:361`; Dialog 내부 Menu/Menubar/Tooltip 첫 Escape | 자식과 부모가 함께 닫힘. 각각 browser test로 **확정** | modal 소유 popup, expanded trigger, tooltip description의 Escape를 자식에 위임. 조합 중 키도 modal dismiss에서 제외. 부모 유지/자식 닫힘 검증 |
| O-04 | `packages/react/src/context-menu.tsx:169`; Dialog 안 Shift+F10 | ContextMenu로 이동한 focus가 부모 닫기 버튼으로 강제 복귀. **확정** | AnchoredPortal로 modal/popover 소유권 연결. 메뉴 focus/첫 Escape/원래 버튼 복귀 검증. unmount 시 long-press timer 정리도 추가(후속 Chromium timer 행동 검증 완료) |
| O-05 | `packages/react/src/overlay-stack.tsx:100`; imperative request에 onDismissComplete 제공 | 공개 request callback이 renderer override로 사라져 0회 호출. **확정** | renderer 완료 시 callback 전달 후 finally에서 closed Promise settle. callback 1회 검증 |
| O-06 | `packages/react/src/overlay-stack.tsx:75`; 같은 이벤트에서 연속 open 또는 이전 handle.close 재사용 | 활성 entry가 교체되고 이전 Promise 소유권 유실 가능. 연속 open이 그대로 허용되는 실패를 재현. **확정** | 동기 activeEntry로 이미 명시된 한 overlay 계약 강제(이전 closed를 기다리라는 오류), handle close와 완료는 entry id 소유권 검사. 오래된 handle이 두 번째 Dialog를 닫지 않음 검증 |
| O-07 | `packages/react-native/src/sheet-gesture.tsx:99`; 두 Sheet 중 아래 Sheet의 busy 변경 | 아래 Sheet effect가 stack 마지막으로 재등록되어 위 Sheet close callback이 호출되지 않음. **확정** | open 세션 동안 등록 순서를 유지하고 callback/busy만 ref 갱신. 위 Sheet 닫기 1회 및 unmount 후 stack 비어 있음 host 검사 |
| O-08 | `packages/react/src/sidebar.tsx:125`; destination 없이 onNavigate만 제공 | href 없는 anchor가 Tab에서 제외되어 키보드로 목적지 도달 불가. **확정** | callback 목적지에 link role/Tab stop/Enter→기존 click 경로 연결. disabled는 제외, URL을 만들지 않음. Tab/Enter 1회 callback 검증 |
| O-09 | `packages/react/src/overlays.tsx:547`, `packages/react/src/modal.tsx:136`; controlled Sheet owner가 첫 닫기 거부 | 다음 닫기에도 callback 누적 1회: lifecycle 및 shared pendingRequest 이중 latch. **확정** | 같은 이벤트 중복만 차단하고 다음 상호작용 전에 재무장. 기존 close-action reason 유지. 거부 후 두 번째 요청 및 기존 teardown reason/정확히 1회 완료 검증 |

O-06은 큐/중첩 overlay라는 새 공개 기능을 추가하지 않는다. 이미 문서화된 `await handle.closed` 순서를 위반하면 활성 세션을 교체하지 않고 즉시 명확한 오류를 낸다.

## 소스 검토 inventory

`검토`는 아래 명시한 상태/핸들러 분기의 소스 확인이다. 대형 파일의 스타일 전 행을 검토했다는 의미가 아니며, `실행`이 없는 항목은 정적 검토만이다. Web-only 계약의 Native 부재는 누락 구현으로 세지 않았다.

| 파일 (packages/ 기준) | 검토한 분기·연결 | 결과 / 이번 실행 |
|---|---|---|
| react/src/overlays.tsx | Dialog focus/완료, AlertDialog session, Sheet lifecycle/policy/detent, Menu disabled/typeahead/after-dismiss, Tooltip delay/touch/escape | O-03/O-09; anchored/menu/tooltip/alert/field-dialog tests |
| react/src/modal.tsx | controlled dedup, top modal priority, background inert 복구, owned popup, focus trap/return, renderTrigger | O-03/O-09; nested/priority/StrictMode/teardown browser |
| react/src/overlay-stack.tsx | promise, entry 교체, handle close, callback | O-05/O-06; 5 browser cases |
| react/src/portal.tsx | ownership 전파, provider theme observer, positioning/viewport listeners, cleanup | O-04 연결 수정; anchored/popover tests |
| react/src/popover.tsx | parent close, request dedup, controlled 거부, outside focus, nested portal, hover timer | 추가 확정 결함 미발견; 11 browser cases |
| react/src/command-palette.tsx | stale external result 비활성, active row, disabled, IME, after-dismiss | O-01/O-02; 14 browser cases |
| react/src/context-menu.tsx | keyboard/pointer anchor, long press, disabled, focus, portal | O-04; 기존 4 browser cases + 후속 lifecycle 5 cases |
| react/src/menubar.tsx | roving, enabled filter, open switching, nested Escape | O-03; 3 browser cases; 동적 메뉴 제거·disabled/항목 축소는 후속 실행 완료; RTL 좌우/Home/End Chromium 검증 완료 |
| react/src/menu-typeahead.ts | prefix timeout, disabled skip, 반복 문자 | 추가 확정 결함 미발견; Menu browser의 typeahead 소비 |
| react/src/menu-morph.tsx | canonical fallback, keyboard/typeahead, open/disabled, focus cleanup | 설치된 실제 bloom-menu 엔진 및 reduced/RTL canonical fallback Chromium 검증 완료 |
| react/src/navigation.tsx | Tabs fallback, controlled validation, roving, mount/visited, panel, indicator cleanup | 후속 focused 항목 삭제/disabled 복구 수정; keyboard 6 + profile 2 Chromium cases |
| react/src/sidebar.tsx | destination 유무, disabled, collapse, focus | O-08; browser 3 cases |
| react/src/splitter.tsx | keyboard Home/End, RTL, pointer capture/end, observer cleanup | 추가 확정 결함 미발견; browser 7 cases. 드래그 도중 disabled 변경·pointer capture 유실은 후속 실행 완료 |
| react/src/bottom-navigation.tsx | route ownership, disabled, modified click, keyboard hide listener | 기존 dirty 보존; unmodified/modified primary click 1 case |
| react/src/navigation-bar.tsx | label 검증, slot 조립 | 정적 검토; 자체 행동 없음 |
| react/src/advanced-navigation.tsx | Breadcrumb/Pagination re-export | barrel 확인; 후속 Pagination/Breadcrumb 직접 source·Chromium 행동검증 완료 |
| react/src/navigation-public.ts | 공개 barrel | export 연결 확인 |
| react/src/supplemental-navigation.tsx | LoadMore cursor identity, dispose, observer late callback, rejection | 정적 확인만; data 담당 범위와 중복 수정하지 않음 |
| react/src/internal/overlay-origin-motion.ts | WAAPI resolve/reject, cancellation, rapid reopen, measurement readiness | dialog-origin/popover-origin 4 browser cases |
| react-native/src/overlays.tsx | Dialog action run token/reject/late result, Alert session/exit, Sheet nativeShown/pending cycle/reopen, back/busy | dialog-actions 5, alert-dialog-actions 4, modal-lifecycle 8 host cases |
| react-native/src/navigation.tsx | Tabs activate/selection, BottomNavigation route activation, Menu disabled/after-dismiss/teardown | 기존 dirty 보존; 후속 Tabs 4/Menu 3 + teardown 4 host cases. 제품 소유 Promise rejection 처리·재실행, owner 교체/재열기 무효화 검증; 실제 OS/제품 오류 화면은 미실행 |
| react-native/src/navigation-bar.tsx | label, host accessibility, slot 조립 | 정적 확인; 자체 상태 없음 |
| react-native/src/context-menu-native.tsx | item 검증, disabled onSelect guard, OS adapter | 정적 확인; Zeego 실제 OS long-press 미실행 |
| react-native/src/sheet-gesture.tsx | present/dismiss, back registry, busy, snap validation | O-07; 새 host 1 case. Gorhom 실제 swipe/keyboard 물리 동작 미실행 |
| react-native/src/internal/modal-lifecycle.ts | iOS shown→onDismiss, Android InteractionManager teardown | modal-lifecycle 8 cases; 실제 OS bridge 미실행 |
| design-contracts/src/command-palette.ts | dismiss policy, descriptor, fire-and-forget/after-dismiss 경계 | renderer 소비 대조; 후속 command-palette/popover 순수 계약 2파일 23건 통과 |
| design-contracts/src/popover.ts | open-state validation, policy, hover delay | renderer 소비 대조; 후속 command-palette/popover 순수 계약 2파일 23건 통과 |
| design-contracts/src/sheet.ts | request latch/cycle complete/detents | O-09는 renderer에서 controlled 거부 재무장; contract 소스 변경 없음 |
| design-contracts/src/alert-dialog.ts | confirm catch, error retry, interrupt late result, exactly-once result | Web/Native renderer tests; parent의 action-session 감사와 경계 분리 |
| design-contracts/src/context-menu.ts | keyboard focused anchor, finite pointer, interaction vocabulary | renderer 소유권 대조; contract 변경 없음 |
| design-contracts/src/menubar.ts | enabled navigation wrap, descriptor | renderer 소비 대조; contract 변경 없음 |
| design-contracts/src/sidebar.ts | destination optional, grouping/current id/disabled | O-08 근거; contract 변경 없음 |
| design-contracts/src/splitter.ts | numeric clamp/step, separator orientation | renderer browser 소비 검증 |
| design-contracts/src/bottom-navigation.ts | enabled selected destination, activation/reselect, configuration validation | 기존 dirty 보존; renderer click 대조 |
| design-contracts/src/bottom-navigation-defaults.ts | distribution/presentation default | 정적 확인 |

Native의 빠른 Sheet `false→true` 중 host가 잠시 없는 것은 즉시 결함으로 판정하지 않았다. `modal-lifecycle-fallback.test.tsx:258`은 host teardown 전에는 visible=false, Android interaction 완료 뒤 true로 돌아오고 stale 완료가 보고되지 않음을 검증한다. 이번 source 실행에서 통과했다. 실제 iOS `onDismiss`가 오지 않는 기기 문제까지 증명한 것은 아니다.

## 실행 기록

모든 명령은 해당 패키지 루트에서 파일 경로를 지정했다. 실패는 먼저 신규 시나리오를 추가한 기준 소스에서 관찰했고, 수정 후 같은 파일 및 직접 소비 테스트를 재실행했다. 테스트 fixture의 required label/trigger 누락도 수정했으며 이 fixture 오류를 제품 결함 수에 넣지 않았다.

- Web Chromium 13파일: `command-palette`, `anchored-overlays`, `overlay-stack`, `context-menu.interactions`, `menubar.keyboard`, `popover`, `tooltip`, `splitter`, `tabs.keyboard`, `sidebar`, `dialog-origin`, `popover-origin`, `menu.keyboard` (`*.browser.test.tsx`). 최종 **13파일 73건 통과**.
- Web 별도 직접 소비: `field-dialog-quality.browser.test.tsx`, `alert-dialog.keyboard.browser.test.tsx`; 위 anchored/stack과 합쳐 4파일 23건 통과.
- Web `sidebar.browser.test.tsx`와 `bottom-navigation.browser.test.tsx`의 확대 시나리오 제외 실행: 4건 통과, 1건 제외. 최종 sidebar 수정 후 실행이다.
- Native `gesture-sheet-lifecycle.test.tsx`, `modal-lifecycle-fallback.test.tsx`, `dialog-actions.test.tsx`, `alert-dialog-actions.test.tsx`, `menu-actions.test.tsx`, `tabs-actions.test.tsx`: 6파일 22건 통과.
- 변경 경로 `git diff --check`: 통과. 통합 build/typecheck 및 dist 소비 재검사는 부모 담당이다. 타입 검사만으로 기능 완료를 선언하지 않는다.

미실행: 전체 회귀, 설치/네이티브 빌드, Firefox/WebKit, 실제 OS 접근성 focus bridge·Android back·Gorhom/Zeego 제스처, 제품 서버 요청/라우터 연결, 앞 표에서 별도 기재한 분기. 최대 글자 검증은 범위 제외다. 이것은 모든 가능한 상호작용이 무결함이라는 선언이 아니다.

## 산출물·보존

코드 7파일 및 직접 회귀 테스트 8파일(새 Native 1파일 포함)을 수정했다. 계약 공개 API·스타일·기존 dirty navigation/bottom-navigation은 변경하지 않았다. 재현 실패가 만든 본 작업 screenshot은 실패 사실을 위 표에 보존한 뒤 파일명을 지정해 제거했다. 기존 타 작업 screenshot·테스트·dist는 정리하지 않았다. 커밋·푸시·배포·네이티브 빌드는 실행하지 않았다.


## 후속 단일 후보 검증: VirtualList의 focused row 삭제

부모가 남은 후보 하나를 지정하여 추가했다. `packages/react/src/virtual-list.tsx:21`에서 stable key를 가진 초점 행 자체가 삭제될 때 기존 코드는 body로 초점을 잃었다. 중간 행·마지막 행·빈 목록의 3조건에서 Chromium RED를 확인했다. 직전 keys의 위치로 인접 행을 선택하고 viewport 안에 보이도록 스크롤한다. 모든 행이 없으면 기존 이름 있는 `role=list` host로 복구한다. 이미 외부 버튼으로 이동한 초점은 되찾아오지 않는다. 키 재정렬 유지 수정은 보존했다.

`packages/react/test/data-media-lifecycle.browser.test.tsx`에 삭제 3조건, 외부 초점 보존, 창 밖으로 재정렬한 행의 삭제 5건을 추가했고, 복구 뒤 ArrowUp 탐색도 검증했다. `pnpm exec vitest run --config vitest.browser.config.ts test/data-media-lifecycle.browser.test.tsx test/data-layouts.browser.test.tsx`: **2파일 15건 통과**. 기존 CSS의 list/row `:focus-visible` 계약을 유지했으며 새로운 장식은 추가하지 않았다. source/test scoped diff check 통과. 이 재현이 만든 screenshot 3개만 제거했다. Firefox/WebKit·실제 보조기기는 미실행이다.


## 후속 지정 분기: 드래그 중단·메뉴 변경·닫기 재시도

- `splitter.tsx:126`: 드래그 도중 disabled 전환 또는 `lostpointercapture` 후에도 60→75로 값이 바뀌는 두 실패를 재현했다. pointer id 소유 세션을 한 번만 종료하고 capture를 해제하며, 마지막 렌더 값으로 end callback을 한 번만 전달한다. 종료 후 이동은 무시하고 다시 시작할 수 있다.
- `menubar.tsx:46`: 열린 메뉴 삭제 시 body로 focus가 빠지고 모든 enabled label이 tabindex=-1인 실패, 열린 항목 축소 뒤 활성 항목이 없어 Enter가 무반응인 실패를 재현했다. 유효한 다음 label로 복구하고 사라진 popup을 닫으며 활성 index를 유효 범위로 맞춘다. disabled 전환도 복구하고 외부 focus는 빼앗지 않는다.
- controlled Menu의 거부→재시도→승인 후 trigger focus 복구 테스트를 추가했다. Popover의 동일 시나리오와 함께 통과했고 추가 소스 수정은 필요하지 않았다.
- `pnpm exec vitest run --config vitest.browser.config.ts test/splitter.browser.test.tsx test/menubar.keyboard.browser.test.tsx test/menu.keyboard.browser.test.tsx test/popover.browser.test.tsx`: **4파일 32건 통과**. 실제 Chromium DOM/key/pointer 이벤트 검증이며 OS 물리 입력 장치 검증은 아니다.
- `pnpm exec tsc --noEmit`: 공유작업의 `src/advanced-display.tsx:39` unused `useEffect`(TS6133) 1건으로 실패. 이 파일은 수정하지 않고 통합 담당자에게 전달했다. 담당 source/test의 diff check는 통과. 재현 screenshot 4개를 지정 삭제했다.


## 후속 지정 분기: RTL·long-press·MenuMorph

- `menubar.tsx:117`: RTL에서 ArrowLeft가 시각적 왼쪽의 다음 메뉴 대신 이전 메뉴로 이동했다. enabled 메뉴 3개로 수정 전 재현하고 computed direction에 맞게 좌우를 반전했다. Home/End는 논리적 처음/끝을 유지하며 열린 메뉴 전환까지 검증했다.
- `context-menu.tsx:53,58,171`: 스크롤 이동 후에도 long-press가 열리고, 새 press가 이전 timer를 덮어 취소 후에도 열리며, 활성 마지막 항목이 disabled로 바뀌면 Enter 대상이 사라지는 3개 실패를 재현했다. 10px 이동은 취소로 처리하고 press 교체·종료·unmount에서 timer를 정리하며 enabled index를 유효 범위로 복구했다. pointerup/cancel/move 취소 후 새 press, Escape 후 재열기, unmount timer 0건, disabled 대상 대신 유효 항목 실행을 검증했다.
- `menu-morph.tsx:83`: 열린 상태에서 owner의 `disabled=true` 전환을 item이 소비하지 않아 실행 가능한 실패를 재현했다. item disabled와 action guard에 연결했다. 설치된 실제 bloom-menu를 사용했고 reduced motion/RTL canonical fallback의 keyboard 실행·trigger focus 복귀도 검증했다.
- `pnpm exec vitest run --config vitest.browser.config.ts test/menubar.keyboard.browser.test.tsx test/context-menu-lifecycle.browser.test.tsx test/context-menu.interactions.browser.test.tsx test/adoption.browser.test.tsx`: **Chromium 4파일 23건 통과**. 새 결함 5개는 수정 전 실패→수정 후 성공을 확인했다. touch는 DOM PointerEvent와 fake timer 검증이며 실제 손가락·OS 제스처 검증은 미실행이다. optional engine 추가 설치·build·commit은 하지 않았다. 이 재현에서 만든 screenshot 5개만 제거했다.


## 후속 지정 분기: Tabs 동적 변경·Native Menu teardown·순수 계약

- `react/src/navigation.tsx:317,380,488`: focused 탭 삭제 시 body로 이동하고 disabled 전환 시 비활성 탭에 초점이 남는 두 Chromium 실패를 재현했다. 유효한 선택 탭으로 실제 focus를 복구하며 외부 버튼 focus는 보존한다. 동적 선택 fallback, controlled 거부→승인, RTL 좌우/Home/End도 검증했다.
- `react-native/src/navigation.tsx:529`: disabled 탭의 accessibility activate가 onValueChange를 disabled id→fallback id로 두 번 호출하는 실패를 재현했다. 접근성/press/focus 경로에서 disabled를 차단했다. dynamic fallback·controlled 수락 및 RTL 환경의 접근성 increment와 bridge 호출을 host mock으로 검증했다. 이것은 실제 OS 접근성 focus·물리 키보드 증거가 아니다.
- `react-native/src/navigation.tsx:1639`: 닫기 완료 전에 재열거나 owner를 교체한 뒤 이전 teardown callback이 action을 실행하는 두 실패를 재현했다. 재열기/해제 시 pending action·task를 폐기하고 세대와 현재 visible/mounted 상태를 확인한다. 이전 세대 callback은 새 닫기 대기 중에도 실행하지 않는다. shown iOS의 onDismiss 대기·중복 완료 방지, 제품 콜백 안에서 Promise rejection을 처리한 뒤 재열어 다시 실행하는 흐름도 통과했다. 오류 표시와 catch는 제품 책임이며 메뉴가 임의로 삼키거나 자동 재시도하지 않는다(usage/components/menu.md 보강).
- Web: `pnpm exec vitest run --config vitest.browser.config.ts test/tabs.keyboard.browser.test.tsx test/profile-tabs.browser.test.tsx` **2파일 8건 통과**. Native: `pnpm exec vitest run test/tabs-actions.test.tsx test/menu-dismiss-lifecycle.test.tsx test/menu-actions.test.tsx test/profile-tabs.test.tsx` **4파일 13건 통과**. 기존 직접 소비 `test/native-input-collection-product.test.tsx -t 'sectioned Menu actions'` **1건 통과, 비대상 9건 제외**.
- Contracts: `pnpm exec vitest run test/command-palette.test.ts test/popover.test.ts` **2파일 23건 통과**. descriptor 검증, controlled state 검증, dismissal policy 관련 기존 소스 테스트를 실제 실행했고 추가 결함은 없었다.
- source/test scoped diff check 통과. 재현에서 만든 Tabs screenshot 2개만 제거했다. build/typecheck는 통합 담당자에게 전달했으며 설치·커밋·실제 기기 검증은 수행하지 않았다.


## 공개 API 대조 후 추가 지정: Anchor·Affix·SkipNav·Tour·SidePanel

아래 5개는 catalog 및 renderer export 대조 결과 Web-only이며 Native는 unsupported다. Native 구현을 추가하거나 동일 검증으로 주장하지 않았다.

| 직접 읽은 source | 실행한 행동·결론 | 남은 경계 |
| --- | --- | --- |
| `react/src/anchor.tsx` | 기존 scroll/offset/history/target 삭제·삽입/키보드 6건 + unmount 시 temporary tabindex/예약 observer 정리 1건 통과. 추가 결함 미발견 | 실제 보조기기·다른 브라우저 미실행 |
| `react/src/affix.tsx` | nested scroll/offset/disabled/부모 끝/oversize 기존 2건 + callback 교체·예약 frame 중 unmount 1건 통과. 추가 결함 미발견 | Chromium CSS sticky 범위 |
| `react/src/skip-nav.tsx:36,46` | 임시 tabindex가 blur/unmount 뒤 남고 modified click이 현재 페이지 focus를 빼앗는 두 RED를 확인. 임시 속성 정리·수정키 클릭 우회 적용. 제품 tabindex 유지와 기존 Enter/Tab 포함 5건 통과 | 제품이 나중에 바꾼 tabindex는 덮어쓰지 않음 |
| `react/src/side-panel.tsx:124,152,179` | non-modal의 조합 중 Escape 닫힘과 정상 Escape 후 body focus 유실을 각각 RED 확인. IME guard와 내부 focus 소유 시 trigger/returnFocusRef 복구. 외부 focus 보존·controlled 거부/재시도/완료 포함 7건 통과 | 기존 double-text-size 1건은 사용자 지시로 제외 |
| `react/src/tour.tsx:100,186` | RTL highlight의 215px 좌표 차이와 anchor 재삽입 뒤 highlight 미복구 RED 확인. 물리 DOMRect 좌표 적용·DOM 교체 후 anchor 재해석. 단계 focus/닫기/unmount 및 신규 2건 포함 10건 통과 | 실제 OS 보조기기 미실행 |

Web 패키지에서 `pnpm exec vitest run --config vitest.browser.config.ts test/anchor.browser.test.tsx test/skip-nav.browser.test.tsx test/side-panel.browser.test.tsx test/tour.browser.test.tsx -t '^(?!.*double text size)'`: **4파일 29건 통과, 확대 1건 제외**. `test/web-additions.browser.test.tsx -t '^affix:'`: **3건 통과, 비대상 3건 제외**. source 3개와 직접 테스트 5개를 수정했다. Tour의 기존 inline CSS 속성명 단언은 실제 DOMRect 위치 단언으로 바꿨으며 이것은 제품 결함 수에 포함하지 않았다.

수정 전 결함 6개와 최종 동작을 확인했다. source/test/report scoped diff check 통과. 본 작업 실패 screenshot 6개만 제거했다. 전체 회귀·설치·build·commit은 실행하지 않았으며 통합 build/typecheck는 부모 담당이다.


## 최종 지정 갭: Pagination·Breadcrumb

`react/src/pagination.tsx`와 `breadcrumb.tsx` 본문을 대조했다. Breadcrumb은 자체 상태 없이 계약이 만든 current label과 실제 ancestor href를 렌더한다. 기존 두 Chromium 검사에서 ancestor Tab/Enter 이동과 현재 항목의 비상호작용·href 보존을 확인했다.

Pagination은 이전/다음 경계와 Enter/Space, 빈 결과, 콜백 reason·controlled 거부→수락을 실행했다. 추가로 10페이지에 focus가 있는 상태에서 유효한 결과를 2페이지로 줄이면 body로 초점이 사라지는 RED를 확인했다. `pagination.tsx:38`에서 제거된 내부 focus를 현재 페이지 버튼으로 복구하고, 외부 focus는 보존하며 onPageChange를 임의 호출하지 않는다.

`pnpm exec vitest run --config vitest.browser.config.ts test/pagination.keyboard.browser.test.tsx test/page-navigation.browser.test.tsx -t '^(?!.*320px/2x)'`: **2파일 7건 통과, 확대 2건 제외**. 변경 source/test diff check 통과. 이 재현의 screenshot 1개만 제거했고 통합 build/typecheck는 부모에게 전달했다.


## iOS 개발 앱 후속: Sheet 재열기 접근성 (2026-10-13)

환경: 기존 iPhone 17 Pro / iOS 26.5 시뮬레이터, `dev.hjm.designsystem.showcase`, 기존 Expo Metro 8187. Device Hub 직접 AXUIElement와 창 캡처로 표시를 확인하고 idb의 접근성 좌표로 조작했다. 새 기기·네이티브 빌드·배포는 하지 않았다.

- **재현:** 단계별 드로어를 앱 새 실행에서 열기 → 닫기 → 다시 열기. 첫 열기는 AX 요소 12개, 두 번째는 application 1개만 남았다. Device Hub 화면에는 단계·본문·버튼이 계속 보였다. 입력 시트에서도 같은 재열기 누락을 관찰했다.
- **수정:** `packages/react-native/src/overlays.tsx`의 Sheet에서 접근성 숨김·입력 차단을 별도 일반 View가 담당하고, Animated.View는 표시 애니메이션과 키보드 영역 측정을 담당하게 분리했다. 닫히는 중 접근성 차단은 유지한다. iOS native animation host 재사용 경계에 대한 대응이며, UIKit/RN 내부 원인을 확정한 것은 아니다.
- **대조:** 원래 코드로 되돌리고 앱을 새로 실행했을 때 12→1개 재현. 변경 코드로 새로 실행한 뒤 연속 열기/닫기 3회 모두 12개 유지. Fast Refresh 결과만으로 판정하지 않았다.
- **추가 동작:** 입력 시트의 실패 후 `Audit draft` 초안 유지·재시도 성공·재열기 보존. 실제 소프트웨어 한국어 자판의 ㅎ→ㅏ→ㄴ 조합 후 키보드 위 저장을 눌러 `Audit draft한` 저장 확인. 키보드가 열렸을 때 저장 버튼 y=482..526, 키보드 상단 y=539로 분리됨. 단계별 드로어의 2단계 닫기/재열기, 마지막 단계 실패 후 단계 유지, 재시도 성공, 성공 후 새로 열 때 1단계 초기화 확인.
- **자동 검사:** Native 패키지에서 `pnpm exec vitest run test/modal-lifecycle-fallback.test.tsx test/sheet-viewport.test.tsx --maxWorkers=1`: 2파일 23건 통과. 이 mock 검사는 실제 AX 누락 재현을 대신하지 않으며 위 시뮬레이터 대조가 회귀 근거다.
- **남음:** VoiceOver 음성·탐색 순서, Android/TalkBack, Dialog/AlertDialog의 같은 재사용 경계, GestureSheet swipe/back, OS 카메라/파일 선택, 물리 기기. 예제 저장은 로컬 모의 응답이며 제품 API 저장 검증이 아니다.


추가 마감: Native `tsc -p tsconfig.build.json`, `tsc -p tsconfig.json --noEmit`, `git diff --check` 통과. 생성 dist도 갱신했다. 별도 GestureSheet 예제에서는 handle 아래로 drag → 닫힘, 다시 열기 → 입력, 소프트웨어 키보드 표시 시 제목 y=106·입력 y=139·닫기 y=228로 이동, 닫기 → Home → 앱 복귀 후 닫힘 상태를 확인했다. Android `adb devices -l`에는 연결 대상이 없어 실제 Android/back/TalkBack 검수는 아직 수행할 수 없다.

UI/UX 후속 기준: [WAI APG modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)의 내부 탐색·명시적 닫기·호출 위치 복귀를 Web 확인 기준으로 대조하고, [Apple Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)의 저장/닫기 행동 구분을 Native 사용 흐름 검토에 참고한다. 이 자료를 Native 접근성 인증 근거로 사용하지 않는다. 현재 결함은 보이는 화면과 실제 접근성 요소가 일치하는지 직접 확인해야 한다는 사례이며, 이후 Dialog/AlertDialog와 VoiceOver 순서 검수에 이어간다.


## iOS 후속: Dialog·AlertDialog 재열기와 실행 예제

Sheet와 같은 방식으로 Dialog/AlertDialog도 앱 새 실행 후 닫기→재열기를 대조했다. 수정 전 Dialog의 AX 요소는 첫 열기 6개→두 번째 application 1개, AlertDialog는 5개→1개였고 화면은 계속 그려졌다. `overlays.tsx`의 비애니메이션 `ModalInteractionBoundary`를 세 모달에서 공유해 접근성 숨김과 입력 차단을 담당하게 했다. 수정 후 새 실행에서 Dialog는 3회 모두 6개, AlertDialog는 유효한 2회 모두 5개였다. AlertDialog의 세 번째 반복은 화면 이동과 겹쳐 근거에서 제외했다.

Native build 통과. `pnpm exec vitest run test/modal-lifecycle-fallback.test.tsx test/dialog-actions.test.tsx test/alert-dialog-actions.test.tsx test/sheet-viewport.test.tsx -t '^(?!.*large text)' --maxWorkers=1`: **4파일 31건 통과, 기존 확대 전용 1건 제외**. Sheet viewport 공용 fixture의 기본 textScale을 1로 분리해 일반 키보드·수명 검사에 확대 조건이 섞이지 않도록 했다. 이전 23/32건 실행 기록은 당시 결과이며 향후 확대 전용 조건은 제외한다.

Dialog/AlertDialog 예제는 실제 이름 편집·초안 유지·취소·trim 저장 및 이름 있는 삭제/취소/재체험 흐름으로 양 Showcase를 보강했다. Web 2건·Native host 2건과 양 Showcase typecheck 통과. 구현·명령은 `logic-inputs.md` 후속 절 참조. 이는 로컬 예제이며 실제 서버 저장 증거가 아니다.

공유 시뮬레이터가 다른 런타임 정리 중 종료되어 Dialog 실제 키보드·VoiceOver 검수는 완료하지 못했다. 기존 iOS 26.5 기기·앱 데이터는 보존하고 Web 호환성 검수를 계속했다. Android는 연결 대상 없음.

## WebKit·Firefox 후속: 모달·입력·복구

`HJM_TEST_BROWSER=webkit|firefox`로 명시한 표적 검사만 해당 엔진에서 실행하도록 browser config를 확장했다. 기본 Chromium·단일 파일 순차 실행은 유지한다. 기존 Playwright 의존성으로 WebKit/Firefox 바이너리만 설치했으며 lockfile·제품 의존성은 바꾸지 않았다.

WebKit 첫 AlertDialog 실패는 일반 HTML 버튼 두 개와 input만 있는 별도 페이지에서도 재현한 기본 키보드 설정 차이였다. macOS WebKit의 Tab은 다음 input으로, Option+Tab은 다음 button으로 이동했다. [Apple Safari 키보드 안내](https://support.apple.com/guide/safari/cpsh003/mac)에 맞춰 버튼 순서 테스트 전용 `tabThroughControls` helper를 추가했고 정방향 wrap과 역방향 wrap을 확인했다. production Tab 동작은 바꾸지 않았다.

추가 outside-click 실패는 WebKit이 클릭한 button에 초점을 주지 않는 조건이었다. 외부 controlled 열기 버튼을 쓰는 fixture에 공개 `returnFocusRef`를 연결해 실제 호출 위치 복귀를 검증했고, Dialog/Sheet/AlertDialog 기본 사용 지침에도 연결 방법과 이유를 추가했다. DatePicker는 클릭하면 모든 엔진에서 초점을 받는 input으로 outside target을 바꿔, 닫힐 때 그 초점을 빼앗지 않는지를 검사한다. 브라우저 차이를 제품 결함 수로 세지 않는다.

WebKit 명시적 10파일(`field-dialog-quality`, `dialog-origin`, `alert-dialog.keyboard`, `dialog-showcase`, `modal-outside-focus`, `overlay-stack`, `input-logic`, `date-picker-lifecycle`, `screen-recovery`, `load-more-lifecycle`) 첫 실행 41/44 통과 후, 조건을 바로잡은 `date-picker-lifecycle`·`modal-outside-focus` 2파일 12/12 통과. 따라서 해당 44개 행동의 최종 결과는 통과이며 중복 실행 수는 합산하지 않는다. Firefox 최초 모달·예제 4파일 10건 통과; 확장 검사는 아래에 이어 기록한다. 실제 Safari 앱·OS 키보드/보조기기 검증을 대신하지 않는다.

Firefox 확장 6파일(`date-picker-lifecycle`, `modal-outside-focus`, `overlay-stack`, `input-logic`, `screen-recovery`, `load-more-lifecycle`) **34건 통과**. 위 최초 10건과 서로 다른 44건이다. 수정한 keyboard/outside fixture의 Chromium 3파일(`alert-dialog.keyboard`, `modal-outside-focus`, `date-picker-lifecycle`) **14건 통과**. 선택/동의/색상 별도 5파일은 엔진별 26건 통과(`logic-inputs.md`).

추가 WebKit `auth-screen-pending`·`collection-rail`·`composition-recovery` 3파일 **11건 통과**. 인증 대기 레이아웃/초점 복귀, 목록 스크롤/행 삭제 초점, 실제 예제의 초안·단계 실패/재시도 흐름이며 최대 글자 조건은 포함하지 않았다. 예제 테스트의 전체 catalog import로 드러난 NodeNext/unused 타입 경계는 양 플랫폼의 작은 `dialog-examples` 실행 모듈로 추출해 해결했다. gallery와 테스트가 같은 구현을 소비하며 renderer 타입 검사를 완화하거나 제외하지 않았다. 양 renderer `tsc --noEmit`·Web 2건/Native 2건 통과.

iOS 기존 기기를 재부팅하고 HJM 앱 실행까지 확인했지만 전면 앱이 Spint 개발 런처로 바뀌었다. 중복 조작을 피하기 위해 입력 조작을 중단하고 공유 세션에 상태를 전달했다. 기기·앱 데이터·공유 서버는 종료하거나 삭제하지 않았다.

동일 인증/목록/구성 3파일의 Firefox **11건 통과**. 이 후속의 서로 다른 실행 범위는 엔진마다 81건(44+26+11)이며 엔진별 재실행은 중복 합산하지 않는다. 본 작업 실패 screenshot 4개를 근거 기록 후 제거했고 `git diff --check` 통과.

예제 추출 최종 통합: react·react-native·showcase/web·showcase/native 각각 자체 디렉터리/compiler의 `tsc --noEmit` 통과. 테스트 제외·타입 오류 억제 없이 경계를 정리했다.


## iOS 실제 키보드: Dialog 저장 버튼 가림 수정

기존 iPhone 17 Pro/iOS 26.5의 HJM 개발 앱을 `hjm-showcase://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8187`로 명시해 재개했다. 앞선 전면 Spint 전환의 주체/원인은 확인되지 않았으며 다른 세션은 공유 기기를 조작하지 않았다고 기록했다. 그 관측을 다른 세션의 조작으로 확정하지 않는다.

첫 실제 실행에서 Native 예제 추출 import `./dialog-examples.js`를 Metro가 찾지 못했다. Native Showcase 관례대로 확장자 없는 경로로 바꾼 뒤 compile overlay가 사라지고 기존 메모 예제가 정상 렌더됨을 Device Hub AX·창 캡처로 확인했다. Showcase 자체 typecheck도 통과. 타입 검사만으로 Metro 해석까지 증명되지 않은 사례다.

- **실제 RED:** 메모 편집을 열고 한국어 소프트웨어 키보드를 표시하면 저장 버튼 y=504..548, 키보드 상단 y=539로 9pt가 가려졌다. 제목·입력 자체는 보였지만 전체 저장 터치 영역이 확보되지 않았다.
- **수정:** `react-native/src/overlays.tsx`에 Sheet의 keyboard metrics/listener·modal 실측 높이·docked 판별을 공통 hook으로 추출했다. Dialog와 AlertDialog는 기본으로 키보드 위 사용 영역에 중앙 배치하고, Sheet의 opt-in은 유지한다. Android adjustResize 중복 여백과 floating keyboard 제외를 보존한다. 공개 prop/optional peer 추가 없음.
- **자동 대조:** 새 `dialog-keyboard.test.tsx` 4건 RED→GREEN. `pnpm exec vitest run test/dialog-keyboard.test.tsx test/sheet-viewport.test.tsx test/modal-lifecycle-fallback.test.tsx test/dialog-actions.test.tsx test/alert-dialog-actions.test.tsx -t '^(?!.*(?:large text|200%))' --maxWorkers=1`: **5파일 33건 통과, 기존 확대 3건 제외**. 이전 필터의 `large text`만으로는 `200%` 제목 2건을 제외하지 못했음을 발견해 향후 필터에 함께 반영했다. Android는 host mock이며 실제 OS 근거가 아니다.
- **새 실행 GREEN:** native TypeScript build 후 앱을 새로 실행했다. 같은 키보드 상단 y=539에서 저장 y=353.7..397.7, 실패 문구가 추가된 상태에서도 y=381.7..425.7로 모두 위에 놓였다. 실제 한국어 자판 ㅎ→ㅏ→ㄴ으로 `다음 여행에서 하고 싶은 일한`을 입력했고, 실패 후 본문 보존→재시도→결과 표시를 확인했다. 이후 연속 재열기 3회 모두 6개 AX 요소 유지.
- **VoiceOver 경계:** Device Hub 메뉴에서 실제 VoiceOver 활성화, OS 첫 안내 닫기, Dialog 제목에 첫 focus outline 표시를 확인했다. idb swipe는 기대한 VoiceOver 다음 항목 이동이 아니라 outside 닫기로 이어져 탐색 순서 증거에서 제외했다. Device Hub 키보드 전달을 켜고 Apple이 안내한 Control+Option+Right를 보냈지만 다음 focus 이동을 확인하지 못했다. 음성 출력·전체 탐색·복귀는 미검증이다. VoiceOver와 Keyboard Capture는 각각 원래 off로 복원하고 메뉴 mark 없음으로 확인했다.

Native build/typecheck 및 Web FilePicker build/typecheck 통과. FilePicker 기존/신규 관련 파일도 각 renderer에서 2파일 4건 통과했고 FP-01~04 상세는 `logic-inputs.md`에 있다. 실제 OS 파일 선택/권한을 이 검사로 대체하지 않는다.


## Adaptive·ContextToolbar·SelectionMotion 실제 구성 후속

양 플랫폼 `reference-adoption-previews.tsx`의 세 함수와 공개 컴포넌트 소비를 대조했다. 새 `adaptive-selection-showcase` 검사에서 Adaptive의 빠른 패널 전환·reducedMotion 전환 중 메모 입력 인스턴스/값, ContextToolbar의 단일 선택·닫기/재열기 초안, SelectionMotion 두 선택기의 양방향 동기화를 실행했다. 예제 함수에 우회 코드는 추가하지 않았다.

- **RED → 수정:** WebKit 실제 pointer로 ContextToolbar를 닫으면 내부 라디오 대신 disclosure wrapper에 초점이 남아 Enter로 재열 수 없었다. `react/src/collapsible.tsx`의 유효한 닫기 클릭만 `event.currentTarget.focus()` 후 상태를 바꾸도록 수정했다. 열기·외부 controlled close·disabled·inline 규칙은 유지했다. 사용 지침과 기존 changeset도 갱신했다.
- **GREEN:** 부모 Web build로 갱신된 공개 dist를 실제 예제가 소비한 뒤 Chromium/WebKit/Firefox에서 각각 새 Web 3건 통과. 직접 source를 소비하는 기존 `collapsible.keyboard.browser.test.tsx` Chromium 4건도 통과해 keepMounted 양쪽·외부 controlled close 복귀·외부 초점 보존·disabled를 대조했다. Native 새 host 검사 3건 통과.
- **검사 경계:** Safari는 pointer로 radio를 선택해도 focus하지 않으므로 pointer 선택 결과를 확인한 후 키보드 단계의 선택 radio에 명시적으로 focus했다. 결함 재현의 닫기 trigger에는 사전 focus를 하지 않았다. Native는 Animated 진행을 유지하는 host mock에서 중단/입력 유지를 확인한 것으로 실제 OS 키보드·초점·렌더링을 증명하지 않는다. 최대 글자 조건은 제외했고 본 작업 실패 PNG 3개를 정리했다.
