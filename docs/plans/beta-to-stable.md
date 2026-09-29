# HJM 성숙도 경계 개선

상태: Beta → Stable 승격 완료 · 2026-09-29 · 대상: React / React Native

## 현재 상태 — 2026-09-29

현재 source catalog 기준 Beta는 없다. Contract/Web은 Stable 100개·Planned 8개이고, Native는 Stable 83개·Planned 3개·Unsupported 22개다. 아래 날짜별 집계는 각 승격 작업 시점의 기록이므로 현재 총계로 읽지 않는다.

ThinkingOrb Native도 renderer 환경 matrix와 설치된 iOS·Android Skia smoke를 통과해 Stable로 승격했다. 기존 iPhone 17/iOS 27.0 시뮬레이터와 Android 16 에뮬레이터에서 light/dark, 접근성 label/busy 상태를 확인했다. iOS 시작 시 UIScene 누락으로 종료된 문제는 Expo 업데이트와 scene plugin으로 수정했다. [검증 기록](../../packages/design-contracts/docs/thinking-orb.md)에 범위와 캡처를 남겼다.

설치 smoke 전 Native ThinkingOrb 회귀 테스트 변경까지 포함해 canonical `pnpm ci:check`가 통과했다: contracts 885, React 1,060 (SSR 174 + Chromium 886), React Native 820, Web Showcase 19, Native Showcase 1. Bundle budgets, workspace/evidence 동기화, 문서 링크, release governance, Android Metro production fixture, Web Storybook build와 112-story static inventory도 성공했다. `git diff --check`도 통과했다. 이후 설치 smoke가 완료됐으며, 최종 승격 변경의 canonical 검사는 아래 결과로 갱신한다.

## 변경

Stable은 API와 동작을 SemVer로 지원하는 상태로 정의한다. Beta는 API·동작·renderer 검증에
구체적인 미완료 항목이 있는 상태다. 제품 수, 제품 배포와 전체 화면 QA를 공용 컴포넌트
승격 조건에서 분리한다. 별도 승격 영수증 스키마나 승인 절차는 만들지 않는다.

- 승격 기준 원문: [stable-promotion.md](../../packages/design-contracts/docs/stable-promotion.md)
- 소비 정책 1.4.0: Beta는 선택 가능. 기존 contract/TASKS의 채택 기록과 관련 회귀 검사로 추적한다.
  항목별 ADR·대안 비교·재검토 날짜는 필수가 아니다. 기존 versioned app profile은 갱신 전까지 유지한다.
- renderer의 접근성·dark·긴 문구·큰 글자·RTL·reduced-motion 검사는 유지한다.
  글자 슬롯이 없는 컴포넌트의 long-copy 제외도 유지한다.
- keyboard와 Native action이 없는 의미 전용 behavior에는 action evidence를 요구하지 않는다.
  그 목록은 행동 계약과 비교하는 회귀 검사로 drift를 막는다.
- adaptive라는 분류만으로 별도 platform-parity 시나리오를 강제하지 않는다.
  실제 완료·취소·선택 의미는 해당 계약과 행동 회귀에서 검증한다. 기존 proof를 삭제하지 않는다.

## 이번 승격

Divider, Section, ListRow, Statistic, DescriptionList, EmptyState, Result를 계약·양쪽 renderer에서
stable로 올린다. 이 7개는 변경 전에도 필수 renderer 시나리오 누락이 0이었다. 기능 구현이나 공개
props를 바꾸지 않고, 과한 소비 조건 때문에 보류했던 지원 상태를 바로잡는다.

| 범위 | 변경 전 | 변경 후 |
| --- | --- | --- |
| 계약 | stable 17 / beta 80 | stable 29 / beta 68 |
| Web | stable 17 / beta 80 | stable 29 / beta 68 |
| Native | stable 17 / beta 62 | stable 27 / beta 52 |

새 기준으로 재평가해 Heading/Top(행동 없는 keyboard 요구), BottomCTA(중복 parity 요구)를
양쪽에서 추가 승격했다. TopBar는 계약/Web만 승격하며 Native의 long-copy 미검증은 beta로
남긴다. public API 안정성과 surface 구현 검증이 다르므로 소비 정책은 `surfaceStatus`로 판정한다.

