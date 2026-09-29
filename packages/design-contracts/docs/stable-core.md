# Stable Core

## 2026-09-29 컴포넌트 승격 (다음 minor)

`Divider`, `Section`, `ListRow`, `Statistic`, `DescriptionList`, `EmptyState`, `Result`, `Layout`, `Splitter`, `Accordion`, `Agreement`, `FilePicker`, `Tabs`, `BottomNavigation`, `LoadMore`, `Mentions`,
`Heading`, `Top`, `BottomCTA`, `AspectRatio`, `Grid`, `Steps`, `TopBar`, `AuthScreenLayout`, `Radio`,
`Avatar`, `Asset`, `CounterBadge`, `Image`, `VisuallyHidden`, `List`, `Timeline`, `BottomInfo`, `Link`, `AuthProviderButton`, `PasswordField`, `CheckboxGroup`, `RadioGroup`, `Chip`, `SegmentedControl`, `SearchField`, `NumberField`, `Toast`, `FloatingActionButton`, `Checkbox`, `Switch`, `ToggleGroup`, `Slider`, `OtpField`, `TagsInput`, `DatePicker`, `DateRangePicker`, `Breadcrumb`, `Pagination`, `Menubar`, `Form`, `Sidebar(Web)`, `TransferList`, `UploadItem`, `ContextMenu(Web)`, `Menu`, `Anchor(Web)`, `Collapsible`, `DataTable(Web)`, `Tree(Web)`, `Calendar`, `Carousel`, `Tour(Web)`, `ThinkingOrb`, `Dialog`, `AlertDialog`, `Sheet`, `SidePanel(Web)`, `Popover(Web)`, `Tooltip(Web)`, `CommandPalette(Web)`, `SkipNav(Web)`을 각 지원 surface에서 stable로 승격합니다.
TextFormat, Splitter, Breadcrumb, Pagination, Menubar, Sidebar와 Web 전용 overlay/navigation 컴포넌트는 Web-only stable입니다. DateRangePicker, Accordion, Agreement, FilePicker, Tabs, BottomNavigation, LoadMore, Mentions, Form, TransferList, UploadItem, Menu, Collapsible, Calendar, Carousel, Dialog, AlertDialog, Sheet는 Web·Native stable입니다. ThinkingOrb도 Web·Native stable입니다. 현재 계약 stable은 100개, Web stable은 100개, Native stable은 83개입니다.

## 2026-09-29 Beta → Stable 확인

- TransferList와 UploadItem은 두 renderer의 Web keyboard·Native host action 및 긴 문구 증거를 연결했습니다. TransferList의 narrow panel 라벨은 flex item intrinsic minimum을 초기화해 wrap되도록 고쳤습니다. UploadItem의 실제 transfer/network lifecycle은 소비 제품 소유라 maturity gate가 아닙니다.
- ContextMenu, Menu, Anchor, Collapsible, DataTable, Tree, Calendar는 각 surface에 적용되는 interaction과 긴 문구를 component-owned test로 확인했습니다. Unsupported surface는 계속 unsupported입니다.
- Carousel, Tour, Dialog, AlertDialog, Sheet, SidePanel, Popover, Tooltip, CommandPalette, SkipNav는 keyboard/focus/action과 좁은 viewport·긴 localized copy를 전용 renderer test로 확인했습니다. Native 증거는 host action simulation이며 실제 OS screen-reader claim이 아닙니다.
- Form Native는 `firstInvalidFieldRef`가 가리킨 제품 선택 입력으로 focus와 accessibility focus를 옮기고 제출 callback을 막는 경로를 추가했습니다. 제품은 validation·필드 순서를 계속 소유합니다.
- ThinkingOrb Web 전용 matrix는 dark, 200% text, RTL, reduced motion, accessibility semantics를 확인합니다. Native도 환경 matrix와 설치한 iOS·Android Skia smoke를 통과했습니다([검증 기록](thinking-orb.md)).
- 새 stable surface는 생성된 renderer evidence와 canonical `pnpm ci:check`가 통과해야 완료로 기록합니다. 제품 채택·배포·실기기 보조기기 QA는 소비자 릴리스에서 별도로 검증합니다.

