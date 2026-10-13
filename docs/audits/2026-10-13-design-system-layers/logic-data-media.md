# 데이터·미디어·피드백·선택 어댑터 기능 검수

2026-10-13 · HJM `main` 공유 checkout. 기존 dirty 변경을 보존했고 커밋·설치·native build·전역 생성은 실행하지 않았다. 이 기록은 구성 60개 문서 감사와 별개의 **소스 로직 검수**다. 토큰·입력·overlay·화면의 병렬 담당 결과를 이 결과에 합산하지 않는다.

## 결과와 증거 경계

18개 결함군을 수정했다. 17개는 수정 전 행동 실패와 수정 후 통과를 확인했고, Native 원형 Progress는 기존 수식의 값 불일치를 소스로 확정한 뒤 0/25/50/75/100 host geometry 테스트를 추가했다. 초기 경로 지정 묶음 실행은 Web Chromium **13파일 57건**, Native mock host **17파일 94건**, 직접 contracts **14파일 138건** 통과다. 후속 실행은 아래 각 절에 구분하며 중복 합산하지 않는다. 타입/build는 부모 작업이 별도 수행한다.

Native 테스트는 `packages/react-native/vitest.config.ts`의 react-native/worklets 대체와 테스트별 optional engine mock을 사용한다. RN Reanimated, Gesture Handler, Carousel, Zoom Toolkit, Skia, Sortables, Screen Transitions, Keyboard Controller, Fast Confetti, Blobatar 10개는 로컬 resolve 가능함을 확인했으나 이것은 native runtime 동작 증거가 아니다. 실기기·시뮬레이터·native gesture·GPU/픽셀·OS 키보드·VoiceOver/TalkBack·성능·소비 앱·npm 게시·배포는 미실행이다. 최대 OS 글자 및 이를 모사하는 확대 조건은 범위 제외다.

## 수정한 결함

| ID | 근거 위치 | 재현 조건과 영향 | 변경 및 확인 |
| --- | --- | --- | --- |
| DM-01 | `packages/react/src/virtual-list.tsx:16` | focus가 든 key=1 행을 index 1→99로 옮기면 이전 index를 보존해 원래 DOM 행을 unmount하고 body로 focus가 빠짐 | active/focused를 stable key로 추적하고 창 밖 focus 행을 유지. Chromium에서 동일 버튼 DOM·focus·posinset100 유지 RED→GREEN. 후속 tokens 담당이 현재 행 삭제→같은 위치의 다음/마지막이면 이전/빈 목록이면 host로 복구하고 viewport scroll·외부 focus 보존·연속 ArrowUp도 확인(관련2파일15건) |
| DM-02 | `packages/react/src/supplemental-display.tsx:262`, `packages/react-native/src/data-display.tsx:1273` | A→B 교체 뒤 A의 늦은 error/load가 현재 Image 또는 외부 observer를 덮음. A→B→A 및 unmount 뒤 callback도 이전 시도를 구분 못함 | 요청 세대 token과 layout cleanup으로 상태·외부 callback 함께 차단. Web 2개·Native 2개 신규 행동 RED→GREEN |
| DM-03 | `packages/react-native/src/swipe-actions.tsx:19` | row A action pending 중 같은 view를 B로 재사용하고 B action 시작; A 완료가 B pending guard를 풀고 B를 닫음 | rowId 세대 확인 후 catch/finally를 처리. B 유지·중복실행 차단·B 완료 뒤 닫기 RED→GREEN |
| DM-04 | `packages/react/src/feedback.tsx:250` | label만 준 Progress의 보이는 이름과 native progress element가 연결되지 않아 이름 기반 progressbar 탐색 실패 | useId로 label과 aria-labelledby 연결. 명시적 aria-label/labelledby 우선 유지. Chromium accessible role/name RED→GREEN |
| DM-05 | `packages/react/src/toast.tsx:513` | document가 이미 hidden인 상태에서 Provider가 mount하면 첫 visibilitychange 전 timer가 진행 | listener 등록 때 현재 visibility도 반영. hidden 초기 pause와 visible 재개 RED→GREEN |
| DM-06 | `packages/react-native/src/feedback.tsx:652` | circular value0/100 모두 고정 3/4 border를 회전시켜 보이는 진행량이 같음 | 두 clipping 반원의 sweep으로 실제 fill을 변경. 0·25·50·75·100 geometry/접근 값 5건 통과. Native 픽셀 캡처 미실행 |
| DM-07 | `packages/react-native/src/feedback.tsx:1215` | StrictMode effect cleanup replay가 단독 Toast session을 interrupted로 닫아 card action이 시작부터 무효화 | mount 세대를 확인하는 deferred cleanup으로 실제 unmount만 interrupt. StrictMode에서 open action 정확히 1회 RED→GREEN |
| DM-08 | `packages/react-native/src/feedback.tsx:1201` | 3초 toast가 2초 표시 후 pause/resume되면 이미 지난 시간을 잃고 다시 3초 대기 | pause/resume/update 전 실제 elapsed를 session에 반영. 2초→5초 pause→남은1초 종료 fake-clock RED→GREEN |
| DM-09 | `packages/react/src/carousel.tsx:37`, `packages/react-native/src/carousel.tsx:41` | 유효 uncontrolled Carousel에서 현재 slide를 삭제하면 내부 old key가 남아 RangeError로 화면이 닫힘 | 이전 위치의 인접 항목/새 마지막으로 복구하고 callback1회·선택 dot·번호·버튼 경계를 동기화. old key 재삽입 시 선택 유지, 전면 교체도 검증. Web 삭제된 dot/card focus는 새 선택 dot으로 복구하고 유지된 버튼 focus는 보존. 양 renderer RED→GREEN; initial invalid default/controlled 오류 계약 유지 |
| DM-10 | `packages/react/src/advanced-display.tsx:132`, `packages/react-native/src/data-display.tsx:923` | 펼친 uncontrolled Accordion 항목을 삭제하면 old 값 검증 오류. Web focused trigger를 disabled로 바꾸면 비활성 대상에 포커스가 남음 | 삭제된 확장 값 제거/변경 알림1회/재삽입 때 닫힘, Web 삭제·disabled 대상의 다음 활성 trigger/group 포커스 복구. 펼친 본문은 disabled 뒤에도 유지. 초기 invalid default/controlled 오류 및 외부 focus 유지 확인. 양 RED→GREEN |
| DM-11 | `packages/react/src/advanced-display.tsx:273` | Avatar가 src A→B→A에서 img 노드를 재사용하여 이전 요청에 대응한 DOM error를 현재 사진에 적용할 수 있음 | src별 img 노드와 generation 격리. 브라우저에서 폐기 DOM의 error dispatch를 무시하고 현재 error만 fallback/observer1회 처리. Native는 기존 A→B→A guard 회귀를 재실행해 통과, 새 변경 없음. 실제 원격망 race를 측정했다는 주장은 아님 |
| DM-12 | `packages/react/src/supplemental-display.tsx:264`, `packages/react-native/src/data-display.tsx:1272` | 같은 src의 실패 뒤 Web srcSet 또는 Native sourceAdapter 헤더를 변경해도 error 상태가 유지되어 새 요청 host가 나오지 않음 | 실제 요청 identity(srcSet/sizes/request policy, Native resolved source)로 generation 구분. 새 후보/헤더로 loading→loaded 복구, 이전 callback 무시 양 RED→GREEN. 동일 내용 inline 함수 재생성으로 reset하지 않음 |

