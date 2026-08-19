# HJM Design System Architecture

## 계약 계층

```text
Foundations
color · spacing · radius · type · motion · elevation · layout
        ↓
Semantic references
themeColor · accentColor · generic status roles
        ↓
Shared component contracts
focus indicator · field frame · floating surface · collection item
        ↓
Component recipes
slots · defaults · variants · sizes · states
        ↕
Behavior and collection contracts
controlled state · keyboard · focus · accessibility · async collection
        ↓
Platform renderers
React DOM / React Native
        ↓
Product adapters
BurnTok vocabulary / Yajalal KBO vocabulary
```

`@hjm/design-system`은 TypeScript 외 런타임 의존성이 없는 계약 패키지로 유지합니다.
React, React Native, DOM, Expo import는 코어에 들어오지 않습니다.

시각 recipe와 behavior contract를 분리합니다. 전자는 어떤 모습인지, 후자는 어떤 상태와
상호작용을 보장하는지를 말합니다. renderer는 다른 primitive를 쓸 수 있지만 같은 behavior
scenario를 통과해야 합니다.

## Recipe 형식

신규 recipe는 가능한 한 다음 항목을 가집니다.

- `slots`: root, label, icon, indicator처럼 스타일과 접근성 책임이 있는 anatomy
- `defaults`: HJM다운 기본 선택
- `tones` 또는 `variants`: 의미와 강조 수준
- `sizes`: 높이, padding, gap, glyph, text variant
- `states`: pressed, focused, selected, disabled, loading, invalid
- 플랫폼 renderer가 번역할 semantic color reference

모든 조합을 열어두는 것이 목표가 아닙니다. HJM다운 승인 조합만 public API로 만들고,
제품 화면의 임의 style override보다 recipe의 새 variant를 우선합니다.

## 지원 단계

- `stable`: 두 제품 이상 또는 두 플랫폼에서 사용되고 계약·접근성 검증이 있음
- `beta`: 실제 앱 패턴을 공용 recipe로 승격했지만 renderer parity 또는 시각 회귀가 진행 중
- `planned`: 범위에 포함되지만 API를 아직 안정화하지 않음
- `deprecated`: 새 사용을 막고 대체 경로와 제거 예정 버전을 문서화한 호환 계약

현재 전체 범위와 목표 플랫폼 분류는 `componentCatalog`가 기계 판독 가능한 형태로 제공합니다.
계획된 컴포넌트를 catalog에 올리는 것은 구현 완료를 의미하지 않습니다.
`recipeRegistry`가 실제 recipe와 catalog 이름을 타입으로 묶어 오타나 유령 계약을 막습니다.

새 소비자는 `componentDefinitions`를 우선합니다. 이 normalized view는 display name이나 category가
바뀌어도 유지되는 `ComponentId`, `primitive | component | provider | utility` kind, 복수
recipe/behavior 배열, Web/Native별 status와 고정 documentation story ID를 제공합니다. v0.2의
평면 `componentCatalog`는 호환 view로 유지하며 renderer가 순차적으로 definition schema로
이동합니다.

## 플랫폼 분류

- `shared`: 같은 semantic API와 시각 계약을 Web/RN renderer가 각각 구현하는 목표
- `adaptive`: 같은 사용자 의도를 dialog/sheet, select/action sheet처럼 플랫폼에 맞게 구현
- `web`: data grid, tree, breadcrumb처럼 우선 Web에서 검증
- `native`: safe-area CTA처럼 우선 Native에서 검증

## 선택형 탐색의 의미 경계

- `Tabs`: 서로 관련된 콘텐츠 panel 중 하나를 표시합니다. `keyed` mode는 tab과 panel을
  같은 stable key로 연결하고, `dynamic` mode는 모든 tab이 하나의 stable panel을 제어하며
  선택이 바뀔 때만 panel의 label과 content를 갱신합니다. 비동기 panel은 기본 `manual`
  activation을 사용합니다.
- `SegmentedControl`: 현재 화면 안의 값·필터·표현 모드를 고릅니다. 별도 tabpanel 관계를
  만들지 않습니다.
- `BottomNavigation`: Web과 Native에서 앱의 2–5개 안정된 최상위 route를 이동합니다.
  콘텐츠 Tabs의 recipe, panel, roving focus를 재사용하지 않고 router의 현재 route를
  read-only `selectedKey`로 받습니다. Web은 navigation landmark 안의 실제 link와
  `aria-current="page"`, Native는 navigator의 selected state와 `tabPress`/`tabLongPress`를
  사용합니다. iOS navigator가 tab role을 안정적으로 지원하지 않는 경우 button+selected
  fallback을 명시적으로 허용합니다.

