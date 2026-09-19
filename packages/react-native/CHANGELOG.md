# @hjmds/react-native

## 1.3.3

### Patch Changes

- db11e92: AuthScreenLayout의 Showcase 등록을 마칩니다.

  Web Storybook 패턴 스토리(`Patterns/Agreement` → `SignInScreen`)와 Native gallery 미리보기,
  두 레지스트리 항목, Web renderer definition을 더했습니다. 1.3.2는 이 등록이 빠져 있어
  릴리스 검증의 showcase 게이트에서 막혔습니다.

  공개 API는 바뀌지 않습니다.

## 1.3.2

### Patch Changes

- 8b053b6: AuthScreenLayout의 렌더러 배선을 마칩니다.

  두 렌더러의 granular export(`./auth-screen`), evidence claim과 실행 가능한 default 사례,
  Metro fixture, package boundary 목록, 그리고 새 진입점의 명시적 그래프 예산을 더했습니다.
  1.3.1은 계약·렌더러 소스만 담고 이 배선이 빠져 있어 릴리스 검증에서 막혔습니다.

  공개 API는 1.3.1과 같습니다 — 빠져 있던 진입점이 실제로 열립니다.

## 1.3.1

## 1.3.0

### Minor Changes

- 1d0c923: AuthScreenLayout — 로그인 화면의 두 영역 골격을 추가합니다.

  계정이 있는 제품들이 같은 로그인 화면을 각자 조립하면서 같은 실수를 반복했습니다. 로고·제목·
  설명·동의 고지·정책 링크를 위에서부터 쌓아 제공자 버튼이 화면 밖으로 밀렸고(2026-09-19 실측),
  간격·최대 폭·마크 크기가 제품마다 달랐으며, 정책 링크가 44pt 터치 기준에 못 미쳤습니다.

  `AuthScreenLayout`은 **배치만** 소유합니다. 위 영역(hero + main)이 남는 세로 공간을 차지하고
  그 안에서 가운데 정렬하며, 아래 영역(footer)은 바닥에 붙습니다. 내용이 화면보다 길면 스크롤로
  전환하고 아래 영역을 겹치지 않습니다. 제공자 버튼 높이는 기존 `authProviderButtonRecipe`가
  그대로 소유합니다.

  문구·마크 자산·제공자 목록·정책 링크 목적지·인증 흐름은 계약에 없습니다. 제품이 슬롯으로
  넘깁니다 — 제품마다 `main`에 넣는 것이 다르기 때문입니다(제공자 버튼만, 또는 가입 재개·심사자
  입력 같은 제품 덩어리).

  마이그레이션: 기존 코드는 영향받지 않습니다. 새 컴포넌트를 쓰려면
  `import { AuthScreenLayout } from "@hjmds/react"` 또는 `"@hjmds/react-native"`.

### Patch Changes

- Updated dependencies [1d0c923]
- Updated dependencies [ca7c84d]
  - @hjmds/design-contracts@1.3.0

## 1.2.0

### Minor Changes

- cdc9ee0: Close the coverage audit's P1 and P2 findings and fill the four Native gaps.

  Add Collapsible on both renderers: a lone disclosure differs from Accordion by
  relationship, not count, so it carries no group keyboard model, no dividers and
  no one-open-at-a-time policy. Closed content is unmounted rather than hidden, so
  the accessibility tree agrees with the collapsed state.

  Add ContextMenu and Menubar on Web. ContextMenu reuses Menu's item vocabulary and
  changes only the anchor: opening by keyboard (Shift+F10 or the Menu key) is part
  of the contract, and it anchors to the focused element's box rather than the
  viewport origin. Menubar is one keyboard unit — left/right move between open
  menus, exactly one menu is open, and the bar is a single tab stop.

  Add a hover axis to Popover. Hover is added to the click path, never a
  replacement, because touch and keyboards have none; both edges are delayed so a
  pass-through does not flash and the gap to the panel stays crossable.

  Add Asset on both renderers: one frame for icon, image, Lottie and video, with
  the media itself arriving as a slot so neither package depends on a player. A
  meaningful asset without a name is rejected, as is a decorative one that carries
  one. Reduced motion freezes the frame instead of removing the asset.

  Add the dataviz token contract — series palette, chrome tokens and a redundant
  encoding rule — without a chart renderer. Drawing stays with the product's chart
  library; the portfolio's actual defect was inconsistent color.

  Add a global density axis to the provider. Lists, menus and tables take it as
  their default while an explicit component prop still wins; each component keeps
  its own density vocabulary and a single mapping function translates between them.

  Define the button label wrap policy in the recipe: wrap up to two lines instead
  of truncating, and lift the cap under large text so a user's own text size is
  never clipped. Web and Native now resolve the same answer.

  Add Native renderers for TagsInput, DateRangePicker, Mentions and TransferList.
  Each reuses the existing contract judgment and records where the surface really
  differs: return is the only commit key on a phone, there is no hover preview for
  a range, the caret is only available through onSelectionChange, and two panels
  do not fit side by side.

