# React·React Native 컴포넌트 완성 작업

기준: 2026-09-16 · 사용자 요청: Flutter 제외, React/RN을 채우고 토스 UI를 중심 모티브로 사용.
이전 8개 앱 감사의 작은 수정 묶음과 별도인 지속 작업이다. 목록 등록만으로 완료하지 않는다.

## 완성 기준

- 지원 플랫폼의 공개 renderer, 타입·granular export, 실제 조작 가능한 Showcase를 제공한다.
- 키보드/터치·focus·선택·비동기 상태·큰 글자·RTL·dark·reduced motion 중 해당하는 계약을 검증한다.
- 외부 비교를 API와 시각 결정에 연결한다. 의도적으로 합성하는 항목은 작동하는 합성 예제를 제공한다.
- 기존 입력 설명/focus·Dialog 종료 계약과 토스 모티브의 목록/제목/하단 행동 영역도 보강한다.
- 전체 구현과 검증을 마친 뒤 minor 버전으로 패키지를 게시하고 모든 React·React Native
  소비 앱의 dependency·lockfile·계약·표준 projection을 갱신해 회귀 검증한다. Flutter는 제외한다.
- 원본 catalog·evidence에서 projection을 생성한다. 지원하지 않는 플랫폼과 검증되지 않은
  stable 승격을 완료 숫자로 바꾸지 않는다. 모든 필수 항목이 끝나기 전 전체 목표는 진행 중이다.

## 시각적 중심: 토스 UI

이번 명시 요청으로 TDS를 가장 우선하는 시각 참조로 둔다. 기존 HJM의 조용한 canvas,
명확한 주 행동, 읽기 쉬운 목록이라는 정체성과 연결한다.

