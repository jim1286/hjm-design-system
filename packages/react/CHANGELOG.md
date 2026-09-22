# @hjmds/react

## 1.4.0

### Minor Changes

- eb0e851: 제품 감사에서 드러난 설정·로그인·입력 Sheet의 반복 구현을 공용 API로 보완합니다.

  - Switch의 row presentation과 Web description 연결을 추가합니다. 전체 행은 한 개의 접근 가능한
    switch이며, 큰 글자에서는 설명과 track이 세로로 재배치됩니다. 기존 플랫폼별 기본 배치는 유지합니다.
  - Native Sheet에 선택적 keyboardAvoidance/scrollable을 추가하고, Web/Native 제목·닫기 버튼을
    중앙 정렬합니다. top safe area는 가용 viewport를 제한하며 키보드/Android resize 여백을 중복 적용하지 않습니다.
  - Native AuthScreenLayout에 layoutStyle/testID와 입력 폼 스크롤 처리를 추가합니다.
  - Web AuthScreenLayout은 기존 main landmark 안에서 as="section"으로 사용할 수 있습니다.
  - 지나간 1.0 legacy style 제거 기한을 정정합니다. 1.x 호환 API는 유지하고 소비 이관 검증 후 다음 major에서 제거합니다.

  기존 Sheet 어댑터의 제목 cast·키보드 listener·maxHeight 보정은 새 옵션을 채택한 뒤 제거합니다.
  세부 이관과 검증 범위는 docs/product-adoption-1.4.md와 docs/sheet.md를 따릅니다.

## 1.3.5

### Patch Changes

- 758cdc0: 제공자 버튼의 Kakao 글자색과 Naver 배경색을 현행 브랜드 자산에 맞춘다.

  Naver는 로그인 BI가 지정 컬러를 `#03C75A`에서 `#03A94D`(RGB 3/169/77)로 바꿨고, Kakao
  글자색은 흔히 인용되는 `rgba(0,0,0,0.85)`가 아니라 `#191919`다. 두 값 모두 각 제공자가
  배포하는 공식 버튼 이미지의 픽셀로 확인했다(2026-09-19).

## 1.3.4

### Patch Changes

- 5c74b76: AuthScreenLayout의 canonical 컴포넌트 스토리를 더합니다.

  정적 Storybook 검증은 catalog의 모든 컴포넌트가 `Components/<카테고리>` 아래 같은 이름의
  스토리를 갖기를 요구합니다. 1.3.3은 패턴 스토리(`Patterns/Agreement → SignInScreen`)만 있어
  그 검증에서 막혔습니다.

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

- cdc9ee0: Keep compact Toast messages and their close control on the same row. Place the
  optional action below the message so long localized copy and doubled text remain
  readable in narrow cards, including 420px cards in a desktop window. No
  descriptor, lifecycle, or Native Toast behavior changes.

  Keep Notice actions from shrinking a short retry label into several lines. Long
  copy and larger text wrap the action below the content when space runs out.

  After consuming the release, BurnTok can remove its temporary `.hjm-toast` and
  `.hjm-toast__content` overrides once the product's compact toast is rechecked.

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

### Minor Changes

