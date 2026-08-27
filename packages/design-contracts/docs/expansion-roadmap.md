# HJM Design System Expansion Roadmap

## 무엇을 흡수하는가

HJM은 외부 라이브러리의 외형이나 public prop 이름을 복사하지 않습니다. 각 시스템에서
잘 검증된 문제 분해 방식만 가져와 HJM의 문장인 **“조용한 화면 위에 중요한 순간만
선명하게”**에 맞게 다시 설계합니다.

| 참고 시스템 | 흡수할 것 | 그대로 가져오지 않을 것 |
| --- | --- | --- |
| Ant Design | 넓은 컴포넌트 범위, Form/Field 역할 분리, async 상태 | 시각 스타일, variant 이름, runtime dependency |
| Radix Primitives | compound anatomy, focus·dismiss·keyboard acceptance table | DOM primitive를 RN까지 강제하는 구조 |
| React Aria | stable key 기반 collection, selection mode, 국제화·키보드 모델 | React hook과 DOM 구현 |
| Material | 상태 축 조합, adaptive layout, non-text contrast | Material shape·motion·component appearance |
| TDS | 모바일 정보 위계, 작은 핵심 세트, ListRow 중심 조합 | 전용 자산·폰트·컴포넌트·이름의 복제 |
| Polaris | component lifecycle, page/pattern catalog | Shopify 도메인 어휘 |
| Tamagui | typed variant, Web popup/Native sheet의 adaptive intent | 스타일 엔진과 package dependency |

공식 참고 링크는 `docs/identity.md`의 참고 원칙에 고정합니다. 새 라이브러리를 참고할 때도
`문제 → 일반화한 계약 → HJM 기본값 → 플랫폼 번역 → 검증 화면`을 기록해야 합니다.

### 「검증 화면」에 후보를 적을 때

**구체적인 화면·컴포넌트 이름은 실제 코드에서 확인한 뒤에만 적습니다.** 확인하지 않았으면
`아직 없음`이 정확한 값이고, 그것만 적는 것이 정직한 문서입니다.

이 규칙이 필요한 이유는 **게이트가 여기를 못 보기 때문**입니다. `pnpm typecheck && pnpm test`는
이 저장소 안만 검사합니다. 그래서 "만들지 않는다" 판정은 근거가 저장소 안(다른 모듈의 계약)에
있어 어긋나면 테스트가 잡지만, 「검증 화면」은 근거가 **저장소 밖**(제품 코드)에 있어 같은
실수라도 걸리는 그물이 없습니다. 실제로 네 문서가 존재하지 않는 화면을 후보로 적어 두었고,
승격을 실측하기 전까지 아무도 몰랐습니다(`docs/consistency-audit.md` 3차).

그래서 후보를 적을 때는 **`파일:줄` 형태로 인용합니다.** 인용이 그 자체로 증명은 아니지만,
적는 사람이 파일을 열게 하고 읽는 사람이 반증할 수 있게 합니다. 인용할 수 없으면 그것은
후보가 아니라 짐작이고, 짐작은 적지 않습니다.

Ant Design의 현재 전체 범위는 [`ant-design-coverage.md`](./ant-design-coverage.md)와
`antDesignReferenceComponents`에 6.6.1 core 73개로 고정합니다. 73/73은 scope tracking이며
renderer 완료를 뜻하지 않습니다. 홈과 Showcase는 Web reference, contract-only, Native-only
증거를 표시하고, reference crosswalk의 fully mature, partial maturity, planned-only 수치와
분리합니다.

## 확장 구조

```text
Foundations ───────────────┐
Semantic color references ├─ Component fragments ─ Visual recipes ─┐
                           │                                         ├─ Web renderer
Behavior contracts ────────┤                                         ├─ RN renderer
Collection contracts ──────┘                                         └─ Product adapter
```

- `component-contracts.ts`: focus, field frame, floating surface, collection item처럼 여러
  recipe가 공유하는 내부 문법