| 참조 | 확인한 원칙 | HJM 적용 |
| --- | --- | --- |
| [TDS ListRow](https://tossmini-docs.toss.im/tds-mobile/components/ListRow/list-row-overview/) | leading/content/trailing의 위계와 행 밀도 | 장식 카드보다 평평한 목록, 제목/설명/보조 행동의 정렬, compact/comfortable 예제 |
| [TDS Button](https://tossmini-docs.toss.im/tds-mobile/components/button/) | 행동 중요도·크기·진행 상태의 구분 | 주요 fill 하나, 보조 tint/ghost, 짧은 명시적 문구, loading 크기 보존 |
| [TDS BottomCTA](https://tossmini-docs.toss.im/tds-mobile/components/BottomCTA/check-first/) · [FixedBottomCTA](https://tossmini-docs.toss.im/tds-mobile/components/BottomCTA/fixed-bottom-cta/) | 본문과 마지막 행동을 연결하는 하단 영역 | Web 지원 추가, 본문 가림·safe area·큰 글자·두 행동 배치 검증 |
| [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) | focus·dismiss·controlled 구성 | overlay 종료와 focus 복구 후 다음 overlay 연결 |
| [React Aria Calendar](https://react-aria.adobe.com/Calendar) | 날짜 탐색·현지화·접근 가능한 선택 | 현재 Calendar 계약을 실제 Web/RN 화면으로 연결 |
| [Ant Design 목록](https://ant.design/components/overview/) | 입력·탐색·데이터·피드백 범위 | 누락 목록 점검, 데스크톱 기능과 모바일 표현을 구별 |
| [MUI composition](https://mui.com/material-ui/guides/composition/) | 합성 시 host 의미와 전달 props 보존 | 링크/버튼/행의 중첩 제어와 공개 ref 경계 검증 |
| [WAI Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) | 숨긴 카드의 focus 제외, 수동 이동·재생 정지 | stable key, 위치 표시, 비활성 카드 격리, 기본 자동재생 없음 |

토스의 자산·폰트 파일·구현을 포함하지 않고 위 구성을 HJM 토큰과 독립 코드로 구현한다.
검증 화면은 같은 데이터로 Web/RN을 비교하며 한영 장문, 320px, 큰 글자를 포함한다.

## 전체 누락 목록과 작업 순서

초기 catalog는94종, Web/RN 각63개 renderer다. 아래26개는 planned에 포함된 기능/합성 범위다.
공통화를 거절한 AppProvider/BorderBeam/Utility3개는 별도 컴포넌트를 만들지 않는 기존 결정이다.
Context 배선/정적 토큰 사용은 예제로 설명하며 BorderBeam은 모티브의 정보 위계에 맞지 않는다.

| 묶음 | 대상 | 지원 방식 | 상태 |
| --- | --- | --- | --- |
| 이동·모바일 구조 | Carousel, FloatingActionButton; Web TopBar/BottomCTA 보완 | React/RN, Web의 safe area와 RN 터치 관습 반영 | 구현·로컬 검증 완료, 앱 채택 대기 |
| 날짜·선택 | Calendar, TimePicker, Rating | React/RN, 합성도 공개된 사용 경로와 동작 예제로 완결 | Calendar 구현·검증, TimePicker/Rating 작동 조합 제공 |
| 계층·다중 선택 | Mentions, TransferList, Cascader, TreeSelect, Tree | Web 완전 탐색, RN에서 계약이 지원하는 흐름 | Tree·TransferList·Mentions는 Web renderer 완료(RN 미구현), TreeSelect·Cascader는 조합으로 제공 |
| Web 탐색 | Breadcrumb, Pagination, Anchor, CommandPalette | React의 키보드·링크·scroll 계약 | 네 개 모두 구현·로컬 검증 완료 |
| 보조 표면 | Popover, ConfirmPopover, SidePanel, Tour, Splitter | React; 모달/비모달·focus 경계 보존 | Popover·SidePanel·Tour·Splitter 구현·로컬 검증 완료, ConfirmPopover는 조합으로 제공 |
| 데이터·배치 | DataTable, Masonry, VirtualList, QRCode | 계약별 플랫폼 구분; 가상화/코드 생성은 실제 출력 검증 | DataTable 구현 완료. 나머지 셋은 각 문서의 "검증할 화면이 없음" 판정이 유효해 planned 유지 |
| 기타 Web 기능 | ColorPicker, Watermark, Affix | React의 해당 기능, 명시된 지원 범위 | 세 문서 모두 "만들지 않는다" 판정이라 구현하지 않는다(아래 근거) |
| 기존 품질 | Field/TextArea 설명·Checkbox focus, Dialog 종료, ListRow/Section/버튼 조합 | React/RN + 토스 모티브 실제 화면 | 전부 완료 |

플랫폼 자체가 다른 Web 전용 기능을 RN에 이름만 같은 빈 wrapper로 추가하지 않는다.
누락 구현과 합성 예제, 의도적 비지원은 각각 증거를 남긴다. 새 공개 API는 Changeset에 기록한다.

## 실행 기록

- 2026-09-16: 현재 소스/미커밋 변경을 재확인하고 위 공식 문서를 비교했다.
- Web TopBar/BottomCTA 추가. 작은 화면의 상단 행동 줄바꿈, 큰 글자의 footer flex 높이,
  busy 버튼 폭·focus, sticky 본문 가림을 검증했다. [설계와 사용법](./screen-chrome.md).
- Web/RN Switch의 `labelVisibility`와 설정 조합 예제 추가. Web List의 들여쓴 구분선이
  행 전체를 이동시키던 문제와 Button/IconButton의 `aria-disabled` 전달 누락을 수정했다.
- Web/RN Carousel 추가. Web keyboard·숨김·controlled·autoplay 및 Native swipe·adjustable·
  screen-reader/reduced-motion guard를 검사했다. [API와 근거](./carousel.md).
- 브라우저에서 320px 설정 선택/저장, 2배 글자·dark·RTL의 정렬, Carousel 이동과 focus
  유지를 확인했다. Showcase의 옛 BottomCTA/Carousel 데모 CSS를 제거하고 클래스 중복을
  검사한다. 실제 Native 기기·배포 검증은 아직 아니다.
- 현재 독립 renderer 지원은 Web 71 / Native 66다. stable은 각 4개로 유지한다. planned 23개에는
  기존 declined 3개와 완성된 TimePicker/Rating 조합 2개가 포함되어 기능/합성 잔여는 18개다.
  조합은 새 renderer가 아니므로 지원 개수에 더하지 않는다. 이 기록은 전체 완료가 아니다.
- Breadcrumb/Pagination은 기존 공개 소스를 분리·보완했고 Table은 기존 Web 공개 소스가 있다.
  DataTable 작업에서는 기존 Table과 계약·API·검증·Showcase를 대조해 중복 구현을 피한다.
- minor 게시·모든 호환 앱 적용은 전체 구현 뒤 실행한다. 현재 버전은 1.1.1이며 게시 전이다.
- Carousel/chrome 묶음의 `pnpm ci:check` exit 0: contracts 731, Web SSR 134 + browser 120,
  Native 259 = 패키지 테스트 1,244개. Showcase Web 19 / Native 1, 타입·문서·evidence·
  플랫폼/번들 경계와 정적 Storybook 검증도 통과했다. 마지막 큰 글자 Carousel 배치는
  별도 browser 8개를 다시 통과했고 최종 빌드 후 번들 예산도 재확인했다.
- Native Metro Android production bundle: 577 modules, raw 1400.4 KiB / gzip 345.4 KiB.
  React Native 포함 pre-Hermes 측정이며 실제 기기 성능 수치나 설치 증거가 아니다.
- FAB 후속 묶음: Web/RN 공개 renderer·scroll hook·실측 본문 여백과 기록 작성 조합을 추가했다.
  [MUI FAB](https://mui.com/material-ui/react-floating-action-button/)의 원형/확장 행동 구분을
  비교하고 HJM의 큰 primary Button과 토스 모티브의 평평한 목록을 사용했다.
  모양 전환 중 동일한 버튼과 접근성 이름을 유지하고, micro motion 계약에 맞춰 reduced motion은
  즉시 전환한다. [API와 결정 근거](./floating-action-button.md).
- 브라우저 320px에서 작성 → 저장 → 첫 행 반영 → FAB focus 복귀, 목록 끝 도달과 축소를
  확인했다. 화면 조합의 자체 viewport에 Showcase padding이 중복돼 생기던 두 번째 scrollbar는
  명시적 `hjm.edgeToEdge` 옵션으로 제거했다. 일반 컴포넌트 데모의 여백은 그대로 유지한다.
- FAB 포함 `pnpm ci:check` exit 0: contracts 731, Web SSR 135 + browser 124, Native 263 =
  패키지 테스트 1,253개. Showcase Web 19 / Native 1, 타입·번들·문서·evidence·정적 Storybook도
  통과했다. Metro Android 578 modules, raw 1404.1 KiB / gzip 346.1 KiB (pre-Hermes).
  정적 Storybook은 Web renderer 67 / contract-only 27로 검증했다. 게시·제품 채택·기기 검증은 남아 있다.
- Calendar를 Web/RN 공개 entry로 추출하고 DatePicker가 같은 격자를 사용하도록 바꿨다.
  비활성 날짜 focus/활성화 분리, product-owned 경계 날짜·월 이동, default/controlled 선택,
  큰 글자·RTL·7열 최소 target·주석 행 정렬을 검증했다. [API와 근거](./calendar.md).
  DatePicker가 열린 채 disabled/readOnly로 바뀌는 경우에도 선택을 막고 비활성 상태를 알린다.
- 브라우저 320px에서 9월 30일 → 10월 1일 방향키 이동 중 선택 유지, Enter 확정, dark·RTL·
  2배 글자를 확인했다. Calendar의 옛 Showcase CSS를 제거하고 화면 조합의 제목/본문에만
  여백을 줘 기본 320px에서 7열을 보여준다. 더 좁은 호스트는 격자만 스크롤한다.
- TimePicker는 시·분 Select와 최종 확정·초기화, Rating은 Slider 정수/반점 입력·저장과
  Statistic 읽기 전용 평균 예제를 양쪽에 제공한다. 시만 선택하면 확정 불가, 23:59 확정·초기화,
  키보드 3 → 3.5점 변경·저장 흐름을 브라우저에서 확인했다. 독립 renderer/API를 추가한 것은 아니다.
  [시간 조합](./time-picker.md), [점수 조합](./rating.md). Native 기기 조작은 아직 검증하지 않았다.
- Calendar·조합 묶음 최종 `pnpm ci:check` exit 0: contracts 731, Web SSR 136 + browser 131,
  Native 268 = 패키지 테스트 1,266개. Showcase Web 19 / Native 1, 타입·문서·evidence·번들 경계와
  정적 Storybook(Web renderer 68 / contract-only 26)도 통과했다.
  Metro Android production은 579 modules, raw 1407.1 KiB / gzip 347.0 KiB (pre-Hermes).
- Calendar medium/large의 최소 날짜 target은 기존 recipe대로 모두 44px다. large는 글자 tier를
  바꾸며 target을 축소하지 않는다. 날짜 주석 영역을 확보해 점 유무에 따른 숫자 높이 차이를 막았다.
- 잔여 18개 기능/합성, 기존 Field/TextArea·Checkbox·Dialog 품질, minor 게시·모든 JS 소비 앱의
  dependency/lock/계약/projection 적용과 회귀 검증은 계속 진행한다. 버전은 아직 1.1.1이다.

- Web 탐색 묶음: Breadcrumb/Pagination을 granular entry로 분리하고 기존 root/navigation
  경로를 유지했다. Anchor는 문서·별도 스크롤 영역, section focus, reduced motion, fragment
  history와 동적 본문 관찰을 구현했다. Web 전용이며 Native wrapper를 추가하지 않았다.
  [Breadcrumb](./breadcrumb.md), [Pagination](./pagination.md), [Anchor](./anchor.md).
- Patterns/WebNavigation은 125개 기록의 페이지별 목록 교체와 보관함 왕복을 제공한다.
  경로 변경 후 사라진 링크 대신 새 본문으로 focus를 옮기며 초기 mount에서는 focus를 뺏지 않는다.
  Patterns/Anchor는 세 부분의 실제 읽기 가이드에서 목차·스크롤·focus를 연결한다.
- 탐색 묶음 `pnpm ci:check` exit 0: contracts 733, Web SSR 139 + browser 140,
  Native 268 = 패키지 테스트 1,280개. Showcase Web 19 / Native 1과 타입·문서·evidence·
  번들·정적 Storybook(Web 71 / contract-only 23 / unsupported 0)이 통과했다.
  Native Metro Android는 580 modules, raw 1409.2 KiB / gzip 347.5 KiB (pre-Hermes).
  Web 전용 Anchor 계약이 공통 metadata graph에 추가되어 Metro도 1 module 증가했다.
- 브라우저 320px·2배 글자·dark·RTL에서 경로와 페이지 버튼 줄바꿈을 확인했다. 마지막 페이지에
  121–125번째 기록이 보이고 상위 보관함으로 왕복한다. Anchor 마지막 목차를 누르면 해당
  본문으로 이동하며 current location·section focus가 일치하고 가로 넘침이 없었다.
  이 결과는 라이브러리 로컬 검증이며 제품 채택·배포·기기 검증을 뜻하지 않는다.

- 보조 표면 묶음(Popover): 이름 있는 비모달 dialog, 문맥 form의 초점 지정, 보호된 dismiss,
  자체 소유 중첩 portal, 뷰포트 충돌 시 대체 배치, 나가는 표면의 inert 처리를 구현했다.
  바깥 pointer/Tab이 향한 곳을 그대로 두고, 자식 popover가 감싸는 Dialog보다 Escape를 먼저 받는다.
  [API와 근거](./popover.md). ConfirmPopover는 새 renderer가 아니라 Popover의 확인/취소 조합으로
  제공하고 파괴적 동작은 AlertDialog에 남긴다. [조합 근거](./confirm-popover.md).
- Patterns/Popover는 필터 적용과 되돌릴 수 있는 보관 두 화면을 제공한다. 보관하면 트리거가
  사라지므로 제품이 초점을 보관 취소 버튼으로 옮기고, 초기 mount에서는 초점을 뺏지 않는다.
- 묶음 종료 시 두 예산이 실측에서 걸려 근거와 함께 올렸다. contracts 루트 barrel은
  111.8 -> 112.3 kB gzip인데 모듈별로 재면 catalog.js +522 B(Popover·ConfirmPopover maturity
  문구)와 나머지 190 B이고 maxModules는 Anchor 때의 71 그대로다 — 새 import 경로가 아니다.
  `@hjmds/react`의 `./popover` raw 43.0 kB는 마지막 focus/dismiss 보강 전 추정값이라
  실측 44.0 kB에서 걸렸고, 공유 모듈 6개가 그대로여서 다른 entry와 같은 약 8% 여유로 맞췄다.
  검사 생략이나 모듈 증가를 동반한 상향은 없다.
- Popover 포함 `pnpm ci:check` exit 0: contracts 733, Web SSR 140 + browser 151,
  Native 268 = 패키지 테스트 1,292개. Showcase Web 19 / Native 1, governance 20,
  타입·문서·evidence·번들 경계와 정적 Storybook(canonical 94 = Web renderer 72 /
  contract-only 22 / Web 미지원 0, navigation 13)도 통과했다.
  Metro Android production은 580 modules, raw 1409.2 KiB / gzip 348.1 KiB (pre-Hermes).
  이 실행은 라이브러리 로컬 검증이며 게시·제품 채택·기기 검증이 아니다.

- SidePanel(Web): 가장자리에 도킹하는 모달/비모달 보조 패널을 추가했다. 모달은 Dialog·Sheet와
  **같은** 모달 스택·스크롤 락·초점 복귀를 쓰고, 비모달은 스택에 들어가지 않으며 backdrop도
  만들지 않아 뒤 페이지가 계속 클릭·탭 가능하다. 논리 edge가 RTL에서 뒤집히고, dismiss는
  사유 하나를 보고하며 완료 콜백은 한 번만 온다. [계약과 renderer 근거](./side-panel.md).
- 이를 위해 모달 기계장치를 `packages/react/src/modal.tsx`로 분리했다. `overlays.tsx`에 두면
  SidePanel의 granular entry가 Menu·Tooltip 그래프까지 끌고 오고, 복사하면 `activeModalStack`이
  둘로 갈려 Dialog와 SidePanel이 서로를 최상위로 오인한다. 공개 API는 그대로이며
  `overlays`는 `OverlayTrigger`를 계속 재export한다.
- 구현 중 실제 결함을 하나 찾았다. 비모달 Escape handler가 effect 시점의 `contentRef`를
  잡아두면 portal이 한 commit 늦게 mount되므로 패널의 첫 키 입력에서 값이 null이다.
  이벤트마다 ref를 읽도록 고쳤고 `test/side-panel.browser.test.tsx`가 이 경로를 검사한다.
- 브라우저(chromium) 검증 6개: 도킹·초점 가둠·스크롤 락과 flush 모서리, RTL `start` 미러링과
  wide 560px, 비모달의 살아 있는 페이지·내부 Escape만 dismiss, 사유별 단일 보고와 busy 중
  outside 차단, controlled owner의 busy 종료와 1회 완료, 320px·2배 글자에서 가로 넘침 없음.
  `Patterns/SidePanel`은 기록 편집(모달)과 도움말(비모달) 두 화면을 제공한다.
- 예산은 실측으로 넷을 조정했다. `./side-panel` 45.9 kB raw / 11.0 kB gzip(6 modules),
  `./overlays`는 modal.js 분리로 6→7 modules(81.2/16.7 kB, 의존성 추가 아님),
  루트는 36→38 modules(322.3/66.3 kB, 바이트 한도 그대로), `./styles.css`는 도킹·크기·footer
  규칙 2.1 kB 증가로 105.8 kB raw. `./evidence`는 claim 하나분 메타데이터다.
- antd 대응표에서 decomposed Drawer의 두 갈래(Sheet·SidePanel)가 모두 구현되며
  partial maturity가 1 → 0이 됐다. fully mature 52 → 53이고 planned only 20은 그대로다.
- SidePanel 포함 `pnpm ci:check` exit 0: contracts 733, Web SSR 141 + browser 157,
  Native 268 = 패키지 테스트 1,299개. Showcase Web 19 / Native 1, 정적 Storybook은
  canonical 94(Web renderer 73 / contract-only 21 / Web 미지원 0)과 navigation 13이다.
  Metro Android는 580 modules, raw 1409.2 KiB / gzip 348.1 KiB (pre-Hermes) 그대로 —
  Web 전용 추가라 Native 그래프는 늘지 않았다. 게시·제품 채택·기기 검증은 여전히 남아 있다.
- 잔여 기능/합성은 17개다(Tour, Splitter, CommandPalette, Mentions, TransferList, Cascader,
  TreeSelect, Tree, DataTable, Masonry, VirtualList, QRCode, ColorPicker, Watermark, Affix와
  기존 Field/TextArea·Checkbox·Dialog 품질 항목). 버전은 아직 1.1.1이고 게시 전이다.

- Splitter(Web): 두 pane의 경계를 드래그·키보드로 옮긴다. 두 경로 모두 계약의 같은 숫자
  판정을 호출하므로 renderer에는 별도 산술이 없고, RTL에서는 드래그와 방향키가 **함께**
  논리 방향으로 뒤집힌다. pane 축이 아닌 방향키는 pane 콘텐츠의 것으로 남긴다.
  [계약과 renderer 근거](./splitter.md).
- Splitter 구현 중 실제 결함을 잡았다. `onValueChangeEnd?.(commit(next))`는 handler가
  없으면 optional call이 인자 평가까지 통째로 건너뛰어 키보드 조절이 조용히 죽는다.
  commit을 먼저 하고 알리도록 고쳤고, 경계에서 값이 그대로면 settle로 보고하지 않는다.
- Tour(Web): 제품이 소유한 opaque anchor 키를 `resolveAnchor`로 넘겨받아 단계 카드를
  붙인다. 초점은 단계마다 카드로 가고(anchor는 inert 배경), veil에는 dismiss handler가
  없어 바깥 pointer로 끝나지 않으며, 마지막 단계의 다음은 `complete`, unmount는
  `interrupted`로 한 번만 정산한다. [계약과 renderer 근거](./tour.md).
- Tour renderer가 `hjm-tour` 클래스를 소유하면서 Showcase의 옛 목업 CSS 규칙에서 그
  선택자를 제거했다. style-boundary 검사가 이 충돌을 잡아 준다 — DS-10에서 세운 규칙대로
  renderer가 생기면 데모 CSS를 먼저 비운다.
- 예산은 실측으로 넷을 조정했다. `./splitter` 8.9 kB raw / 2.9 kB gzip(2 modules),
  `./tour` 51.0 kB raw / 12.0 kB gzip(7 modules), 루트는 39→40 modules에 gzip
  66.3 → 69.9 kB(세 renderer 자체 코드, 새 의존성 없음), `./styles.css`는 Splitter·Tour의
  기능 CSS 3.4 kB 증가로 109.2 kB raw다.
- antd 대응표는 fully mature 55 / partial maturity 0 / planned only 18이 됐다.
- Splitter·Tour 포함 `pnpm ci:check` exit 0: contracts 733, Web SSR 143 + browser 168,
  Native 268 = 패키지 테스트 1,312개. Showcase Web 19 / Native 1, 정적 Storybook은
  canonical 94(Web renderer 75 / contract-only 19 / Web 미지원 0)과 navigation 13이다.
  Metro Android는 580 modules, raw 1409.2 KiB / gzip 348.1 KiB (pre-Hermes) 그대로다.
  게시·제품 채택·기기 검증은 남아 있다.
- 잔여 기능/합성은 15개다(CommandPalette, Mentions, TransferList, Cascader, TreeSelect,
  Tree, DataTable, Masonry, VirtualList, QRCode, ColorPicker, Watermark, Affix와 기존
  Field/TextArea·Checkbox·Dialog 품질 항목). 버전은 아직 1.1.1이고 게시 전이다.

- CommandPalette(Web): 모달 검색 표면과 결과 실행을 추가했다. 실행은 정책이 거부할 수 없는
  종료 사유이고, 다음 표면을 여는 명령은 팔레트가 사라진 뒤에 실행된다. 여는 단축키는
  제품 소유로 남긴다. [근거](./command-palette.md).
- DataTable(Web): 정렬 버튼을 header 안에 두고 방향을 `aria-sort`로 흘리며, tri-state
  선택이 disabled 행을 분모에서 뺀다. 표시 전용 표는 기존 `Table`이 그대로 담당한다 —
  둘의 경계를 [문서](./data-table.md)에 적었다.
- 기존 품질 두 건을 닫았다. Field/TextArea는 오류가 떠도 지원 문구를 계속 보여 주고
  `aria-describedby`를 소비자 값·설명·오류 순으로 병합한다. Dialog에는 Sheet와 같은
  `onDismissComplete`를 넣어 portal·초점 정리가 끝난 시점을 제품이 타이머로 추측하지
  않게 했다. Checkbox는 이미 ref가 input에 닿아 있어 회귀 테스트만 추가했다.
  [감사 항목 마무리](./product-audit-2026-09-15.md).

## 남은 planned 행에 대한 판정 (2026-09-18)

`Masonry`, `VirtualList`, `QRCode`, `ColorPicker`, `Watermark`, `Affix`는 "아직 못 만든
것"이 아니다. 각자 `docs/<id>.md`(Masonry는 `docs/catalog-decision-status.md`의 감사표)에
**검증할 화면이 없다 / 만들지 않는다**는 판정이 이미 적혀 있고, 뒤집히는 조건도 전부
"실제 제품 화면·엔지니어링 증거가 나타나면"이다. 그 조건이 아직 충족되지 않았으므로
renderer를 만들지 않고 planned로 남긴다 — 이번 작업에서 판정을 뒤집을 새 근거를 찾지
못했고, 근거 없이 계약을 여는 것이 이 표준이 금지하는 일이다.

따라서 **이 완성 작업의 구현 대상은 모두 닫혔다.** 남은 것은 구현이 아니라 릴리스다:
minor 게시, 모든 JS 소비 앱의 dependency·lock·계약·projection 갱신과 회귀 검증,
그리고 제품 우회(BurnTok Toast·Taground 설명 복사·Diairy Notice 등) 제거다.
Native renderer가 없는 Web 전용/Web 우선 항목(TransferList·Mentions의 RN 쪽 포함)은
catalog의 surface 행렬에 그대로 남아 있다.

## 마지막 전체 검증 (2026-09-18)

`pnpm ci:check` exit 0: contracts 733, Web SSR 148 + browser 198, Native 268 =
패키지 테스트 1,347개. Showcase Web 19 / Native 1, governance 20,
정적 Storybook은 canonical 94(Web renderer 80 / contract-only 14 / Web 미지원 0)과
navigation 13이다. Showcase 토큰 경계는 66개 선언·66개 문서화된 예외다.
Metro Android production은 580 modules, raw 1409.2 KiB / gzip 348.1 KiB (pre-Hermes)로
이번 추가가 전부 Web 전용이라 Native 그래프는 늘지 않았다.

contracts 루트 barrel은 478.4 kB raw / 113.1 kB gzip이며 maxModules는 71 그대로다 —
이번에 늘어난 것은 catalog의 maturity 문구뿐이고 새 import 경로는 없다. `@hjmds/react`
루트는 36 → 45 modules(370.8 kB raw / 77.4 kB gzip), `styles.css`는 119.5 kB raw /
18.7 kB gzip이다. 모든 예산 조정에 실측값과 근거를 주석으로 남겼고 검사 생략은 없다.

이 결과는 라이브러리 로컬 검증이다. npm 게시, 제품 채택, 실제 기기·보조기기 검증은
아직 하지 않았다.

## 커버리지 감사 후속 — P0 (2026-09-18)

메타 저장소의 커버리지 감사(`app-portfolio` 저장소 `docs/design/HJM_COVERAGE_AUDIT_2026-09-18.md`)가
"새 제품이 첫 주에 막히는 것"으로 꼽은 항목을 닫았다. `@hjm/icons`는 외부 아이콘
라이브러리를 쓰기로 한 사용자 결정(2026-09-18)에 따라 범위에서 뺐다.

- **Agreement**(Web/RN): 전체 동의는 항목의 합에서 파생하고 저장되지 않는다. 필수 항목만
  제출 가능 여부를 정하고, 필수이면서 비활성인 항목은 descriptor가 거절한다 — 사용자가
  영원히 진행할 수 없는 화면이 조용히 만들어지는 것을 막는다. 전문 보기는 체크박스와
  다른 tab stop이고 눌러도 동의되지 않는다. [계약](./agreement.md).
- **Top**(Web/RN): 화면 본문의 첫 제목 블록. 고정 크롬인 TopBar와 분리했고 실제 heading
  요소를 낸다. BurnTok `AppScreenHeader`·Taground `screen-shell`·Diairy `DetailPanel`이
  각자 만들던 자리다. [계약](./top.md).
- **AuthProviderButton**(Web/RN): 소셜 로그인 버튼. 색은 각 제공자 가이드라인 값이고
  테마는 제공자 자신의 light/dark 변형 중 하나를 고를 뿐이다. 로고 자산과 문구는 제품이
  넘긴다 — BurnTok이 `.hjm-button.bt-provider-*` CSS 네 줄로 덮던 자리를 계약으로 올렸다.
  [계약](./provider-button.md).
- **테마 주입 문서**: [theming.md](./theming.md). 메커니즘(`brandPalette`)은 이미 있었고
  문서가 없었다. BurnTok의 실제 사용을 근거로 "덮어도 되는 key"와 "하지 말아야 할 세 가지"를
  적었다. 예제 API는 실행해서 확인했다.
- P0 포함 `pnpm ci:check` exit 0: contracts 747, Web SSR 151 + browser 207, Native 271.
  정적 Storybook canonical 97(Web renderer 83 / contract-only 14 / 미지원 0).
  Metro Android 586 modules, raw 1423.9 KiB / gzip 351.6 KiB (pre-Hermes).


## 커버리지 감사 후속 — P1·P2 마무리와 Native 공백 (2026-09-18)

P0에 이어 감사의 P1·P2를 전부 닫고, Web 전용으로 남아 있던 네 개에 Native renderer를
붙였다. 순서는 ①P1 ②P2 ③P2-b(데스크톱 메뉴·disclosure) ④P2-c(토큰·정책) ⑤Native다.

### P1 — 화면 하나를 끝까지 만들게 하는 것

Heading(Web/RN), 원형 Progress(Web/RN), ListRow 로딩 행과 `relaxed`·`spacious` 밀도(Web),
ToggleGroup(Web/RN), TagsInput(Web), SkipNav(Web), BottomInfo(Web/RN), Sidebar(Web),
Sheet detent + 핸들(Web), DateRangePicker(Web), `useDialog`/`useSheet`(Web), 로케일 필수
formatters, RN 키보드 회피·햅틱 계약.

두 가지는 **감사가 틀렸다.** heading 스케일은 이미 있었고 노출만 없었다. Tabs의
`size`·`overflow`도 이미 공개 prop이었다 — 제품의 CSS 우회는 API 공백이 아니라 시각적 선택이다.

### P2 — TextFormat, Clipboard, CounterBadge dot, AvatarGroup

`Kbd`/`Code`/`Blockquote`를 "상호작용이 없어서 채택하지 않는다"고 적어 두었던 판정을
뒤집었다. 문제는 상호작용이 아니라 **같은 표현이 제품마다 다른 요소로 그려지는 것**이었고,
그 요소 선택이 계약의 값이다.

### P2-b — Collapsible · ContextMenu · Menubar · Popover hover

- **Collapsible**(Web/RN): Accordion과 다른 것은 개수가 아니라 **관계**다. 이웃이 없으니
  그룹 키보드·구분선·"하나만 열림" 정책이 없다. 닫힌 내용은 숨기지 않고 트리에서 뺀다.
- **ContextMenu**(Web): Menu와 목록은 같고 **앵커가 좌표**다. 트리거가 없으므로 Shift+F10과
  메뉴 키를 반드시 준다 — 그것을 빼면 마우스 없이는 존재하지 않는 기능이다. 키보드로 열면
  초점 요소의 상자를 앵커로 쓴다.
- **Menubar**(Web): 막대 전체가 **키보드 단위 하나**다. 열린 상태에서 ←/→가 옆 메뉴로
  넘어가고, 한 번에 하나만 열리며, tab stop은 하나다. Menu 세 개로는 성립하지 않는다.
- **Popover `openOn="hover"`**: 클릭 경로를 대체하지 않고 **더한다**. 터치와 키보드에는
  hover가 없다. 양쪽 지연(300/150ms)이 있어야 스쳐 지나가도 안 열리고 패널까지 갈 수 있다.

### P2-c — Asset · Chart 토큰 · 전역 density · 버튼 라벨 정책

- **Asset**(Web/RN): 아이콘·이미지·Lottie·비디오를 같은 액자에 넣는다. **재생기는 슬롯으로
  받아** 이 패키지가 의존하지 않는다. [asset.md](./asset.md).
- **Chart**: 렌더러를 만들지 않는다. 계열 팔레트·축·격자·범례 토큰(`dataviz`)만 고정하고
  그리기는 제품 라이브러리에 위임한다. 실제로 어긋난 것은 색이었다. [chart.md](./chart.md).
- **전역 density**: Provider의 한 축이 목록·메뉴·표의 기본 밀도가 된다. 컴포넌트 prop이
  언제나 이긴다. 어휘는 통일하지 않고 매핑 함수를 한 곳에 뒀다. [density.md](./density.md).
- **버튼 라벨 wrap**: 자르지 않고 두 줄까지 접는다. 큰 글자에서는 상한을 푼다(WCAG 1.4.4).
  [button-label.md](./button-label.md).

### Native 공백 네 개

TagsInput · DateRangePicker · Mentions · TransferList에 RN renderer가 들어왔다. 네 곳 모두
계약 판정을 그대로 쓰고, **표면이 다른 지점만** 따로 적었다.

- TagsInput: 확정 키 어휘가 return 하나뿐이다. Comma/Space/Blur는 Web 전용으로 남는다.
- DateRangePicker: hover 미리보기가 없다. 구간은 날짜 이름과 점으로만 드러난다.
- Mentions: 캐럿을 `onSelectionChange`로만 알 수 있어 따로 추적한다. `value.length`로
  추측하면 문장 중간 편집이 전부 깨진다.
- TransferList: 두 칸을 나란히 놓을 폭이 없어 세로로 쌓는다. 읽기 순서가 "목록 → 무엇을
  할지 → 다른 목록"이 된다.

### 마지막 전체 검증

`pnpm ci:check` exit 0: contracts 793, Web SSR 163 + browser 239, Native 280.
정적 Storybook canonical 110(Web renderer 95 / contract-only 15 / 미지원 0), navigation 13.
Showcase 토큰 경계는 68개 선언·68개 문서화된 예외다.
Metro Android production은 families=37 / modules=611 / raw 1475.9 KiB / gzip 364.9 KiB
(pre-Hermes, headroom 9.8% raw / 9.7% gzip)로, 이번에 Native renderer가 여섯 개 늘어난 만큼
그래프도 늘었다.

예산은 전부 실측값으로 올렸고 근거를 주석으로 남겼다. 하나는 특히 의식적인 선택이다:
`@hjmds/react`의 `./data-table`이 전역 density를 읽으면서 provider 모듈을 그래프에
끌어와 2 → 4 모듈(2.6 → 5.2 kB gzip)이 됐다. provider 예산의 경고를 알고 올렸다 —
제품은 어차피 `HjmProvider`를 항상 싣고, 대신 얻는 것이 목록·메뉴·표의 같은 밀도다.

이 결과는 라이브러리 로컬 검증이다. npm 게시, 제품 채택, 실제 기기·보조기기 검증은
아직 하지 않았다.