- cdc9ee0: Extend TopBar and BottomCTA to React DOM using the existing Native recipes and
  Toss-inspired screen composition. Add matching top-bar and bottom-cta entry paths
  to both renderers, preserving the existing Native family exports. Web chrome
  supports safe areas, semantic headings/actions, large text, and in-flow sticky CTA.

  Add a finite keyed Carousel on Web and Native with controlled/uncontrolled
  selection, inactive-content isolation, localized controls, opt-in autoplay guards,
  Web keyboard navigation and Native swipe/adjustable accessibility actions.
  Preserve focusable aria-disabled Button/IconButton behavior. Add a hidden-label
  Switch composition on both surfaces and keep indented Web list dividers from
  shifting the row content.

  Add FloatingActionButton on both renderers with a persistent button, scroll
  direction hooks, additive safe-area placement and measured content-clearance
  callbacks. Include a working notes-list and create-dialog composition.

  This is part of the React/React Native completion work recorded in
  design-contracts/docs/react-native-completion.md. Publish the minor train after
  the complete implementation and verification, then update compatible apps.

  Add inline Calendar for React and React Native. DatePicker reuses the same grid, including disabled-date semantics, large-text target sizing, and product-owned month navigation.

  Add working React/Native time selection and rating compositions using the existing Select, Slider, and Statistic public APIs, with explicit confirmation and reset flows.

  Expose granular React Breadcrumb and Pagination entries, preserving navigation/root compatibility. Keep boundary pagination controls focusable with guarded activation and wrap long RTL trails. Add React Anchor with document/custom-container scroll tracking, section focus, reduced-motion behavior, fragment history, and observer cleanup. Include working record-browser and reading-guide compositions.

  Add React Popover with a named non-modal dialog, contextual form focus, guarded dismissal, owned nested portals, viewport collision fallback, and inert exit surfaces. Preserve outside pointer/Tab destinations and let child popovers handle Escape before a containing Dialog. Include working filters and reversible confirmation/undo compositions.

  Add React SidePanel for modal and non-modal docked panels, sharing the existing
  modal stack, scroll lock, and focus return with Dialog and Sheet. Non-modal panels
  leave the page interactive, keep their own Escape handling, and cannot declare
  outside dismissal. Logical start/end edges mirror in RTL and dismissal reports one
  concrete reason with a single completion callback.

  Add React Splitter for two-pane resizing. Drag and keyboard produce the same
  snapped value through the existing numeric range judgment, logical start/end
  direction mirrors in RTL for both, off-axis arrow keys stay with the pane
  content, and a boundary step reports no settlement.

  Add React Tour for anchored step walkthroughs. Products resolve each opaque
  anchor key themselves; focus moves to the step card on every step, the page
  behind stays inert, an outside pointer never dismisses, the last step closes as
  complete, and an unmounted open tour settles once as interrupted.

  Add React Tree for hierarchical Web navigation. Every decision — arrow handling,
  visible-node movement, typeahead, expansion reconciliation — comes from the
  existing contract helpers. Nodes keep one tab stop each, announce depth and
  sibling position, and can carry tri-state check marks derived from the
  tree-select module. TreeSelect and Cascader ship as working compositions of
  Popover, Tree, and those helpers rather than new components.

  Add React TransferList and Mentions. TransferList moves rows entirely by
  keyboard, places focus on the row that slid into the removed position, leaves
  moved rows unselected at the destination, and excludes disabled rows from
  select-all. Mentions layers the existing Combobox list vocabulary on a TextArea,
  re-reading the caret on movement as well as edits, and commits through the
  contract's insertion range.

  Add React CommandPalette and DataTable. The palette is a modal takeover sharing
  the existing modal stack, always closing on activation and running any follow-up
  command after it is gone. DataTable adds interactive grid semantics — a sort
  button inside each sortable header, tri-state select-all that excludes disabled
  rows, and shared async state — while the existing Table stays the display-only
  option.

  Keep field support text visible and described when an error appears, and merge
  it with the consumer's own aria-describedby instead of replacing it. Add
  Dialog's onDismissComplete so a product can open the next overlay when the
  portal and focus restoration are actually finished, instead of guessing with a
  timer; it fires exactly once, including on unmount and under StrictMode.

  Add Agreement for consent lists on both renderers: all-agree is derived from the
  items, only required rows decide whether the product may submit, a required row
  can never be disabled, and each item's full text opens from its own tab stop
  that never toggles consent.

  Add Top, the screen's first heading block, on both renderers. It is body content
  that scrolls with the page — distinct from the fixed TopBar — and emits a real
  heading element at the declared level.

  Add AuthProviderButton for Google, Kakao, Naver and Apple sign-in. Colors come
  from each provider's published guideline table and the theme only picks between
  the provider's own light and dark variants; products supply the logo asset and
  the localized label.

  Add Heading, which exposes the existing 40/32/24/20/18 heading scale as real
  heading elements with the visual size and the document level as separate axes.
  No new type sizes are introduced.

  Add a circular Progress shape that draws the same value, keeps the same
  element and the same announcement, and reuses the existing size tokens.

  Add a loading ListRow that reserves the real row's line boxes, so a list no
  longer jumps when content replaces a product-owned skeleton.

  Add ToggleGroup for turning several options on at once, with single choice
  staying with SegmentedControl, and a Web TagsInput for values that are not in
  any list — Enter commits, the first Backspace only arms the last tag, and the
  policy reports why a value was rejected instead of swallowing it.

  Add SkipNav, the WCAG bypass link that stays hidden until focus and then moves
  focus into the target rather than only scrolling to it.

  Add BottomInfo for the standing conditions under a primary action — no alarm
  tone, no status role, a sentence when there is one line and a list when there
  are several — on both renderers.

  Add Sidebar, a grouped desktop navigation whose collapsed state hides labels
  while keeping every item, its badge and its accessible name. BottomNavigation
  keeps the three-to-five destination mobile case.

  Add Sheet detents so a user can step an open sheet between sizes, with the
  handle as an accessible control rather than a drag-only affordance; gesture
  physics stay with the product and report through the same callback.

  Add DateRangePicker on Web, reusing the Calendar grid. The value shape differs
  from single selection, so Calendar gains no mode axis; picking an earlier
  second date swaps the ends instead of rejecting the click, and the hovered
  preview runs through the same cell-state function.

  Add useDialog and useSheet over an OverlayStackProvider. The provider owns the
  open state and the mount point, and the returned handle resolves once the
  overlay is actually gone — replacing the 0ms timers products used to guess with.

  Add locale-required number, currency, percent and byte formatters, and a React
  Native keyboard/haptics contract: the platform-correct avoidance behavior, a
  safe-area inset counted once, and haptic intents named by meaning that stay
  silent for changes the user did not start.

  Add TextFormat for keyboard keys, inline code and quotes. Each kind emits its
  own HTML element rather than a styled span, which is why it is not a Text size.

  Add ClipboardButton, which announces the copied state instead of only painting
  it, reports a denied clipboard rather than claiming success, and drops the
  copied state when the value changes.

  Add a dot variant to CounterBadge for "something is new" without inventing a
  number — it requires an accessible name, since the dot carries the meaning —
  and AvatarGroup, whose overlap comes from the recipe ratio and which carries
  one group name instead of a row of unlabelled images.