BottomNavigation item은 destination만 허용합니다. 생성·작성처럼 새 작업을 시작하는 primary
action은 item, selected state, route count에서 제외하고 별도 Button/IconButton으로 합성합니다.
`center-gap` distribution은 이 sibling action의 자리를 예약할 뿐 action을 계약에 포함하지
않습니다. 자세한 renderer 규칙은 `docs/bottom-navigation.md`에 둡니다.

## 목적지와 동작의 경계

`Link`는 `href`가 있는 목적지이고 `Button`은 command입니다. 내부 route와 외부 URL을
discriminated destination으로 구분하되 Web은 실제 anchor/Next Link, Native는 Expo Router
Link 또는 external Linking adapter를 사용합니다. 공통 API가 `onClick`/`onPress`로 navigation을
대체하지 않습니다.

disabled, visited application state, download는 공통 Link API에 없습니다. unavailable 목적지는
plain Text로, 파일 저장은 별도 workflow로, 인증·retry·back 같은 command는 Button으로
표현합니다. Link의 icon은 semantic name만 허용하고 recipe가 크기·tone·방향을 소유합니다.
별도 접근성 이름은 visible label을 포함하며 resolver는 숨은 플랫폼 field를 보존하지 않습니다.
자세한 계약은 `docs/link.md`에 둡니다.

## 선택 입력의 의미 경계

- `Checkbox`는 독립적인 참/거짓 값입니다. 집계 상태에서만 `mixed`를 허용하고, 기본
  activate는 `mixed → checked`입니다.
- `CheckboxGroup`은 중복 없는 `ReadonlySet`을 값으로 사용합니다. 각 checkbox가 Web의
  독립 tab stop이며 방향키를 가로채지 않습니다. 긴 Native 목록은 그룹이 렌더링을 소유하지
  않고 같은 `Checkbox` row 계약을 가상 목록 안에서 조합합니다.
- `RadioGroup`은 하나 이하의 값을 선택합니다. Web은 roving focus와 방향·RTL을 반영한
  방향키 이동을 제공하고, Native는 각 radio의 `checked` 상태와 activate action을 제공합니다.
  Radio를 그룹 밖의 독립 입력으로 공개하지 않습니다.
- 보이는 group label 또는 명시적인 accessibility label 중 하나는 필수입니다. label,
  description, error는 서로 연결하고, disabled/readOnly는 상태를 바꾸지 않습니다.
- Native에는 Web의 `aria-required`, `aria-readonly`, `aria-invalid`와 동등한 공통 state가
  없으므로 해당 상태를 켜는 renderer API는 현지화된 상태 문구를 함께 요구하고
  `accessibilityHint` 또는 오류 live region으로 전달합니다. 그룹의 `required`를 각 item의
  required 상태로 복제하지 않습니다.

선택 행 전체가 하나의 target이며 내부에 또 다른 button/link를 넣지 않습니다. `plain`과
`card`는 승인된 표현만 고르고, 선택 여부는 색뿐 아니라 checkbox check/dash 또는 radio dot으로
항상 드러냅니다. 항목 간격은 임의 합성하지 않고 `vertical/plain=4`, `vertical/card=8`,
`horizontal/plain=12`, `horizontal/card=16`의 orientation×presentation 계약을 그대로 씁니다.

`keyed` Tabs의 mount policy는 `active`(활성 panel만), `visited`(방문한 panel 상태 보존),
`always`(모두 mount하되 비활성 panel은 hidden·inert)로 제한합니다. `dynamic` mode는 하나의
host 인스턴스를 유지하므로 `active`만 허용합니다. 자동 활성화는 panel이 이미 준비되어
포커스 이동과 동시에 지연 없이 표시될 때만 명시적으로 선택합니다.

Native의 필수 접근성 baseline은 각 tab의 이름, `selected`/`disabled` 상태와 activate action입니다.
`tablist`/`tabpanel` role은 운영체제별 지원이 달라 renderer hint와 실제 기기 검증 항목으로 두며,
중첩 control을 숨길 수 있는 panel 전체의 `accessible` 병합은 금지합니다.

## 위험 확인의 생명주기