- `component-recipes.ts`: anatomy, size, tone, visual state
- `behaviors.ts`: controlled state 이름, 유효한 state axis, Web keyboard/focus, RN
  accessibilityState, 공통 acceptance scenario
- `catalog.ts`: 구현 범위, 플랫폼 분류, maturity와 recipe/behavior 연결

시각 recipe만으로 구현 완료를 주장하지 않습니다. Menu, Tabs, Dialog처럼 행동이 중요한
컴포넌트는 behavior scenario까지 renderer 테스트가 통과해야 합니다.

## 공통 상태 축

| 축 | 값 |
| --- | --- |
| interaction | idle, hover, focusVisible, pressed, dragged |
| availability | enabled, disabled, readOnly, busy |
| value | empty, filled, checked, mixed, selected, open, expanded |
| validation | valid, invalid |
| content | idle, loading, loadingMore, empty, error |

컴포넌트는 필요한 축만 공개합니다. 예를 들어 Link는 disabled를 지원하지 않고, AlertDialog는
outside dismiss를 지원하지 않습니다. 반드시 별도 fixture로 검증할 조합은
`selected + focusVisible`, `invalid + focusVisible`, `busy + focusVisible`,
`open + selected item`입니다.

## Collection 기본 계약

Menu, Select, Combobox, DataTable, Tree가 서로 다른 데이터 모델을 만들지 않도록 다음을
공유합니다.

- stable string `id`
- 보이는 `label`과 typeahead/검색용 `textValue`
- 선택적 `description`, `disabled`; 위험 `tone`과 `shortcut`은 Menu descriptor에만 추가
- section의 보이는 label 또는 accessibility label
- `none | single | multiple` selection mode
- `idle | loading | loadingMore | empty | error` async state
- interactive item 안에 또 다른 button/link 금지

제품 객체를 recipe에 직접 넘기지 않습니다. 제품 adapter가 목적에 맞는 descriptor로 변환하며
도메인 ID를 유지하고, semantic tone은 그 의미를 지원하는 컴포넌트에만 전달합니다.

## 공개 배치

### 현재 실제 앱에서 검증 중

- Button, Field, Surface
- IconButton, Badge, CounterBadge
- SegmentedControl, Tabs, SearchField
- Checkbox, CheckboxGroup, RadioGroup
- List, ListRow, Divider, Section
- Notice, EmptyState, Skeleton
- Sheet, Dialog, Toast, BottomCTA, TopBar
- Select, Combobox

### Batch 1 — 기반과 행동 검증 (beta 적용 중)

- shared: Icon, Stack, Checkbox/CheckboxGroup/RadioGroup, Accordion
- adaptive: Link, Menu, AlertDialog
- web: Tooltip

Accordion은 disclosure behavior의 첫 shared 세로 슬라이스, Menu는 Web anchored surface와 RN
Sheet가 같은 결과를 만드는 adaptive 슬라이스, AlertDialog는 focus/back/async confirm을
검증하는 overlay 슬라이스로 사용합니다.

Tooltip은 현지화된 plain text 보충 설명만 허용하는 Web 전용 overlay입니다. focus는 즉시,
pointer는 지연 후 열고 trigger/content hover·pointer corridor·Escape·skip delay·한 번에 하나만
열림을 provider가 조정합니다. portal/flip/shift/RTL/visual viewport는 제품 Web renderer의
비공개 AnchoredOverlay에 두고 interactive Popover로 확장하지 않습니다. 상세는
`docs/tooltip.md`에 둡니다.

BurnTok 알림 버튼 vertical slice에서 실제 anchor clone, 기존 `aria-describedby`, focus와
pointer 수명주기, controlled close 거부, sibling FIFO, detached anchor, portal RTL과 viewport
collision을 검증했습니다. Tooltip surface는 interaction을 추가하지 않고 plain copy만
제공하며 Reduce Motion exit도 같은 완료 경계를 지나므로 Tooltip을 Web beta로 승격합니다.