### Patch Changes

- cdc9ee0: Keep automatic system themes consistent across Expo static-web hydration. Start
  from the same light server snapshot before applying the browser preference, so
  existing surfaces and newly mounted overlays use the same theme. Preserve native
  first-frame OS detection, explicit themes, supplied values, and parent inheritance.

## 1.1.1

### Patch Changes

- 3e33f29: AlertDialog gains `info` and `success` tones.

  Tone answers why the dialog interrupted, and `attention` / `danger` only covered
  "are you sure?" and "this destroys something". Products also stop the user to
  _explain_ an action before running it — an intro before a button that copies
  content into the account — or to report that one finished. Those were shipping
  with the attention mark, so a neutral explanation read as a warning (reported by
  a consumer on 2026-09-15).

  - Both new tones keep the brand confirm button; only the mark and its wash change.
    `danger` remains the one tone that also repaints the confirm action.
  - Alert mode now accepts every tone except `danger`. A danger dialog without a
    cancel would let a destructive act through on a single key press.
  - Renderer translation differs and stays documented in `docs/architecture.md`:
    Web paints the product-supplied mark in the tone color, while React Native has
    no mark slot, so on native `attention`, `info` and `success` look alike and
    only `danger` differs.

  No migration: existing `attention` / `danger` requests are unchanged. Released as a
  patch by owner decision on 2026-09-15 — the axis only widens a union that no
  consumer switches on exhaustively today.