- TextFormat은 `<kbd>`, `<code>`, `<blockquote>` 의미를 Web에서 제공하고 Native는 unsupported입니다.
  실제 긴 코드를 `<code>` slot에 넣는 Chromium matrix proof를 새로 연결했습니다.
- AspectRatio는 Web Chromium과 Native renderer matrix에서 비율 컨테이너 안의 긴 자식 콘텐츠를 검증했습니다.
  미디어 의미와 crop은 계속 제품이 소유합니다.
- Grid는 Web Chromium과 Native renderer matrix에서 셀 안의 긴 텍스트 줄바꿈을 검증했습니다.
- Steps는 계약이 요구하는 두 단계 이상 흐름에서 긴 단계 label을 Web Chromium과 Native matrix로 검증했습니다.
- TopBar Native compact title의 잘림을 제거해 `screen-chrome.md`의 줄바꿈 계약에 맞췄고, 긴 제목 matrix를 통과했습니다.
- AuthScreenLayout은 제품 소유 긴 제목을 hero slot에 넣어 Web Chromium과 Native matrix에서 검증했습니다.
- Radio는 긴 option label이 좁은 Web 열을 넓히지 않도록 선택 label의 최대 폭을 제한하고 Web/Native matrix에서 확인했습니다.
- List는 행 title에 긴 문구를 넣어 Web Chromium과 Native renderer matrix에서 줄바꿈을 확인했습니다.
- Timeline은 실제 이벤트 label의 긴 문구를 Web Chromium과 Native matrix에서 검증했습니다.
- BottomInfo는 제품 소유 안내 문구를 길게 넣어 Web Chromium과 Native matrix에서 줄바꿈을 확인했습니다.
- Link는 browser의 anchor Enter 활성화와 Native router host action을 각각 별도 interaction proof로 연결했습니다.
- AuthProviderButton은 Web Enter/Space와 Native host press에서 제품 소유 동작 호출을 확인했습니다.
- PasswordField는 Web Enter/Space로 값은 보존한 채 표시 상태가 바뀌고, Native host press도 같은 상태 전이를 일으키는지 검증했습니다.
- CheckboxGroup은 Web Space와 Native host press에서 선택 집합이 바뀌는 것을 각각 확인했습니다.
- RadioGroup은 Web Space와 Native host press에서 선택 옵션이 바뀌는 것을 각각 확인했습니다.
- Chip은 Web Space와 Native host press에서 선택 상태가 바뀌는 것을 각각 확인했습니다.
- SegmentedControl은 Web 화살표 키와 Native host press에서 선택값 전이를 확인했습니다.
- SearchField는 label 긴 문구 줄바꿈과 Web typing/clear, Native input/clear action을 검증했습니다.
- NumberField는 긴 label, Web ArrowUp, Native adjustable increment를 확인했습니다.
- Toast는 Web Enter 닫기와 Escape 해제, Native 접근성 닫기 action을 별도 회귀로 검증했습니다. Liquid presentation은 선택형 adapter로 stable을 상속하지 않습니다.
- FloatingActionButton은 Web/Native 긴 이름 렌더와 Web Enter·Native host press 활성화를 회귀로 확인했습니다. 기존 scroll 방향·focus 유지·safe-area 검증도 유지합니다.
- Checkbox는 Web/Native 긴 label과 Web Space·Native host press에서 선택값 전이를 확인했습니다.
- Switch는 Web/Native 긴 label과 Web Space·Native host press에서 checked 전이를 확인했습니다.
- ToggleGroup은 Web/Native 긴 option label과 Web Space·Native host press에서 pressed-id 집합 전이를 확인했습니다.
- Slider는 Web/Native 긴 label, Web ArrowRight, Native adjustable increment를 검증했습니다.
- OtpField는 양 renderer의 긴 label과 키보드 입력·숫자 정리 동작을 검증했습니다. 인증 절차 전체는 제품 소유로 남습니다.
- TagsInput은 Web Enter 확정과 Native Return 확정·이름 있는 삭제 action을 각각 검증했습니다. Native blur는 초안을 확정하지 않으며, Web 후보 키 탐색과 2단계 Backspace 동작은 Native parity로 주장하지 않습니다.
- Select는 긴 field label과 Web ArrowDown/Enter 선택, Native option host action을 확인했습니다. Native 선택은 실제 OS dialog 시각·접근성 검증을 포함하지 않습니다.
- Combobox는 긴 label과 Web 입력·ArrowDown/Enter 선택, Native 후보 host action 후 sheet dismissal commit을 검증했습니다. 실제 IME와 OS sheet·스크린 리더 동작은 기기에서 확인하지 않았습니다.
- Layout은 두 renderer의 긴 본문·접근성·환경 matrix와 Web skip-link Tab/Enter를 검증했습니다. Native에는 skip-link나 host action 계약이 없어 keyboard proof를 요구하지 않습니다. 제품 shell의 스크린 리더·실기기 확인은 제품 릴리스 QA 범위입니다.
- Splitter는 Web long-copy·접근성·환경 matrix와 실제 Tab focus 뒤 focused separator에서의 ArrowRight 조절을 검증했습니다. 기존 회귀는 drag/keyboard 동일 step grid·Home/End·RTL·disabled·44px hit target을 검사합니다. 제품 화면과 스크린 리더 실측은 보증하지 않습니다.
- DatePicker는 양 renderer의 긴 label·접근성·환경 matrix, Web의 trigger Tab/Enter와 날짜 ArrowRight/Enter 선택·닫힘·focus 복귀, Native 날짜 선택 host action을 검증했습니다. 제품 폼 및 실제 OS 스크린 리더 검증은 소비 앱 QA입니다.
- Breadcrumb는 긴 label matrix와 Tab/Shift+Tab·Enter 조상 링크 이동, 현재 위치의 non-interactive `aria-current` 동작을 Web에서 확인했습니다. Pagination은 Tab focus 순서, Space/Enter 페이지 전환, 현재 페이지 발표, 양쪽 경계의 focus 유지와 중복 전환 차단을 Web에서 검증했습니다. Pagination은 소비자 문장을 표시하지 않으므로 long-copy 요구를 제외했고, 숫자 폭은 320px·200%·RTL 테스트에 남겼습니다.
- Accordion은 Web Tab/Enter 확장·축소와 Native 이름 있는 press action의 expanded 상태를 검증했습니다. Agreement는 양쪽 표면에서 개별/전체 동의와 전문 보기 분리를 확인했고, FilePicker는 Web 키보드 trigger와 선택 결과 및 Native 제품 adapter action·공통 선택 판정을 검증했습니다. FilePicker OS 피커 연결과 법적 문구·동의 기록은 소비 앱 소유입니다.
- Tabs는 disabled skip, manual selection, 긴 이름의 실제 keyboard focus/activation을 검증했습니다. Chromium에서 overflow strip 안 긴 탭이 키보드 포커스 뒤 보이지 않는 문제를 고쳐 `scrollIntoView`를 연결하고 reduced motion일 때 즉시 이동을 확인했습니다. Native `activate` action도 확인했습니다. BottomNavigation은 Web Tab/Enter와 Native navigate/reselect action이 선택 상태를 외부 navigator에 남기는지, LoadMore는 observer/onEndReached gate·수동 retry·긴 상태 문구를 확인했습니다.
- Mentions는 Web/Native long-label matrix, Web Arrow/Enter/Escape/pointer 흐름, Native caret query callback과 이름 있는 후보 press action을 검증했습니다. Native callback은 parent state update를 render 중 실행하지 않습니다. Candidate filtering과 실제 IME device QA는 제품 소유입니다.
- Sidebar는 Web에서 disabled 항목을 건너뛰는 실제 Tab 순서, Enter로 접기, 접힌 상태의 접근성 이름, 긴 그룹·항목 라벨 줄바꿈을 Chromium으로 검증했습니다. 모바일 목적지는 기존 BottomNavigation 계약을 사용합니다.
- Avatar는 이름을 visible 문장으로 렌더하지 않고 initials/media로 나타내며, Asset과 Image는 visible media와 alt accessibility semantics를 제공합니다.
  CounterBadge는 숫자/dot만, VisuallyHidden은 의도적으로 숨긴 accessibility text만 내므로 long-copy overflow는 이들의 계약을 시험하지 않습니다.
  이를 확인해 required scenario를 제외하고 기본·접근성·fallback proof를 유지했습니다. 기존 Icon·Skeleton 등 예외에 이 다섯 이름을 추가했습니다.