| DM-13 | `packages/react/src/statistic-motion.tsx:18` | NumberFlow 값 전환 중 document visibility를 hidden으로 변경해도 WAAPI 7개가 계속 running | ref 수명에서 visibility listener 등록 및 숨김/호스트 제거 시 finish. 최종 숫자와 completion promise 함께 정리. 실제 Chromium RED→GREEN; 숨김 중 새 값/빠른 변경/reduced motion 전환/unmount 추가 통과 |

| DM-14 | `packages/react/src/avatar-blobatar-motion.tsx:9` | IntersectionObserver 없는 host에서 optional animated fallback mount가 TypeError로 Avatar 전체를 실패시킴 | observer 지원 확인, 미지원이면 같은 seed/expression의 정적 artwork 유지. 실제 Blobatar renderer + browser API 부재 주입 RED→GREEN |
| DM-15 | `packages/react/src/statistic-motion.tsx:30` | NumberFlow 진행 중 viewport 밖 이동 후 6개 전환이 계속 running; 보이지 않는 값 갱신도 전환 | 실제 IntersectionObserver로 visible 추적, offscreen finish/animated=false. host 유지로 최신 값/접근 이름 반영, 재진입 후 다음 값부터 전환. Chromium RED→GREEN |

| DM-16 | Web/Native `gravity-letters.tsx`, `grid-reveal.tsx` | 두 번째 animation 생성이 실패하면 첫 animation과 상태가 정리되지 않고 본문까지 throw | 생성목록을 순차 축적하고 실패 시 이전 host animation stop/cancel, Native 값 전부 정적 상태로 복원. Web/Native 4개 host failure RED→GREEN |
| DM-17 | `packages/react/src/collapsible.tsx:38` | focused input이 있는 controlled disclosure를 외부에서 닫으면 keepMounted=false는 body로 focus 유실, true는 숨겨진 input에 focus 잔존 | content focus 소유 추적 후 trigger로 복구(동시 disabled면 host). 외부 focus 보존·보관된 draft DOM 유지. 두 경로 Chromium RED→GREEN; FolderPreview도 실제 소비로 확인 |
| DM-18 | `packages/react-native/src/collapsible.tsx:53` | disabled로 바뀐 뒤 host onPress가 전달되면 콜백과 내부 expanded 변경 | disabled/inline handler guard. Native host callback RED→GREEN. 실제 OS가 해당 늦은 press를 보냈다는 기기 재현은 아님 |

DataTable의 `selectedKey:null`과 `defaultSelectedKey` 동시 입력은 공개 `CollectionSelectionModel` union이 금지하는 조합이었다. 초기 runtime 재현 fixture와 방어 변경은 제거했으며 유효 API 결함/수정 건수에 넣지 않았다. 기존 다른 세션 변경은 원복하지 않았다.

## 파일별 소스 검토 inventory

아래 각 행은 해당 source의 본문을 읽고 상태·수명·입력 경계를 검토했다는 뜻이다. 행동 실행을 표시하지 않은 항목은 **소스 검토만 수행**했으며 기능 통과로 세지 않는다. style·정적 마크업 검토는 상태 분기 실행과 다르다. Native DataTable은 제공되지 않는다. `tree`/`text-formats`는 입력 담당, `sheet-gesture`는 overlay 담당이다.