## 1.1.0

## 1.0.2

### Patch Changes

- 3cc1f7d: Switch의 레시피와 렌더러가 어긋나 있던 나머지 두 축을 맞춘다.

  1.0.1이 꺼짐 hairline을 붙이면서 드러난 것들이다. `switchRecipe.colors`는 렌더러가
  자동으로 소비하지 않는다 — 웹은 `styles.css`가, native는 컴포넌트가 각각 손으로
  다시 적기 때문에 계약에만 있고 아무 데도 그려지지 않는 슬롯이 생긴다.

  **`trackOn`: 계약을 고친다(렌더러가 아니라).** 켜진 트랙은 채워진 brand 면이고,
  같은 형태인 체크된 체크박스는 `selectionControlRecipe.states.checkedBackground`
  = `action.brand.background`를 쓴다. 레시피만 `content.brand`(아이콘·라벨용 content
  역할)를 가리키고 있었고 두 렌더러는 이미 `primary`를 칠하고 있었다. 관례와 실제
  화면이 같은 곳을 가리키므로 **계약을 옮긴다 — 화면 변화는 없다.**

  **disabled: opacity 한 장 대신 hue를 바꾼다.** 레시피가 진작 그렇게 적어뒀고
  (`trackOffDisabled`·`trackOnDisabled` 등) 그 근거 주석은 "flat opacity가 on과 off를
  거의 같게 만들어 저장된 설정을 읽을 수 없게 했다"고 말한다. 두 렌더러 모두 정확히
  그 flat opacity를 쓰고 있었다. 이제 컨트롤은 색이 대비를 책임지고, fade는 **라벨에만**
  남아 행이 여전히 disabled로 읽힌다. 38%로 고른 on 트랙이 한 번 더 흐려지는 문제도
  사라진다.

  - 웹: 꺼짐 트랙 `border`, 켜짐 트랙 38% brand wash, 손잡이 `textWeak` hairline.
  - native: 플랫폼 `Switch`가 fill만 받아 `*Border` 슬롯은 웹 전용으로 남지만,
    fill은 이제 레시피에서 읽는다 — 값을 손으로 다시 적는 것이 `trackOn`이 어긋난
    원인이었다.
  - 웹 렌더러가 레시피의 `label` 슬롯을 `hjm-switch__label`로 실제로 내보낸다.
    이전에는 클래스 없는 `<span>`이라 슬롯을 겨냥할 수 없었다.
  - `action-contrast.browser.test.tsx`가 disabled에서 두 상태가 서로 다른 색이고
    컨트롤이 fade되지 않는 것을 고정한다.

## 1.0.1

## 1.0.0