제품 소스 감사에서는 EmptyState가 BurnTok·Diairy·Spint·Mofun, ListRow가 BurnTok·Unairplane,
Result가 BurnTok Web에서 사용됨을 확인했다. 나머지 4개는 실제 제품 본문 채택을 확인하지
못했다. 이 차이는 채택 관측이며 승격 조건이 아니다. source import는 제품 실행 증거도 아니다.

## 검증 범위

기존 검사: 변경 전 `pnpm ci:check` 통과 (contracts 883, React 950, Native 735,
Web Showcase 19, Native Showcase 1). ListRow/EmptyState의 Web Chromium 12건,
Native mock 12건도 통과했다. 이번 수정에 대한 결과는 아래에 별도로 기록한다.

Native scenario는 mock/host prop 검증이다. 기존 Device Hub 열기는 timeoutReached였으며,
실제 iOS/Android·스크린 리더·제품 화면·배포 검증을 완료로 기록하지 않는다.
제품별 QA는 소비 앱 릴리스에서 변경한 흐름에 맞춰 수행한다.

### 수정 후 결과

최종 `pnpm ci:check` exit 0: contracts 884, React 950 (SSR 174 + Chromium 776),
React Native 735, Web Showcase 19, Native Showcase 1 — 총 2,589건 통과.
타입·패키지 build·Metro 번들·번들 제한·workspace/governance·생성물 일치·문서 링크와
Web Storybook build/static inventory도 통과했다. Vite의 큰 chunk 경고는 있지만 build는 성공했다.
Native mock과 실제 제품/기기 검증의 경계는 위와 같다.

### 2026-09-29 Layout 승격 검증

`Layout`은 Web·Native 모두 generated renderer evidence에서 필수 scenario 누락 0을 확인한 뒤 stable로 올렸다. Web은 실제 Chromium Tab/Enter skip-link 테스트와 긴 본문·dark·200% text·RTL·reduced-motion·접근성 matrix를 통과했다. Native는 긴 본문과 renderer 환경/접근성 matrix, region-order 계약 검사를 통과했다. Native Layout에는 bypass link나 host action이 없어 keyboard 증거를 요구하지 않는다.

최종 `pnpm ci:check` exit 0: contracts 886, React 991 (SSR 174 + Chromium 817), React Native 775, Web Showcase 19, Native Showcase 1 — 총 2,672건 통과. Bundle graph·Metro·workspace/evidence/docs/governance 검사, Native/Web Showcase 검사와 Web Storybook build/static inventory도 통과했다. Storybook에는 기존 Vite large-chunk 경고가 있지만 build와 112-story inventory 검증은 성공했다.

전체 beta를 기준에 따라 순차 처리 중이다. Web-only TextFormat에 이어 AspectRatio, Grid, Steps, TopBar, AuthScreenLayout, Radio,
Avatar, Asset, CounterBadge, Image, VisuallyHidden, List, Timeline, BottomInfo, Link, AuthProviderButton, PasswordField, CheckboxGroup, RadioGroup, Chip, SegmentedControl, SearchField, NumberField, Toast, FloatingActionButton, Checkbox, Switch, ToggleGroup, Slider, OtpField, DatePicker, Breadcrumb, Pagination, DateRangePicker, Menubar, Form Web을 지원 surface별로 승격했다.
TextFormat은 실제 긴 코드를 `<code>` slot에 넣는 Chromium proof로, AspectRatio/Grid/Steps/AuthScreenLayout은 긴 콘텐츠
matrix proof로 승격했다. Steps fixture는 최소 두 단계라는 계약 조건을 지킨다. TopBar Native의 한 줄 잘림을 수정했다.
Radio의 좁은 Web 열 줄바꿈을 위해 선택 label 폭을 제한했다. visible 문장 슬롯이 없는 다섯 컴포넌트는 evidence 계약에서 long-copy만 제외하고 default/accessibility 증거로 유지했다. List의 긴 row title도 양 renderer에서 확인했다.
Timeline label과 BottomInfo 문구도 양 renderer에서 검증했다. Link는 Web anchor Enter와 Native router press를 각각 증명했다. AuthProviderButton은 Web Enter/Space와 Native press, PasswordField는 표시 toggle의 Web Enter/Space와 Native press, CheckboxGroup은 Web Space와 Native press, RadioGroup은 Web Space와 Native press, Chip은 Web Space와 Native press, SegmentedControl은 Web 화살표 키와 Native press, SearchField는 긴 label과 양 renderer 입력·지우기 동작을, NumberField는 긴 label·Web ArrowUp·Native adjustable increment를 검증했다. TagsInput은 Web Enter와 Native Return 확정·이름 있는 tag 삭제 action을 검증했다. 확인 과정에서 Native blur가 초안을 확정하는 구현 불일치를 발견해 제거하고 회귀 테스트를 추가했다. Web 후보 탐색·2단계 Backspace는 Native에서 주장하지 않는다. Select는 긴 label, Web ArrowDown/Enter와 Native option host action을 검증했다. Combobox는 긴 label, Web 입력·ArrowDown/Enter와 Native 후보 action·dismiss 이후 확정을 검증했다. Layout은 양 renderer의 긴 본문·접근성·환경 matrix와 Web skip-link Tab/Enter를 확인했다. Native는 skip-link와 host action 계약이 없어 keyboard proof를 요구하지 않는다. Splitter는 Web 긴 콘텐츠 matrix와 실제 Tab focus 이후 separator keyboard resize를 검증했다. DatePicker는 양 renderer의 긴 label·환경·접근성 matrix, Web 키보드 날짜 이동·선택·닫힘과 Native 날짜 선택 host action을 검증했다. 현재 계약/Web stable 69개, Native stable 62개다. Toast, FloatingActionButton, Checkbox, Switch, ToggleGroup, Slider, OtpField, TagsInput, Select, Combobox, Layout, Splitter, DatePicker 승격이 이 집계에 포함된다.
stable surface의 필수 증거 누락은 0이다.

