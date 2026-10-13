# 화면·실행 세션 기능 검수

2026-10-13 · 공유 working copy · `진행` 후 행동 검수

## 소스 검토와 수정

공통 `action-session.ts`, `screen-patterns.ts`, Web/Native `screens.tsx`, `screen-flows.tsx`, `saved-items.tsx`, 입력 시트·단계별 드로어와 공통 데모 요청 어댑터를 확인했다. 화면 상태 교체, 저장 진행, 목록/상세 유지, 검색 취소, 권한 행동 선택, 댓글·저장 항목 소유권을 따라갔다. 아래 실행 항목 외 모든 분기를 실행했다는 뜻은 아니다.

| 발견 | 재현·수정 | 실행 근거 |
| --- | --- | --- |
| 완료 알림 중 세션의 엔티티가 바뀌어도 이전 `run`이 success/error를 반환 | terminal publish 뒤에도 세대를 확인해 ignored 반환. 새 편집 대상에 이전 저장 후속 처리가 전달되는 것을 막음 | 성공·실패 구독자 reset 2건 수정 전 실패, 수정 후 통과 |
| `scroll="content"` 목록의 원래 포커스 항목을 상세 방문 중 삭제하거나 비활성화하면 복귀 포커스가 body로 사라짐 | 유지하는 목록 host에 프로그램 포커스 지점 추가; 기존 항목·스크롤 본문 우선 복귀는 유지 | 원래 항목 삭제/비활성화 + 상세 닫기 Chromium 회귀 수정 전 실패, 수정 후 통과 |

`useDemoAction`의 언마운트 자동 reset은 추가하지 않았다. 공개 ActionSession 계약은 화면보다 오래 살 수 있는 작업 소유자가 reset 여부를 결정한다. 데모는 실제 서버·영속 저장소를 연결하지 않는다.

## 실제 실행

- 공통 계약: `vitest run test/screen-patterns.test.ts test/action-session.test.ts` — 22건 통과.
- Web: `vitest run --config vitest.browser.config.ts test/screen-recovery.browser.test.tsx test/screen-flows.browser.test.tsx test/composer-host.browser.test.tsx -t '^(?!.*narrow width).*$'` — 33건 통과, 확대 레이아웃 1건 선택 제외.
- Native host: `vitest run test/screen-recovery.test.tsx test/composer-host.test.tsx` — 6건 통과.
- 실제 공개 패키지를 사용하는 구성 예제: Web `composition-recovery.browser.test.tsx` 2건, Native `composition-recovery.test.tsx` 2건 통과. 시트 실패 시 초안 유지, pending 중 닫힘 차단, 실패 후 닫기·재열기·재시도, 드로어 단계 보존, 성공 후 단계 초기화를 확인했다. 이 테스트는 로컬 dist를 소비하므로 source build 이후에도 실행한다.

Web 검색 지연 호출·이전 signal 취소, 한글 Enter 구분, 검색 확정/입력 단계 분리, 필터 적용·취소와 초안, 빈 결과 복구·정렬, 수정 취소 확인, 댓글·상세 복구 등을 포함한다. 기존 브라우저 테스트에는 act 경고가 있었고 실패는 없었다. Native 시트는 이전 dismiss 완료 전 빠른 재열기를 잠시 유예하도록 설계되어 있으며, 내용이 그 순간 없다는 이유로 결함으로 판정하지 않았다. 오버레이 담당이 기존 lifecycle 회귀로 종료 신호 이후 재열기를 확인했다.

## 미실행·경계

Chromium은 실제 브라우저 DOM 상호작용이고 Native는 mock host/React renderer 검사다. iOS/Android 기기, OS 권한·카메라·파일 선택, 실제 API 저장·취소·멱등성, 스크린리더, Safari/WebKit, 전체 회귀는 미실행이다. 최대 글자 조건은 범위에서 제외했다. 화면의 라우팅·저장·권한·재시도 안전성은 제품 어댑터 소유이며 이번 결과가 소비 앱의 종단간 검증을 대신하지 않는다.

## 추가 수정 — 취소·다중 포인터

사용자의 계속 수정 요청으로 남은 이벤트 경합을 확인했다.

- Native PhotoSourceSheet: 시트 닫기를 제품이 지연한 뒤 사용자가 취소해도 이전 카메라 선택이 실행되는 경로와, 닫힘 전에 cameraAvailable=false로 바뀌어도 카메라 callback이 실행되는 경로를 모두 실패로 재현했다. 실제 취소는 대기 선택을 비우고 완료 시 현재 카메라 가용성을 확인한다. 정상 카메라·앨범 선택은 닫힘 완료 뒤 한 번만 실행되는 검사를 포함해 `photo-source-recovery.test.tsx` 4건 통과.
- Web ChatMessage: 다른 pointer의 release가 답장을 실행하고, 다른 pointer의 cancel이 진행 중인 원래 제스처를 지우는 두 경로를 실패로 재현했다. 시작 pointerId만 move/up/cancel/leave를 처리하고, 진행 중 추가 pointerdown은 시작점을 바꾸지 않는다. `message-gesture.browser.test.tsx` 2건 통과. 실제 멀티터치 기기는 실행하지 않았고 Chromium PointerEvent 입력으로 검증했다.

## 코드 범위 확정 후 보강

- `resolveSearchEmptyCause`가 loading/nonempty 분기에서 count 검증을 건너뛰어 양수 소수·Infinity 및 잘못된 필터 수를 통과시키는 테스트 실패를 확인했다. 상태 분기 전에 기존 nonnegative safe-integer 계약을 검증하도록 옮겼다. 공통 계약 `screen-patterns.test.ts` 12건 통과.
- Web AuthScreenLayout은 pending 동안 inert 처리로 body로 사라진 키보드 초점을 종료 뒤 원래 인증 버튼으로 돌려준다. 사용자가 footer 등 다른 곳으로 이동한 초점은 가져오지 않는다. 기존 카드 크기/중앙 로딩 동작은 유지한다. 새 포커스 복귀 테스트는 수정 전 실패로 확인했다. `auth-screen-pending.browser.test.tsx` 3건 통과(기존 카드 유지 1건, 초점 복귀/외부 초점 보존 2건).

최종 검색 소비 경로 확인: Chromium `auth-screen-pending.browser.test.tsx`와 `screen-flows.browser.test.tsx`에 `authentication|pending|search|query|filters|filter|results|draft|commit` 패턴을 적용해 17건 통과, 무관한 12건 제외. 기존 screen-flows fixture의 act 경고는 있었으며 assertion 실패는 없었다.

## 남은 비동기 구성 검수

- LoadMore: Native에서 A 진행 중 B viewport 요청이 차단되면 B를 이미 요청한 것으로 기록해 이후 B를 영구 차단했다. 실패한 A도 같은 이유로 재시도하지 못했다. 성공한 viewport 요청만 완료 cursor로 기록하도록 수정했다. Web/Native unmount 뒤 늦은 success/error callback과 Web disconnect 뒤 queued observer callback도 실패로 재현해 차단했다. 제품 query 자체는 취소하지 않는다.
- InlineConfirm: 확인 화면이 새 prompt/action으로 바뀌어도 이전 callback을 실행하는 오류를 양쪽에서 RED로 확인했다. 실제 확인 시 현재 callback을 사용하여 표시된 대상과 실행 대상을 맞춘다.
- 실행: Web `load-more-lifecycle.browser.test.tsx` + `load-more.interactions.browser.test.tsx` 6건, Native `load-more-lifecycle.test.tsx` + `load-more.interactions.test.tsx` 기존 6건 통과; 이후 queued FlatList callback 1건도 추가해 5-case lifecycle 파일 재실행 통과. `compound-controls.browser.test.tsx` 4건, Native `compound-controls.test.tsx` 6건 통과. Native는 mock host, viewport late callback은 제어한 observer 이벤트이며 실제 네트워크/OS FlatList 검증이 아니다.

### 공개 행동 API 대조의 추가 실행

- ActivityChip, TaskList, DocumentResource, CollectionRail, FieldGroup 양 renderer의 실제 책임을 읽고 이름별 테스트를 실행했다. static 표시를 별도 행동으로 부풀리지 않았다. Web 문서 retry 초점·save gate, FieldGroup 잠금·제거·재삽입 callback, TaskList 독립행동, rail 실제스크롤 및 Native host 대응을 확인했다.
- Web `activity-chip`, `task-list`, `document-resource`, `field-group` 관련 browser 파일은 확대 조건 2건 제외하고 13건 통과. CollectionRail은 기존 5건과 새 카드삭제 회귀 1건을 합해 최종 6건 통과했다. 새 회귀에서 카드 안 초점이 제거 뒤 body로 유실되는 RED를 확인하고 이름 있는 list viewport로 복구했다. 생존 입력·외부 컨트롤 초점은 유지한다.
- Native 위 5개 파일 및 LoadMore lifecycle 파일 6개 19건 통과(LoadMore 5건 포함). 이 테스트가 Native 실제 scroll/접근성 브리지 실행을 의미하지 않는다.
- `stable-core`에서 AuthProviderButton/FloatingActionButton/Chip/Link 관련 이름만 선택: Chromium 4건/18제외, Native 5건/17제외 통과. 기본 행동의 직접 실행 근거이며 모든 base-button 상태 조합을 의미하지 않는다.
- LoadMore Web `contract-alignment` 지정 검사 2건/18제외 통과(StrictMode controller 포함).


## 실제 파일 흐름·문서 상태 배치 후속 (2026-10-13)

기존 iPhone 17 Pro/iOS 26.5, Metro 8187의 HJM 개발 앱에서 `배포/구성/정보 표시/문서와 파일/기본`을 실행했다. 설치 앱의 공유 host 가용성 안내는 false였고 현재 Podfile.lock에도 ExpoSharing이 없다. 설치된 Expo 패키지의 native module 이름(FileSystem/ExpoSharing)과 host guard는 일치했다. 이 환경에서 OS 공유창·취소를 실행했다고 보고하지 않는다. 다른 기기 부팅·native rebuild·설치는 하지 않았다. 기본 Native FilePicker 예제 역시 Promise fixture를 반환하며 실제 OS 파일 선택 adapter가 아님을 확인했다.

### 확인하고 수정한 내용