## 0.10.0

### Minor Changes

- 041c76a: Skeleton: 펄스를 기본값으로 켜고, native renderer가 recipe를 실제로 소비하게 한다.

  `skeletonRecipe.defaults.animated`를 `false`에서 `true`로 바꾼다. 정지한 회색 블록은
  로딩이 아니라 깨진 화면으로 읽힌다는 보고가 BurnTok 웹 피드에서 나왔고, 그 자리는
  결국 소비 앱이 매번 `animated`를 켜서 쓰고 있었다. `reducedMotion: "static"`은 그대로라
  접근성 기본값은 이 전환으로 바뀌지 않는다.

  React Native `Skeleton`은 지금까지 recipe의 shape도 animation도 읽지 않고 높이 16의
  정지 View만 그렸다. 같은 recipe를 쓰는 web renderer와 표현이 갈려 있었다. 이제 recipe의
  shape·배경·opacity 구간을 그대로 소비하고, `environment.reducedMotion`이 아닐 때만
  펄스를 돌린다. 새 의존성은 추가하지 않았다 (`Animated` 사용).

  React renderer는 원 지름·펄스 길이·곡선·opacity 구간을 provider가 내보내는
  `--hjm-skeleton-*` 변수로 읽는다. 그 값들이 stylesheet에 literal로 박혀 있는 동안에는
  recipe를 바꿔도 CSS가 따라오지 않았고, 게이트는 이 파일을 텍스트로만 읽어 드리프트를
  잡지 못한다.

  ## 소비 측 migration

  - **`animated`를 끄고 싶은 자리**: `<Skeleton animated={false} />`로 명시한다.
    기존에 `animated`를 지정하지 않던 skeleton은 이제 펄스가 돈다.
  - **React**: `--hjm-skeleton-*` 변수는 `HjmProvider`가 내보낸다. provider 밖에서
    `.hjm-skeleton`을 직접 렌더하던 곳이 있으면 provider 안으로 넣는다.
  - **React Native**: `width`/`height`/`radius`는 그대로 동작하며 `shape`보다 우선한다.
    세 값을 모두 생략하던 호출부는 기본 높이가 16에서 `shape="block"`의 recipe 값(32)으로
    바뀌므로 확인이 필요하다. 포트폴리오 안에서는 taground `around` 화면이 유일한
    호출부이고 `height`/`radius`를 명시하고 있어 영향이 없다.

### Patch Changes

- 79473d2: 두 renderer의 `@hjmds/design-contracts` peer 범위를 0.10 train으로 옮긴다
  (`>=0.9.0 <0.10.0` → `>=0.10.0 <0.11.0`).

  범위는 여전히 정확히 한 minor train이다. train을 올리는 release에서는 버전 PR보다 먼저
  범위를 옮겨야 한다. 순서를 뒤집으면 contracts의 minor bump가 아직 이전 train을 가리키는
  peer 범위를 벗어나고, changesets가 그 변경을 dependents의 major로 승격시켜 `fixed` 그룹
  전체가 1.0.0으로 올라간다. 실제로 그렇게 나왔다. 판단 근거는
  docs/RELEASE_GOVERNANCE.md의 "Contracts peer 범위"에 있다.

## 0.9.12

## 0.9.11

## 0.9.10

## 0.9.9

### Patch Changes

- 845aedc: Give `BottomNavigation` destinations an activatable trait on iOS. React Native maps `accessibilityRole="tab"` to `UIAccessibilityTraitNone`, so items reached VoiceOver with no trait and never announced that they can be activated. `Tabs` already branched on `Platform.OS`; `BottomNavigation` now uses the same branch and keeps the ARIA `tab` role on web.

## 0.9.8

### Patch Changes

- 8f5bf52: Apply `minimumVisualTarget` to the native `IconButton` diameter.

  The web renderer reads the same size through `--hjm-control-button-*`, which the
  axis already raises, but the native renderer read `iconButtonRecipe.sizes[size].diameter`
  straight from the recipe. A product that turned the axis on therefore got 44pt
  buttons and chips but 36pt compact icon buttons, and the two renderers disagreed.
  Found by running a consuming app on the iOS simulator and measuring the
  accessibility tree.