| 남은 필수 증거 | Web beta 28개 | Native beta 17개 |
| --- | ---: | ---: |
| 긴 문구 | 27 | 16 |
| 키보드 / Native host action | 27 | 16 |
| dark·큰 글자·RTL·reduced motion·접근성 | 각각 1 (ThinkingOrb) | 각각 0 |

누락은 중복 집계된다. 정확한 대상과 proof 연결은
[generated renderer evidence](../../packages/design-contracts/docs/generated/renderer-evidence.md)에 있다.
Toast는 Web 키보드와 Native 접근성 닫기 action을 추가해 승격했다. CheckboxGroup·RadioGroup·Chip·SegmentedControl은 각 키보드/host-action 회귀를 연결한 뒤 승격했다. 기존 클릭/prop 검사만으로 키보드 통과를 선언하지 않는다. 제품 채택 수나 배포를 기다리기 위해 보류한 항목은 없다.

### 2026-09-29 Breadcrumb·Pagination 증거 보강

Breadcrumb는 Web 긴 label matrix와 실제 Tab/Shift+Tab·Enter 경로 이동 검증을 갖췄고, Pagination은 visible prose 슬롯이 없어 long-copy 요구에서 제외하되 320px·200%·RTL의 네 자리 수 레이아웃 검증을 유지했다. Pagination은 실제 Tab focus, Space/Enter 전환, 현재 페이지 의미, 첫/끝 경계 focus 유지를 확인했다. Web-only 두 항목은 각 지원 surface 기준에서 누락 0을 확인한 뒤 stable로 승격했다.

최종 `pnpm ci:check` exit 0: contracts 886, React 998 (SSR 174 + Chromium 824), React Native 777, Web Showcase 19, Native Showcase 1 — 총 2,681건 통과. Bundle budget, Metro, workspace/evidence/docs/governance, 두 Showcase 검사 및 Web Storybook build/static inventory도 통과했다. Vite의 기존 large-chunk 경고는 있지만 build는 성공했다.

### 2026-09-29 DateRangePicker·Menubar·Form 증거와 승격

DateRangePicker는 Web Chromium에서 Tab·Enter·화살표로 구간의 시작과 끝을 선택하고 시작·중간·끝 accessible name을 검증했다. Native는 이름 있는 날짜 Pressable action으로 같은 범위 상태와 접근성 이름을 확인했다. Native renderer가 실제 존재하는 것을 확인해 예전 문서의 planned/no-renderer 문구를 고쳤다. 양쪽 matrix와 실행 증거가 통과해 두 surface를 stable로 올렸다.

Menubar는 Web-only renderer다. Chromium에서 Tab focus, 비활성 menu 건너뛰기와 wrap, ArrowDown 열기, 비활성 item 제외, Enter action, 닫힌 뒤 focus 복귀와 긴 menu label을 확인해 Web stable로 올렸다.