`AlertDialog`는 단순히 열린 boolean과 빨간 버튼을 공유하지 않습니다. 삭제·결제처럼 되돌릴 수
없는 side effect를 한 번만 실행하고, 닫힘 모션이 끝난 뒤 결과를 돌려주는 session을 공통
계약으로 사용합니다.

```text
idle ─ confirm ─→ busy ─ success ─→ closing ─ exit complete ─→ closed
  ↑                  └─ failure ─→ error ─ retry ───────────────┘
  └──────────── cancel / escape / back (idle 또는 error에서만) ─┘
```

- `busy`에서는 confirm 연타와 cancel, Escape, Android back을 모두 무시합니다.
- outside press는 상태·콜백·결과를 전혀 바꾸지 않습니다.
- 오류 번역기가 실패하거나 빈 문장을 반환해도 현지화된 fallback 오류를 발표합니다.
- 결과 Promise는 action 시점이 아니라 실제 exit 완료 시 한 번만 끝납니다.
- provider unmount나 route 교체는 `interrupted` 결과로 정산해 pending Promise를 남기지 않습니다.
- confirm 모드는 cancel, 확인만 있는 alert 모드는 confirm에 초기 포커스를 둡니다.
- Web은 modal isolation·Tab trap·trigger focus restore를, Native는 custom Modal·back 처리·초기
  accessibility focus·live error를 renderer에서 보장합니다.

일반 `Dialog`와 `Sheet`도 이후 같은 `open reason → closing → exit complete` 문법을 공유하지만,
outside dismiss 허용 여부와 action/result 의미는 각 behavior가 따로 소유합니다.

### Sheet 열림·닫힘 계약

Sheet renderer는 `SheetOpenState`의 controlled/uncontrolled 축을 섞지 않고 모든 닫힘을
`close-action | escape | back | outside | swipe | programmatic` 중 하나로 보고합니다.
기본 `SheetDismissPolicy`는 idle 상태의 close action, outside, Escape/Android back만 허용하며
swipe와 busy 중 사용자 dismiss는 허용하지 않습니다. 제품이 직접 `open=false`로 바꾸는
programmatic close는 controlled owner의 권한이므로 policy나 busy 상태로 막지 않습니다.

`canDismissSheet`가 플랫폼 이벤트를 이 정책으로 해석하는 유일한 공통 경계입니다. 기본 RN
behavior 목록에는 아직 swipe를 넣지 않습니다. 실제 gesture capability가 있고 제품이
`swipeDismiss=true`를 선택한 renderer만 swipe를 연결하며, 그때만 drag handle을 표시합니다.
handle은 장식이 아니라 가능한 동작의 신호이므로 기본값은 hidden입니다.

지속 마운트되는 Native Modal renderer는 `createSheetLifecycle`로 visible cycle을 발급하고
close 요청과 dismiss 완료를 각각 한 번만 수락합니다. iOS `onDismiss`나 플랫폼 adapter가
확인한 종료 시점에 `completeDismiss(cycle)`을 호출해야 다음 surface를 열 수 있습니다.
Android의 `InteractionManager`만으로는 native Modal의 slide 종료를 확인할 수 없습니다.
Android까지 정확한 successor 순서가 필요한 renderer는 `animationType="none"`인 native host 안에서
퇴장 모션을 직접 실행하고, 그 animation 완료 뒤 host를 내린 다음 cycle을 완료합니다.

Sheet의 visual recipe는 dismiss 정책을 소유하지 않습니다. border/shadow, title/body/footer의
type·gap, Web max-width, bottom safe-area의 additive padding, Reduce Motion fallback만 제공합니다.
renderer는 `paddingBottom + safe-area inset`을 적용하고, transform을 줄여도 exit 완료 콜백은
항상 한 번 발생시켜야 합니다.

Overlay stack coordinator가 모든 renderer에 들어가기 전에는 modal surface를 중첩하지 않습니다.
Sheet 안에서 AlertDialog가 필요하면 Sheet를 먼저 닫고 exit/onDismiss 완료 뒤 후속 surface를
엽니다. 이 규칙은 Web의 Escape·focus trap 경쟁과 iOS의 Modal-on-Modal 발표 순서 문제를
동시에 피합니다.

## Select와 Combobox의 적응형 경계

Select와 Combobox는 Menu와 같은 collection contract를 사용하지만 Menu role을 재사용하지
않습니다. Web은 field + popover/listbox, Native는 field + modal Sheet/radio options로 렌더링하고
선택 결과와 상태 의미만 공유합니다.