## 0.9.7

### Patch Changes

- fc51e46: Give `IconButton` the same `selected` toggle treatment `Button` has.

  `aria-pressed` / `accessibilityState.selected` already carried the state on an
  icon toggle — a sound switch, a notification bell — but without a paired visual
  every consumer painted the pressed state in product styles.
  `iconButtonRecipe.states.selected` mirrors `buttonRecipe.states.selected`, and
  `resolveIconButtonPresentation` takes the state as its third argument.

## 0.9.6

### Patch Changes

- 52770b7: Add the field `align` axis.

  A short, ceremonial single value — a nickname, a code — is centred in the
  control, and consumers expressed that with `inputStyle={{ textAlign: "center" }}`
  or a `text-align` override. `align` (`start` | `center`) makes it a recipe axis;
  `start` keeps following the resolved direction, so RTL is unaffected.

- 467ac3e: Add `minVisibleLines` to the multiline field, and bind the web field's multiline
  minimum to the recipe.

  `maxVisibleLines` already replaced `inputStyle={{ maxHeight }}`; a composer that
  should open several lines tall was still reaching for `inputStyle={{ minHeight }}`.
  The web renderer additionally carried `min-block-size: 80px` / `78px` in the
  stylesheet — numbers that duplicated `fieldRecipe.multilineMinHeight` and
  `paddingVertical` — and had neither bound axis. Both bounds are now expressed in
  lines on both renderers, so line height and vertical padding stay recipe-owned.

- c2e0edb: Give the React Native renderer the DOM accessibility contracts it needs on web.

  `accessibilityRole` and `accessibilityState` are translated by react-native-web
  into `role` and a subset of ARIA, but not the state attributes a screen reader
  reads: an expanded Accordion header, a checked ChoiceRow or Chip, and a selected
  Tab all reached the DOM without them. The keyboard contracts were missing too —
  `onPress` alone gives a `Pressable` no Space activation and no arrow traversal
  inside a radio group or tab list.

  `internal/web-a11y.ts` holds one copy of those contracts, spread only on web:

  - Accordion: `aria-expanded` / `aria-disabled`
  - ChoiceRow and Chip: `aria-checked` / `aria-disabled`, Space activation, and
    the WAI-ARIA radio-group arrow contract (focus and selection move together,
    skipping disabled and hidden options, wrapping, and leaving a `role="toolbar"`
    group to its focus-only contract)
  - RadioGroup: roving tabindex on the selected option, or the first enabled one
  - Tabs: `aria-selected` / `aria-disabled` / `aria-controls`, roving tabindex,
    Enter and Space activation, and orientation- and direction-aware arrow, Home
    and End traversal. Tab focus now uses DOM focus on web instead of the
    iOS/Android-only `setAccessibilityFocus` bridge call.

  This was carried as a `patches/@hjmds__react-native@*.patch` against `dist` in a
  consuming app, so every other consumer shipped the gap.

- 28f141f: Make `sunken` a real Surface tone that paints `surfaceAlt`.

  `semanticColors.surface.sunken` already named this role, but no Surface tone
  exposed it, so a consumer that wanted a recessed panel painted `surfaceAlt` in
  its own product styles. Worse, the React Native renderer carried `sunken` as a
  legacy alias for `subtle` — that is, for `bg`, the opposite direction from the
  role its own semantic layer defines. No consumer in this workspace used the
  alias, so the mapping is corrected rather than kept.

  `brand` remains a deprecated native alias for `accent`.

## 0.9.5

### Patch Changes