Icon은 외부 package component를 화면에서 직접 고르는 방식 대신 HJM semantic name을 제품
adapter가 tree-shakeable glyph로 번역합니다. 기본은 decorative이며 정보 icon만 현지화된
접근성 이름을 요구하고, 논리 방향 icon만 RTL에서 mirror합니다. 상세는 `docs/icon.md`에 둡니다.

Link는 Button callback이 아니라 필수 `href`가 있는 목적지입니다. Web은 실제 anchor/Next Link로
modifier click·context menu·새 탭을 보존하고, Native는 internal Expo Router Link와 external
Linking adapter로 적응합니다. disabled·visited application state·download는 공통 API에 넣지
않습니다. BurnTok 메시지 목록의 고정 conversation-row adapter에서 Web anchor와 Native
`Link asChild`, unread 접근성 이름, modifier/context navigation, pressed feedback을
검증했으므로 Link를 adaptive beta로 승격합니다.
Stack은 반복되는 내부 flex를 감싸는 것만으로 제품 의미나 접근성 계약이 생기지 않으므로 실제
paired layout 요구가 나타날 때까지 planned recipe 이상으로 공개하지 않습니다.

BurnTok Web/RN과 Yajalal RN의 Toast tone mark, Yajalal Statistic trend mark에서 같은 semantic
registry·tone·size·stroke·RTL 계약을 실제 renderer로 검증했습니다. 제품 전용 야구 icon은
별도 adapter에 남기고 raw color·숫자 size·stroke override가 공용 API로 새지 않게 했으므로
Icon을 beta로 승격합니다.

AlertDialog는 `idle → busy → error/closing → closed` session을 공통 기반으로 삼습니다.
confirm side effect와 결과 정산을 별도 once guard로 나누지 않고 한 session이 소유하며,
outside dismiss는 영구 금지합니다. Web의 exit 완료와 Native Modal dismissal 이후에만 결과를
정산하므로 중첩 확인도 동시에 두 개가 열리지 않습니다.

Sheet는 beta 단계에서 `SheetOpenState`, concrete dismiss reason, `SheetDismissPolicy`와
`canDismissSheet`를 공통 계약으로 고정합니다. 기본값은 close/outside/Escape·back 허용,
busy dismiss와 swipe 금지입니다. controlled owner의 programmatic close는 항상 허용하고,
후속 overlay는 exit/onDismiss가 끝난 뒤 엽니다. drag handle은 swipe gesture capability와
명시적 policy가 모두 켜진 renderer에서만 보여 동작하지 않는 affordance를 만들지 않습니다.
visual recipe는 border/shadow, 콘텐츠 typography rhythm, Web max-width, safe-area, Reduce Motion만
담고 dismiss behavior는 포함하지 않습니다.

Toast는 root provider의 bounded FIFO와 stable-id update를 공통화합니다. queued 항목에는 timer를
시작하지 않고 visible 동안 pointer/focus/window/gesture pause를 합성하며, action과 dismiss는
한 revision에서 정확히 한 번만 처리합니다. 외형 tone과 announcement priority를 분리하고 모든
tone을 고유 icon mark와 함께 표시합니다. 상세 계약은 `docs/toast.md`에 둡니다.

선택 입력은 단일 mode prop으로 합치지 않습니다. Checkbox, CheckboxGroup, RadioGroup이
시각 recipe만 공유하고, Checkbox는 각 native tab stop, RadioGroup은 roving focus를 갖습니다.
그룹 값은 stable string id와 `ReadonlySet` 또는 nullable single key만 사용합니다.

### Batch 2 — 입력과 탐색 (beta 적용 중)

- shared: Steps, Statistic, Slider, NumberField, LoadMore
- adaptive: Select, Combobox, BottomNavigation
  - `ContextPanel`은 이 목록에서 뺐다. 선택 대상의 상세를 옆에 보여 주는 문제는
    `Drawer`를 분해할 때 이미 **Web `SidePanel`(+`modal: false`) / Native `Sheet`**로
    답이 나와 있었다. 로드맵이 컴포넌트 이름을 먼저 적어 두고 문제 정의를 나중으로
    미루면 이런 중복이 생긴다 — 근거는 `docs/context-panel.md`.