| 파일 | 검토한 책임 | 실제 실행/한계 |
| --- | --- | --- |
| `packages/react/src/display.tsx` | Card 활성/disabled, ListRow loading·링크, static badge/tag | 소스 검토; 이 파일 전체 행동 테스트 미실행 |
| `packages/react/src/advanced-display.tsx` | Accordion 값/disabled/키, Avatar 실패, List 키, Statistic/Description/Table/Timeline | DM-10/11 추가 행동 실행; 모든 하위 컴포넌트 행동 전수는 미실행 |
| `packages/react/src/supplemental-display.tsx` | Icon resolver, Image 요청 세대·상태·의미, CounterBadge | DM-02; Web image 행동 실행 |
| `packages/react/src/data-table.tsx` | single/multi 선택, disabled select-all, sort, async status | Web data-table + keyboard 실행; invalid fixture 제외 |
| `packages/react/src/virtual-list.tsx` | 키, window clamp, 포커스 유지, empty, Native FlatList viewport | DM-01 Web; 양 data-layouts 실행. Native 실제 recycling 미실행 |
| `packages/react/src/masonry.tsx` | packing, 빈 데이터, 폭/높이 검증, source reading order/RTL | 양 data-layouts 실행; Native 실제 스크롤 미실행 |
| `packages/react/src/carousel.tsx` | controlled/uncontrolled 키, finite 경계, autoplay·focus/hover/AppState/reader cleanup | 양 carousel 실행; Native 실제 gesture/reader 미실행 |
| `packages/react/src/carousel-motion.tsx` | engine select/snap와 stable key, 경계, reduced motion, controlled intent | interaction-adapters 실행; Native engine mock |
| `packages/react/src/image-comparison.tsx` | 비율/값 계약, before-after 물리 좌표, Slider 위임/disabled | Chromium 키보드 양끝/증감·disabled·동적 비율·caption/값 표시 실행 |
| `packages/react/src/voice-note.tsx` | 재생 가능 상태, duration/position normalize, disabled·retry·seek | 양 voice-note 실행; 실제 오디오 엔진은 제품 소유/미실행 |
| `packages/react/src/step-player.tsx` | controlled playback, range/labels, disabled replay/play | 양 step-player 실행; 실제 재생 엔진 없음 |
| `packages/react/src/upload-item.tsx` | status→cancel/retry 파생, progress/null/error 발표 | 양 upload-item 실행; 실제 업로드·네트워크는 제품 소유/미실행 |
| `packages/react/src/feedback.tsx` | Notice/Empty/Result, Progress range/name, Skeleton 표시 | DM-04 Progress 및 Result primary/secondary·callback 교체·역할/액션 제거 실행; 슬롯만 받는 Notice/Empty는 정적 |
| `packages/react/src/toast.tsx` | session/store, action·press exactly-once, clock, focus/window pause, cleanup | DM-05; Web toast-press 실행 |
| `packages/react/src/internal/spinner.tsx` | 상태 이름·live semantics, decoration 분리 | 소스 검토; Native deprecated feedback 소비 실행 |
| `packages/react/src/content-transition.tsx` | retained subtree/focus, height observer, visibility/AppState, cancel cleanup | interaction-adapters 실행; 실제 Native animation 미실행 |
| `packages/react/src/sortable.tsx` | disabled item barrier, stale dataset drag, keyboard/a11y commit, cancel | 양 interaction-adapters 실행; Native sortable engine mock |
| `packages/react/src/swipe-actions.tsx` | async 중복실행, busy/disabled, Native recycled row identity | DM-03 Native; 양 interaction-adapters 실행 |
| `packages/react/src/statistic-motion.tsx` | Intl 최종값, reduced motion, Web 비라틴/RTL fallback | 실제 NumberFlow 0.6.2 Chromium 빠른 값 변경/visibility/reduced motion/unmount 실행; DM-13 |
| `packages/react/src/scroll-progress.tsx` | metrics normalize, Web observer/rAF cleanup, current host binding | 양 scroll-progress 실행 |
| `packages/react/src/celebration.tsx` | event dedupe, finite timer, visibility, delayed start, cleanup | interaction-adapters 실행; Native confetti mock |
| `packages/react/src/progressive-blur.tsx` | edge metrics, focus fallback, physical direction, decoration hit-test | 양 progressive-blur 실행; Native blur host mock |
| `packages/react/src/avatar-blobatar.tsx` | seed/expression validation, decorative fallback boundary | 실제 Blobatar local SVG data URI·이름/seed 분리·실패사진→fallback→교체사진 browser 실행 |
| `packages/react/src/avatar-blobatar-motion.tsx` | visibility/reduced motion, observer/listener cleanup | 실제 Blobatar CSS 실행/viewport·foreground·reducedMotion·seed변경·unmount; API 미지원 DM-14 |
| `packages/react/src/effect-surface.tsx` | active/visible/reduced, Web observer cleanup, host failure fallback | 실제 SVG WAAPI/IO viewport·reducedMotion·unmount 및 visibility 이벤트 실행; animate throw 주입 후 static/내용 유지 |
| `packages/react-native/src/data-display.tsx` | Badge/Tag/Card/ListRow/Avatar/Divider/Accordion/DescriptionList/Image/CounterBadge/List/Statistic/Timeline 본문 | DM-02/10/12; Image/Avatar/Accordion 및 Card/ListRow host 실행, 나머지는 소스 검토 |
| `packages/react-native/src/virtual-list.tsx` | 키, window clamp, 포커스 유지, empty, Native FlatList viewport | DM-01 Web; 양 data-layouts 실행. Native 실제 recycling 미실행 |
| `packages/react-native/src/masonry.tsx` | packing, 빈 데이터, 폭/높이 검증, source reading order/RTL | 양 data-layouts 실행; Native 실제 스크롤 미실행 |
| `packages/react-native/src/carousel.tsx` | controlled/uncontrolled 키, finite 경계, autoplay·focus/hover/AppState/reader cleanup | 양 carousel 실행; Native 실제 gesture/reader 미실행 |
| `packages/react-native/src/carousel-motion.tsx` | engine select/snap와 stable key, 경계, reduced motion, controlled intent | interaction-adapters 실행; Native engine mock |
| `packages/react-native/src/image-viewer.tsx` | open/reopen collection identity, loading/error/retry, navigation, retired callbacks | Native image-viewer-host 실행; Zoom Toolkit host mock |
| `packages/react-native/src/internal/image-inspection.tsx` | retry generation, mode/viewport 교체, pan bounds, readiness | Native image-inspection 실행; 실제 pan/zoom 미실행 |
| `packages/react-native/src/image-comparison.tsx` | 비율/값 계약, before-after 물리 좌표, Slider 위임/disabled | host layout 폭/비율/0·100 clipping·caption·접근 증감/disabled 실행 |
| `packages/react-native/src/voice-note.tsx` | 재생 가능 상태, duration/position normalize, disabled·retry·seek | 양 voice-note 실행; 실제 오디오 엔진은 제품 소유/미실행 |
| `packages/react-native/src/step-player.tsx` | controlled playback, range/labels, disabled replay/play | 양 step-player 실행; 실제 재생 엔진 없음 |
| `packages/react-native/src/upload-item.tsx` | status→cancel/retry 파생, progress/null/error 발표 | 양 upload-item 실행; 실제 업로드·네트워크는 제품 소유/미실행 |
| `packages/react-native/src/feedback.tsx` | Notice/Empty/Result, Progress range/name/ring, Skeleton cleanup, Native Toast lifecycle | DM-06/07/08; Progress/Toast, Result actions/announcement rAF, Skeleton loop/reducedMotion/cleanup host 실행 |
| `packages/react-native/src/toast-liquid.tsx` | generation callback, cancellation, fallback, presentation pause, PanResponder | Native toast-liquid 실행; Skia/Reanimated/gesture mock |
| `packages/react-native/src/internal/spinner.tsx` | 상태 이름·live semantics, decoration 분리 | 소스 검토; Native deprecated feedback 소비 실행 |
| `packages/react-native/src/content-transition.tsx` | retained subtree/focus, height observer, visibility/AppState, cancel cleanup | interaction-adapters 실행; 실제 Native animation 미실행 |
| `packages/react-native/src/sortable.tsx` | disabled item barrier, stale dataset drag, keyboard/a11y commit, cancel | 양 interaction-adapters 실행; Native sortable engine mock |
| `packages/react-native/src/swipe-actions.tsx` | async 중복실행, busy/disabled, Native recycled row identity | DM-03 Native; 양 interaction-adapters 실행 |
| `packages/react-native/src/statistic-motion.tsx` | Intl 최종값과 Native rise 전환/reduced motion | Animated host spy로 연속교체/배경정지/배경중최신값/복귀/unmount·listener 해제 실행; 실제 Native 프레임 미실행 |
| `packages/react-native/src/scroll-progress.tsx` | metrics normalize, Web observer/rAF cleanup, current host binding | 양 scroll-progress 실행 |
| `packages/react-native/src/celebration.tsx` | event dedupe, finite timer, visibility, delayed start, cleanup | interaction-adapters 실행; Native confetti mock |
| `packages/react-native/src/progressive-blur.tsx` | edge metrics, focus fallback, physical direction, decoration hit-test | 양 progressive-blur 실행; Native blur host mock |
| `packages/react-native/src/avatar-blobatar.tsx` | seed/expression validation, decorative fallback boundary | 실제 Blobatar path 생성 + SVG host mock으로 deterministic fallback/사진오류/교체 실행; Native 픽셀 미실행 |
| `packages/react-native/src/avatar-blobatar-motion.tsx` | visibility/AppState/reduced motion, listener cleanup | animated/static 엔진 host mock으로 gates/background mount/seed교체/foreground/구독해제 실행; 실제 Reanimated 미실행 |
| `packages/react-native/src/effect-surface.tsx` | active/visible/reduced, AppState cleanup, host failure fallback | Native SVG/Animated mock 실행(실패격리 포함); 실제 Native 프레임 미실행 |
| `packages/react-native/src/keyboard-controller.tsx` | provider preload false, clearance 음수 offset, scroll tap handling | 본문 검토만; OS keyboard/runtime 미실행 |
| `packages/react-native/src/screen-transition.tsx` | retained route accessibility·hit testing, stable id, reduced transition | interaction-adapters host mock 실행; 실제 navigation worklet 미실행 |
| `packages/react-native/src/internal/toast-presentation.ts` | presentation adapter/session callback seam, optional import 경계 | type seam 본문 확인; 자체 runtime 없음 |