- a7d87b0: 웹 렌더러가 `environment.textScale`의 large-text 전환을 받게 한다.

  `segmentedControlRecipe.adaptive.stackAtFontScale`은 계약이 선언한 축인데, 웹에서 그 전환을
  일으키는 것은 스타일시트의 `@media (max-width: 11em)`(브라우저 기본 글꼴 크기)뿐이었다.
  제품이 provider에 `textScale`을 선언하는 경로는 전환을 받지 못했다 — 같은 계약을 React
  Native만 구현한 상태였다 (#20).

  - `largeTextThreshold`(1.6)를 `foundations`에 이름 붙였다. `segmentedControlRecipe.adaptive
.stackAtFontScale`과 `topBarRecipe.largeTextThreshold`가 각자 적어 두었던 같은 값이다.
    `design-system-provider`는 `isLargeTextScale(textScale)`로 그 판정을 공개한다.
  - `HjmProvider`와 portal host(`overlays`·`toast`·`AnchoredPortal`)가 임계값을 넘을 때
    `data-large-text="true"`를 내보낸다. `data-text-scale`은 숫자라 속성 선택자로 `>= 1.6`을
    표현할 수 없다.
  - SegmentedControl의 스택 규칙이 그 플래그도 트리거로 받는다. 기존 미디어 쿼리는 그대로
    둔다 — 브라우저 기본 글꼴은 provider가 모르는 별개의 신호다.

  렌더러 번들 비용은 0이다. 같은 판정을 렌더러가 직접 하면 `./selection` 같은 granular
  entry가 provider 모듈을 통째로 끌어와 gzip 기준 24% 커진다(측정치는 이슈에 있다).
  `./provider` 예산만 raw 12_500 -> 12_700 · gzip 3_400 -> 3_600으로 올렸고 module 수는 3으로
  그대로다.

  topBar·description-list의 large-text 분기는 React Native 표면이며 이번 변경에 포함되지 않는다.

### Patch Changes

- 96ad9aa: Field·TextArea의 포커스 표시가 색조에만 기대던 문제를 고친다.

  포커스 링을 1px에서 계약된 2px(`focusIndicatorContract.width`)로 넓힌다. 표시 자체의 대비는
  원래 기준을 넘었지만(칸 배경 대비 낮 6.86:1 · 밤 7.98:1), **상태가 바뀐 것을 알아채는 단서**가
  색조뿐이었다 — 비포커스↔포커스 테두리 명도 대비는 낮 1.06:1, 밤 1.44:1이라 회색조에서는 두
  상태가 사실상 같은 그림이다. 밤에는 `rgb(203,213,225)` → `rgb(56,189,248)`로 바뀌며 칸 배경
  대비가 11.51에서 7.98로 오히려 떨어진다(에어리 웹 편지 편집기, 2026-09-13 접근성 검수).

  같은 화면의 다른 컨트롤은 없던 2px outline이 생기는 방식이라 단서가 형태였다. 가장 오래
  머무는 입력 칸만 예외였다. WCAG 1.4.1(색에만 의존하지 않기) 관점의 문제다.

  `.hjm-field__control`을 쓰는 모든 표면(TextField·TextArea·SearchField·PasswordField·
  NumberField·Select trigger·Combobox)이 같은 규칙을 공유하므로 링은 함께 넓어진다. 링은
  box-shadow라 레이아웃을 밀지 않는다.

  react-native renderer는 필드 포커스 테두리를 그리지 않아(OS가 처리) 이번 변경 대상이 아니다.

- 65cb6cf: Select의 빈 선택 항목에서 화살표 키가 움직이지 못하던 문제를 고친다.

  `disallowEmptySelection: false` · `loop: false`(둘 다 `selectBehaviorDefaults`)에서 선택이
  없으면 roving `aria-activedescendant`가 빈 선택 항목에서 시작하는데, 그 항목이 목록 끝에
  그려져 있고 `moveHighlight`가 `next`를 `loop`가 켜진 경우에만 허용했다. 결과적으로 기본값을
  쓰는 모든 Select에서 목록을 연 키보드 사용자는 `Home`을 먼저 눌러야 선택을 시작할 수 있었다
  (에어리 웹 "받을 도시 선택", 2026-09-12 접근성 검수).

  - 빈 선택 항목을 listbox의 **첫** entry로 그린다. 선택이 없을 때 활성 항목이 시작하는
    자리이므로, 목록 맨 아래는 화살표 이동의 출발점이 될 수 없다.
  - `moveHighlight`가 그 DOM 순서를 따른다: `Home`은 빈 선택, `End`는 마지막 실제 항목,
    빈 선택에서 `ArrowDown`은 `loop`와 무관하게 첫 항목, 첫 항목에서 `ArrowUp`은 빈 선택이다.
    `loop`는 목록의 양 끝을 잇는 역할만 한다(빈 선택에서 위 → 마지막 항목, 마지막 항목에서
    아래 → 빈 선택).
  - 닫힌 상태에서 키로 열 때도 같다. `End`/`ArrowUp`은 마지막 실제 항목을 집는다.

  **Migration.** 마우스 사용자에게는 "선택 안 함" 항목의 위치가 목록 끝에서 시작으로 바뀐다.
  option을 위치(`querySelector('[role="option"]')`)로 집는 테스트는 빈 선택 항목을
  (`.hjm-select__option--empty`) 먼저 만난다.

  react-native renderer는 빈 선택 항목을 그리지 않고 roving 키보드 탐색도 없어 이번 변경에
  포함되지 않는다.

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

### Patch Changes

- 2d01352: Switch의 꺼짐 상태가 다크 테마에서 보이지 않던 문제를 고친다.

  웹 renderer가 `switchRecipe.colors`의 `trackOffBorder`·`thumbOffBorder`를 그리지
  않아, 꺼짐 스위치가 `surfaceAlt` 트랙 위에 `surface`보다 어두운 `bg` 손잡이만
  얹은 모양이었다. canonical 다크 팔레트에서 트랙 대 카드 1.10:1, 손잡이 대 트랙
  1.20:1이라 컨트롤이 통째로 사라졌다(소비 앱 설정 화면, 2026-09-14).

  - `.hjm-switch__track`·`__thumb`이 꺼짐 상태에서 계약된 hairline을 그린다.
    `border`가 아니라 inset box-shadow다 — `box-sizing: border-box`에서 border는
    padding box를 줄이는데 `--hjm-switch-track-offset`은 그대로라 손잡이가 2px
    넘어간다.
  - 켜짐 트랙은 `trackOnBorder`(`border.focus`)를 얻고, 레시피에 `thumbOnBorder`가
    없으므로 켜짐 손잡이는 drop shadow만 유지한다.
  - `action-contrast.browser.test.tsx`가 두 테마에서 hairline 대비 3:1을 잡는다.

  react-native renderer는 플랫폼 `Switch`가 trackColor·thumbColor만 받아 hairline을
  표현할 수 없어 이번 변경에 포함되지 않는다.

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

### Patch Changes

- 0c060c4: 0.9.11의 스타일시트에 닫는 중괄호가 하나 많아 소비자 빌드가 깨지던 것을 고친다.

  0.9.11에서 SegmentedControl 큰 글자 쌓기 규칙을 넣을 때 미디어 쿼리 뒤에 `}`가 하나 남았다.
  Next(lightningcss) 소비자는 `Invalid empty selector`로 **빌드가 통째로 실패한다.**

  게이트가 전부 통과했던 이유를 함께 닫는다. SSR 단언은 스타일시트를 **문자열로만** 읽었고
  showcase 번들러는 `Unexpected "}"`를 경고로만 냈다. 이제 주석을 제거한 뒤 중괄호 균형을
  구조로 확인한다 — 0.9.11 상태로 되돌리면 이 검사가 실패하는 것을 확인했다.

  마이그레이션: 0.9.11을 쓰는 웹 소비자는 이 버전으로 올린다.

## 0.9.11

### Patch Changes

- 6efed96: 큰 글자에서 SegmentedControl이 웹에서도 옵션을 쌓는다.

  `segmentedControlRecipe.adaptive.largeTextLayout: "stacked"`는 계약에만 있었다. React Native
  렌더러는 이 값을 읽어 세로로 쌓는데 웹 렌더러는 한 번도 참조하지 않아, 같은 레시피가 두
  플랫폼에서 다른 레이아웃을 냈다. 소비 앱의 320px 화면에서 브라우저 글자 크기를 200%로
  올리면 보기 전환 컨트롤이 333px가 되어 가로 스크롤이 생긴다(100% 195px → 150% 263px →
  200% 333px). 잘리는 글자는 없지만 화면 폭을 넘는 행이 남는다.

  트리거는 레시피의 `stackAtFontScale`이 아니라 스타일시트의 `@media (max-width: 11em)`이다.
  웹에서 `textScale`을 provider에 선언하는 제품이 없고, 브라우저 사용자가 실제로 바꾸는 값은
  기본 글꼴 크기이며 미디어 쿼리의 `em`이 정확히 그 크기이기 때문이다. 11em은 100%에서 176px
  (실존하지 않는 폭이라 기존 행은 그대로)이고 200%에서 352px다. Chrome에서 기본 글꼴 크기를
  직접 바꿔 실측했다: 320px·200%와 352px·200%는 쌓이고, 360px·390px·200%와 320px·150%는
  행을 유지한다. 쌓을 때는 행 전용 선언 두 개를 푼다 — `flex: 1 1 0`은 높이가 auto인 열을
  padding만 남기고 접고, `max-content`는 전체 폭을 받은 라벨의 줄바꿈을 막는다.

  레시피가 `"stacked"`를 그만 선언하면 SSR 테스트가 깨지므로 계약과 스타일시트가 조용히
  어긋나지 않는다.

  마이그레이션: 없음. 브라우저 글자 크기가 200% 이상인 좁은 화면에서만 레이아웃이 바뀐다.
  제품이 `textScale`을 선언해 큰 글자를 표현하는 웹 경로는 아직 이 전환을 받지 않는다.

## 0.9.10

### Patch Changes

- 47e1d80: 단독(standalone) 링크가 두 축 모두 최소 터치 타깃을 지킨다.

  `linkRecipe.variants.standalone`이 높이만 `control.minTouchTarget`으로 잡고 있어서 "닫기",
  "Write"처럼 짧은 라벨은 폭이 36pt까지 좁아졌다. 소비 앱의 390pt 화면에서 실제로 36×44
  링크가 확인됐다. 계약에 `minWidth`를 추가하고 웹 렌더러의 `.hjm-link[data-variant="standalone"]`에
  `min-inline-size`와 `justify-content: center`를 적용한다. 문장 안(inline) 링크는 글줄을
  따라가야 하므로 최소 크기를 강제하지 않는다.

  마이그레이션: 없음. 짧은 라벨의 단독 링크가 좌우로 최소 44pt까지 넓어진다.

## 0.9.9

## 0.9.8

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
- aafecc5: Make zero-delay Tooltip focus and dismissal transitions synchronous, and preserve pointer transit between a trigger and its portaled Tooltip by following `relatedTarget` instead of a timing grace period.
- 6079dab: Make dark neutral surface edges and quiet text readable, and give secondary buttons and icon buttons a contrasting outline in both themes. The dark border now separates from every neutral surface at 3:1 or above; dark textWeak reaches 4.5:1 on those surfaces while retaining the text emphasis order. Secondary action borders use textSub through the shared recipe and Web CSS. ThemeColors and component props are unchanged; ghost actions remain transparent.

  Consumers can remove overrides that only repair these default colors after upgrading the fixed package train together. See `packages/design-contracts/docs/migration-0.9.1.md` for contrast scope and remaining product-specific checks.

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
