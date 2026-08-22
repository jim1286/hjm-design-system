# v0.2 migration

`v0.2`는 기존 `THEMES`, foundations, Button/Surface/Field API를 유지하는 additive
release입니다. 소비 앱은 태그가 발행된 뒤 아래 순서로 전환합니다.

1. 당시 package name인 `@hjm/design-system` Git dependency를 정확한 `#v0.2.0`으로 변경
2. lockfile이 같은 HJM commit을 가리키는지 확인
3. 제품 어댑터가 신규 foundation, recipe, type을 명시적으로 re-export
4. Web token generator가 필요한 신규 foundation을 CSS variable로 변환
5. 기존 앱 component renderer를 beta recipe에 연결
6. typecheck, contrast test, Web/RN fixture와 실제 화면을 검증

## 신규 foundation

- `easing`, `spring`, `motionPreset`와 Reduce Motion fallback
- `opacity`, `stateLayer`, `stroke`
- `layout`, `breakpoint`, `layer`
- `shadow.floating`, `shadow.overlay`, renderer-neutral `backdrop`
- `semanticColors`

## 신규 공통 계약

- semantic color reference: `themeColor`, `accentColor`, `resolveColorReference`
- content/action: `textRecipe`, `iconButtonRecipe`, `chipRecipe`
- semantic icon/destination: `IconDescriptor`, `LinkDescriptor`, `LinkDestination`
- field affordance: accessible field label/hint colors, `searchFieldRecipe`
- selection/navigation: `selectionGroupRecipe`, `selectionControlRecipe`, typed Checkbox/RadioGroup
  selection helpers, `segmentedControlRecipe`, `switchRecipe`, `tabsRecipe`
- data display: `badgeRecipe`, `counterBadgeRecipe`, `avatarRecipe`, `dividerRecipe`, `listRecipe`, `listRowRecipe`, `sectionRecipe`,
  `StatisticDescriptor`, `resolveStatisticDescriptor`
- feedback: `noticeRecipe`, `emptyStateRecipe`, `skeletonRecipe`, `spinnerRecipe`, `progressRecipe`
- adaptive overlay: `dialogRecipe`, `alertDialogRecipe`, `sheetRecipe`, `toastRecipe`,
  `createAlertDialogSession`, `SheetOpenState`, `SheetDismissPolicy`, `canDismissSheet`,
  `createSheetLifecycle`, `ToastDescriptor`, `createToastSession`, `createToastStore`
- navigation feedback: `BottomNavigationDescriptor`, `LoadMoreState`, `createLoadMoreController`
- Web overlay planning: `TooltipDescriptor`, `TooltipOpenState`
- native layout: `topBarRecipe`, `bottomCtaRecipe`
- scope/maturity registry: `componentCatalog`, typed `recipeRegistry`
- renderer acceptance: `behaviorRegistry`, state-axis types, collection descriptors and selection models
- future collection controls: `validateCollection`, `flattenCollectionItems`,
  `resolveCollectionItem`, `getCollectionNavigationTarget`,
  `getCollectionTypeaheadMatch`, `reconcileSelectSelection`, `SelectOpenState`
- reusable visual fragments: focus indicator, field frame, floating surface, collection item
- planned/beta expansion recipes: Icon, Stack, Link, CheckboxGroup, RadioGroup, Accordion, Menu,
  AlertDialog, Tooltip, Statistic, LoadMore, BottomNavigation

## 호환성 메모

- `buttonRecipe`와 `fieldRecipe`에는 `slots`와 `defaults`가 추가됐습니다. 기존
  `tones`, `sizes`, `states` 접근은 그대로 동작합니다.
- Field label, hint, placeholder는 필수 안내로 취급해 모든 기본 surface에서 AA를 지키는
  `textBody`/`textMuted` 역할을 사용합니다. 검색의 아이콘·지우기 버튼·포커스 계약은
  `searchFieldRecipe`로 분리했습니다.
- 숫자 알림은 상태 라벨용 `badgeRecipe`가 아니라 solid fill과 `99+` 상한을 가진
  `counterBadgeRecipe`를 사용합니다.
- `surfaceRecipe`의 기존 index 접근은 그대로 유지합니다.
- light theme의 `danger` foreground는 tinted feedback surface에서도 WCAG AA를 지키도록
  `#b71919`로 깊어졌습니다. `dangerFill`은 `#b91c1c`, `onDanger`는 white 계약을
  유지합니다.
- 신규 recipe는 beta입니다. 두 제품과 Web/RN renderer 검증 전에는 prop 이름을
  stable API로 간주하지 않습니다.
- CheckboxGroup 값은 중복 없는 `ReadonlySet`이며 변경 때마다 새 Set을 emit합니다.
  RadioGroup은 nullable single key를 사용합니다. 단독 Radio를 값 입력으로 사용하지 않고
  RadioGroup item으로만 조합합니다.