| `packages/react/src/gravity-letters.tsx` | active/replayKey/glyph교체·reduced/visibility·부분 시작 실패 정리 | decorative lifecycle 및 기존 gravity 테스트; DM-16 |
| `packages/react/src/grid-reveal.tsx` | ready/active·reduced/visibility·부분 생성 실패 마스크 정리 | decorative lifecycle 및 기존 grid 테스트; DM-16 |
| `packages/react/src/thinking-orb.tsx` | 상태별 frame·canvas/Skia·RAF·visibility·OS preference·cleanup | Web 실제canvas/viewport2건; Native mock 상태/기본AppState2건. 최대글자 환경사례 제외 |
| `packages/react/src/collapsible.tsx` | controlled/uncontrolled·inline·disabled·keepMounted·닫힘 focus | Web keyboard/외부닫힘4건; Native host toggle/유지/disabled3건. DM-17/18 |
| `packages/react/src/folder-preview.tsx` | Collapsible 위임·preview inert·controlled 거부/재시도·disabled | 양쪽 전용2건; Web 외부닫힘 focus 및 Native 실제Pressable 전달 |
| `packages/react-native/src/gravity-letters.tsx` | active/replayKey/glyph교체·reduced/visibility·부분 시작 실패 정리 | decorative lifecycle 및 기존 gravity 테스트; DM-16 |
| `packages/react-native/src/grid-reveal.tsx` | ready/active·reduced/visibility·부분 생성 실패 마스크 정리 | decorative lifecycle 및 기존 grid 테스트; DM-16 |
| `packages/react-native/src/thinking-orb.tsx` | 상태별 frame·canvas/Skia·RAF·visibility·OS preference·cleanup | Web 실제canvas/viewport2건; Native mock 상태/기본AppState2건. 최대글자 환경사례 제외 |
| `packages/react-native/src/collapsible.tsx` | controlled/uncontrolled·inline·disabled·keepMounted·닫힘 focus | Web keyboard/외부닫힘4건; Native host toggle/유지/disabled3건. DM-17/18 |
| `packages/react-native/src/folder-preview.tsx` | Collapsible 위임·preview inert·controlled 거부/재시도·disabled | 양쪽 전용2건; Web 외부닫힘 focus 및 Native 실제Pressable 전달 |