- Native 예제가 공유 host 부재를 전체 `disabled`에 연결해 AX에서 본문 보기와 내보내기 모두 enabled=false였다. `saveDisabled`에만 연결한 후 본문 보기 enabled=true / 내보내기 false를 실제 앱에서 확인했다. 본문 펼치기→접기, 미리보기 오류→재시도→내용 복구를 실행했다.
- 양 Showcase는 본문이 펼쳐져도 버튼이 계속 ‘본문 보기’였고 다른 문서로 바꿔도 이전 loading/error를 유지했다. 현재 펼침 상태에 맞는 보기/접기 문구와 문서 교체 시 ready 초기화를 반영했다. Native 로딩→다른 문서 전환 후 새 파일명·본문 보기 복구 및 Web 동일 전환을 확인했다.
- 양 renderer `internal/document-resource.tsx`에서 preview와 export를 각각 Stack 영역으로 묶고 상태 문구를 중앙 정렬했다. 파일 metadata/실제 본문 정렬과 버튼 순서·저장 버튼 identity·재시도 제거 후 focus 복구는 유지한다. 실제 Web 오류 textAlign=start→center, 부모 justifyContent=center를 확인했다. iOS 창 캡처에서 오류와 로딩 중앙 배치를 확인했다. Web 390×844, 기본 글자 light의 loading/none/error와 dark의 error를 확인했고 scrollWidth=390으로 가로 넘침이 없었다. Native dark와 음성 낭독은 이 후속에서 미실행이다.

### 실제 웹 파일과 표적 검사

- 로컬 Web Storybook 6006의 실제 예제에서 첫 synthetic failure→retry를 실행해 브라우저 다운로드 `문서-예제-1.txt`를 얻었다. 다운로드 파일 본문이 `HJM 문서 예제\n개인 자료가 없는 자체 생성 텍스트입니다.\n`과 일치했다. UI는 ‘내보내기를 시작했습니다’를 표시했고 저장 완료로 바꾸지 않았다. 이것은 실제 로컬 브라우저 다운로드 근거이며 Native OS 공유·실제 제품 서버·사용자의 저장 위치 선택 검증이 아니다.
- `react/test/document-resource.browser.test.tsx` Chromium **5 PASS / 최대 글자 1 제외**. `react-native/test/document-resource.test.tsx` **3 PASS**. 저장 버튼 유지, 독립 preview/save 잠금 및 웹 retry focus 복구를 포함한다.
- WebKit/Firefox에서 `file-picker-lifecycle.browser.test.tsx`, `file-picker.keyboard.browser.test.tsx`, `document-resource.browser.test.tsx`를 지정해 각각 **9 PASS / 최대 글자 1 제외**. 처음 WebKit의 버튼 Tab 실패는 이미 대조했던 macOS 기본 설정 차이여서 기존 `tabThroughControls` helper를 FilePicker fixture에도 연결했다. 제품 focus 로직은 바꾸지 않았다. 해당 키보드 fixture Chromium **1 PASS**. native FilePicker의 실제 OS 선택·권한은 계속 미확인이다.
- 양 renderer TypeScript build + typecheck, 양 Showcase typecheck 통과. 이번 browser console의 오류 1개는 favicon.ico 404이며 runtime 예외가 아니다. 관련 diff check 통과.

본 후속의 공유 앱·기기·Metro는 보존한다. 이번에 별도로 띄운 Web Storybook과 내려받은 자체 TXT·화면 캡처·실패 PNG는 결과 기록 후 정리한다. 기존 다른 세션 산출물은 제거하지 않는다. 커밋·push·게시·소비 앱 적용은 미실행이다.


## 화면 상태·확인 세션·키보드 문맥 후속 (2026-10-13)

이 후속은 ScreenLayout/SettingsScreen/NotificationInboxScreen과 EditorScreen/ModerationScreen/PermissionScreen의 남은 상태 전환을 지정했다. 기존 다른 dirty 작업을 보존했으며 새 브랜치·설치·기기 조작·전체 회귀는 없었다.

### 수정한 제품 동작

| 대상 | 수정 전 재현 | 최종 동작 |
| --- | --- | --- |
| EditorScreen, Web/Native | 본문이 loading/error/restricted/empty인데 header/footer 저장이 활성화 | ready에서만 저장 허용. 제품 submit.disabled/pending은 계속 우선. 이탈이 잠기지 않은 닫기 행동은 유지 |
| EditorScreen, Web/Native | dirty 확인창을 연 뒤 외부 저장이 pending으로 바뀌어도 ‘버리기’로 이탈 가능 | submit.pending 또는 cancel.disabled/pending이 되면 확인 세션 종료. 잠금 해제 후 자동 재열기 없음. ready 본문·초안 노드는 유지 |
| ModerationScreen, Web/Native | 열린 차단 확인 중 block을 제거한 뒤 다시 공급하면 이전 confirm=true가 부활 | 행동 제거 시 확인 세션 초기화. 다시 누르기 전에는 열리지 않고 mutation도 호출되지 않음 |
| ScreenLayout, Web | focused retry→loading/ready, focused input→restricted에서 document.body로 초점 유실 | 현재 본문에서 제거된 요소의 초점만 본문으로 복구. content 스크롤은 복구용 tabIndex=-1로 일반 Tab순서 유지 |

Editor/Moderation 새 회귀는 수정 전 양 renderer 각각 **3 FAIL / 권한 경로 1 PASS**였다. Editor 잠금 wrapper 작성 중 비동기 cancel 반환을 잃는 회귀도 별도 RED로 발견해 `return cancel.onAction()`을 유지하도록 고쳤다. 기존 결함 수에 이 중간 구현 회귀를 더하지 않는다. 최종 Web에서 폐기 실패→AlertDialog 유지·오류→같은 초안으로 재시도 성공, Native에서 host Promise가 confirmation에 그대로 전달됨을 확인했다.

ScreenLayout 첫 focus 복구 구현을 재검토해 의도적인 input.blur 및 바깥 비포커스 영역 클릭 뒤에도 초점을 다시 가져오는 **추가 2 RED**를 확인했다. 연결된 입력이 의도적으로 blur된 경우 소유권을 해제하도록 보강했다. DOM 제거 때문에 초점을 잃은 경우만 복구하며 외부 버튼·body의 의도적 초점은 보존한다.

### 결함 없이 확인한 경로와 검증 경계

- 알림함은 loading/error/empty 중에도 filter와 notice를 본문 밖에 유지한다. 필터 identity·focus·행동, notice 추가/제거, 상태 action을 실행했다. 390×650 기본 글자 light의 실제 header+notice+footer를 제외한 본문에서 상태 묶음의 가로·세로 중심 차이가 3px 미만이었다(Chromium/WebKit/Firefox). wrapper는 콘텐츠 높이+대칭 padding이며 margin-block:auto로 중앙 배치하는 기존 CSS를 그대로 사용한다.
- 설정은 실패 notice 추가, 섹션 key 재정렬에도 입력 node·미저장 값·selection·focus를 유지했다. notice 추가 때 scrollTop=150 유지. Native는 host state/identity와 스크롤 소유 props를 검증했고 실제 Yoga/OS 스크롤로 확대하지 않는다.
- 권한은 prompt→request, denied→settings, granted→continue, unavailable→skip 경로를 양쪽에서 실행했다. 렌더 자체는 요청하지 않으며 해당 visible action만 callback을 호출했다. 실제 OS 권한 요청·설정 앱 복귀 검증은 아니다.

### 실행 결과

- 새 `screen-action-lifecycle.browser.test.tsx` 최종 **5 PASS**, `screen-shell-lifecycle.browser.test.tsx` **7 PASS**: Chromium 통합 2파일 12건. WebKit·Firefox 각각 action 5건/shell 7건 통과. 재실행 횟수는 합산하지 않는다.
- Native `screen-action-lifecycle.test.tsx` + `screen-shell-lifecycle.test.tsx`: **2파일 8 PASS**. 모두 기본 배율의 새 fixture다. 기존 Native screen-flows 파일의 공용 fixture가 textScale=2라 그 파일은 실행하지 않았다.
- 기존 Web `screen-flows.browser.test.tsx`에서 dirty discard와 denied permission 제목만 선택해 **2 PASS / 24 제외**. 기존 fixture의 act 경고는 있었으며 새 파일에서는 재현하지 않았다. 기존 `screens.browser.test.tsx`의 ScreenLayout/Inbox 지정 2건도 통과했고 content 모드 기대값을 무tabindex가 아닌 tabIndex=-1로 정합화했다.
- 양 renderer `tsc -p tsconfig.build.json` + `tsc --noEmit` 최종 통과. 이 후속은 공개 prop/type을 추가하지 않아 이전 Showcase 검사는 반복하지 않았다. source·해당 지침·changeset의 diff check 통과.

Web/native 동작·사용 지침·기존 changeset에 함께 반영했다. 자체 test 작성 임시 스크립트와 본 후속 실패 PNG만 기록 후 제거하고 회귀 source는 보존한다. Native 실제 기기·OS 화면·스크린리더·제품 API·릴리스·게시 검증은 계속 남는다.


## 미디어 선택 초점·알림 설정 저장 후속 (2026-10-13)

### MediaSelectionScreen Web

- 첫 실행 `media-selection-lifecycle.browser.test.tsx` 4건 중 삭제·경계 이동 **2 FAIL**을 확인했다. 삭제 후 본문으로 떨어지는 초점, 순서 이동으로 disabled된 버튼의 초점을 인접 사진 제거/같은 사진의 사용 가능한 이동 행동으로 이어준다. 마지막 제거는 활성 추가 버튼, 추가 잠금이면 본문이다.
- 외부 재정렬 후 최신 위치와 지연 반영, 제품이 삭제를 거부한 동안 유지, 명시적 blur·외부 focus, 미리보기 DOM/입력값 identity와 custom library 소유권을 검증했다. 복구는 제품이 실제 items를 갱신한 후에만 한다.
- 보완 중 추가 **2 FAIL**: 마지막 삭제와 `state=empty`가 동시에 반영되면 grid ref가 사라지는 분기, 다음 줄로 이동한 focused 버튼이 실제 본문 밖에 가려지는 분기. 빈 상태에도 추가로 복구하고, 이동된 행동은 소유 본문에서 최소 스크롤로 드러내도록 수정했다. 이 추가 2건은 초기 수정 검토에서 찾은 누락이며 별도 원래 결함 수로 부풀리지 않는다. Firefox의 소수점 레이아웃과 정수 scrollTop 사이 0.25px 잔여 가림도 최소 이동량을 위/아래로 반올림해 보정했다.
- 최종 Chromium **7 PASS**, WebKit·Firefox는 새 media 7건과 notification 2건을 함께 지정해 각각 **9 PASS**. `react-native/test/media-selection-lifecycle.test.tsx` **2 PASS**는 keyed preview identity·현재 id callback·경계 disabled·완료/라이브러리 제품 소유를 확인한 host 실행이며 Native OS 초점 복구를 구현/검증한 것이 아니다.