- 처음 7개는 변경 전에도 양쪽 renderer의 필수 시나리오 누락이 0이었습니다. 제품 채택 수만으로
  보류했던 조건을 [승격 기준](stable-promotion.md)에서 제거했습니다.
- Heading/Top은 행동이 없는 계약에 붙은 keyboard 요구만, BottomCTA는 중복 parity 요구만
  남아 있었습니다. TopBar는 Native 긴 제목 잘림을 고친 뒤 세 surface를 모두 승격합니다.
- Web은 `test/scenario-matrix.browser.test.tsx`, Native는 `test/scenario-matrix.test.tsx`의
  default/접근성/환경 증거와 기존 컴포넌트 회귀를 사용합니다. Native 검사는 renderer mock이며
  기기·VoiceOver/TalkBack 실측을 주장하지 않습니다.
- 검증 명령은 canonical `pnpm ci:check`입니다. 실행 결과는
  [이번 변경 기록](../../../docs/plans/beta-to-stable.md)에 남깁니다.
- 실제 제품 수·제품 배포 여부는 승격 조건이 아닙니다. 선택형 AnimatedStatistic·Liquid Toast·
  기타 확장은 기본 컴포넌트의 stable 상태를 상속하지 않습니다.

아래 절은 각 릴리스 당시 기록입니다. 현재 조건은 위 승격 기준을 따릅니다.