renderer/내부 seam **62파일**. 직접 상태 계약은 다음 **16파일** 본문을 대조했다. 공통 foundations/semantic color/전체 recipe catalog를 이번 기능 검사에서 재전수한 것은 아니다.

| 직접 계약 파일 | 검토 내용 | 실행 |
| --- | --- | --- |
| `packages/design-contracts/src/data-table.ts` | Collection 선택/async 공유, sort cycle, disabled rows | data-table 1파일 |
| `packages/design-contracts/src/virtual-list.ts` | finite geometry·clamp·unique keys | data-layouts |
| `packages/design-contracts/src/masonry.ts` | positive geometry, shortest column, source order | data-layouts |
| `packages/design-contracts/src/image.ts` | descriptor validation, fallback meaning, inspection bounds | image, image-inspection |
| `packages/design-contracts/src/carousel.ts` | stable selected key, finite intent, autoplay constraints | carousel |
| `packages/design-contracts/src/voice-note.ts` | metadata/position bounds, canPlay/canSeek | voice-note |
| `packages/design-contracts/src/upload-item.ts` | state union→action, labels, range, duplicate IDs | upload-item |
| `packages/design-contracts/src/progress-recipe.ts` | linear/circular 동일 range, size/stroke recipe | renderer progress-ring 및 Web Progress 소비 검사 |
| `packages/design-contracts/src/toast.ts` | session phase/revision, control reentry, timer pause, queue/overflow/dispose | toast, toast-press |
| `packages/design-contracts/src/toast-liquid.ts` | anchor/layout fit, bounds, animated geometry | toast-liquid |
| `packages/design-contracts/src/interaction-adapters.ts` | reorder disabled barriers/intent, IDs/actions, event validation | interaction-adapters |
| `packages/design-contracts/src/effect-surface.ts` | deterministic sampling, finite bounded cost, active default | effect-surface |
| `packages/design-contracts/src/scroll-progress.ts` | unmeasured vs fit, logical offset clamp, edge tolerance | scroll-progress |
| `packages/design-contracts/src/progressive-blur.ts` | focus/edge visibility, bounded layers, RTL side | progressive-blur |
| `packages/design-contracts/src/avatar-fallback.ts` | initials, seed identity, allowed expressions/active default | 이번 전용 계약 행동 미실행 |
| `packages/design-contracts/src/reference-controls.ts` | ImageComparison same ratio/value validation; Rating는 입력 담당 | 이번 ImageComparison 전용 계약 행동 미실행 |

## 실제 실행 명령

최종 묶음 전의 RED/개별 GREEN 실행은 위 재현 근거이며, 아래 최종 결과에 중복 합산하지 않는다. 경로 없는 테스트나 패키지 전체 테스트는 하지 않았다.

```sh
pnpm --filter @hjmds/react exec vitest run --config vitest.browser.config.ts test/data-media-lifecycle.browser.test.tsx test/data-layouts.browser.test.tsx test/data-table.browser.test.tsx test/data-table.keyboard.browser.test.tsx test/layout-image.browser.test.tsx test/carousel.browser.test.tsx test/interaction-adapters.browser.test.tsx test/voice-note.browser.test.tsx test/step-player.browser.test.tsx test/upload-item.browser.test.tsx test/toast-press.browser.test.tsx test/scroll-progress.browser.test.tsx test/progressive-blur.browser.test.tsx
# 13 files, 57 passed
pnpm --filter @hjmds/react-native exec vitest run test/data-layouts.test.tsx test/image-lifecycle.test.tsx test/avatar-image-host.test.tsx test/image-viewer-host.test.tsx test/image-inspection.test.tsx test/carousel.test.tsx test/interaction-adapters.test.tsx test/voice-note.test.tsx test/step-player.test.tsx test/upload-item.test.tsx test/toast-press.test.tsx test/toast-liquid.test.tsx test/progress-ring.test.tsx test/deprecated-style-feedback.test.tsx test/scroll-progress.test.tsx test/progressive-blur.test.tsx test/effect-surface.test.tsx
# 17 files, 94 passed
pnpm --filter @hjmds/design-contracts exec vitest run test/data-layouts.test.ts test/data-table.test.ts test/image.test.ts test/image-inspection.test.ts test/carousel.test.ts test/interaction-adapters.test.ts test/voice-note.test.ts test/upload-item.test.ts test/toast.test.ts test/toast-press.test.ts test/toast-liquid.test.ts test/scroll-progress.test.ts test/progressive-blur.test.ts test/effect-surface.test.ts
# 14 files, 138 passed
```

### 후속 후보 확정 검사

Carousel 삭제 후보를 별도 판단으로 남기지 않고 이어서 실행했다. 추가 source 변경 뒤 아래 지정 검사가 통과했다(앞 묶음과 중복 실행이므로 단순 합산하지 않는다).