### 알림 설정 예제 Web/Native

- 기존 boolean saved만으로는 원래 값으로 되돌려도 저장이 필요하고 비동기 제출/실패/재시도 경로가 없었다. 양 Showcase가 기존 공개 `createActionSession`을 주입하는 shared helper를 사용하도록 바꿨다. 초기 메모리 값, 편집 초안, 마지막 저장값, 제출 시점 복사값을 분리한다.
- 값이 같으면 저장하지 않고, pending 중 중복 제출은 동기 잠금으로 차단한다. pending 중 스위치 변경은 보존하고 이전 제출만 확정한다. 실패하면 초안을 유지하며 같은 하단 행동으로 현재 초안을 재제출한다. 실제 권한·푸시·제품 계정을 변경하지 않는 메모리 예제임을 표시한다.
- 최초 Web **2 FAIL**, Native **2 FAIL** 이후 `notification-settings-showcase.browser.test.tsx` Chromium **2 PASS**, Native `notification-settings-showcase.test.tsx` **2 PASS**. WebKit·Firefox에서도 위 2건 통과. 양 Showcase `typecheck` 통과. renderer 테스트가 Story를 직접 읽으면서 NodeNext가 요구한 Web shared import `.js`도 보정했다. Native Metro용 extensionless 경계는 유지한다.

공개 타입·Native 미디어 구현은 변경하지 않았다. 실제 OS 사진 선택·업로드 서버·완료 후 라우팅·Native 접근성 초점은 이번 브라우저/host 회귀 근거와 구분한다.


### 사진 선택 예제의 실제 단계 보강

기존 예제는 완료 화면에서도 선택 해제 버튼을 노출해 0장인데 완료 제목이 남을 수 있었다. Web 초기 회귀에서 이 결함 1건과 항목별 업로드/재시도·pending 삭제 실행 경로 부재 2건을 RED로 확인했다. 양 예제를 선택 → 선택한 사진 업로드 → 완료의 메모리 흐름으로 연결했고, 리뷰 단계는 공개 MediaSelectionScreen의 기본 items 격자를 재사용한다.

- shared `media-picker-example.ts`는 5장 제한, 현재 순서, 항목별 업로드·재시도, 모든 항목 성공 후 완료 snapshot을 제공한다. 삭제·복귀·같은 id 재선택·dispose는 시도 토큰을 폐기해 늦은 결과가 되살아나지 않는다. 이미 성공한 사진은 재시도하지 않는다.
- 완료 화면 사진은 읽기 전용이고 새로 선택은 빈 선택으로 시작한다. Web 하단 썸네일의 선택 해제는 원본 타일, 다른 앨범에 숨은 사진이면 현재 앨범 버튼으로 초점을 복구한다. Native 완료 이미지에는 접근성 이름을 제공한다(음성/OS 브리지 검증과 별개).
- 완료 이미지가 직계 flex item이 되면서 축소되지 않도록 Web `flex:none`과 기존 토큰 `spacing.xxxl * 2`를 사용했다. 실제 토큰은 40×2=80px이다. 390px/기본 글자에서 실제 media-picker CSS로 5장 각각 80px, 가로 overflow와 scrollLeft 이동을 확인했다.
- `media-picker-showcase.browser.test.tsx` **Chromium/WebKit/Firefox 각각 5 PASS**. Native `media-picker-showcase.test.tsx` **3 PASS**(예제 host 2건, 제어한 지연 Promise helper 1건). JPEG는 Native host에서 불투명 asset fixture이며 실제 decoding 근거로 쓰지 않는다.
- Web renderer build 및 양 renderer `tsc --noEmit`, 양 Showcase typecheck 최종 통과. Web fixture가 가져오는 JPG는 테스트 전용 `.d.ts`에 실제 Vite URL-string 계약으로 선언했으며 renderer compiler 설정을 완화하지 않았다. 관련 diff check 통과.

이 후속의 원시 실패 PNG·임시 작성 스크립트만 제거했다. 공유 Metro/기기·다른 세션 파일은 건드리지 않았고 새 브랜치·worktree·서버·설치·커밋·push·게시는 없다. 실제 OS 권한·파일/사진 선택·업로드 서버·Native 화면 및 전체 스크린리더 흐름은 계속 남는다.


## 도구 출력·대시보드·탐색 후속 (2026-10-13)

### MockupStudio PNG와 파일 수명

기존 소스에서 동일 렌더의 연속 PNG 클릭이 두 번 인코딩하고, 초기화 후 이전 PNG가 다운로드와 성공 문구를 되살리는 **2 RED**를 실제 브라우저로 확인했다. 작업 세대와 즉시 ref 잠금을 두어 파일 선택·초기화·언마운트가 이전 PNG 결과를 폐기하고, 새 출력 중 도착한 이전 실패가 새 잠금을 풀지 못하도록 수정했다. 브라우저 인코딩 자체를 취소한다고 주장하지 않는다.

PNG 재시도 후 Notice 버튼이 사라지는 키보드 경로는 완료 시 주 PNG 행동(다시 실패면 재시도)으로 이어준다. 새 입력에 초점을 두거나 명시적 blur/다른 pointer 행동을 하면 복구 소유권을 해제한다. JSON 읽는 동안에는 실제 진행 상태를 표시한다. 실패한 파일/JSON은 이전 편집을 유지하고, 유효한 JSON은 캡처를 비워 원본 파일을 다시 선택하게 한다.

`mockup-studio-lifecycle.browser.test.tsx` 최종 **Chromium/WebKit/Firefox 각각 9 PASS**:
- 같은 렌더의 중복 출력, reset 뒤 늦은 결과, 교체된 출력의 오류/잠금, 이미지 decode 순서 뒤집힘과 폐기.
- 잘못된 이미지 뒤 이전 캡처 유지, PNG 실패→재시도, 시작 후 비율을 바꿔도 원래 snapshot의 실제 1080×1440 PNG encode/decode 유지.
- 재시도 초점 복구·외부 focus·의도적 blur 보존, JSON pending·오래된 결과·잘못된 JSON·정상 import.

PNG 파일은 실제 Canvas Blob을 다시 decode했으며 테스트가 anchor click을 가로채 다운로드 이름·Blob을 관찰했다. OS 디스크 저장/브라우저 다운로드 UI 확인은 아니다. 최초 손상된 테스트 PNG fixture는 Canvas가 생성하는 PNG로 교체한 뒤 제품 RED를 판정했고, fixture decode 실패를 제품 결함으로 집계하지 않았다.

### SceneTimeline 재생·포스터·영상

담당 표적 검사에서 **5 RED**를 확인했다: 동일 렌더에서 영상/포스터 중복 시작 2건, 이미지/장면 교체 뒤 이전 영상 미취소 2건, 부모 callback 참조 갱신 때 재생 시계가 반복 초기화되어 frame 0에 멈춤 1건. 각 출력의 현재 작업 ref로 잠금·취소·언마운트·교체를 구분하고 늦은 progress/result/finally를 차단했다. 재생은 최신 callback을 ref로 호출하면서 기존 시계를 유지한다. 실제 progressbar 0–100%와 Heading 의미 구조를 연결했다. 다운로드 상태 문구는 저장 완료가 아닌 시작으로 맞췄다.

`scene-timeline-lifecycle.browser.test.tsx` **세 엔진 각각 10 PASS**. 포스터 PNG는 실제 1080×1440 encode/decode, 영상 export 함수는 MediaRecorder 제어 mock으로 abort/hidden/encoding error 때 bitmap.close와 track.stop을 확인했다. 실제 export 함수의 기존 자원 정리 경로는 정상으로 유지했으며 상대 import만 `.js`로 정합화했다. 실제 영상 코덱·압축 품질/시간·OS 다운로드는 미실행이다.

### Dashboard·DiscoveryGallery

두 예제는 동기 fixture이며 서버 조회 실패/재시도 기능을 제공하지 않는다. 존재하지 않는 API 흐름을 실행했다고 세거나 새 서버 예제로 확장하지 않았다.

- Web Gallery 저장만 보기에서 카드 저장을 해제해 버튼이 사라질 때 저장 필터로 복구한다. 상세에서 저장 취소로 원본 카드가 사라진 경우에도 양 예제의 Sheet `returnFocusRef`를 원본 상세 버튼 또는 저장 필터에 연결한다. Native는 host ref 대상 연결만 확인했다.
- Web Dashboard 빈 달의 ‘9월 보기’와 Gallery 빈 검색 초기화는 자신을 지운 뒤 각각 선택 기간 radio·검색 필드로 이어진다.
- Native 연속 정렬 callback이 이전 값을 재사용하는 RED를 확인해 양 Gallery 정렬/저장 필터를 함수형 updater로 바꿨다. 기존 집계·필터/정렬 계산은 정상으로 유지했다.
- `dashboard-discovery-showcase.browser.test.tsx` **세 엔진 각각 4 PASS**. 기간 집계 7/6/125→주 4/3/80→빈 달 0/0/0, 목록 보기 유지, 카테고리/검색 초기화, 저장 동기화, 상세 복귀/fallback, 연속 토글을 포함한다. Native 같은 이름 host 파일 **4 PASS**. 테스트용 host props의 unknown은 좁혀 확인했으며 compiler를 완화하지 않았다.

### 최종 확인·경계

양 renderer `tsc --noEmit`, 양 Showcase typecheck 통과. Showcase 기존 `src/studio/mockup-scene.test.ts` + `src/studio/scene-timeline.test.ts` **4 PASS**, 해당 diff check 통과. 공개 renderer 계약/소스와 CSS를 이 후속에서 변경하지 않아 package build는 앞선 성공을 재사용한다. 테스트 fixture와 실제 예제/출력 도구만 추가·수정했다.