- `Select`는 기존 항목의 stable key 하나 또는 `null`만 값으로 사용합니다. label을 값으로
  저장하지 않습니다.
- `SelectItemDescriptor`는 Menu 전용 `tone`/`shortcut`을 허용하지 않습니다. 위험 action과
  단축키는 `MenuItemDescriptor`에만 존재해 Select/Combobox가 색만으로 의미를 만들지 않습니다.
- `validateCollection`은 빈 section·item ID와 중복 ID, 빈 label/textValue, section accessible name을
  renderer가 열리기 전에 거부합니다. `flattenCollectionItems`와 `resolveCollectionItem`은 Web
  popup과 Native sheet가 같은 key namespace를 소비하게 합니다.
- `getCollectionNavigationTarget`과 `getCollectionTypeaheadMatch`는 disabled skip, wrap,
  section 간 탐색 순서를 공통화합니다. typeahead는 NFC 정규화와 locale-aware base-sensitivity
  비교를 사용하고, 문자열 buffer와 timeout은 renderer가 소유합니다.
- collection 변경 뒤에는 `reconcileSelectSelection`으로 사라진 key를 `null` 또는 첫 enabled
  key로 정리합니다. 아직 존재하지만 disabled가 된 현재 선택은 보존합니다.
- `Combobox`는 선택 key와 입력 문자열을 서로 다른 controlled 축으로 둡니다. 검색어와 선택값을
  하나의 string prop으로 합치지 않습니다.
- `filtering="local"`은 renderer가 `textValue`로 필터링하고, `external`은 제품이 결과와
  `loading/loadingMore/empty/error` 상태, 서버에 실제 요청한 canonical `queryValue`, 그 결과를
  만든 `resultQuery`를 공급합니다. 사용자가 편집 중인 raw `inputValue`는 IME 조합과 공백을
  보존하며 stale 판정에 직접 쓰지 않습니다.
- external 결과 목록은 committed value의 저장소가 아닙니다. 현재 결과가 선택 항목을 포함하지
  않으면 제품이 stable key가 같은 `selectedItem` snapshot을 공급하고
  `resolveComboboxSelectedItem`이 일치 여부를 검증합니다. 비동기 Select도 같은 이유로
  `selectedItem`을 받을 수 있으며, loading/loadingMore/error 동안에는
  `reconcileSelectSelection`이 committed key를 지우지 않고
  `resolveSelectSelectedItem`이 표시 copy를 보존합니다.
- Web popup과 Native sheet는 외형·dismiss 방식이 달라도 선택 결과, 오류 발표, disabled skip,
  stable key reconciliation은 같아야 합니다.
- 임의 값 생성은 실제 제품 요구와 별도의 discriminated policy가 생기기 전까지 공개하지
  않습니다. Select와 기본 Combobox는 기존 option 선택과 clear만 commit합니다.

`selectRecipe`와 `comboboxRecipe`는 같은 field frame, floating surface, collection item grammar를
조합합니다. Web/RN 구현이 픽셀 parity를 만들 필요는 없지만 44-unit target, visible focus,
selected indicator, invalid border, support copy, loading/empty/error announcement는 같아야 합니다.
기본 키보드 탐색은 collection 경계에서 멈추며(`loop: false`), 순환은 제품이 명시적으로
선택할 때만 켭니다. behavior registry의 `controlled`에는 state triplet만 두고,
서버 결과 같은 read-only 값은 `inputs`, 후속 side effect 알림은 `events`로 구분합니다.

## Toast queue와 announcement 경계

Toast는 controlled `open` 하나가 아니라 앱 root의 bounded FIFO입니다. 제품은 plain-text
`ToastDescriptor`와 stable id를 publish하고, `createToastSession`이 queued/visible/closing/closed,
timer pause, action과 dismiss의 exact-once를 소유하며 `createToastStore`가 visible slot과 pending
promotion을 소유합니다. 실제 clock, animation, live region과 native announcement는 renderer에
남깁니다.

queued 시간에는 timer가 시작되지 않습니다. visible이 된 뒤에만 renderer가 경과 시간을
전달하며 pointer, focus, window/app background와 gesture pause가 모두 풀린 경우에만 흐릅니다.
자동 닫힘은 최소 5000ms이고 action이 있으면 기본 persistent입니다. visual exit가 끝난 뒤
`completeExit`을 호출해야 다음 FIFO 항목이 올라오고 `onDismiss`가 정확히 한 번 정산됩니다.
Reduce Motion의 즉시 exit도 같은 완료 경계를 건너뜁니다.