```sh
pnpm --filter @hjmds/react-native exec vitest run test/carousel.test.tsx
# 12 passed
pnpm --filter @hjmds/react exec vitest run --config vitest.browser.config.ts test/carousel.browser.test.tsx -t 'recovers an uncontrolled|requests a controlled|keeps keyed|stops autoplay|initially invalid'
# 6 passed, 7 skipped
pnpm --filter @hjmds/design-contracts exec vitest run test/carousel.test.ts
# 23 passed
```

직접 계약 `UncontrolledCarouselSelection`의 설명과 기존 `usage/components/carousel.md`에 위치 보존 규칙/초기 오류 경계를 덧붙였다. 공개 API 이름이나 export는 추가하지 않았다. tokens 담당의 VirtualList 삭제 복구 검사2파일15건과 inputs 담당의 CounterBadge2건은 각각 그 담당의 실행 증거다.

## 미실행 분기와 남은 판단

- VirtualList 현재 focus 행 삭제는 후속 병렬 검수로 해결했다. 중간/마지막/전체 삭제, 외부 focus 보존, 재정렬→창 밖 이동→삭제 회귀를 `data-media-lifecycle.browser.test.tsx`에 추가했고 관련2파일15건을 통과했다. 실제 Native FlatList recycling은 여전히 미실행이다.
- Carousel uncontrolled 삭제 후보는 DM-09로 재현·수정했다. 남은 항목의 선택/번호/버튼 및 Web focus를 복구한다. 최초 잘못된 default, 명시적 controlled invalid key, 빈 collection은 계속 오류이며 검증을 느슨하게 하지 않았다.
- Image의 src 교체·A→B→A·unmount에 이어 동일 src key-remount, Web srcSet 변경, Native sourceAdapter 헤더 변경은 아래 4군 후속 검수에서 실행·수정했다. 실제 외부 cache/네트워크 엔진 동작은 미실행이다.
- Avatar/Accordion의 이번 후속 mutation 검사는 아래 4군 절에 기록했다. Statistic/List/Timeline을 포함한 모든 호스트 조합을 전부 실행했다는 뜻은 아니다. Native CounterBadge 조건부 theme hook은 입력 담당이 early-return 위로 옮겼고 0↔양수/접근 이름2건을 통과했다. 기존 React에서 runtime crash는 재현되지 않아 규칙 보정으로 분류했다([입력 보고서](logic-inputs.md)).
- 독립 Toast의 focus pause와 StrictMode는 실행했다. 실제 background OS 전환·foreground reader 발표, 동시에 여러 포인터와 focus 이동, 실제 native spring 완료/취소는 미실행이다. Region/store 테스트와 독립 Toast 검사를 섞어 플랫폼 전체 완료로 쓰지 않는다.
- Native 원형 Progress는 source/host geometry까지 확인했다. iOS/Android border clipping 픽셀·aliasing 확인은 남아 있다.
- Keyboard Controller의 OS 이동, Screen Transition의 실제 navigation/worklet, Native animated Avatar와 Native 숫자 전환의 실제 프레임 동작은 미실행이다. Web animated Avatar는 아래 실제 CSS engine으로 실행했다. Web NumberFlow·EffectSurface는 아래 실제 Chromium 실행으로 보강했다. 설치/resolve·mock callback·typecheck로 대체하지 않는다.
- 외부 product의 upload/audio/request 성공·실패·재시도는 host 소유이며 실제 네트워크·파일·사용자 데이터에 작업하지 않았다.

## 공유 작업과 정리

수정한 source는 Web `virtual-list`, `supplemental-display`, `feedback`, `toast`; Native `data-display`의 Image, `swipe-actions`, `feedback`의 Progress/standalone Toast다. 후속 Carousel 양 source/선택 계약 설명/기존 usage 지침을 위 DM-09 범위로 변경했다. 기존 Carousel 변경을 보존했다. ImageViewer·Toast contract·Toast Liquid 등 dirty 구현은 읽고 관련 테스트만 실행했다. 부모의 build/dist 생성 및 다른 담당의 수정은 보존했다. 새 회귀 테스트는 재사용 증거로 유지하고 이번 실패 실행이 만든 screenshot 7개와 보고서 생성용 임시 Python만 정리했다. 브랜치·워크트리·서버·native build를 새로 만들지 않았다.


## 기본 표시 4군 후속 검수 (2026-10-13)

사용자의 계속 수정 지시에 따라 Card/ListRow, Accordion, Avatar, same-src Image의 공개 API 흐름을 추가 실행했다. DM-10~12를 수정하고 기존 Accordion/Image/Avatar 사용 지침에 복구 규칙을 짧게 기록했다. 기존 다른 세션 source 변경은 보존했다.

- **Card/ListRow:** Web selected Card를 disabled pending으로 바꾸고 loading ListRow를 다시 ready로 복구해 클릭 차단/재개·선택값·loading 접근 이름·disabled href 제거를 확인했다. Native는 Card disabled guard와 ListRow `disabled + accessibilityState.busy` 상태/선택·재개를 확인했다. Native ListRow에 없는 loading prop을 있다고 가정하지 않았다. 이 경로에서는 새 기능 결함을 찾지 않았으며 API를 늘리지 않았다.
- **Accordion:** 초기 default/controlled invalid 값은 오류 유지. 현재 expanded 삭제→변경 알림1회→재삽입 시 닫힘을 양쪽 실행했다. Web panel 내부 입력 삭제 포커스·새 disabled trigger 포커스·외부 포커스 보존을 실행했다. Native의 실제 VoiceOver 포커스 이동은 미실행이며 host props 검사와 구분한다.
- **Avatar:** Web data URI로 네트워크 실패를 배제하고 폐기 img 노드의 error 이벤트/현재 error를 구분했다. Native 기존 host A→B→A 회귀3건은 계속 통과했다.
- **Image:** 동일 URL의 명시적 `key={attempt}` remount 재시도는 양쪽 정상. 같은 URL의 Web 새 srcSet·Native 새 sourceAdapter 헤더는 실패를 재현해 수정했다. adapter 함수 identity만 바뀌는 경우를 요청 재시도로 취급하지 않는다. adapter 구현 교체만 필요한 경우도 Image host key로 명시적 새 수명을 시작한다.