- web: Pagination, Breadcrumb

Statistic은 제품이 포맷한 문자열을 받아 label/value/hint/trend 위계만 통일합니다. trend 방향과
semantic tone은 독립이고 arrow/minus와 visible copy를 함께 사용합니다. 그룹은 각 값을 하나의
축약된 접근성 노드로 합치지 않습니다.

Yajalal의 선수·FA 기록 vertical slice에서 기존 StatGrid 호환 adapter와 새 Statistic renderer를
함께 검증했습니다. 좁은 폭에서는 1열까지 reflow하고 큰 글자에서도 값을 줄 수로 자르지 않으며,
각 통계의 label/value/hint/trend를 독립된 접근성 이름으로 유지하므로 Statistic을 beta로
승격합니다.

Select/Combobox는 Menu의 collection contract를 공유하지만 role과 dismiss behavior는 별도입니다.
Web은 listbox popup, Native는 Sheet를 사용합니다. Native 긴 목록에는 페이지 번호보다
LoadMore/infinite loading을 사용합니다.

LoadMore는 `ready | loading | error | complete` footer state와 stable `requestKey`만 공유합니다.
Web IntersectionObserver와 Native onEndReached는 플랫폼 renderer가 소유하고, 공통 controller는
요청 하나만 통과시켜 반복 viewport event와 retry 중복을 막습니다. automatic mode도 접근 가능한
manual fallback을 유지합니다.

BurnTok 홈 피드 vertical slice에서 Web IntersectionObserver와 항상 보이는 manual fallback,
Native FlatList onEndReached와 footer fallback을 같은 controller에 연결했습니다. 두 renderer 모두
탭과 다음 offset으로 requestKey를 만들고 실제 페이지 요청 Promise가 끝날 때까지 중복 호출을
차단하며 loading/error/complete 접근성 상태를 검증했으므로 LoadMore를 beta로 승격합니다.

BottomNavigation은 route source-of-truth를 복제하지 않고 `selectedKey`를 input으로만 받습니다.
Web renderer는 실제 link와 `aria-current`, Native renderer는 navigator의 preventable tabPress와
long press를 보존합니다. 숫자 badge는 visual subtree를 접근성에서 숨기고 item root에 합성된
이름을 한 번만 전달합니다. BurnTok 중앙 생성 action은 `center-gap`에 놓이는 sibling primary
action이며 destination collection에는 들어가지 않습니다. BurnTok Web/RN과 Yajalal RN 실제
navigation에 적용해 route state·disabled/reselect·긴 글자·safe area·RTL 계약을 검증했으므로
BottomNavigation을 beta로 승격합니다.

선행 타입은 Select의 nullable stable key와 Combobox의 `selectedKey`/`inputValue` 분리를
고정합니다. local filtering과 server-driven external filtering도 구분해 선택 상태와 비동기
검색 상태가 서로 덮어쓰지 않게 합니다. 실제 제품 흐름에서 확인된 stable key, stale result,
committed item snapshot만 공개하고 임의 값 생성이나 option 내부 action은 아직 추가하지 않습니다.

`validateCollection`, `flattenCollectionItems`, `resolveCollectionItem`,
`reconcileSelectSelection`은 먼저 공개합니다. item ID는 section 전체에서 유일하고 보이는
label·typeahead용 textValue·section accessible name은 비어 있을 수 없습니다. Select의 open
state도 selection state와 별도 controlled/uncontrolled 축으로 유지합니다.

### vertical slice가 없는 계약 — 채택 전 확인할 것

surface별 `planned → beta` gate는 public renderer export와 package CI가 실행하는 canonical
`default` proof를 요구합니다. 실제 제품 vertical slice는 별도의 adoption evidence이며,
없다면 beta의 환경 debt와 함께 공개되고 stable 승격을 막습니다. 제품 채택을 검토하는
과정에서 **전제가 이미 바뀌어 있던 사례**도 나왔습니다.