- Native renderer에서 `required`, `readOnly`, `invalid`를 켤 때는 운영체제가 지원하는 공통
  접근성 state가 없으므로 현지화된 상태 문구도 함께 전달합니다. Group `required`는 개별
  checkbox/radio의 required로 복제하지 않습니다.
- 제품 전용 의미는 계속 어댑터에 남깁니다. BurnTok의 `ai` accent와 Yajalal `live`
  같은 상태/색 이름은 코어로 옮기지 않습니다. 공통 `ai` 아이콘 이름은 특정 제품
  스타일이 아닌 일반 “AI 기능” 의미 역할입니다.
- 위험 작업은 화면에서 직접 Promise와 loading boolean을 조합하지 않고
  `createAlertDialogSession`의 `idle/busy/error/closing/closed` 전이를 사용합니다. async confirm은
  현지화된 `fallbackErrorMessage`를 필수로 받고, 결과는 renderer exit 완료 후 정산합니다.
- Sheet의 `dismissible`은 visual `sheetRecipe.defaults`에서 제거되어
  `sheetBehaviorDefaults`/`SheetDismissPolicy`로 이동했습니다. 기존 renderer는 outside,
  Escape/Android back, busy, swipe를 각각 `canDismissSheet(reason, busy, policy)`로 판정하고
  `onOpenChange(false, { reason: dismissReason })`를 전달해야 합니다. 기본 swipe는
  꺼져 있으며 gesture capability와 policy가 모두 활성화된 경우에만 handle을 표시합니다.
- controlled owner가 `open=false`로 닫는 것은 `programmatic` reason이며 busy 또는
  `dismissible=false`여도 허용합니다. 후속 Dialog/AlertDialog는 Sheet exit/onDismiss가 끝난
  뒤 열어야 합니다.
- RN Android의 `Modal` 종료 시점을 `InteractionManager`로 추정하지 않습니다. successor surface를
  여는 Sheet는 native animation을 끄고 recipe 기반 enter/exit를 renderer가 소유한 뒤, exit 완료와
  Modal host teardown 이후에 `createSheetLifecycle.completeDismiss`를 호출합니다.
- Select/Combobox adapter는 section 전체에서 item ID를 유일하게 유지하고 비어 있는
  label/textValue/accessibility label을 거부해야 합니다. Select의 open state는 selection과
  별도 축이며, 사라진 key는 `reconcileSelectSelection`으로 정리합니다.
- collection item·section의 stable ID는 공백일 수 없습니다. typeahead는 locale-aware 검색을
  사용합니다. external Combobox는 raw `inputValue`와 제품이 정규화한 `queryValue`를 분리하고,
  `resultQuery === queryValue`인 결과만 표시합니다. transient 결과에 선택 항목이 없으면 stable
  key가 같은 `selectedItem` snapshot을 공급합니다. 공통 single/multiple selection도 controlled
  값과 default 값을 동시에 받을 수 없습니다.
- Select/Combobox renderer는 `selectRecipe`/`comboboxRecipe`를 사용합니다. Web은 popover/listbox,
  Native는 Sheet/radio options로 적응하며 Menu role을 대신 사용하지 않습니다.
- Toast renderer는 화면별 local timeout 배열 대신 `createToastStore`를 하나만 둡니다. 기존
  `toastRecipe.defaults.duration=4000`은 제거됐고 behavior의 기본 5000ms와 최소 5000ms로
  이동했습니다. action이 있는 Toast는 duration을 명시하지 않으면 persistent입니다.
- `toastRecipe`은 `surface`, `toneMark`, `title`, `description`, `action`, `close`, `viewport`,
  `placements` anatomy로 나뉘며 `transition.enter/exit`은
  `transition.web.enter/exit`과 `transition.native.enter/exit`으로 바뀌었습니다. 각 renderer는
  exit 또는 Reduce Motion 즉시 종료 뒤 `store.completeExit(id)`를 호출해야 합니다.
- Toast의 같은 stable id는 기본 `update + preserve timer`로 제자리 갱신됩니다. queue는
  bounded FIFO이고 pending overflow, action, close, timeout, programmatic close, provider teardown은
  모두 구체적인 `ToastDismissReason`을 한 번만 전달합니다. hover/focus/window/gesture pause와
  announcement priority 번역은 [`toast.md`](./toast.md)의 renderer acceptance를 따릅니다.
- color resolver에는 제품 alias가 아니라 `statusAccents`와 `statusAccentFills`를
  분리해 전달합니다. 예를 들어 BurnTok `ai`는 제품 API에 남고 resolver에는 원래의
  `info` status role이 들어가야 합니다.