- 6440876: Replace the product style overrides that blocked consumer legacy-style migration with semantic axes.

  Auditing what consuming apps actually put in a legacy `style` prop showed five
  recurring overrides of recipe-owned values and five components that offered no
  `layoutStyle` at all, so placement had no legal expression.

  - `Button`: `shape` (`rounded` | `pill`) and `align` (`center` | `leading`)
  - `ListRow`: `leadingShape` binds `listRowRecipe.leadingSize`, which was
    declared but never rendered — every consumer rebuilt the avatar frame itself
  - `HjmProvider` (web): `host` (`surface` | `contents`) for a nested provider
    inside a product that already paints its own root
  - `layoutStyle` on `Chip`, `ListRow`, `Image`, `LoadMore` (native) and
    `DescriptionList` (web); their root `style` is now marked deprecated, and the
    layout-only slot styles narrow to `HjmCompositionStyleProp`

  - `Button`: `selected` paints the toggle treatment that `accessibilityState` /
    `aria-pressed` already claimed, and the `link` tone drops the size axis'
    horizontal padding so it aligns with the copy around it
  - `borderControl` joins `ThemeColors` as the resting outline of an interactive
    control, exposed as `semanticColors.border.control`. The secondary Button and
    IconButton tones drew that outline in `textSub`, a text color, which is the
    same mistake `chipRecipe` already documents; a product that needs a stronger
    control boundary than its surface hairline can now inject one semantic key
    through `brandPalette` instead of overriding `borderColor` per wrapper. The
    default value matches what the outline already resolved to in both themes.
  - Web `ListRow` binds the same density recipe the native renderer does. It used
    a single hardcoded `min-block-size: 56px` and never distinguished a one-line
    from a two-line row, so `oneLineMinHeight` / `twoLineMinHeight` /
    `paddingHorizontal` / `paddingVertical` / `gap` and the `leadingShape` frame
    are now emitted as `--hjm-list-row-*` variables and read by the stylesheet.
  - Web `Switch` binds `switchRecipe.sizes`. It had no `size` prop and the
    stylesheet carried 48/28/22/3px, which matched neither recipe size, so the
    axis was unbound on web and consumers re-implemented it with their own
    variables. Track and thumb geometry now read `--hjm-switch-*`.
  - `surfaceRecipe` gains `clipsContent`. A child image spilled past the rounded
    corner in every consumer, which each fixed with `overflow: hidden` in product
    styles — including the discovery that an elevated tone must opt out because
    clipping cuts off its own shadow. Both renderers bind it.

- 684c34a: Add the `minimumVisualTarget` provider environment axis.

  Compact recipes stay at 36pt and reach the 44pt target through hit slop. A
  product whose accessibility stance requires a _visible_ 44pt frame previously
  had to re-add `minHeight` in its own wrapper styles, which put control geometry
  back into product code. The axis resolves once on the provider environment and
  `visibleControlHeight()` applies it to the native Button and Chip heights and to
  the web `--hjm-control-button-*` variables, so every stylesheet rule that reads
  a control height follows without its own case.

## 0.9.4

### Patch Changes

- 8a1e6b0: Add `maxVisibleLines` so a growing multiline field can be capped without a caller style.

  Consumers were setting `inputStyle={{ maxHeight }}` on a composer, moving a
  recipe-owned dimension into product code. The field recipe already owned
  `multilineMinHeight`; this adds the matching upper bound expressed in visible lines,
  resolved against the input's own line height and vertical padding. The default stays
  unbounded, so existing behaviour is unchanged.

## 0.9.3

### Patch Changes

- 30d2acc: Fill the contract gaps that blocked consumer migrations off the deprecated `style` prop.

  `maxWidth`, `minWidth` and `flexWrap` join the composition key set. Width bounds and
  wrapping decide how much room a component may take in the consumer's own layout, which
  is placement rather than appearance; height stays out because the recipe owns vertical
  rhythm. The web set also accepts `maxInlineSize` and `minInlineSize`.

  `Section`'s `headerStyle`, `copyStyle`, `actionStyle` and `contentStyle` are narrowed to
  the composition style type, so a consumer can place a slot without moving recipe-owned
  appearance into it. `titleStyle` and `descriptionStyle` stay deprecated because
  typography belongs to the recipe.

  `Sheet` gains a `size` axis — `auto`, `medium`, `large`, `full` — exposing the
  `maxHeightRatio` the recipe already owned. Consumers previously set sheet height through
  `contentStyle`, which is now narrowed to placement only.

## 0.9.2

### Patch Changes