Form Web은 Chromium에서 값을 수정하고 Enter 제출 후 FormData를 검증했으며 기존 비동기 중복 제출, busy/오류 의미, 환경 matrix도 유지한다. Web surface는 stable로 올렸다. Native는 새 값 제출과 busy 상태의 host-action proof를 추가했지만, 공유 계약이 요구하는 첫 무효 필드로의 accessibility focus 경로가 Native renderer에 구현되지 않았다. 이 실제 기능 공백 때문에 Native는 beta로 남긴다. 제품 adoption 수는 승격 기준에 넣지 않았다. Form·DateRangePicker에는 prose를 직접 소유하는 slot이 없어 long-copy는 요구하지 않는다.

변경 후 계약/Web stable 69, Native stable 62; Web beta 28, Native beta 17이다. 필수 증거 누락은 stable surface에서 0이며 Form Native beta의 남은 사유는 자동 scenario 누락이 아니라 위 계약 기능 공백이다. 최종 canonical `pnpm ci:check` exit 0: contracts 886, React 1,002 (SSR 174 + Chromium 828), React Native 779, Web Showcase 19, Native Showcase 1 — 총 2,687건 통과. Bundle budgets, Metro, workspace/evidence/docs/governance, Showcase 검사와 Web Storybook build/static inventory도 통과했다. Vite 기존 large-chunk 경고는 있지만 build와 112-story inventory 검증은 성공했다.

### 2026-09-29 DatePicker 승격 검증

DatePicker는 Web·Native의 긴 label·접근성·dark·큰 글자·RTL·reduced-motion matrix가 모두 통과하고 generated renderer evidence의 필수 누락이 양쪽 모두 0인 것을 확인해 승격했다. Web Chromium은 Tab/Enter로 trigger를 열고, 오늘 셀에서 ArrowRight로 날짜를 옮겨 Enter 선택 후 닫힘과 trigger focus 복귀를 검증한다. Native는 열린 Sheet 안 날짜 host action이 선택값과 닫힘을 요청하는지 검증한다. 제품 adoption과 실기기/스크린 리더 검증은 consumer QA 소유이므로 promotion blocker에서 제거했다.

최종 `pnpm ci:check` exit 0: contracts 886, React 995 (SSR 174 + Chromium 821), React Native 777, Web Showcase 19, Native Showcase 1 — 총 2,678건 통과. Bundle budget, Metro, workspace/evidence/docs/governance, Web·Native Showcase 및 Web Storybook build/static inventory도 통과했다. DatePicker 안정 상태에 따른 catalog root import graph는 92 modules, 567,844 raw bytes, 141,102 gzip bytes였으며 gzip 한도는 이 측정값까지만 넓혔다. Web Storybook의 기존 large-chunk 경고는 남아 있으나 build와 static inventory는 성공했다.

### 2026-09-29 Accordion·Agreement·FilePicker 승격 검증

Accordion은 Web Chromium Tab/Enter 확장·축소와 Native 이름 있는 press action의 expanded 상태를 확인했다. Agreement는 양 surface에서 전체/개별 필수 동의, 제출 가능 상태, 전문 보기와 동의의 분리를 확인했다. FilePicker는 Web keyboard trigger에서 선택 결과를 확인하고 Native 제품 adapter action이 공통 accept·size·count resolver를 호출하는지 검증했다. 세 컴포넌트 모두 긴 표시 문구·접근성·환경 matrix를 양 renderer에서 통과했다. FilePicker의 OS picker 연결, Agreement의 법적 문구와 기록은 제품 소유이며 기기에서 검증했다고 주장하지 않는다.

변경 후 계약/Web stable 72, Native stable 65; Web beta 25, Native beta 14다. 표적 검사에서 Web 543개, Native 456개 테스트가 통과했다. canonical `pnpm ci:check`도 exit 0: contracts 886, React 1,008 (SSR 174 + Chromium 834), React Native 785, Web Showcase 19, Native Showcase 1 — 총 2,699건 통과. Renderer·contract bundle budget, Metro, workspace/evidence/docs/governance, 양쪽 Showcase 검사, Web Storybook build와 112 story static inventory도 통과했다. 기존 Storybook 번들 경고는 있으나 build와 검증은 성공했다.

### 2026-09-29 Tabs·BottomNavigation·LoadMore 승격 검증