```sh
pnpm --filter @hjmds/react exec vitest run --config vitest.browser.config.ts test/display-lifecycle.browser.test.tsx test/accordion.keyboard.browser.test.tsx test/data-media-lifecycle.browser.test.tsx
# 3 files, 19 passed
pnpm --filter @hjmds/react-native exec vitest run test/display-lifecycle.test.tsx test/avatar-image-host.test.tsx test/image-lifecycle.test.tsx test/accordion-actions.test.tsx test/card-activation.test.tsx test/deprecated-style-data-display.test.tsx
# 6 files, 40 passed
```

위 결과는 앞선 실행과 중복되므로 단순 합산하지 않는다. 같은 src에 대해 실제 네트워크/cache 엔진·인증 서버·기기 화면을 실행한 것은 아니다. 이 후속 실행의 실패 screenshot4개도 결과 기록 후 정리했다.


## ImageComparison·웹 장식/숫자 모션 후속 검수 (2026-10-13)

- **ImageComparison:** Web 실제 keyboard Home/End/ArrowRight로 0/100 경계, disabled→ready, 값의 접근 텍스트와 divider 일치, 이미지 비율/라벨 변경을 확인했다. Native는 onLayout 폭 320→160, 비율 2→1, divider 0/25/100, 이미지 전체 좌표 유지, 접근 증감/disabled 제거/재개를 host로 확인했다. 두 구현은 새 결함이 없어서 source를 변경하지 않았다. Slider 공개 min/max는 비교에서 고정 0/100이며 별도 동적 bounds prop이 있다고 가정하지 않았다.
- **EffectSurface:** mock 없이 Chromium IntersectionObserver와 SVG WAAPI가 실제 전진하는 것을 확인했다. viewport 밖 이동→복귀, reduced motion→복귀, unmount에서 정지/재개를 확인했다. `document.hidden` getter와 visibilitychange만 주입해 hidden→visible도 확인했다. 따라서 실제 OS 탭 전환 자동화로 표현하지 않는다. 이 경로는 새 source 변경 없이 통과했다.
- **AnimatedStatistic:** 실제 `@number-flow/react`/`number-flow` 0.6.2 custom element·shadowRoot·WAAPI를 사용했다. 10→120→5→1234 빠른 갱신 후 애니메이션 종료와 접근 최종값, 진행 도중 reduced motion 전환, hidden 시 기존 전환 정리, hidden 중 값333 반영, visible 복귀 값777의 재전환, unmount 종료를 확인했다. 숨김 getter/이벤트는 제어했지만 animation engine은 대체하지 않았다. DM-13을 수정하고 기존 statistic 지침에 수명 설명을 추가했다.

```sh
pnpm --filter @hjmds/react exec vitest run --config vitest.browser.config.ts test/media-effects.browser.test.tsx
# 1 file, 5 passed
pnpm --filter @hjmds/react-native exec vitest run test/image-comparison.test.tsx
# 1 file, 2 passed
```

미실행: Native ImageComparison 실제 touch/스크린리더/픽셀, Native 숫자 애니메이션 engine, 외부 이미지 decoding/네트워크, 브라우저 전체 조합·실제 OS 탭 전환/성능. NumberFlow의 viewport 밖 최적화와 EffectSurface 엔진 실패 주입은 아래 다음 후속 검사에서 실행했다. 관련 실패 screenshot 1개만 기록 후 삭제했으며 재사용 회귀 파일은 보존했다. 설치·빌드·커밋·전역 테스트는 실행하지 않았다.


## Optional Avatar·모션 잔여 경로 후속 검수 (2026-10-13)

- Web static/animated Blobatar는 설치된 2.7.0 renderer와 실제 Chromium CSS animation을 실행했다. 정적 SVG seed 안정성·실패 사진 fallback·사진 교체, active 모션 프레임 전진·viewport 밖 정지/복귀·document hidden 정지/복귀·reduced motion 정지·seed 교체·unmount 정지를 확인했다. IO 부재는 API만 주입했으며 renderer는 대체하지 않았다(DM-14).
- EffectSurface `SVGElement.animate`가 throw하는 host를 주입해 정적 SVG/본문 버튼 유지 및 visibility 이벤트 반복에도 재시도 루프가 없음을 확인했다. NumberFlow는 실제 IntersectionObserver/WAAPI로 offscreen 전환 정리·보이지 않는 동안 새 값200/접근 이름·복귀 후300 전환을 실행했다(DM-15).
- Native static Blobatar는 실제 seed/path 생성 코드와 mock SVG host를 사용했다. Animated Blobatar는 엔진 두 개를 mock host로 대체해 시작 background, active/visible/reducedMotion gates, 같은 subtree seed 교체, foreground 재개, AppState listener 해제를 확인했다. 실제 Reanimated frame callback이 멈췄다는 증거가 아니다.
- Native AnimatedStatistic은 실제 ContentTransition 연결에 timing spy를 주입해 이전 전환 stop, 연속 값 교체, background stop, background 중 최신값4 반영 및 새 timing 없음, foreground 다음 값5 재개, unmount stop/listener 해제를 확인했다. 기본 mock은 timing을 동기 완료하므로 이 추가 검사는 stop 호출을 직접 측정했다.