- 564056c: Open the two entry points consumers were missing.

  `layoutStyle` reaches the component roots apps place directly. React Native gains
  it on `Stack`, `Text`, `Container`, `Section`, `Card`, `Tag`, `Switch` and
  `IconButton`; the web renderer gains the composition-style contract itself plus
  `Stack`, `Surface`, `Container`, `Grid`, `Text`, `Badge`, `Tag`, `Button`,
  `IconButton`, `CounterBadge`, `Switch` and `ListRow`. Placement is applied after
  the deprecated `style`, so layout wins. The allowed key set is unchanged, and the
  web set uses CSS logical properties so placement keeps its meaning under RTL.

  `resolveDesignSystemProviderValue` accepts a `brandPalette` that layers product
  colors over the semantic keys. The key set is untouched, so recipes and contrast
  rules keep applying. Without it a consumer had to build its own token layer and
  override the CSS variables, which duplicates the canonical palette.

  Both additions are additive: existing consumers keep working unchanged.

## 0.9.1

### Patch Changes

- edeff8d: Improve UploadItem readability for RTL and 200% text, and align Native Switch, RadioGroup, SegmentedControl, and Tabs with the Web canonical props while preserving deprecated aliases.
- 6079dab: Make dark neutral surface edges and quiet text readable, and give secondary buttons and icon buttons a contrasting outline in both themes. The dark border now separates from every neutral surface at 3:1 or above; dark textWeak reaches 4.5:1 on those surfaces while retaining the text emphasis order. Secondary action borders use textSub through the shared recipe and Web CSS. ThemeColors and component props are unchanged; ghost actions remain transparent.

  Consumers can remove overrides that only repair these default colors after upgrading the fixed package train together. See `packages/design-contracts/docs/migration-0.9.1.md` for contrast scope and remaining product-specific checks.

- edeff8d: Document the React Native legacy raw-style enforcement gap and its pre-1.0 removal gate, add a reusable layout-only composition style API to Stable Core renderers, and deprecate unrestricted compatibility props without changing their runtime behavior.

## 0.9.0

### Minor Changes

- bc41bab: Promote the shared Surface, Button, Field, and TextArea renderer surfaces to Stable Core, and add the Container and AspectRatio contracts and renderers plus the Web VisuallyHidden accessibility utility.

  Document the public package governance, support, security, licensing, and external design-system gap analysis used for the additions.

## 0.8.2

### Patch Changes

- 794a2ce: Publish the renderers under the `@hjmds` npm scope. The previous `@hjm` scope is
  owned by another account, so the registry rejected every publish attempt. The
  release now targets `@hjmds`, which this project owns. The first registry version
  uses a one-time CI credential; subsequent releases authenticate through npm
  Trusted Publishing (OIDC) without a long-lived publish token.

## 0.8.1

### Patch Changes

- Publish to the npm registry after the tag and consumer evidence gate pass, so consumers install a semver range instead of vendoring a tarball or pinning a Git ref and package path. Also fix the yajalal consumer release gate's stale `develop` default branch and a Chromium background-tab timer throttling flake in the Tooltip browser test.

## 0.8.0

### Minor Changes

- 12703fa: Expand the first-party Web and Native kits with `DatePicker`, `FilePicker`, `Steps`, and `UploadItem`; promote existing Link, Form, Avatar, Spinner, NumberField, Slider and parity renderers; add granular exports, bundle budgets, interaction tests, Storybook galleries, synchronized maturity/evidence artifacts, and a seven-scenario environment smoke matrix.

### Patch Changes

- 8d91f33: Add real Web and Native `PasswordField` and `OtpField` renderers with granular exports, shared contracts, catalog and Storybook evidence. Also add a renderer-neutral `Card.leading` slot with shared header spacing, align Native choice defaults with the shared card presentation, and fix Web fields so focus is drawn only around the rounded control.

## 0.7.1

### Patch Changes

- c17b104: Harden production renderer integration across Web and Native. Web anchored overlays now escape clipping boundaries, resolve viewport collisions and logical alignment, preserve grouped menu semantics, and coordinate modal priority and dismissal completion. Native renderers preserve product accessibility copy, test hooks, narrow-layout statistics, and root prop pass-through required by real consumer apps.