tone과 announcement priority는 독립입니다. tone은 HJM recipe의 색과 서로 다른 non-color mark를
고르고, `normal | high` priority는 Web polite/assertive 또는 Native announcement scheduling으로
번역합니다. 색이 위험하다는 이유만으로 사용자의 현재 screen reader 발화를 끊지 않습니다.
상세 descriptor, dedupe/update, overflow와 renderer acceptance는 [`toast.md`](./toast.md)를 따릅니다.

## 목표 패키지

```text
@hjm/design-system       토큰·recipe·catalog
@hjm/react               DOM·ARIA·focus·keyboard renderer
@hjm/react-native        Pressable·Modal·safe-area renderer
@hjm/icons               같은 의미의 Web/RN icon adapter
@hjm/testing             contract·접근성·fixture parity 도구
```

renderer 패키지는 코어 계약이 앱에서 반복 검증된 뒤 분리합니다. 초기에는 각 앱의 얇은
renderer를 유지해 API를 검증하고, 안정화된 구현만 패키지로 이동합니다.

## 적용 순서

1. HJM theme를 모든 앱의 유일한 시각 원천으로 고정
2. Button, Field, Surface의 Web/RN parity 복구
3. Badge, CounterBadge, SearchField, ListRow, SegmentedControl, Switch, Notice, Skeleton을 공용 recipe로 승격
4. BurnTok Web/RN의 테마 선택·검색·알림·공유 흐름에 적용
5. Yajalal 설정·전체 목록·홈 화면에 적용
6. Dialog, Sheet, Toast 같은 behavior-heavy renderer 안정화
7. Select, Menu, DatePicker처럼 플랫폼 적응형 입력 확장
8. DataTable, Tree, CommandPalette를 Web-first experimental로 검증

세부 배치와 외부 시스템에서 흡수하는 원칙은 `docs/expansion-roadmap.md`를 따릅니다.

## 출시 규칙

- public token/recipe 변경에는 타입 검사, 계약 테스트, light/dark 대비 검증을 포함합니다.
- beta → stable 승격에는 Web/RN fixture, 키보드 또는 screen reader 검증, Reduce Motion 확인이
  필요합니다.
- 소비 앱은 정확한 SemVer Git tag를 고정하며 `main`이나 로컬 경로를 커밋하지 않습니다.
- 제거는 deprecation 기간과 migration note를 거칩니다.
- 원시 팔레트나 제3자 라이브러리 이름을 public component prop으로 노출하지 않습니다.

## 향후 토큰 교환

Figma와 코드 생성이 필요해지면 [Design Tokens Community Group 형식](https://www.w3.org/community/design-tokens/)
으로 foundations와 semantic roles를 직렬화합니다. JSON 파일을 당장 source of truth로
도입하기보다 현재 TypeScript 계약과 동등성 테스트를 먼저 만든 뒤 전환합니다.

## 오버레이 어휘 규칙

병렬 저작에서 같은 개념이 다른 이름을 갖는 일이 실제로 일어났다(`docs/consistency-audit.md`).
다음 둘은 이제 규칙이다.

- **여는 사유는 `"trigger"`다.** `"trigger-activation"`이라 부르지 않는다. 그 문자열은
  `src/tooltip.ts`에서 **닫는** 사유(열려 있는 툴팁의 트리거를 눌러 닫는다)로 이미 쓰인다.
  한 문자열이 여는 뜻과 닫는 뜻을 겸하면 렌더러가 조용히 반대로 처리한다 — 두 값 모두
  유효한 문자열이라 컴파일러가 잡지 않는다.
- **바깥 닫힘은 모달이면 `"outside"` 하나, 비모달이면 `"outside-pointer"`와
  `"outside-focus"`로 나눈다.** 모달은 바깥이 불활성이라 입력 양식을 구분할 필요가 없지만,
  비모달은 Tab으로 초점이 빠져나가는 것이 포인터 클릭과 다른 사건이다.

공용 `BehaviorContract.dismiss`가 각 모듈의 사유보다 거친 것은 버그가 아니다. 레지스트리는
렌더러 테스트가 읽는 **요약**이고, 정밀한 계약은 모듈 자신의 타입이 갖는다.