관련 지침에 작업 취소·초점·다운로드 의미를 반영했다. 자체 실패 PNG만 정리하며 공유 Metro/기기/다른 변경은 보존한다. 실제 OS 사진·권한·공유, 전체 Native 화면·VoiceOver/TalkBack·소비 제품 서버, 영상 코덱 품질, 커밋·push·npm 게시·소비 적용은 여전히 별도 미확인/미실행이다.


## 기록 비교·랜딩·제품 소개 후속 (2026-10-13)

### 기록 비교와 서비스 소개 변형

RecordComparison에서 검색 결과가 없어 초기화를 누르면 검색 입력 대신 ScreenLayout 본문으로 초점이 이동하는 RED 1건을 확인했다. 초기화 행동에서 기존 입력 ref로 초점을 옮긴 후 검색만 비운다. 보기 방식과 저장 목록은 유지한다. 세 보기 방식의 검색 정규화·저장 상태 유지, 이미지 없는 기록의 본문, 상세 닫기 두 경로와 동시 저장 토글도 실행했다. Native는 기존 동작이 정상이라 source를 바꾸지 않았다.

처음 브라우저 fixture는 `.focus()` 뒤 `.click()`하는 키보드 활성화 조건이었다. 이를 실제 포인터로 확장하자 WebKit에서 RecordComparison 1건과 ServiceIntroduction 두 CTA 2건이 추가 RED였다. Safari는 포인터로 누른 버튼을 focus하지 않을 수 있어 자동 activeElement 복귀로는 원래 버튼 대신 본문으로 돌아갔다. Web private Action이 클릭 event를 전달하고 두 예제가 실제 `event.currentTarget`을 기록해 Sheet `returnFocusRef`에 연결하도록 고쳤다. 공개 Button/Sheet API·Native helper는 변경하지 않았다.

ServiceIntroduction의 일반·편집형 두 변형은 FAQ·공백 저장 차단·두 CTA·닫기 후 초안·trim 저장·저장값과 미저장 편집 구분이 정상이다. 저장 뒤에도 같은 한 장면을 편집하는 기존 초안은 보존한다. 새 기록을 누적하는 기본 Landing과 저장 후 초기화 정책이 다르다.

### 기본 Landing Web/Native

양쪽에서 재열기 초안 소실과 동일 렌더 중복 저장, Web 빈값 오류 후 입력으로 돌아오지 않는 초점, Native Done 키 제출 누락을 재현했다. 닫기는 초안을 보존하고 정상 저장만 새 기록을 한 번 추가한 뒤 입력을 비운다. 동기 ref로 시트 세션을 닫아 연속 이벤트가 두 행을 만들지 않게 한다. Web Enter는 IME 조합 확정 중에 저장하지 않으며, Native Done과 오류 input focus를 연결했다. 실제 발동한 위/아래 CTA를 복귀 대상으로 지정하고 하단 CTA secondary·Native 저장 fullWidth를 사용한다.

기본 본체는 양쪽 `landing-preview.tsx`로 추출했고 기존 Landing 진입점과 product/editorial 변형 경로는 유지한다. Native 런타임 상대 import는 Metro용 extensionless, Web은 NodeNext용 `.js` 경계를 유지했다. 공개 renderer API/CSS는 바꾸지 않았다.

### ProductBento Web/Native

A를 저장하는 동안 B로 수정했는데 A의 성공으로 현재 B까지 저장된 것처럼 안내하는 Web RED, pending 중 지연 도착한 복귀 callback으로 입력이 사라지는 Native RED를 확인했다. 기존 useDemoAction의 제출값·확정값과 현재 trim 초안을 비교해 안내하고 같은 확정값의 중복 저장을 비활성화한다. 복귀 callback도 현재 session pending 여부를 검사한다. 실패 후 현재 초안 재시도, 저장 도중 편집, 안내 펼침과 소개 복귀 후 초안 유지도 검증했다. 새 서버 기능을 만들거나 메모리 성공을 제품 저장으로 취급하지 않는다.

### 실행 근거와 범위

- 새 Web `record-comparison-showcase.browser.test.tsx` 5건, `service-introduction-showcase.browser.test.tsx` 4건, `landing-showcase.browser.test.tsx` 5건, `product-bento-showcase.browser.test.tsx` 3건. 총 17개의 서로 다른 표적 검사가 Chromium/WebKit/Firefox에서 각각 통과했다. 반복 실행 횟수는 검사 수에 합산하지 않는다.
- Native 대응 host 파일은 각각 3/2/5/3건 통과(총 13건). Sheet 복귀 host ref·접근성 adapter 호출과 TextInput callback은 실제 OS 키보드·VoiceOver 결과가 아니다.
- 최초 fixture의 radio selector 오류와 순환 mock JSON 오류는 테스트 자체를 수정한 뒤 제품 RED를 판정했다. 이 fixture 오류는 제품 결함에 포함하지 않는다.
- 전체 회귀·최대 글자 조건·기기 조작·설치·서버 연동·커밋·push·게시는 수행하지 않았다. 본 작업의 실패 PNG만 제거하고 공유 서버·기기·다른 dirty 변경은 보존한다.

양 renderer `tsc --noEmit`과 양 Showcase `typecheck` 최종 통과. 공개 renderer source/CSS 변경이 없어 package build는 앞선 성공을 재사용했다. 관련 tracked diff check 통과, 본 후속의 실패 PNG 9개(부모 기록비교 3·소개 변형 2·기본랜딩 4)와 ProductBento 담당이 정리한 3개만 제거했다. 회귀 테스트 source는 보존한다. 새 임시 서버·브랜치·worktree·clone은 만들지 않았다.


## 저장·복구·작성 구성 실행 후속 (2026-10-13)

### SaveRecovery · OptimisticRecovery · UndoRecovery

Web 새 행동 검사 최초 4건이 모두 RED였다. SaveRecovery는 저장 중 A→B로 편집해도 A의 성공으로 단순 저장 완료를 알렸고, 저장·북마크·실행 취소 세 재시도는 pending에서 버튼이 사라져 document.body로 초점을 잃었다. Native는 같은 snapshot 안내 1 RED와 기존 낙관적 복구/역연산 2 PASS를 확인했다.

- 양 SaveRecovery는 현재 초안과 확정 snapshot이 다르면 아직 저장되지 않은 입력을 따로 안내한다. 실패한 내용 재시도는 원래 제출 A를 다시 보내고, 편집한 B는 주 저장 행동으로 제출하는 기존 계약을 유지한다.
- Web 재시도는 사라지기 전에 기존 주 행동으로 초점을 옮긴다. 저장 입력이 비어 주 행동을 누를 수 없으면 입력칸으로 돌아간다. 완료 시 비동기 focus를 하지 않으므로 사용자가 이후 선택한 입력을 유지한다.
- Web 낙관적 토글은 pending에서 `aria-disabled`로 실행을 차단해 키보드 위치를 보존한다. 동일 렌더 중복 요청과 pending 클릭은 계속 차단되며, 새 상태 reset 뒤 오래된 응답도 표시를 덮지 않는다.
- Undo는 역연산 실패 중 마지막 확정 보관 상태를 유지하고 성공 뒤에만 목록으로 복구한다. 이 동작과 기존 세션의 중복 방지는 정상으로 유지했다. useDemoAction과 공개 ActionSession은 수정하지 않았다.

`action-recovery-showcase.browser.test.tsx` **Chromium/WebKit/Firefox 각각 4 PASS**, Native 대응 host 파일 **3 PASS**. Web은 실제 pointer 재시도·키보드 초점·수정 중 입력 유지, Native는 host callback/메모리 요청 경계다. WebKit의 최초 fixture input.focus act 경고는 후속 fixture에서 act로 감쌌고 assertion 실패는 없었다. 본 작업의 실패 PNG 4개를 제거했다. 실제 API·Native OS 초점은 이 결과로 증명하지 않는다.


### ActionFeedback · UploadRecovery

ActionFeedback는 이전 저장 성공 이후 현재 초안을 바꿔도 성공 표시가 남는 분기를 양쪽에서 수정했다. 제출 시 trim한 값과 현재 trim 초안을 구분하고, 확정 제목은 별도 줄에 유지한다. 실패 뒤 다시 저장은 현재 입력을 제출한다(SaveRecovery의 원래 실패 snapshot 재시도와 구분).

UploadRecovery는 중복 후보가 남은 슬롯을 소비해 새 파일을 거부하는 경우, 동일 렌더의 두 선택 callback이 기존 count를 재사용해 3개를 넘기는 경우, 취소 후 오래된 수동 성공 callback이 되살아나는 경우를 RED로 확인했다. 최신 목록 ref에서 중복 제거 후 capacity를 다시 판단하고, 수동 상태 callback은 캡처한 항목 객체가 현재 항목일 때만 반영한다. 제거 후 같은 파일 재선택/재시도는 이전 callback과 별개이며 다른 파일 추가는 기존 항목의 유효한 응답을 막지 않는다.

FilePicker 공통 resolver는 형식·크기를 검사한 뒤 count를 판정한다. 이 순서를 근거로 count-exceeded 후보만 최신 owner 목록에 재평가하며, unsupported-type/too-large 거부는 유지한다. private shared helper를 추가하고 소비가 없어진 mergeSelectedFiles는 exact 검색 후 제거했다. 공개 FilePicker/UploadItem 계약과 서버 기능은 변경하지 않았다.

`action-feedback-upload-showcase.browser.test.tsx` **3엔진 각각 5 PASS**, Native 대응 host 파일 **5 PASS**(최종 문구 assertion 추가 1건 지정 재확인). Web은 실제 input File/DataTransfer/drop 이벤트와 같은 렌더 취소/응답 click, Native는 host와 공통 resolver 실행이다. 서버 전송·실제 시스템 파일 선택 근거는 아니다. 담당 실패 PNG 4개만 정리했다.


### FirstTask · RecoverableSettings · SelectionReview

Editor가 공유하는 세 변형을 실제 예제로 검수했다. Web은 빈 입력 확인 뒤 입력에 초점을 주지 않는 경우와 설정 확인 Sheet 닫기 뒤 opener로 복귀하지 않는 RED 2건, Native는 같은 알림 callback 두 번이 한 번으로 처리되고 pending 중 queued 편집·되돌리기가 제출 제목을 초기값으로 치환하는 RED 2건을 확인했다.