`Calendar`·`DatePicker`를 위임할 때 "야잘알 일정 찾기가 월 달력 격자를 자체 구현 중"이라는
전제를 줬는데, 저작자가 소스를 직접 확인해 그 전제가 **커밋 `0f4887c`(「일정 탐색기 월
그리드를 날짜 레일로 교체」)에서 이미 깨졌다**는 것을 찾아냈다. `buildCalendarCells`는
남아 있지만 렌더되지 않고 월 범위 쿼리의 내부 계산일 뿐이며, 화면은 월 헤더 + 7일
날짜 레일이다. 앱 전체에 값 하나를 고르는 압축 트리거 UI도 없다.

이후 DatePicker에는 first-party Web·Native renderer와 canonical 환경 증거가 추가되어
`beta`로 승격됐다. 다만 위 실측은 여전히 유효하다. **제품 adoption evidence는 없고**,
Yajalal의 날짜 레일을 DatePicker 채택으로 세지 않는다. 따라서 `stable` 승격 근거는 없다.

**교훈**: 위임할 때 준 실사용처 전제를 저작자가 **확인하게** 해야 한다. 리드의 기억은
커밋 하나로 낡는다.

### Batch 3 — 복합 데이터와 파일

- beta: Timeline, UploadItem, DatePicker, FilePicker
- planned: TimePicker
- web: DataTable, Tree, ColorPicker, CommandPalette, SidePanel, Popover

FilePicker는 파일 선택 의도만 소유합니다. 업로드 요청·재시도·서버 상태는 제품이 소유하고,
공유 UI에는 UploadItem의 progress/success/error/cancel 표현만 둡니다.

## 제품 적용 순서

### BurnTok

1. SearchField, CounterBadge, ShareSheet/ListRow
2. messages/notifications metadata row와 unread state
3. Sheet의 시각 recipe 연결 — 기존 focus trap·scroll lock은 보존
4. action Menu를 공유/피드에서 검증
5. Dialog와 AlertDialog를 분리

### Yajalal

1. SearchField, BottomCTA, Notice, CounterBadge
2. Chip을 action/radio/checkbox로 의미 분리
3. List/ListRow/Section/Skeleton을 공용 recipe에 연결
4. Accordion을 기록 상세에서 검증
5. Menu/Select를 선수·시즌 선택 흐름에 적용

제품 전용 `ai` accent, `built`, `live`, `win`, 구단 색은 adapter에 남고 recipe에는
`info`, `success`, `attention`, `brand` 같은 공용 의미만 들어갑니다. 반면
`SemanticIconName`의 `ai`는 특정 모델이나 제품 색을 뜻하지 않는 일반 “AI 기능”
아이콘 역할이므로 공용 registry에 둡니다.

## maturity gate

- surface `planned → beta`: public renderer export + package CI의 canonical default proof
- `beta → stable(shared)`: Web/RN renderer, 공통 scenario parity, Web keyboard,
  iOS VoiceOver, Android TalkBack, Reduce Motion + consumer adoption evidence
- `beta → stable(adaptive)`: 픽셀 parity 대신 같은 action/result/announcement, dismiss/back
  scenario 통과
- Web/Native 전용: 해당 플랫폼의 keyboard 또는 screen reader evidence

모든 단계에서 light/dark, 200% text 또는 큰 글자, RTL 가능한 API, 필수 텍스트 4.5:1,
경계·focus·indicator 3:1, 44-unit target을 확인합니다.

Sheet stable 승격에는 위 gate와 함께 모든 dismiss reason의 단일 callback, busy 차단,
Web focus/scroll lock, Native safe-area/back, Reduce Motion exit 완료, Sheet 종료 뒤 후속 surface
순서, opt-in swipe gesture의 실제 기기 검증이 필요합니다.