Tabs Web에서 320px Chromium overflow strip의 긴 비활성 제외 탭으로 ArrowRight 이동 시 focus가 화면 밖에 남는 문제를 재현했다. roving focus가 target에 `scrollIntoView`를 호출하도록 고쳤고, reduced motion에서는 instant scroll을 확인했다. Enter는 수동 선택 상태를 활성화한다. Native `activate` action도 이름·selected state·panel 연결로 검증했다. BottomNavigation은 실제 320px viewport에서 긴 route label layout, Web Tab/Enter, Native navigate/reselect를 검증했다. LoadMore는 keyboard fallback·observer trigger, Native end-reached gate/retry, loading/error/complete의 긴 문구를 검증했다. 세 shared component의 모든 required renderer scenario 누락은 0이다.

변경 후 계약/Web stable 75, Native stable 68; Web beta 22, Native beta 11이다. canonical `pnpm ci:check` exit 0: contracts 886, React 1,017 (SSR 174 + Chromium 843), React Native 792, Web Showcase 19, Native Showcase 1 — 총 2,715건 통과. Renderer·contract bundle budget, Metro, workspace/evidence/docs/governance, 양쪽 Showcase 검사, Web Storybook build와 112-story static inventory도 통과했다. 이번 budget 증가는 신규 import 없이 evidence 문구에 한정했다.

### 2026-09-29 Mentions 승격 검증

Mentions는 Web·Native 모두 generated renderer evidence 필수 scenario 누락 0을 확인한 뒤 Stable로 올렸다. Web의 기존 browser test는 token-start trigger 탐지, 공백 닫힘, caret 중간 삽입, Arrow candidate 순환, Enter/Escape, pointer 선택과 empty state를 검증한다. 긴 field label은 320px scenario fixture에 연결했다. Native는 실제 caret selection을 입력해 query를 보고하고, 중간 trigger만 교체하며 뒤 문장을 보존하는 named candidate press action을 검증했다. 이 과정에서 `onMentionQueryChange`가 render 도중 부모 state를 갱신하던 문제를 발견해 commit effect로 옮겼고, candidate list role과 accessible label을 보완했다. 실제 IME 조합 및 VoiceOver/TalkBack 실기기 검증은 제품 QA로 남긴다.

현재 계약/Web stable 76, Native stable 69; Web beta 21, Native beta 10이다. 대상 테스트와 두 renderer scenario matrix가 통과했으며, `pnpm ci:check`는 다음 batch 이후 다시 실행한다.

## 릴리스

현재 소스/Changeset만 반영한다. package version은 1.7.0이며 게시 버전의 stable 목록은
아직 바뀌지 않았다. 실제 배포 시 fixed train release와 중앙 sync-design-system을 거쳐 소비
dependency·lock·profile을 갱신한다. 선택형 모션/네이티브 확장에는 별도 구현 제한이 계속 적용된다.

### 설치 smoke 후 최종 검사 — 2026-09-29

Contracts 885, React SSR 174 + Chromium 886, React Native 826, Web Showcase 19,
Native Showcase 1: 기능 테스트 총 2,791개 통과. 승격 과정에서 Native evidence export 목록과
Storybook registry 누락을 수정해 해당 검사를 다시 통과했다. Evidence 메타데이터는
10.7 kB raw / 2.72 kB gzip으로 늘어 한 모듈 graph 유지 확인 후 예산만 갱신했다.
`pnpm ci:check` 단일 실행은 기존 evidence budget에서 중단되었고, 수정 후 그 단계부터
나머지 canonical 명령을 순서대로 재실행하여 모두 통과했다. 최종 전체 명령을 다시
한 번 실행했다고 주장하지 않는다. Renderer/contract budgets, Android Metro fixture,
workspace/evidence/docs/governance, 양쪽 showcase 검사, Web Storybook build 및
112 canonical story inventory, 중앙 library-policy 정적 검사, `git diff --check` 통과.
게시·소비 앱 갱신은 실행하지 않았다.

## 실제 기능 공백 후속 구현

Masonry·VirtualList·QRCode를 양쪽 renderer에 추가하고 Native Cascader 조합을 추가했다.
Chart·AppProvider·BorderBeam·Utility 후보는 사용자 요청으로 삭제했다.
이 후속 변경의 전체 릴리스 검증·게시·소비 앱 적용은 진행 중이며, 위 과거 통과 기록으로 대체하지 않는다.