```sh
pnpm --filter @hjmds/react exec vitest run --config vitest.browser.config.ts test/avatar-blobatar-motion.browser.test.tsx test/avatar-blobatar.browser.test.tsx test/media-effects.browser.test.tsx
# 3 files, 10 passed
pnpm --filter @hjmds/react-native exec vitest run test/avatar-blobatar.test.tsx test/avatar-blobatar-motion.test.tsx test/statistic-motion.test.tsx
# 3 files, 5 passed
```

Source 변경은 Web `avatar-blobatar-motion.tsx`/`statistic-motion.tsx`의 실패·가시성 처리다. 공개 API 추가 없음. Native engine/GPU·실기기/AppState OS 전환·스크린리더/성능은 미실행이다. Web document visibility getter/event 주입을 실제 OS 탭 전환으로 주장하지 않는다. 이번 RED screenshot 2개만 결과 기록 후 삭제했다. 기존 dirty·재사용 테스트는 보존하고 설치·native build·commit은 수행하지 않았다.


## 공개 API 누락 대조 뒤 장식·접기 5군 실행 (2026-10-13)

공개 대응표와 usage 목록을 파일 단위가 아닌 실제 공개 이름/handler 기준으로 대조했다. 상태가 없는 CodeBlock의 copyAction 슬롯, read-only Steps/ActivityHeatmap, AssetGroup 같은 배치 companion을 독립 행동 완료 숫자로 채우지 않았다. 아직 직접 행동 근거가 없는 API 후보는 부모에 메시지로 넘겼고 이 절은 배정된 GravityLetters/GridReveal/ThinkingOrb/Collapsible/FolderPreview 양쪽 범위만 기록한다.

- Web GravityLetters/GridReveal은 실제 WAAPI로 재생·replay/ready·reduced/active·document hidden·unmount를 확인했다. 두 번째 animate 호출에만 실패를 주입해 첫 animation 정리와 정적 내용 유지를 확인했다(DM-16). Native도 timing 생성 중간 실패를 주입했고 초기 값 복원/기존 timing stop, background stop 및 AppState listener 해제를 확인했다. 초기 실패는 공유부하 아래 발생했지만 throw/명시 callback 불일치로 재현됐고 이후 worker1 순차 GREEN으로 확인했다.
- Web Collapsible는 Tab/Enter/Space, controlled 외부닫힘(keepMounted 양쪽), 외부 focus 보존, disabled 클릭을 실행했다. FolderPreview의 실제 trigger를 통해 owner가 open 변경을 거부한 뒤 연속 요청2회, 수락, 외부닫힘 초점 복귀, disabled 차단을 확인했다. Native는 실제 Collapsible Pressable host를 통과하는 동일 controlled 요청/disabled와 보관된 content 수명·접근성 숨김을 확인했다. Native OS 스크린리더 초점 복귀는 미실행이다.
- ThinkingOrb Web은 실제 Canvas pixels의 진행/정지·theme ink·viewport 밖 정지/복귀·observer cleanup을 확인했다. Native는 Skia/Reanimated mock으로 상태/크기·AppState/reducedMotion/active·RAF/paint dispose를 확인했다. 새 결함은 발견하지 않았다. 큰 글자 전용 Web1건과 Native 환경 매개변수5건은 명시 제외했다.

```sh
pnpm --filter @hjmds/react exec vitest run --config vitest.browser.config.ts test/decoration-lifecycle.browser.test.tsx test/collapsible.keyboard.browser.test.tsx test/folder-preview.browser.test.tsx test/gravity-letters.browser.test.tsx test/grid-reveal.browser.test.tsx test/thinking-orb.browser.test.tsx -t '^(?!.*large-text).*$' --maxWorkers=1
# 6 files, 14 passed, 1 excluded
pnpm --filter @hjmds/react-native exec vitest run test/decoration-lifecycle.test.tsx test/collapsible-actions.test.tsx test/folder-preview.test.tsx test/gravity-letters.test.tsx test/grid-reveal.test.tsx test/thinking-orb.test.tsx -t '^(?!.* environment).*$' --maxWorkers=1
# 6 files, 13 passed, 5 excluded
```

설치/네이티브빌드/커밋/전수 테스트 없음. 전체 기기와 optional GPU 엔진 실행은 여전히 미실행이다. 이번 명시 재현 screenshot4개만 결과 기록 뒤 제거했고 다른 작업 증거는 보존했다.


## 마지막 명시 갭: Result·Native Skeleton (2026-10-13)

Result 양쪽은 secondary→primary 실제 버튼 순서 및 분리 callback, actions 교체 후 최신 callback만 호출, Web failure→success→info 역할과 버튼 제거를 실행했다. Native Result의 rAF는 초점 이동이 아니라 **iOS 실패 문구 발표 예약**이다. host frame queue에서 이전 문구 취소→최신 문구1회, success 전환·unmount 시 취소를 확인했다. Native Skeleton은 실제 component와 Animated.loop spy로 최초 시작, reducedMotion 정지, 재활성화, animated=false 정지, unmount 정지 호출을 확인했다. 이 지정 경로에서 새 결함은 발견하지 않아 source 변경을 추가하지 않았다.

```sh
pnpm --filter @hjmds/react exec vitest run --config vitest.browser.config.ts test/result-actions.browser.test.tsx --maxWorkers=1
# 1 file, 1 passed
pnpm --filter @hjmds/react-native exec vitest run test/result-skeleton-lifecycle.test.tsx --maxWorkers=1
# 1 file, 3 passed
```

실제 iOS 발표·접근성 초점·Native Animated GPU frames·background OS scheduling은 미실행이다. Native rAF/loop spy를 플랫폼 엔진 실행으로 세지 않는다. 테스트 파일은 재사용 회귀로 보존하며 추가 설치/build/commit은 하지 않았다.