Editor 내부에서 현재 세션 pending 상태를 조회해 편집·되돌리기·이탈·단계 이동의 늦은 callback을 차단한다. 알림 토글은 함수형 update, 이전 단계는 0 이하로 내려가지 않도록 처리했다. 입력 오류는 필드 초점과 Steps error로 이어지고 설정 확인창은 실제 발동 지점/이탈 후 남은 제목으로 돌아간다. Native 단계 이동은 현재 제목 host로 접근성 focus를 예약하며 unmount 때 frame을 취소한다. useDemoAction·다른 소개/기록비교 함수·공개 renderer 계약은 그대로다.

`reference-editor-showcase.browser.test.tsx` **3엔진 각각 3 PASS**, Native 대응 host **4 PASS**. 시작→검증→초안 보관→이어하기→저장 실패→편집 재시도→완료→결과 보기, 설정 취소/폐기/계속 편집을 실행했다. WebKit에서 modal mount 직후 synthetic close를 먼저 부른 1회 실패는 source를 바꾸지 않고 실제 pointer 닫기와 focus 조건대기로 단독 재검사해 통과했다. 해당 실행은 실제 OS 키보드·VoiceOver·서버 영속 복구를 증명하지 않는다. 담당 실패 PNG 2개만 정리했다.

추가 전환/도구/기간 선택 구성 3건과 공통 Web Collapsible 수정은 [오버레이 후속](logic-overlays.md#adaptivecontexttoolbarselectionmotion-실제-구성-후속)에 기록했다. Web 3엔진 각각 3건 및 Native host 3건, 기존 Collapsible source 4건 Chromium 통과다. 이 후속의 신규 독립 행동 수는 Web/Native 각각 15건이며 전체 회귀 수로 확대하지 않는다.

최종 통합: Web renderer build, 양 renderer `tsc --noEmit`, 양 Showcase `typecheck` 통과. 관련 source·지침·기존 감사 기록 diff check 통과. Native 공개 renderer source는 변경하지 않아 build를 반복하지 않았다. 자체 실패 PNG만 정리했고 모든 담당 검사 프로세스는 종료했다. 공유 Metro/기기·다른 변경은 보존했으며 커밋·push·npm 게시·소비 앱 반영은 수행하지 않았다.


## 탐색·영상·보조 동작 구성 후속 (2026-10-13)

### WebAdditions

Watermark 저장을 다시 누르면 저장 전으로 취소되는 문제와 Watermark/Affix 변형이 하나의 saved 값을 공유하는 문제를 실제 Web 예제에서 RED 2건으로 확인했다. 저장은 각 문서 예제별 로컬 확정 상태로 유지하고 완료 버튼은 aria-disabled로 재실행을 막아 기존 초점을 보존한다. 서버 저장·파일 쓰기 기능을 추가한 것은 아니다.

`packages/react/test/web-additions-showcase.browser.test.tsx` 4건은 Chromium/WebKit/Firefox에서 각각 통과했다. 실제 포인터의 워터마크 통과, 내부 스크롤의 Affix top 8px·같은 버튼/초점 유지, 잘못된 HEX/escape 복구와 alpha/프리셋, 변형별 독립 저장을 확인했다. Affix ResizeObserver의 테스트 act 경계도 맞췄다. own 실패 PNG 2개만 제거했고 public renderer/CSS는 변경하지 않았다.

### WebNavigation

로컬 hash 예제의 첫 모음→상위 이동 뒤 browser Back으로 URL만 복귀하고 화면은 상위에 남는 RED를 수정했다. 각 예제의 최초 fragment와 자기 경로 방문 여부를 기록해 본인 경로에서 돌아왔을 때만 초기 모음/1페이지를 복구한다. 다른 예제의 hash와 malformed fragment는 상태를 덮지 않는다. 페이지 번호는 기존 예제 계약대로 메모리 상태이며 제품 router나 서버를 제공하지 않는다.

`packages/react/test/web-navigation-showcase.browser.test.tsx` 3건이 Chromium/WebKit/Firefox에서 각각 통과했다. 5페이지→상위→Back 1페이지/Forward, 마지막 페이지 경계, disabled Enter, 이전 페이지 키보드 초점·스크롤, 두 예제 간 독립 상태를 실행했다. Firefox hashchange는 act 내부 완료 대기로 정리해 최종 경고 없이 통과했다. 최초 disabled 버튼 pointer timeout은 fixture 오류로 제품 결함에 합산하지 않았다. 담당 실패 PNG 2개만 제거했다.

### FloatingActionButton

양 예제의 작성 Dialog에 FAB returnFocusRef를 전달하고 작성 세션 ref로 같은 렌더 중복 저장을 막았다. WebKit 실제 pointer 닫기 뒤 body 초점과 Native host 연속 저장의 중복 행을 RED로 확인했다. 동기 로컬 기록 추가라는 기존 범위를 유지하며 가짜 비동기 요청은 만들지 않았다.

`fab-showcase` 새 Web 표적 2건이 3엔진 각각 통과했고 Native host 2건도 통과했다. 초안·입력 검증·재열기·스크롤 방향·하단 clearance를 포함한다. Native OS 초점/기하/음성 검증은 아니다. 테스트의 비동기 resize/scroll act 경고는 assertion 실패와 구분한다. 자체 실패 PNG 1개만 제거했고 public FAB 구현은 바꾸지 않았다.


### VideoDialog

Web의 같은 렌더 중복 play 요청과 error 뒤 사라진 재생 버튼의 초점 유실을 고쳤다. 현재 play 요청을 ref로 식별하고 숨김·정지·오류·닫기 뒤 늦은 promise를 무시한다. 추가 실제 Enter 검사에서 pending disabled 버튼이 초점을 잃는 RED 2건을 재현해 기존 Button loading의 실행 차단으로 바꿨다. 오류 때는 해당 재생 제어가 가진 초점만 재시도로 복구한다.

Native는 영상 모듈이 없는 클라이언트에서도 같은 텍스트 설명을 유지한다. optional Expo module/asset/useEvent 경계만 private video-dialog-host로 분리했으며 public VideoPlayer/Dialog/API/CSS는 바꾸지 않았다. Native 상대 runtime import는 extensionless를 유지했다.

`video-dialog-showcase` Web lifecycle/keyboard 8건이 Chromium/WebKit/Firefox에서 각각 통과했다. 외부 메모 보존, 닫기 즉시 pause/src 해제/load, 재열기 무자동재생, 오류/retry, 숨김·복귀·늦은 promise를 포함한다. 메서드 spy를 해제한 실제 번들 MP4 추가 1건도 세 엔진에서 skip 없이 통과했다(duration 5~7초, currentTime 증가, pause와 닫기 후 src 해제). 실제 파일 검사의 metadata/act 대기만 보정한 최종 fixture도 각 엔진에서 재확인했다. Native host mock 4건 통과는 실제 Expo 코덱·OS 키보드·스크린리더·네트워크 장애 증거와 구분한다. 담당 실패 PNG 3개만 제거했다.


### DateTimeSelection

실제 Web 키보드로 확인할 때 pending disabled 버튼이 body로 초점을 잃는 문제와 응답 완료가 다른 행동으로 옮긴 초점을 무조건 확인 버튼으로 빼앗는 문제를 RED 2건으로 확인했다. 확인은 기존 Button loading으로 중복 실행을 차단하면서 초점을 유지한다. 응답 버튼을 직접 발동했거나 해당 버튼에 초점이 있을 때만 비활성화 후 원래 확인 버튼으로 복귀한다. pointer focus가 없는 WebKit도 실제 click detail로 구분한다.

새 `showcase/web/src/patterns/date-time-selection.browser.test.tsx` 4건은 Chromium/WebKit/Firefox에서 각각 통과했다. 실패·재시도·초기화·테마 변경 중 선택/요청 유지, Enter 중복 차단과 초점 소유를 포함한다. 해당 브라우저 fixture는 Showcase의 Bundler 경계에 두어 Web renderer NodeNext 검사가 Native 공유 소스의 extensionless import를 바꾸도록 강제하지 않는다. `showcase/web/vitest.browser.config.ts`는 기존 renderer 브라우저 구성을 재사용하고 unit config에서는 브라우저 fixture만 제외한다.

Native 실제 예제를 렌더하는 새 `packages/react-native/test/date-time-selection-showcase.test.tsx` 2건도 통과했다. 실패/재시도/초기화와 같은 렌더의 confirm→queued date/hour/reset→confirm이 제출 snapshot을 지키는지를 확인했다. 기존 shared reducer 5건은 경로 지정으로 재검사해 통과했다. Native source/shared reducer는 정상이라 수정하지 않았다. 실제 OS 날짜/시간 선택·시간대 변환·서버 예약은 이 예제의 기능/검증 범위가 아니다.

### Native 결과 알림과 탐색 막대 비교

결과 알림의 기존 PatternStatus는 이미 Android live region/iOS announce를 제공한다. 조건부 mount되는 CommandRecords 진행과 ServiceIntroduction 첫 저장 결과가 mount opt-in을 전달하지 않는 누락을 수정했다. CommandRecords 실패·초기 copyFailed fixture도 기존 Notice assertive에 연결했다. 새 공개 API는 만들지 않았다. `showcase-pattern-status.test.tsx` 5건과 `pattern-status-consumers.test.tsx` 3건이 Native host에서 통과했다. 실제 clipboard 거부가 아니라 초기 주입 실패 fixture이며 실제 VoiceOver/TalkBack 낭독을 검증했다고 주장하지 않는다.

탐색 막대 비교는 Web의 Back 후 선택 불일치와 같은 preset 복수 mount의 fragment 충돌을 수정했다. useId로 preview별 링크를 구분하고 해당 hash history만 따라간다. Native 결과 카운트는 기존 PatternStatus를 사용해 iOS 알림 호출을 연결했다. Web `navigation-bars-showcase` 3건이 세 엔진 각각, Native 대응 5건이 통과했다(4그룹/10preset·독립 primaryAction 포함). 자세한 기록은 compositions.md C-05/R-04 후속에 있다.

최종 통합: 양 renderer `tsc --noEmit`과 양 Showcase `tsc --noEmit` 통과. Native 영상 fixture의 넓은 Mock 타입이 호출 가능성을 보장하지 않아 최초 타입 검사가 실패했고, `Mock<() => void>`로 좁힌 뒤 해당 host 4건과 Native renderer 타입 검사를 다시 통과했다. 공개 renderer source/CSS는 이 후속에서 바꾸지 않아 앞선 build 성공을 재사용했다. 제거된 영상 큰 글자 Story ID 하나는 기본 영상 예제로 retired 연결했다. 전체 회귀·전체 registry 감사·기기 조작·설치·게시·소비 앱 반영은 실행하지 않았다. 자체 실패 PNG만 제거하고 기존 공유 서버/기기·다른 dirty 변경은 보존했다.


## 대화·적용·초안·검색·선택 범위 구성 후속 (2026-10-13)

### 댓글·메시지 작성, 메시지 말풍선, 알림 항목

실제 Enter로 댓글·메시지를 전송할 때 disabled/제거되는 전송 버튼이 body로 초점을 잃는 2건, 읽음 처리 중 disabled 행에서의 초점 유실 1건, 재전송 성공 후 상태가 초기 안내에 남는 1건을 안정화된 브라우저 환경에서 RED로 확인했다.

Web 전송은 기존 MessageComposer inputRef로 시작 시 입력 초점을 보존한다. 알림 항목은 aria-disabled와 session snapshot guard로 중복 동작을 막으면서 행 초점을 유지한다. 말풍선은 사라지는 재전송 행동이 가진 초점만 결과 안내로 옮기고 외부 초점·명시적 blur를 보존한다. 양쪽 예제의 성공/실패 안내와 unmount session reset을 보강했다. 공용 MessageComposer/ActionSession/PatternStatus는 변경하지 않았다.

`showcase/web/src/patterns/conversation-previews.browser.test.tsx` 8건이 Chromium/WebKit/Firefox에서 각각 통과했다. 초안 수정 후 재시도, 사진·답장 유지와 중복 전송 차단, 읽음 실패 rollback/누적 확정, 반응 선택·해제·답장, 외부 초점/blur, unmount 늦은 완료를 포함한다. `packages/react-native/test/conversation-showcase.test.tsx` 6건 통과는 SVG/사진 픽셀 host를 모형화한 실제 예제 callback과 350ms session 동작 근거이며 OS 키보드·음성·사진·서버 전송 근거는 아니다. 담당 PNG 6개와 임시 로그 6개를 정리했다.

### 적용/취소 · 초안 재열기 · 최신 검색

취소·폐기 후 queued apply/edit/save가 선택이나 초안을 되살리는 Native RED와 검색 응답 순서에 따라 실패 예약이 다른 요청에 적용되는 Web/Native RED를 확인했다. 각 Sheet 열기에 generation/active 경계를 두어 닫힌 열기의 callback을 거부한다. 취소·외부 닫기는 초안을 보존하고 폐기·저장은 기존 정책대로 처리하며, 재열기 후 이전 callback도 무효다.

검색 실패 예약은 요청 시작 시 캡처·소비해 응답 도착 순서와 분리했다. 재시도는 실패한 query snapshot을 유지하고 작성 중인 현재 query는 보존한다. Web/Native 재시도 입력 ref를 연결하고 unmount 때 private demo timer를 정리한 뒤 이미 분리된 promise를 settle한다. 실제 transport 취소를 구현한 것으로 해석하지 않는다.

`showcase/web/src/patterns/interaction-flow-showcase.browser.test.tsx` 4건은 세 브라우저 각각 통과, 대응 Native `test/interaction-flow-showcase.test.tsx` 4건도 통과했다. 테스트 render helper의 ComponentType 타입만 후속 수정했고 source/동작이 같아 행동 검사는 재사용했다. 검색 지연 150·900·60,000ms는 기존 데모 설정이다. 담당 실패 PNG 2개만 제거했다.

### SelectionScope

실제 Native Story의 pending 도중 늦은 radio callback이 session.reset(null)로 요청을 버리고 범위를 바꾸는 RED 2건을 확인했다. 양 Story 선택/실패 예약 handler가 현재 session snapshot을 조회해 pending일 때 거부하도록 수정했다. 안내도 초기 선택 설명 대신 제출 범위 개수의 처리 중 문구를 표시한다.

`showcase/web/src/patterns/selection-scope.browser.test.tsx` 2건이 세 브라우저 각각 통과했고 Native `selection-scope-showcase.test.tsx` 2건도 통과했다. 실패→같은 범위 재적용→성공→범위 변경 결과 초기화, 중복 적용, pending 늦은 callback, 적용/외부 초점을 확인했다. 공통 hook/공개 API는 유지했고 담당 실패 PNG 1개만 정리했다.

처음 Showcase 브라우저 환경에서 optional renderer의 늦은 dependency 최적화가 페이지를 reload하며 Invalid hook call을 일으킨 실행은 제품 결함으로 합산하지 않았다. Showcase browser config에 React/ReactDOM dedupe와 framer-motion/lucide-react 선최적화를 연결한 뒤 정상 실행했다. Native Flow 파싱·SVG host 경계·iOS 알림을 Android 기본 host에 기대한 fixture 오류도 제품 결함과 구분한다.


### 주문 단계·OTP 확인/재전송

OrderProgressRetry는 요청 중 실패 스위치가 활성이고 shared reducer도 toggle을 받아 진행 중 요청의 성공/실패가 바뀔 수 있었다. 양 예제의 Switch 잠금과 reducer의 pending guard를 함께 추가해 queued callback도 거부한다. 확정 전 단계 이동 금지, 실패한 같은 단계 재시도, 전체 완료 후 기존 버튼 identity/초점과 초기화는 정상임을 실행했다.

OTP는 Web 성공→다시 해 보기에서 입력으로 복귀하지 않는 RED와, 성공 응답이 사용자가 옮긴 외부 초점을 빼앗는 추가 RED를 수정했다. 사라지는 폼이 가진 초점만 Result로 옮기고 데모 초기화는 새 입력으로 이어진다. Native 재전송·새 시도는 input ref를 호출하며, 성공은 기존 Result의 행동을 각각 탐색할 수 있게 유지한 채 iOS 안내/Android polite live region으로 연결했다. 전체 결과/버튼을 인위적인 접근성 그룹으로 묶거나 새 public API를 만들지 않았다.

재전송 안내는 동일한 정답 246810을 유지하는 로컬 예제에 맞췄다. 실제 문자 발송·이전 코드 무효화를 수행하지 않는 데도 이를 완료했다고 읽히던 문구를 제거했다. 실제 인증·예약·문자 서버는 제품 소유다.

Native `stea-recovery-showcase.test.tsx` 최종 4건과 Showcase `src/stea-compositions.test.ts` 8건 통과. 실패→재시도·같은 렌더 중복/queued switch, 자동 OTP 확인·잠금/두 번 재전송·성공/새 시도·unmount 타이머 정리를 포함한다. Native의 장식 Check glyph는 mock이고 OS 초점·음성은 미실행이다. 최초 success focus 요구는 전체 결과를 강제로 그룹화하지 않도록 알림+입력복귀로 정리했으며, iOS 알림을 Android 기본 fixture에 기대한 실패는 환경을 명시해 수정했다.


Web `showcase/web/src/patterns/stea-recovery.browser.test.tsx` 최종 4건이 Chromium/WebKit/Firefox에서 각각 통과했다. 진행 중 실패 잠금, 전체 완료/다시 시작, OTP 성공·새 입력 복귀·3회 오류 잠금·첫/반복 재전송, 의도적 외부 초점 보존을 실행했다. root 자체 실패 PNG 4개만 제거했다.

최종 통합은 양 Showcase와 Native renderer `tsc --noEmit` 통과다. interaction-flow Web/Native fixture의 컴포넌트 인자 타입이 처음에 실패해 ComponentType으로 바로잡은 뒤 재검사했다. 이번 후속에서 public renderer source/CSS는 바꾸지 않았고 Web renderer 검사/패키지 build는 앞선 성공을 재사용했다. 새 Web 18건(대화 8·상호작용 4·선택범위 2·주문/OTP 4)은 세 엔진 각각 통과, Native host 16건(6·4·2·4) 및 shared reducer 8건은 경로 지정으로 통과했다. 전체 회귀·최대 글자·실제 OS/기기·서버·게시/배포는 수행하지 않았다. 공유 main 변경/서버/기기는 보존했고 새 임시 서버·브랜치·worktree·clone을 만들지 않았다.


## 컬렉션·내용 전환·프로필·실시간 목록 실제 구성 후속 (2026-10-13)

### 컬렉션 상세

동일 페이지에 CollectionDetailPreview를 두 번 렌더하면 고정 `collection-walk` 입력 ID가 중복돼 두 번째 라벨이 첫 번째 입력에 초점을 주는 Web RED를 확인했다. 항목 key는 유지하고 불필요한 ID override를 제거해 TextField의 고유 ID를 사용한다. Native source에는 해당 DOM 문제가 없어 수정하지 않았다.

`showcase/web/src/patterns/collection-detail.browser.test.tsx` 5건은 Chromium/WebKit/Firefox 각각 통과했고 `packages/react-native/test/collection-detail-showcase.test.tsx` 4건도 통과했다. 카드별/상세별 독립 초안, 탐색·테마 변경, 닫기/재열기·다른 카드 복귀, 빈 목록 전환 후 stale modal 미복원을 확인했다. 이 구성에는 원래 조회·저장·실패 callback이 없으므로 가짜 서버 실패 흐름을 추가하지 않았다. Native는 onLayout/onScroll·Dialog callback·returnFocusRef와 접근성 adapter 호출 근거이며 실제 OS 탐색 근거가 아니다. 담당 PNG 1개·임시 로그 4개 정리 완료.

### 내용 전환·종이 표면

내용 전환은 steps 완료 뒤 tabs에서 초안을 수정하고 steps로 돌아오면 이미 확정한 결과가 현재 초안으로 바뀌는 양 플랫폼 결함을 수정했다. 확인 snapshot을 분리하고 Web 다시 비교는 새 입력 ref로 복귀한다. Web 재시작 시 body 초점 RED와 Native Paper 확인 결과 iOS announcement 0회 RED도 확인했다. Native Paper에는 기존 PatternStatus를 연결했고 정상인 Web Paper 소스는 유지했다.

`showcase/web/src/patterns/content-paper-showcase.browser.test.tsx` 4건은 세 브라우저 각각, Native 대응 `test/content-paper-showcase.test.tsx` 5건은 host에서 통과했다. 수동 탭 화살표/Enter, 초안·표시/테마 변경, 실패→재시도→재시작, Paper 확인 snapshot·현재 초안 Dialog·닫기 복귀를 실행했다. pill의 실제 label 클릭과 fieldset 상속 비활성 검사(`:disabled`)로 수정한 초기 fixture 오류는 제품 결함과 구분한다. 담당 PNG 4개를 정리했다.

### 테마 조합

Web 실제 예제로 저장 중 편집한 내용까지 저장됐다는 잘못된 안내, 토스트 닫기 no-op, WebKit pointer 오버레이 닫기 후 복귀 실패를 RED 3건으로 확인했다. 추가 Chromium/Firefox 키보드 검사는 실패 재현 버튼이 pending disabled가 되며 초점을 잃는 RED를 확인했다.

양 RecordSample은 기존 useDemoAction/action session을 사용해 제출 이름·기간과 현재 초안을 구분하고 현재 session snapshot으로 같은 렌더의 중복/실패 콜백을 거부한다. 실패 뒤 다시 저장은 현재 편집 값을 제출한다. Web BottomCTA의 기존 보조 슬롯에 aria-disabled Button을 넣어 초점을 보존한다. unmount는 session.reset으로 늦은 결과를 분리하며 기존 350ms 데모 지연/공통 hook은 바꾸지 않았다. 실제 요청 취소·서버 저장 기능을 추가한 것은 아니다.

Web 제어 Toast는 닫기/재표시 상태를 소유하고 닫힌 뒤 다시 보기 버튼에 초점을 준다. Native Toast는 기존 자체 lifecycle을 유지하고 명시적 재생에만 remount한다. 양 Dialog/Sheet에 returnFocusRef, Native 저장/FAB 결과에 기존 PatternStatus를 연결했다. 테마/제품/탭 표시 변경은 입력·선택·열린 오버레이를 교체하지 않는다.

`showcase/web/src/patterns/design-profile.browser.test.tsx` 최종 5건은 Chromium/WebKit/Firefox 각각 통과했다. 저장 중/후 편집·실패와 재저장, 실제 토스트 닫기/재표시, 열린 Dialog/Sheet 테마 변경과 pointer 복귀, 제품/표현/탭 표시 변경 시 같은 입력 host, 키보드 중복 실행 차단을 포함한다. `packages/react-native/test/design-profile-showcase.test.tsx` 최종 6건도 통과했다. queued save/fail, 이름·기간/프로필 유지, iOS 결과 알림, 실제 오버레이 초안/return target, Toast 미부활/명시 재생, FAB 연속 카운트/프로필 유지다.

Native 초기 실행은 Expo workspace 모듈과 SVG drawing host를 불러오며 import에 실패했다. optional Expo blur/Liquid Toast 예제, PNG image ID, SVG drawing host만 모형화하고 공개 컴포넌트/상태 소유자는 실제로 실행했다. PNG loader/cache는 fixture 종료 시 복원한다. Native 이 6건은 수정 전 RED를 얻은 것으로 보고하지 않는다. OS 초점·VoiceOver/TalkBack 전달·blur·이미지 decode는 미실행이다. root 자체 실패 PNG 4개 정리 완료.

### 실시간 목록 및 통합

LiveList의 WebKit 삭제 후 body 초점, Native 스크롤 host 누락과 iOS 결과 알림을 수정했다. 단건/3건 추가·첫 행 삭제·역순·메모 편집·모션 정지가 실제 예제 기능이며 filter/선택/서버 동기화는 추가하지 않았다. Web 3건씩 세 엔진, Native host 3건, shared 모델 2건 통과. 상세 원인/변경 문구/no-op·정리 기록은 compositions.md의 LiveList 후속에 있다.

이번 새 표적 행동은 Web 17건(컬렉션 5·전환/종이 4·프로필 5·목록 3)이 세 브라우저 각각, Native host 18건(4·5·6·3) 및 shared 모델 2건이다. 반복 실행 횟수를 합산하지 않는다. 양 Showcase와 Native renderer `tsc --noEmit` 통과. 공개 renderer source/CSS를 바꾸지 않아 이전 Web renderer 검사/build를 재사용했다. 범위별 diff check 통과, 자체 실패 PNG/로그만 정리했다. main 공유 변경·서버·기기는 보존했으며 전체 회귀·최대 글자·기기 실행/설치·커밋·push·패키지 게시·소비 앱 반영·배포는 실행하지 않았다.


## 화면 연결·진행 상태·복합 입력 실제 예제 후속 (2026-10-13)

### 복합 입력 및 공통 InlineConfirm

실제 Compound 예제의 실패 설정을 600ms 요청 완료 시 읽어 처리 중 결과가 바뀌는 Web/Native RED와, 같은 렌더의 연속 알림 추가가 한 번으로 합쳐지는 Web/Native RED를 확인했다. shared `runConfirmationPreview`는 실패 여부를 시작 시 캡처하고 예제 Notifications는 함수형 count 갱신으로 바꿨다. 데모 reset key도 함수형 갱신으로 처리하며 이전 요청 완료가 새 예제를 확정하지 않는 것을 확인했다. 소요 시간/반응 제어는 정상이라 상태 구현을 바꾸지 않았다. 블록 제목은 기존 지침에 맞춰 양쪽 Heading level3로 통일했다.

Web 실제 Enter 확인은 pending의 disabled 버튼에서 body로 초점을 잃었다. 이 문제는 공개 `packages/react/src/inline-confirm.tsx`에서 수정했다. 기존 Button loading으로 재실행을 막으면서 확인 버튼 초점을 유지하고, WebKit pointer가 취소 버튼에 초점을 남겼다면 실행 직전에 확인으로 옮긴다. 성공으로 확인 묶음이 없어질 때 그 묶음이 소유하던 초점만 결과 `role=status`로 옮긴다. 이미 외부로 옮긴 초점은 그대로 유지한다. 공개 API/상태 엔진/CSS는 추가하지 않았고 기존 changeset·공개 계약·사용 지침에 반영했다.

새 `showcase/web/src/patterns/compound-showcase.browser.test.tsx` 5건은 Chromium/WebKit/Firefox 각각 통과했다. 실패 설정 변경→현재 요청/다음 재시도 분리, pending/success 키보드 초점과 중복 차단, 외부 초점/초기화 후 늦은 완료, 연속 알림 추가·읽음 직후 도착, 실제 Duration 합계·Reaction 선택/교체/해제를 확인했다. Native 새 `test/compound-showcase.test.tsx` 3건도 통과했다. Native 첫 실패 출력이 ReactTestInstance 전체를 직렬화한 것은 assertion 출력을 boolean으로 바꿨고 제품 결함과 구분한다.

공개 `packages/react/test/compound-controls.browser.test.tsx`는 기존 4건에 실제 keyboard/pointer·외부 초점 2건을 추가해 총 6건이 세 브라우저 각각 통과했다. Web renderer build 및 `tsc --noEmit` 통과. Showcase는 공개 패키지 dist를 소비하므로 build 전 pending 초점 실패가 남았고, source 검사 성공 뒤 rebuild하여 실제 예제를 재확인했다. 이 중간 실행을 새로운 결함으로 합산하지 않는다. Native 공개 구현은 변경하지 않았다. root 자체 실패 PNG 3개 정리 완료.


### 계정·편집·목록 예제 연결

양 `screen-flow-previews.tsx`의 실제 Account/Editor/Collection 소유자를 검수했다. Web 수정 전 6건 중 새 기록 prefill·갱신 Notice 숨김·pending 입력 미잠금·로그아웃 확인 재등장 4건이 실패했다. Native에서는 이 연결 문제와 queued 중복 생성·returnFocusRef 부재를 확인했다. 모든 상세가 전역 editor body를 읽는 것은 source에서 확인했고 수정 후 두 기록의 독립 본문을 실행했다(이 항목만 따로 수정 전 RED를 실행한 것으로 합산하지 않는다).

새 기록은 빈 제목/본문으로 시작하며 저장한 항목별 body/고유 ID를 보존한다. 목록 필터 슬롯이 base Notice를 덮지 않게 합성하고 갱신 실패 문구는 저장 실패와 구분했다. Editor는 처리 중 입력을 잠그며 현재 ref로 queued 입력도 거부한다. 공통 예제 mutate에 동기 잠금/요청 시작 시 실패 예약 소비를 연결해 중복 생성·결과 변경을 막았다. 계정 Sheet/확인창에는 실제 account trigger의 returnFocusRef를 전달하고 로그아웃 확인 플래그를 종료 시 해제한다. 공개 화면 구현은 바꾸지 않았다.

Web 새 `screen-flow-showcase.browser.test.tsx` 6건이 세 브라우저 각각, Native 대응 host 6건이 통과했다. Chromium 최종 작은 변경은 영향 2건만 재실행하고 나머지 4건 성공을 재사용했다. 빈 목록→새 기록→ready, 프로필 실패 초안/재시도, Editor 폐기 시 마지막 저장값 복구, 공유 mutate를 쓰는 Onboarding/Moderation 실패→재시도도 포함한다. Native 모달 취소 직후 exit settle 없이 재열어 실패한 fixture는 대기를 고친 뒤 재실행했다. 실제 서버 저장/로그아웃 세션·OS 키보드/초점/음성은 미실행이다. 관련 usage 3개 갱신, 담당 PNG 4개·임시 로그 7개 정리, scoped diff check 통과.


### 로그인·알림·대화 예제 연결

양 `common-screen-previews.tsx`의 실제 owner 흐름을 검수했다. 로그인은 렌더 전 중복 provider callback이 타이머 두 개를 만들고 취소가 마지막 것만 지우던 문제를 요청 identity ref로 막았다. 취소/재시작/unmount 뒤 오래된 callback을 거부하며, 오류 예제의 재시도 성공은 recovered 상태로 다음 화면에 진입한다. 성공 후 홈→대화에서 초기 error가 남아 composer가 사라지는 추가 Web RED도 확인했다.

알림은 읽지 않음 0건을 실제 empty 상태로 연결하고 빈 날짜 그룹을 제거했다. 상세의 대화 연결은 실제 제공하는 서연 알림에만 둬 다른 사람의 알림이 서연 대화로 잘못 이어지지 않게 했다. 읽음/메시지 실패 예약과 오류 표시를 action kind별로 분리해 화면 이동 시 오류가 다른 작업에 누출되지 않는다. 답장 원문 재탐색은 같은 원문에도 강조 1500ms를 다시 시작하며 unmount 때 타이머를 정리한다. Web은 원문 초점 및 상세 복귀 시 원래 알림/선택 필터·화면 제목의 탐색 맥락을 유지한다.

새 Web `common-screen-showcase.browser.test.tsx` 최종 6건은 Chromium/WebKit/Firefox 각각 통과했고 Native `test/common-screen-showcase.test.tsx` 최종 9건도 통과했다. 첫 Web 3 RED와 추가 로그인 연결 RED, Native 중복/보관된 타이머 callback/0 unread/잘못된 대화 연결/강조 시간/실패 예약/오류 누출 경계를 실제 예제에서 확인했다. SVG·Native scroll host는 모형이며 OS 입력/VoiceOver/OAuth·API·서버 읽음 저장/사진 선택의 증거는 아니다. 공개 Auth/Chat/Inbox 소스는 그대로다. 사용 지침 3개 갱신, 자체 PNG 4개·빈 하위폴더 정리, 범위 diff check 통과.

### 진행 상태 패널

Native의 변경되는 Toast controller 객체를 effect 의존성으로 삼아 publish와 렌더가 무한 반복되는 문제를 안정된 publish/dismiss 함수 의존성으로 수정했다. 결과 안내는 기존 PatternStatus announceOnMount를 사용하고 Web은 지속되는 role=status로 연결했다. 완료 칩 자동 제거 때 칩이 가진 초점만 시작 버튼으로 복구한다.

Web 패널은 private wrapper의 portal focus/blur 이벤트로 실제 소유 초점을 추적한다. 닫히면서 그 요소가 제거되고 초점이 body로 유실된 경우만 칩으로 돌아간다. 명시적 blur, 외부 control 이동, 처음부터 초점 없는 pointer 경로는 그대로 유지한다. body만으로 소유권을 추론하던 문제는 source 검토에서 확인했으며 별도 수정 전 RED 수치로 합산하지 않는다. WebKit의 pointer가 기존 초점을 blur하는 중간 fixture 실패는 실제 Enter 복구와 비초점 pointer 보존을 나눠 보정했다.

Web `activity-status.browser.test.tsx` 최종 7건이 Chromium/WebKit/Firefox 각각 통과했다. Native `activity-status-showcase.test.tsx` 3건도 통과했고 Web 후속 수정에는 재사용했다. 실제 OS 음성/탐색 검증은 아니다. 자체 PNG 4개를 정리했고 공개 Toast API 변경은 없다.

## 원점 대화상자·그림 결과·명령 기록·독립 날짜/시간 후속 (2026-10-13)

### 독립 날짜·시간 Story

두 플랫폼의 DateEntry/TimeSelection Story 자체를 불러와 상태 소유자를 확인했다. Native 날짜 확인 결과가 Android live region만 갖고 iOS에는 안내되지 않는 것을 0회 호출 RED로 확인하고 기존 PatternStatus로 교체했다. 초기 안내는 조용하고 새 확인 결과만 알리며, 순서만 바꿀 때 반복 발표하지 않는다. Native 실제 Story 검사 3건이 통과했다: 확인 날짜/원문 재배치 보존과 재편집 무효화, iOS 안내, 시간 한쪽 값/자정/해제/재확인/초기화. 기존 공개 parser와 컴포넌트 검사는 중복하지 않았다.

첫 fixture의 provider/context 실패는 테스트가 renderer 상대경로와 Story의 package import를 혼용한 문제였다. 같은 package import로 맞춰 재실행한 뒤 제품 결함을 판정했다. iOS 안내는 mock 호출 근거이며 실제 기기 음성을 검증한 것은 아니다. 시간 지침의 자동 반응형 gutter 주장을 실제 양 Story의 compact 16과 맞췄고 제품용 반응형 코드 골격과 구분했다.

Web `independent-date-time.browser.test.tsx` 2건도 Chromium/WebKit/Firefox 각각 통과했다. 실제 TextField 입력과 Select 선택/해제를 통해 날짜 순서 변경·유효하지 않은 재편집·오류 복구, 자정 확인·부분 해제·재확인·전체 초기화를 확인했다. Web 날짜/시간 및 Native 시간 source는 기존 동작이 정상이어서 수정하지 않았다.

### 원점 대화상자와 문맥 편집

Web Dialog/Popover에서 빈 메모 저장을 미저장으로 표시하는 2건, Native에서 오래된 measureInWindow 응답이 닫힌 창을 다시 열거나 최신 원점을 덮는 2건과 빈 저장 1건을 RED로 확인했다. 저장값은 null을 미저장으로 삼고 빈 문자열도 저장 결과로 알린다. Native 측정은 요청 세대를 비교하며 닫기/언마운트가 이전 요청을 무효화한다. 상태/오류는 기존 PatternStatus로 연결했다. iOS 안내 누락은 기존 Android liveRegion만 있던 source 검토 근거이며, 초기 Android fixture의 0회 발표 실패는 iOS RED로 합산하지 않았다. 수정 후 명시적 iOS 조건에서 확인했다.

Web `origin-showcase.browser.test.tsx` 5건이 Chromium/WebKit/Firefox 각각 통과했다. 실패→닫기→재열기→재저장/원래 opener 복귀와 실제 외부 클릭의 초점 보존을 포함한다. 외부 버튼을 popup 아래 놓은 timeout은 fixture 배치를 고쳤고, Safari pointer의 비초점 동작은 plain HTML 버튼의 실제 baseline과 비교했다. 제품 초점 로직을 테스트 기대에 맞춰 바꾸지 않았다. Chromium은 마지막 외부 클릭 fixture 1건만 재실행하고 다른 4건을 재사용했다. Native `origin-showcase.test.tsx` 최종 5건 통과. 자체 PNG 3개·임시 로그 7개를 정리했다. 실제 기기 측정/초점/음성과 서버 저장은 미실행이다.

### 그림을 포함한 시작·완료 화면

실제 Enter 시작으로 제거되는 버튼의 초점이 body에 빠지는 Web RED와, Native iOS 완료 결과 안내 0회 RED를 확인했다. Web은 전환 버튼이 소유한 초점을 기억하고 layout commit 뒤 단계 제목/입력/결과/시작 버튼으로 연결한다. 외부로 이동한 초점, 같은 event batch의 명시적 blur, pointer의 비초점 상태는 유지한다. Native는 완료 진입 때 기존 announcement 경로와 Android live region을 연결하고 결과의 별도 행동을 하나의 접근성 노드로 묶지 않는다. 그림 토글로 재렌더해도 완료를 다시 발표하지 않는다.

Web `illustrated-outcome-showcase.browser.test.tsx` 4건이 세 브라우저 각각 통과했다(기존 3건 + 마지막 실제 pointer 1건 별도 실행). WebKit pointer가 그림 토글에 남을 것이라는 중간 fixture 가정은 실제 click 시 body로 blur되는 것을 보고 수정했으며 제품 결함 수에 넣지 않았다. Native 대응 Story 3건 통과. 이전 단계/재시작 뒤 초안 유지, 공백 제목 확정 차단, 장식 이미지 오류/숨김과 입력/행동 보존을 포함한다. 실제 비동기 요청이 없는 owner에 가상의 늦은 callback 요구를 추가하지 않았다. 그림 자산은 Native host fixture의 opaque require 경계만 대체했고 기기 시각/음성 검증은 아니다.

### 명령 기록과 복사·갱신

Web 실제 Enter로 새로고침하면 native disabled 속성 때문에 body로 초점을 잃고, 응답 완료 effect는 사용자가 원문으로 옮긴 초점까지 새로고침 버튼으로 가져가는 두 RED를 확인했다. 기존 Button loading이 재활성화를 막으므로 중복 disabled를 제거했다. 응답 handler는 응답 버튼이 초점을 소유할 때만 비활성화 전에 새로고침으로 옮기며 원문 초점과 명시적 blur를 유지한다. 공개 Button/ClipboardButton은 변경하지 않았다.

Web `command-records.browser.test.tsx` 6건이 세 브라우저 각각 통과했다. 실제 예제의 수동 탭 키보드 탐색, 표시/테마 변경 중 원문·복사 owner 유지, 이전 원문 복사 Promise의 성공/거부 무시와 새 원문 쓰기, 현재 복사 오류 닫기/재시도, 갱신 실패/재시도/초점 경계를 확인했다. OS 클립보드 Promise만 제어했으며 실제 장치 클립보드 검증은 아니다. 표시 label 아래 가려진 radio를 클릭한 초기 fixture timeout은 실제 label 클릭으로 보정했다. Native `command-records-showcase.test.tsx` 2건은 실제 탭/표시 및 갱신 중 선택 유지에 집중했고 기존 결과 안내 검사는 재사용했다. Tabs의 스크롤까지 센 초기 fixture는 code subtree로 범위를 좁혔다. Native source는 그대로이며 자체 PNG 3개를 정리했다.

### 통합 검증과 다음 범위

이번 Web 예제 17건(원점 5·그림 결과 4·명령 6·독립 날짜/시간 2)이 Chromium/WebKit/Firefox 각각, Native host 13건(5·3·2·3)이 통과했다. 마지막 양 Showcase와 Native renderer의 `tsc --noEmit`도 통과했다. 이번 예제 변경은 공개 renderer 소스를 바꾸지 않았다. 동시에 다른 세션이 수행한 Native RN Web focus host 수정은 별도 변경으로 보존했고 그 검증을 이번 실적으로 합산하지 않는다. 본 묶음 PNG 8개와 임시 로그 7개를 정리했고 root 날짜/시간 검사는 실패 PNG를 생성하지 않았다.

README의 실제 예제 후속 1~8은 실행했지만 전체 요청 완료로 판정하지 않았다. 사용자의 레거시 제거 요구와 달리 Native deprecated style 호환 통로가 남아 있음을 source에서 확인했다. 정식 host style을 보존하고 실제 소비 코드·대체가 없는 표현을 조사해 제거를 이어가며, 해당 미완료 범위는 README에 명시했다.