## 1.5.0 승격

다음 13개를 stable로 올렸습니다: `Text`, `Icon`, `Stack`, `Container`, `DesignSystemProvider`,
`IconButton`, `Badge`, `Card`, `Tag`, `Notice`, `Progress`, `Spinner`, `Skeleton`.

- 근거: 1.5.0에서 renderer 시나리오 증거를 이름뿐인 검사에서 실제 검사로 바꿨습니다
  (Web `test/scenario-matrix.browser.test.tsx`, Native `test/scenario-matrix.test.tsx`). 두 renderer에서
  요구 시나리오가 모두 통과하고 세 제품 이상이 쓰는 컴포넌트만 올렸습니다.
- 이 전환으로 Web의 "모든 시나리오 증거 완비"는 33개에서 16개로 줄었다가 승격 대상 보강 뒤
  24개가 됐습니다. 줄어든 것은 이전 수치가 과대 표시였기 때문입니다.
- 아이콘·로딩 표시·구분선처럼 보이는 글자 슬롯이 없는 컴포넌트는 long-copy 요구에서 뺐습니다
  (`showcase.ts`의 `textlessComponentNames`).
- keyboard·platform-parity를 요구하는 컴포넌트(Checkbox, Switch, Dialog, Sheet 등)는 그 증거가
  아직 없어 beta로 남습니다. 생성된 evidence 문서의 "Missing required scenarios"가 남은 일입니다.

## 0.8 첫 stable slice

첫 renderer stable slice는 `Surface`, `Button`, `Field`, `TextArea`다. 이 네 컴포넌트는
계약이 이미 stable이고 Web/RN renderer가 같은 public intent를 실행한다.

## 승격 증거

- 두 surface의 default·dark·long copy·large text·RTL·reduced motion·accessibility matrix
- `Field` Web label activation, native Tab stop, invalid description linkage
- Native `Field` host control의 focus/setText action과 accessible name/hint
- package granular export와 bundle graph boundary
- canonical Web/Native Showcase renderer

`Surface`, `Button`, `TextArea`는 추가 keyboard model을 발명하지 않고 host semantics를
그대로 사용한다. `Field`만 공통 behavior가 있으므로 dedicated keyboard/host-action proof를
연결한다.

## stable이 보장하지 않는 것

- 제품의 폼 validation 정책이나 서버 오류 번역
- arbitrary style override 또는 모든 브랜드 palette
- 모든 OS·브라우저 조합의 영구 호환
- 제품이 전달한 copy, URL, file의 신뢰성

새 회귀가 발견되면 stable 표면을 조용히 beta로 낮추지 않는다. patch에서 회귀를 고치거나,
API 변경이 필요하면 Changeset과 migration을 함께 제공한다.
