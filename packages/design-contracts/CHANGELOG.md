# @hjmds/design-contracts

## 1.14.0

### Minor Changes

- f98f4b5: Add Agreement descriptor.disabled to freeze consent changes during submission without altering required-item validity, selected consent, or detail reading. Keep Web focus and native disabled semantics, and provide matching interactive examples and usage guidance.

  Keep large-text agreement labels readable by wrapping long detail actions beneath them, and render fixed-size selection marks without font scaling overflow.

- f98f4b5: Expose experimental DateEntry through dedicated subpaths. Compose existing text fields with lossless date drafts, product-controlled parsing and error visibility, localized order and birthdate autocomplete. Keep calendar selection in DatePicker and Calendar.
- f98f4b5: Expose experimental DocumentResource through dedicated subpaths. Compose file metadata, independent preview/export/menu actions and explicit failure recovery. Distinguish download initiation from host-confirmed saving. Keep file access, permissions and durable outcomes product-owned; provide Web/Native usage and interactive examples.

  Restore Web keyboard focus after removing preview retry within the same document, without taking focus from another control or a replacement document.

  Allow product review gates to disable export and export retry without disabling document preview or preview recovery.

- f98f4b5: Expose experimental FieldGroup through dedicated subpaths. Keep named groups, independent field feedback and guarded edits separate from form submission. Provide Web fieldset/legend semantics and Native per-control accessibility bindings.

  Invalidate retained callbacks after committed field removal even when the same id is reinserted. Preserve active bindings across normal rerenders and Strict Mode effect replay, while blocking edits during cleanup and after unmount.

- f98f4b5: Add image inspection geometry for fit, double-fit and output-size viewing through the existing components/image subpath. Preserve image aspect ratio and expose centered pan bounds in layout units, with invalid and overflowed size validation. Renderer integration remains pending.
- f98f4b5: Add measured origin-to-destination geometry to the existing content-transition subpath. Invalid or missing layout and reduced motion retain the canonical overlay presentation. This resolver does not introduce a renderer morph API or change focus/presence behavior.
- f98f4b5: Add isolated ProgressiveBlur subpaths with shared logical-edge, scroll-boundary and focus visibility rules. Web renders masked backdrop layers; Native accepts a product-owned blur/mask host and isolates decoration failures. Register an experimental list preview and usage guidance; no blur engine enters published renderer dependencies.
- f98f4b5: Add experimental, granular Rating and ImageComparison compositions with shared validation,
  localized accessibility, existing Image/Slider behavior and no new dependencies. Add opt-in
  ContentTransition animateHeight without an exiting interactive subtree. Existing transition
  defaults remain unchanged; no migration is required unless opting into the new APIs.

  Provide matching experimental Web/Native stories for input/read-only ratings, image comparison,
  adaptive panel height, action feedback, upload recovery, product feature cards and contextual tools.
  See docs/plans/ui-reference-application-2026-10-06.md for adoption decisions and validation limits.

- f98f4b5: Add resolveScrollEdges to the existing scroll-progress subpath so product edge hints disappear at the actual boundary, including fractional offsets, overscroll and content resizing. Existing progress semantics are unchanged; renderers still own their visual effects and focus handling.
- f98f4b5: Add an opt-in noise layer to EffectSurface with a shared static alpha tile and semantic tint. Existing grain and defaults remain unchanged. The Native SVG peer does not implement FeTurbulence, so this original raster texture avoids adding a new runtime. This is a visual experiment, not SVG-filter pixel parity.
- f98f4b5: Add mergeTextAnnotationFragments for measured runs on the same visual line.
  This prevents overlapping marker washes at font-fallback boundaries while
  preserving unselected gaps and distinct lines. A Native Skia diagnostic confirms
  range geometry on Korean, emoji, and mixed-direction text, but is not a public
  renderer or a replacement for native text selection.
- f98f4b5: Expose the pure text-annotation geometry subpath and add an internal Web renderer
  that measures actual inline line fragments, preserves text selection, and cancels
  decorative motion for reduced-motion users. The renderer remains outside public
  exports and Storybook until Native fragment measurement and visual review are
  complete. See docs/text-annotation.md for the outstanding adoption boundary.

  Merge touching Web bidi fragments in the same measured vertical band to remove interior annotation seams; preserve separate lines and unselected gaps.

### Patch Changes

- f98f4b5: Allow Native Avatar to use a product image host with the canonical fallback and source-generation-safe error callback. This preserves consumer disk-cache and loading-fallback behavior without adding Expo Image to HJM. The default native Image renderer is unchanged.
- f98f4b5: Keep image-comparison captions aligned with their physical before/after sides in RTL. Document image-host verification and use compatible deterministic PNG showcase fixtures.
- f98f4b5: Add opt-in enterOnMount to ContentTransition for new data rows, preserving stable keys and existing default behavior. Provide a Web/Native live-list experiment with immediate batch updates, draft retention, deletion and motion controls.
- f98f4b5: Promote the 17 reviewed Web/Native Storybook experiments and their usage guides after explicit user approval. Preserve Web story IDs and optional product-host boundaries. Keep Native onboarding guidance inside the existing scroll body so 200% text and a keyboard cannot collapse the input area; keep completion actions fixed. Repair the native Agreement artwork regression assertion and add DateEntry, FieldGroup and DocumentResource to the real Metro reachability fixture.

  See docs/qa/2026-10-07-experiment-promotion-release.md for observed flows, release validation and unverified product environments.

- f98f4b5: Document the experimental illustrated empty-state/onboarding/result composition using existing public slots. Keep product artwork and media dependencies out of the renderer packages, preserve drafts through back navigation, and retain actions when decoration fails.
- f98f4b5: Document number-effect reference comparisons and locale-preserving AnimatedStatistic examples without replacing the existing renderer engines.
- f98f4b5: Add optional measured-origin presentation to the existing Web Popover, sharing Dialog's animation lifecycle while preserving anchored placement, non-modal focus, dismissal and reduced-motion behavior. Document draft ownership and the Native Dialog/Sheet alternative.
- f98f4b5: Restore keyboard focus to the first rating option when clearing disables the clear button. Clarify the current supplemental rating contract alongside the historical Slider composition decision.
- f98f4b5: Clarify explicit reading-host metrics, dynamic content measurement, and the distinction between scroll position and reading completion.
- f98f4b5: Clarify product-introduction CTA guidance with existing BottomCTA/BottomInfo, retained drafts and recovery states. Keep external style extraction separate from observed product behavior.
- f98f4b5: Add internal deterministic geometry for seven text annotation treatments using
  renderer-measured line fragments. This is unfinished experimental infrastructure:
  there is no public package export or renderer yet. See docs/text-annotation.md for
  the measurement, accessibility, and motion work required before adoption.
- f98f4b5: Keep experimental surrounding-loop strokes outside the measured text rectangle.
  The previous inscribed ellipse crossed end glyphs at large text sizes. The new
  outward-bowed loop includes pen width in its clearance and SVG bounds. Its visual
  difference from an ellipse remains subject to experiment review.
- f98f4b5: Clarify upload recovery focus destinations, consistent example file limits, and the boundary between local fixtures and real transfer cancellation.
- f98f4b5: Document the existing Dialog composition for product-owned video playback, error recovery, focus return and immediate media disposal. Add Web and Native experimental showcases without a new published player dependency.

## 1.13.1

### Patch Changes

- 1be91fc: Fix five gaps found while utilverse adopted 1.13.0 (2026-10-06, iPhone 17 Pro / iOS 26.5, accessibility-large). Both renderers; the only API change is one optional SearchScreen prop.

  - SegmentedControl `presentation="pills"` no longer stacks into a column at large text (new `segmentedControlRecipe.pills.largeTextLayout: "wrap"`). Pills wrap inside a block and stay on one scrolling line inside a rail (SearchScreen `filtersOverflow="scroll"` or a product ScrollView); radio selection and focus order are unchanged. `connected` still stacks from 1.6x. Visual change: large-text pills that used to be a full-width column now render as wrapped or one-line pills.
  - Native Chip uses its recipe height as a minimum (`minHeight`) instead of a fixed `height`, so large-text labels such as the SearchScreen filter trigger and suggested queries are no longer clipped. Web already used `min-block-size`. Visual change: chips grow with large text; 1x is unchanged (36 / 44).
  - Native fixed-size Sheet (`size` `medium`/`large`/`full`, side sheets) gives its body the remaining height (`flexGrow: 1`, `minHeight: 0`), as Web `.hjm-sheet__body` already did, so a `flex: 1` child such as SearchScreen fills it instead of collapsing to 0pt. With `scrollable` the ScrollView grows but its content container does not. Visual change: the footer of a fixed-size Native sheet now sits at the bottom of the sheet; `auto` sheets are unchanged.
  - SearchScreen closes the keyboard on every commit. Native calls `Keyboard.dismiss()` when a suggestion, recent or suggested query is picked (one-step and two-step). Web moves focus from the picked row or chip, which unmounts, to the results region (`.hjm-search-screen__results`, `tabIndex=-1`, no focus ring) instead of letting it fall to `<body>`; leaving the field also closes a mobile browser keyboard. Enter keeps focus in the field.
  - SearchScreen adds optional `hostGutter` (`ContainerGutter`, default `none`). With `filtersOverflow="scroll"` the rail bleeds over the screen padding plus this host gutter, so with `contentInset="none"` inside a Container or Sheet it reaches the host edge while its first chip stays on the gutter. Default behavior is unchanged.

  Migration (utilverse, origin/main 077b190): after upgrading to this patch, remove the three workarounds. `ToolThemeFilter` drops its large-text `Select` branch once pills keep one row in a rail. `ChatToolPicker` drops `layoutStyle={{ flexBasis: height }}` once the fixed-size Sheet body fills, and passes `hostGutter="regular"` (Sheet padding `spacing.lg`). `notification-tools` drops `Keyboard.dismiss()` from `onSubmit` and passes `hostGutter="regular"` (its Container gutter). Products on 1.13.0 keep the workarounds.

## 1.13.0

### Minor Changes

- def5311: Add experimental category pills through the existing SegmentedControl contract and SavedItemsScreen through ListDetailScreen/Grid. Preserve app-owned themes, collection membership and persistence; document and demonstrate both platforms. Improve keyboard access to scrolling story surfaces and labeled badges.

  Use the shared Spinner for initial screen loading, retaining localized accessibility names without visible loading copy. Preserve keyboard scrolling when a virtualized screen switches to replacement guidance.

- def5311: CommandPalette now implements the filtering, empty-state, and section-naming behaviour its contract already declared.

  - Web `CommandPalette` filters `source` by `query` locally by default (case-insensitive substring over `label` and `textValue`, the same rule as the Native Combobox). Pass `queryState={{ filtering: "external", asyncState, queryValue, resultQuery }}` to show product-filtered results verbatim; stale external results (`queryValue !== resultQuery`) stay visible but cannot be activated. Sections emptied by filtering are dropped.
  - `CommandPaletteDescriptor` gains optional `emptyMessage` (announced once for the whole list when no result is visible; an `asyncState` message still wins) and optional `closeLabel` (renders a close button that dismisses with `"close-action"`). Both are validated as non-empty when present.
  - Section groups are named by `accessibilityLabel ?? label`.

  Migration: products that already filter with a substring rule need no change. Products that pass fuzzy, ranked, or server results without `filtering: "external"` must add it, otherwise the renderer narrows those results again. To show empty copy, move it from an ad-hoc `asyncState: { status: "empty" }` to `descriptor.emptyMessage` (the old route still works).

  The active row now resets only when the query changes. Previously a parent re-render that
  passed `source`/`queryState` as inline objects snapped the active row back to the first item,
  so arrow keys and pointer hover could not move it.

- def5311: Add themed PhotoSourceSheet with localized camera/library choices. Native selection waits for modal dismissal; Web preserves file-input user activation. Capture and permission adapters remain product-owned.
- def5311: Add an optional plus action to ReactionPicker that expands a product-localized emoji catalog,
  with combined validation and same-reaction removal even when the selected value is outside
  quick reactions. Existing callers without `more` retain their quick list, and on Web the default
  `layout="wrap"` keeps the button's glyph size; only `layout="strip"` (the chat reaction row) enlarges
  glyphs to the title type step, matching Native's strip. Choosing a catalog-only emoji collapses the
  catalog and moves keyboard focus to the plus toggle instead of dropping it to the page.

  Add ChatMessage horizontal swipe-to-reply (without a visible reply button), accessible message actions, and a separate quote-navigation button;
  MessageComposer accepts a controlled reply target and cancel action. Native ScreenLayout can
  expose its scroll host ref. Product callbacks retain reply IDs, message loading, scrolling,
  and receipt-driven clearing. Web/Native experimental stories demonstrate sending a targeted
  reply, cancelling without losing the draft, and scrolling to an existing quoted message.

- def5311: Close the Web/Native drifts found while writing the usage guides (2026-10-06 follow-ups). The recipe stays the single source; renderers that disagreed now read it.

  **Visual changes (no API change; review screens that measured the old values)**

  - `Sheet size="full"` (both): fills the height inside the top safe area. `sheetRecipe.content.maxHeightRatio` (0.9) now caps only `size="auto"`; it used to stop `full` at 90%.
  - Web `Sheet`: content padding 12 top/bottom · 20 sides, 16 between header/body/footer and between body children, and 12 above the footer (`sheetRecipe`), as Native. It used the Dialog's 20 everywhere, so the same sheet was taller on Web.
  - Web `ScreenLayout`: header items 12 apart (`screenPatternRecipe.itemGap`) and the state block `stateGap` 16. Both used the content inset, so they collapsed to 0 with `contentInset="none"`.
  - Web `SearchField`: `medium` padding 12 · gap 8 and a 36px clear circle with a 4px hit slop (still a 44 target); `large` padding 16 · gap 12 · clear 44 (`searchFieldRecipe.sizes`).
  - Web `Select`/`Combobox`/`Menu`: 8px from the viewport edge (`collisionPadding`), not 16. `Tooltip`: 4px from its trigger, 12px from the edge, at most 280px wide (`tooltipRecipe`). Menu items use radius md (12).
  - Web `SegmentedControl`: 4px track padding/gap, radius lg with a 1px border, 2px selected ring, semibold/bold labels, and the `small` size (36 + 4px slop) that had no CSS.
  - Web `Chip` (`small` 12/4, `medium` 16/8 padding/gap with a 4px slop on `small`), `Badge size="small"` padding 4, `Statistic` (line gap 8/4, compact surface padding 12, group gap 8), `TransferList` (rows 12, move buttons 12 apart), `UploadItem` (min 68, padding 8/16), `DataTable` regular cells 12/16, `EmptyState` regular 40 vertical, indented `List` separators start at 52.
  - Web `Section` header and `StatisticGroup` stack below `breakpoint.medium` (600) instead of 640.
  - Web circular `Progress`: the label row sits above the ring, as the linear bar and Native.
  - `Result` (both): actions render secondary → primary like every other action row. Primary still comes first in `actions`.
  - Web `ClipboardButton`: default `tone` is now `secondary`; it added a second primary next to a screen's main action. Pass `tone="primary"` to keep the old look.
  - `AuthProviderButton` (both): labels return to `typography.body`. The provider guideline owns label and colour; the Naver green contrast is recorded as a provider colour exception (`docs/provider-button.md`).
  - Web `Tooltip`: 8px padding on every side (`tooltipRecipe.surface.padding`); it drew 8 × 12.
  - Web `Section`: title uses the `title` variant (18/26 bold) and description `caption` (11/16), as Native. Both inherited body (14).
  - Web `Menu`/`ContextMenu`/`Select`/`Combobox` popups and the `Mentions` list: 8px inner padding (`floatingSurfaceContract.padding`), not 4. Native `Mentions` list padding 8 and radius md from `comboboxRecipe.popover`.
  - Web `Mentions` list: 8px from the field and 8px from the viewport edge (`comboboxRecipe.popover`), not 16.
  - `DatePicker` (both) trigger heights follow `datePickerRecipe.sizes`: medium 44, large 52 (Web large was 56; Native was 48/56).
  - Web `MessageComposer`: 12px (`screenPatternRecipe.itemGap`) between rows and between the editor and the send button, as Native. It was 8.
  - Web `Statistic` text follows `statisticRecipe`: label `label` semibold (compact `caption`), value `heading` heavy (compact `title`), prefix/suffix `body` semibold in the body colour, hint and trend `caption` (trend bold). The value no longer scales twice with large text.
  - Native `TagsInput` suggestion rows and `Collapsible` triggers keep a 44 minimum height. Native `RadioGroup`/`CheckboxGroup` descriptions sit above the options (slot order), as Web. Native `Slider` header has a 16 label–value gap.
  - Disabled fields (both) fade the label and the control only; the hint and the error keep full contrast (`fieldRecipe.disabledScope`). The whole frame used to fade, support text included. The amount is the component recipe's `states.disabledOpacity` where it has one, else `fieldRecipe.disabledOpacity` (0.6). So Web `Select`, `NumberField`, `OtpField`, `SearchField` and `PasswordField` (both platforms for the last) fade to 0.5 instead of 0.6; Native `NumberField`/`Select` labels now fade with the control; Native `Combobox` and `DatePicker` (both platforms) did not dim at all and now fade at 0.6; `TagsInput` fades its label too, at 0.6 on both (the Native frame was 0.5). Native custom `Field` fades its label; its consumer control is a direct child and dims itself from `accessibilityState.disabled` (Web still fades it through the frame). Screens that faded their own hint or error under a disabled field can drop that.

  **Behaviour**

  - `Agreement` (both) calls `onStateChange` once on mount with the initial state, so `defaultCheckedIds`/`checkedIds` that already satisfy the required items enable a submit button. Consumers that counted calls see one more at mount.
  - `Avatar` initials (both) come from `resolveAvatarInitials` (`@hjmds/design-contracts/avatar-fallback`): first and last word in code points. Web used the first two words ("Kim Min Jun" → "KM", now "KJ"); Native could split surrogate pairs.
  - Native `SearchField` keeps accepting input while `busy`, as Web does under `loading`; only `disabled` ignores typing. `SearchScreen` `searching` therefore no longer drops keystrokes typed while suggestions refresh, so it can stay on during live suggestion requests. The clear button is still replaced by the progress indicator while busy.
  - Native `ImageViewer` announces the load failure (assertive live region, iOS announcement), not only the loading copy.
  - Web `Toast` forwards the remaining HTML attributes (id, data-\*, handlers) it already accepted in its type; role and labelling stay owned by the toast.
  - Web `Masonry` empty state is a named `group` (a bare div cannot carry `aria-label`).

  **Additions**

  - Native `DurationField` and `QRCode` accept `layoutStyle`.
  - Contracts: `resolveAvatarInitials`, `sliderRecipe.header`, `uploadItemRecipe.row.paddingVertical`, `fieldRecipe.disabledScope`.

- def5311: Add opt-in screen-patterns/screens entries for shared settings, notification inbox and chat layouts, reusing the existing login layout and canonical primitives. Products retain routing, localized copy, data, permissions, persistence and keyboard adapters. Existing APIs are unchanged; no automatic consumer migration. Screen state replacement is distinct from refresh/save notices. See design-contracts/docs/screen-patterns.md for ownership and package export rationale.

  Add comments/search/saved/profile composition examples, unshaded settings and activity rows, and content-sized message composers without a manual resize handle. Native explicitly bounded multiline inputs grow and shrink with their content; MessageComposer starts from the single-control minimum, while public TextArea `minVisibleLines` keeps the 80pt `multilineMinHeight` floor.

  Add opt-in screen-flows entries for list/detail, draft editing, profile/account, moderation, media selection, debounced search, permission and onboarding flows, plus controlled comment threads. Media uses responsive thumbnail grids and separately localized action names; search keeps recent queries in the scrollable body. Products retain OS pickers, uploads, router guards, persistence and server operations.

  Separate library selection from post-selection uploads with optional library and selectionSummary slots. Showcase uses a system-picker-style three-column grid with ordered selection and a fixed completion area; align search filter controls with their summary.

  Add optional header submit placement and custom moderation reason picker slots while preserving existing defaults. Refine screen header sizing for compact screens and large text, and use a rounded chat composer with unshaded incoming bubbles. Refresh twelve Web/Native screen examples from documented product references.

- def5311: SearchScreen now owns the two-step search flow that only existed in the Storybook preview, so products can adopt it through the public API instead of copying Showcase code. All props are optional and additive on Web and Native; without them SearchScreen renders and behaves exactly as before.

  - `committedQuery` (requires `onSubmit`) splits idle / typing / results. Every commit — Enter or the keyboard search key, the "search ‘q’" row, a suggestion, a recent or suggested query — goes through `onSubmit` with a trimmed, nonblank value; debounced `onSearch` never does, so "record only committed searches" holds at the API. `onSubmit` (unreleased) now trims and drops blank commits.
  - `recentQueries` (rows commit, per-row remove, clear all), `suggestedQueries` (chips, also shown under a query-caused zero result) and `suggestions` (commit row plus up to six rows, `match` bolded on Web).
  - `resultSummary` (count with polite announcement, `null` = loading skeleton rows instead of `children`, sort Menu that scrolls back to the top, a `notice` slot for retained-results errors, `empty` copy with a cause-specific recovery), `appliedFilters` (removable chips plus clear all) and `filterSheet` (draft copied on open, discarded on any close, applied only from the primary action whose label carries the live `count(draft)`; reset always present and disabled at the default; optional rail trigger named with the applied count).
  - Web moves focus after removing an applied chip or recent row to the next item, then the filter trigger or the search field. Native keeps the screen-reader cursor.
  - `queryLabelVisibility="hidden"` drops the visible label and uses `queryLabel` as the accessible name and placeholder.
  - `searching` + `searchingLabel` (both or neither) is one name for the default field's progress (Web `loading`, Native `busy`/`busyLabel`). Native SearchField ignores typing while busy, so turn it on for committed result requests only.
  - `@hjmds/design-contracts/screen-patterns` adds `resolveSearchScreenPhase`, `resolveSearchCommit`, `resolveSearchEmptyCause`, `resolveFocusAfterRemoval` and `searchScreenRecipe`.

  The `배포/화면/검색/검색 결과와 필터` previews now use this API and keep only example data. Native `./screen-flows` and `./saved-items` gain two reviewed module edges (heading, navigation). No migration is needed.

- def5311: Extend experimental screen compositions with controlled multi-photo previews, individual removal,
  photo-only sending and an optional inline send icon. Preserve the existing text-button API and
  receipt-owned draft clearing. Extend TextArea with a trailing action slot rather than duplicating
  its growing-input behavior.

  Connect ChatMessage long press and accessible activation to the existing ReactionPicker, with
  single-row layout, same-reaction removal and dismissal. Web movement cancels the hold gesture.
  Native uses core Modal and requires no optional context-menu package. Missing native safe-area
  edges contribute zero to dialog viewport padding rather than producing NaN.

  These changes include Web/Native experimental stories and interaction tests; they do not publish
  packages, promote stories, or migrate consumers from the currently installed 1.12.1 release.

### Patch Changes

- def5311: Let Native string/number Button labels shrink and wrap within their available width, using the recipe height as a minimum so enlarged text is not clipped. Preserve the label footprint while loading and retain explicit growWithContent for custom visual children. Independent nine-sample guidance validation reproduced the 2x-text clipping on iPhone 17 Pro / iOS 26.5. Align Button and Dialog usage guidance with loading and asynchronous-action contracts; no API migration or publication is performed here.

  Native Button now joins string/number children such as `{count}개 공유` into one label. Before, that
  array rendered bare inside Pressable and crashed on device with "Text strings must be rendered within a
  <Text> component"; Web already accepted mixed text children.

- def5311: Recreate Native TopBar's internal layout subtree when OS text scaling switches
  between large-text and compact layouts. This prevents a full-width large-text
  host from retaining its layout when reused as a compact side slot. Public props
  remain compatible; slot-local state/focus can reset during this structural change,
  so persistent product state should live outside TopBar. Web keeps its existing
  DOM/CSS layout. Consumer installs and package publication are separate steps.
- def5311: Preserve Dialog and Sheet return focus after a real pointer click on the backdrop. Prevent the backdrop default blur from undoing modal cleanup or moving focus outside a busy modal; leave inside controls and dismissal policy unchanged. Diairy QA W16 supplies real pointer regression evidence. Native has no corresponding DOM default and remains unchanged. No public API or migration is required.

  The Native patch entry follows the fixed release train; no Native implementation changed because it has no browser mousedown default.

- def5311: Use foundation layer and elevation tokens in Web surfaces and anchored overlays, and the floating shadow token for Native Surface. Preserve modal-owned popup ordering and keyboard skip-link visibility. The usage handoff audit found that the documented token scale diverged from hard-coded renderer values; update the related usage guides and browser/native regressions together. No new public component or release publication is introduced.

  Web `@hjmds/react` is a minor change because the absolute `z-index` numbers move to the `layer` token scale (`@hjmds/design-contracts/foundations`, emitted as `--hjm-layer-*`). The relative order of HJM's own layers is unchanged except where noted below.

  | Web surface                                                                                                 | Before      | After                                                                                                       |
  | ----------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
  | BottomCTA (`data-position="sticky"`)                                                                        | 1           | 100 (`sticky`)                                                                                              |
  | FloatingActionButton                                                                                        | 500         | 100 (`sticky`)                                                                                              |
  | BottomNavigation                                                                                            | 700         | 100 (`sticky`)                                                                                              |
  | Select/Combobox listbox, DatePicker popover, `useAnchoredPopup` default, advanced-forms popups              | 800         | 400 (`dropdown`)                                                                                            |
  | Menu, Menubar panel, Mentions list                                                                          | 900         | 400 (`dropdown`)                                                                                            |
  | Popover                                                                                                     | 950         | 400 (`dropdown`) — shares the menu tier; a popover opened from a menu is portaled later and paints above it |
  | Dialog/AlertDialog/Sheet/SidePanel overlay, ContextMenu, CommandPalette, Tour backdrop (`getModalLayer(0)`) | 1000        | 900 (`modal`); Tour popup 1001 → 901                                                                        |
  | Tooltip                                                                                                     | 1100        | 950 (`tooltip`)                                                                                             |
  | Toast viewport                                                                                              | 1200        | 1000 (`toast`)                                                                                              |
  | SkipNav, Layout skip link                                                                                   | 1300 / 1400 | 1001 (`toast + 1`)                                                                                          |

  `modalPriority` still adds to the modal base (`getModalLayer(priority) = layer.modal + priority`), but the base moved from 1000 to 900, so the thresholds shift: a modal now covers tooltips from priority 51 (was 101), toasts from 101 (was 201), and the skip links from 102 (was 401).

  Migration: an app `z-index` set directly against the old numbers can now land on the other side of an HJM layer. For example, an app header at 500 used to sit under menus (800/900) and now covers them (400), and an app banner at 950 used to sit under dialogs (1000) and now covers them (900). Express app layers relative to the tokens instead of copying numbers: `var(--hjm-layer-sticky)` for app chrome that menus must cover, a value below `var(--hjm-layer-dropdown)` for in-page floating content, and above `var(--hjm-layer-toast)` only for something that must cover every HJM layer. Re-check any `modalPriority` above 50 against the thresholds above.

## 1.12.1

## 1.12.0

### Minor Changes

- 914b870: Unify the Progress `max` default at 100 through `progressRecipe.defaults.max`. Native previously defaulted to 1, so the same `value={76}` rendered on Web but threw a RangeError on Native. Native callers that pass fractions without `max` must either pass percentages or set `max={1}`. Native UploadItem now converts its 0–1 descriptor progress like Web does. Like the 1.11.0 API removals, this ships in a minor because the user decided on 2026-10-02 to migrate every managed consumer together; see packages/design-contracts/docs/migration-native-legacy-removal.md.
- 914b870: Allow `currentStepStatus: "complete"` on Steps. The cursor step and every step before it read as complete, so a finished flow no longer shows its last step as in progress. The cursor gets no `aria-current` when complete. The single-cursor derivation is unchanged.

## 1.11.0

### Minor Changes

- 5e394b6: Add optional ActivityHeatmap with a bounded calendar-day contract, explicit missing-data semantics, shared value levels, accessible grid/list views and role-based Web/Native showcase entries.
- 5e394b6: Add AuthScreenLayout mainCard and pendingLabel. Login actions become hidden and inaccessible during authentication while their mounted layout preserves the card dimensions and one loader appears at its centre. Clear pendingLabel after cancellation or failure to restore actions. Products supply localized labels and use provider names for visible button text.
- 5e394b6: Add a shared decorative Avatar fallback slot and opt-in static Blobatar factories
  for Web and Native. Keep existing photo/initials behavior and retry Native photos
  when their source changes. Blobatar peers are exact, optional, and absent from
  base entries. Profile studio examples demonstrate local selection/apply/revert.
- 5e394b6: Add optional animated Blobatar fallback factories, seven supported expressions and explicit active/visible controls. Pause for reduced motion and background hosts; Web also observes intersection. Keep static avatar entries separate and add role-based showcase states.
- 5e394b6: Add optional CodeBlock source previews with exact-text highlight validation, selectable source, scrolling/wrapping and a copy-action slot. Web can reuse ClipboardButton; Native supports system text selection without requiring an Expo clipboard dependency.
- 5e394b6: Add optional DurationField, InlineConfirm, ReactionPicker and NotificationBell compositions for Web and React Native. Reuse existing number, button, confirmation and badge behavior with shared duration/reaction validation. Labels and persistence remain product-owned; no consumer migration is required.
- 5e394b6: Expose contentTransitionMotion geometry on the existing content-transition contract entry, preserving current distances and scale. Native ContentTransition now uses the shared entrance easing and settles an interrupted transition when direction or preset changes. Existing props/imports remain compatible; no new engine, dependency, or automatic consumer adoption is introduced. See docs/expo-interactions.md for Expo support boundaries and the opt-in recovery example.
- 5e394b6: Add a gooey appearance to existing horizontal Tabs, with a measured elastic indicator, unchanged navigation semantics, reduced-motion/background cleanup and Web/Native stories.
- 5e394b6: Add optional GravityLetters decorative drop/rebound presentation with bounded host graphemes, explicit replay, reduced-motion/background cleanup, and role-based Web/Native stories.
- 5e394b6: Add a bounded decorative GridReveal mask that composes with existing Image loading/error semantics and respects reduced motion and host visibility.
- 5e394b6: Add opt-in BottomNavigation capsule presentation with an adjacent primary action,
  accessible collapsed labels and expanded text fallback. Existing routing remains controlled.
  Add the granular NavigationBar slot composition for Web/Native; Native uses an opaque
  surface without a new blur dependency. No existing consumer needs migration.
- 5e394b6: Add an optional underline presentation to the existing OtpField on both platforms. Boxes remains the default; the single real input, paste/autofill behavior and completion contract are preserved. Include matching role-based showcase states.
- 5e394b6: Remove deprecated compatibility APIs in the 1.11 fixed release train: Native state/content aliases, collection options and legacy Menu items, layout descriptors and numeric Surface geometry, and deprecated raw styling props. Remove Web Menu item onSelect and Tabs glyphSize aliases, plus contract layout-validator and catalog-summary aliases. Migrate renderer internals, both showcases, and managed consumers to canonical composition, items/selection, onAction, and token APIs. See packages/design-contracts/docs/migration-native-legacy-removal.md for the complete replacement table and verification boundaries.
- 5e394b6: Add optional ScrollProgress using the canonical Progress renderer and shared bounded scroll metrics. Web includes an explicit-host observer; Native composes the application's existing scroll events. No existing API migration is required.
- 5e394b6: Add optional `action-session` behavior for serialized async work, explicit retry,
  optimistic failure recovery and stale-result invalidation. Existing AlertDialog,
  Button and Toast APIs remain the owners of their UI behavior. Web/native
  experimental stories demonstrate save drafts, bookmark rollback and inverse operations.
  See `docs/action-session.md` for product-owned idempotency, cache and persistence boundaries.
- 5e394b6: Add optional controlled TaskList compositions with shared task validation, canonical Checkbox/List semantics, empty content and an optional collection slot for the existing SortableCollection. Register role-based Web/Native showcase states.
- 5e394b6: Add theme-studio utilities for immutable provider palette edits, numeric contrast reports and JSON export. Include Web/Native foundation previews using the existing providers.
- 5e394b6: Add independently authored fluid and matrix presentations to ThinkingOrb, retaining its existing accessibility and motion lifecycle. Register role-based Web and Native stories with default, dark and large-text fixtures.
- 5e394b6: Add optional seeded mesh/glow/grain EffectSurface entries with shared validation,
  static fallback and host/reduced-motion suspension. Add selective Lucide glyph
  factories and an optional Web Icon glyph seam while retaining existing semantics.
  Provide individual Web/Native avatar, icon and background-effect stories.

  Extend existing ContentTransition/TextTransition with shared fade/rise/slide/scale
  presets, retaining reduced-motion behavior and single-subtree focus semantics.

- 5e394b6: Add controlled VoiceNote presentation using Asset, Slider and Button with playback, seek, loading, error and retry seams. Include role-based three-state Web/Native stories.

### Patch Changes

- 5e394b6: Use a circular in-app Liquid Toast origin and a less rounded 12-unit card. Share the card radius
  with Native content clipping, retaining existing anchor API keys and default settled card placement.

  Reduce Liquid Toast depth with the raised shadow token, fade out the goo-filtered surface during
  expansion, and reveal content at its final scale to avoid an inflated card silhouette.

  Refine the liquid card hierarchy and narrow-screen text space with a top-aligned title/body,
  a rounded-square status badge, and an independent trailing close target.

  Redesign the liquid card as a two-row banner with an unboxed heading glyph, full-width description
  and a separated full-width action footer instead of a badge column and pill action.

  Fix the settled surface losing its fill when the goo layer fades: retain the shape under its shadow
  so the light card stays crisp and the dark card remains visible.

  Use the light background and dark accent-surface tokens for a cleaner white / blue-tinted card,
  retaining its single outline so the light card remains distinct from the page.

- 5e394b6: Share menu typeahead, table sorting/header semantics, Native field presentation and canonical
  carousel navigation/naming across optional motion hosts. Keep existing public APIs and optional
  peer boundaries. Reuse anchored-overlay validation and ThinkingOrb backdrop geometry; add a
  checked public component-to-catalog map and document the Table/DataTable selection boundary.
- 5e394b6: Use a shared 3-second default and minimum auto-dismiss duration for standard and liquid toasts on Web and Native, per the 2026-10-02 product decision. Preserve explicit null and actionable persistent defaults, and renderer pause behavior.
- 5e394b6: Declare explicit React Native resolution conditions for the visual integration subpaths. Keep package-boundary fixtures aligned with the reviewed optional APIs and peers. Include peer-free optional families in the production Metro fixture; SVG/Blobatar adapters retain the existing full-showcase verification boundary.

  Use a distinct dark surface for borderless Liquid Toast so the card remains visible against the canvas without restoring the removed rim.

  Keep the decorative toast close glyph independent of body text scaling so it fits its fixed accessible button at 200% text.

## 1.10.0

### Minor Changes

- 7b7e6c4: Toast visual refresh: tone is shown by a tinted circular icon badge with stroke SVG glyphs (neutral = bell) instead of an edge strip plus text glyph; the action becomes an end-aligned tinted pill; cards use the lg radius and secondary description colour. `toastRecipe` gains `tones.*.badge`, `icon.badgeDiameter`/`badgeRadius` and `action.background`/`radius`/`align`; `toneMark.width` is 0 (retired, slot kept). Native renders the badge around the host's `renderToneIcon`.

## 1.9.0

### Minor Changes

- 3ce99ac: Liquid Toast is stable. Fix the opaque, canvas-clipped card shadow, fade the in-app capsule once the card settles, and keep the droplet anchor-colored until the card widens (`liquidToastRecipe.delay.tint` 110 → 420 ms). Hosts with a Dynamic Island should pass a measured `island` anchor frame.
- 3ce99ac: Add opt-in stable sortable collections, row actions, content transitions, motion carousels and bounded celebrations (Web and Native, verified in Chromium, the iOS 27 simulator and the Android 16 emulator), plus an experimental Native shared-screen transition adapter. Celebration particles use the primary plus theme status accents. Keep runtime peers outside base entries and provide accessible action alternatives. Consumers of Screen Transitions 4.0.0 must apply the shipped conditional-export and native-availability patch; see docs/interaction-adapters.md for exact host compatibility and evidence limits.
- 3ce99ac: Implement Web ColorPicker (controlled sRGB HEX, alpha and presets), decorative text Watermark,
  and top Affix with nested-scroll observation and oversized-content fallback. Add granular
  contract/renderer exports, token-based styles, live showcase examples and browser regression
  coverage. The three implemented Web entries are stable; React Native remains unsupported for these Web-specific entries. No publication or
  consumer dependency changes are performed as part of this source change.

### Patch Changes

- 3ce99ac: Remove TimePicker, Cascader, Rating, TreeSelect and ConfirmPopover from the planned
  component inventory because their working patterns already compose existing primitives.
  Reference mappings now point to those primitives. Keep pattern examples and the public
  tree-select helper; catalog consumers must use the underlying component IDs instead of
  the removed planned IDs. Regenerate catalog artifacts and clarify historical adapter
  verification records without publishing or migrating consumer applications.

## 1.8.0

### Minor Changes

- d589299: Promote completed Web and React Native component contracts/renderers to stable, including the first-invalid-field Native Form focus path. ThinkingOrb becomes stable on Web and Native after required renderer evidence and installed iOS/Android Skia smoke.
- d589299: Add stable Masonry, fixed-row VirtualList, and QRCode entries for Web and Native, with shared geometry and UTF-8 QR contracts. QRCode peers remain optional and its matrices are decode-tested. Add a Native Cascader composition and remove the excluded Chart, AppProvider, BorderBeam, and Utility candidates from the catalog. Ship documented host patches for the optional native menu on RN 0.86.
- d589299: Add the opt-in liquid Toast presentation with capsule and explicit island anchors. Native consumers
  import `createLiquidToastPresentation` from `@hjmds/react-native/toast-liquid` and provide it to a top,
  single-slot ToastRegion. The effect requires optional Skia, Reanimated and Worklets peers; ordinary
  imports remain independent of these modules. Shared descriptors retain standard rendering on Web.

  Preserve FIFO, action and dismissal ownership in the existing store, account for elapsed time before
  Native updates/pauses, and pause while entering or occluded by a host modal. Screen readers, reduced
  motion and constrained viewports use the standard surface. This remains beta; device geometry and
  performance verification are separate from unit and bundle checks.

- d589299: Add opt-in animated Statistic and morphing action Menu for web, and experimental image viewer,
  keyboard motion, gesture Sheet and OS context-menu adapters for native. Preserve root dependency
  isolation and document peer installation, behavior boundaries and pending device verification.
- d589299: Separate component stability from product adoption counts and product release QA. Promote Divider, Section, ListRow, Statistic, DescriptionList, EmptyState, Result, Heading, Top, BottomCTA, AspectRatio, Grid, Steps, TopBar, AuthScreenLayout, Radio, Avatar, Asset, CounterBadge, Image, VisuallyHidden, List, Timeline, BottomInfo, Link, AuthProviderButton, PasswordField, CheckboxGroup, RadioGroup, Chip, SegmentedControl, SearchField, NumberField, Toast, FloatingActionButton, Checkbox, Switch, ToggleGroup, Slider, OtpField, TagsInput, Select, Combobox, Layout, DatePicker, DateRangePicker, Accordion, Agreement, FilePicker, Tabs, BottomNavigation, LoadMore, Breadcrumb, Pagination, Menubar, Form Web, Web-only Splitter, and Mentions on their supported surfaces. Mentions proves caret-based query/insertion, named candidate actions, long labels, and Web keyboard interaction on both supported renderers; Native query callbacks run after commit. Native Form remains beta until its renderer supports first-invalid-field accessibility focus. TextFormat remains Web-only. Do not require visible long-copy layout for media, initials, numeric-count, page numerals, intentionally hidden text primitives, or behavior containers without a prose slot such as Form and DateRangePicker; keep their default and accessibility proofs. Keep component environment checks and require keyboard or host-action evidence only on surfaces whose behavior contract declares that interaction; Layout therefore requires Web skip-link keyboard proof and has no Native keyboard proof. DatePicker has browser keyboard selection/focus-return and Native selection host-action proof. DateRangePicker has browser range keyboard behavior and Native named-date host-action proof. Accordion, Agreement, and FilePicker now have per-surface interaction proof; FilePicker's Native OS picker remains a product adapter responsibility and is not claimed as device-tested. Tabs verifies roving focus, disabled skips, reduced-motion visibility, and Native activate; BottomNavigation verifies route intent while selection remains navigator-owned; LoadMore verifies viewport/manual requests, retry, deduplication, and long status labels. Menubar has actual Web keyboard navigation and long-label evidence. Breadcrumb has real Web route-link keyboard proof. Pagination has real Web page movement and boundary-focus keyboard proof; its four-digit layout stays covered by the 320px/200%/RTL browser test. Splitter remains Web-only and its drag grid, focusable keyboard actions, and RTL behavior are covered by its browser tests. Remove automatic parity evidence. Consumer policy 1.4.0 permits beta adoption with a shared adoption record instead of a separate ADR per component. Existing versioned app profiles retain their requirements until explicitly updated.
- d589299: Add an optional ThinkingOrb AI operation indicator with shared MIT-derived geometry,
  HJM semantic ink, localized labels and pausable motion. Web and optional Skia Native renderers are stable after their required matrices
  and installed iOS/Android Skia smoke. Native hosts must link the documented optional peers.

### Patch Changes

- 6c9b155: Use theme canvas tokens for neutral component backgrounds and white light-theme input interiors, keeping blue focus/selection outlines and typed primary CTA fills such as Create draft. Secondary buttons use their typed recipe with white fill and a neutral control border. Fix native OTP interaction/rendering, repeated UploadItem progress text, GestureSheet first presentation, Web DateRangePicker pointer hit areas and CounterBadge shrinkage discovered during full showcase device/browser auditing.

  Align renderer contracts peers with the authored 1.8 train before version generation, following docs/RELEASE_GOVERNANCE.md; keeping the previous train would incorrectly turn a minor peer update into a major release.

## 1.7.0

## 1.6.0

### Minor Changes

- 59b983f: AlertDialog 버튼이 세로로 쌓일 때 확인을 위, 취소를 아래에 둡니다.

  폰 너비(`alertDialogRecipe.actions.stackBelow` 미만)나 큰 글자에서 버튼이 세로로 쌓이면 1.5.0까지는 소스
  순서대로 취소가 위에 그려졌습니다. 플랫폼 경고창 관례와 반대라 소비 제품이 거꾸로라고 보고했습니다
  (2026-09-27). 이제 `alertDialogRecipe.actions`에 `stackedOrder: "confirm-first"`와 `stackedGap`(`spacing.xs`)이
  있고, 쌓인 상태에서는 확인이 먼저·간격은 좁게 그려집니다. 가로 배치는 그대로 [취소][확인]입니다.

  - React Native: 쌓이면 확인 버튼을 먼저 렌더해 화면·스크린리더·포커스 순서가 같습니다. 취소 버튼 바탕은
    `surfaceAlt` 대신 `bg`입니다 — 브랜드가 `surfaceAlt`를 칠하면 취소가 색 판처럼 보여 확인과 경쟁했습니다.
  - Web: 600px 미만에서 `column-reverse`로 쌓습니다. DOM은 [취소][확인]을 유지해 첫 포커스(취소)와 가로 배치가
    그대로이고, 쌓인 상태에서 Tab은 화면상 위로 이동합니다.

  소비자 migration은 없습니다. 제품이 취소 순서·간격을 직접 덮어 둔 스타일이 있다면 지워도 됩니다.

## 1.5.0

### Minor Changes

- 3d3a2f0: 브랜드가 들어오는 경로를 `brandPalette` 하나로 정하고, 제품 팔레트의 대비를 검사하는 도구와 opt-in 레이어 stylesheet를 추가합니다.

  - `@hjmds/design-contracts/palette-contrast`를 추가합니다. `checkBrandPaletteContrast(brandPalette)`는 Provider와 같은 방식으로
    theme별 병합 결과를, `checkPaletteContrast(palette)`는 완성된 팔레트를 검사해 WCAG 기준 미달 쌍을 돌려줍니다.
    본문 글자(`text`·`textBody`·`textMuted`·`textSub`·`contentBrand`·`danger` on `bg`·`surface`)와 채운 버튼 라벨은 4.5:1,
    `primary`·`borderControl` 윤곽과 `textWeak`(비활성·장식 등급, canvas 위 `border.strong`)는 3:1입니다.
  - 이 검사로 기본 라이트 `textSub`가 `surface` 위 4.19:1로 AA 미달임을 찾아 `#6b7684` → `#65707d`로 고칩니다.
    `Text tone="subtle"` 등 `textSub`를 쓰는 글자가 약간 진해집니다. `borderControl`은 그대로입니다.
  - 브랜드 규칙의 단일 원본 `docs/brand-boundary.md`를 둡니다. 지원 경로는 `brandPalette` 부분 병합뿐이고 모든 브랜드 팔레트는
    대비 검사를 통과해야 합니다. `.hjm-*` 선택자·`--hjm-*` 변수 재정의는 지원하는 테마 경로가 아니며, 이전 문서들의 상충하던
    문구(특이도를 맞춘 재정의 허용, partial override 배제)를 정정합니다.
  - `@hjmds/react/styles.layered.css`를 추가합니다. `styles.css`와 같은 규칙을 `@layer hjm { }`으로 감싼 파일이며 빌드가
    한 원본에서 생성합니다. 이 파일을 쓰면 레이어 밖의 제품 CSS(전역 요소 리셋 포함)가 특이도와 무관하게 HJM을 이기므로
    전환 전에 전역 선택자를 점검해야 합니다. 기본 `styles.css`는 호환성을 위해 레이어 밖에 그대로 둡니다.

- 3d3a2f0: 같은 의도가 Web과 Native에서 다른 이름·모양이던 API를 맞춥니다. 모두 추가 변경이며 기존 이름은 1.x 동안 유지합니다.

  - `HjmProvider`·`HjmNativeProvider`에 `brandPalette` prop을 추가합니다. 이전에는 브랜드를 넣으려면 전체 `value`를
    직접 만들어야 했고, 그러면 Provider가 OS theme·글자 크기·모션 설정 관찰을 멈췄습니다. 중첩 Provider는
    가장 가까운 상위의 브랜드를 물려받습니다. 브랜드 경계 규칙은 `docs/brand-boundary.md`입니다.
  - Web `TextField`에 `onValueChange(value)`를 추가합니다. Native `TextField`·Web `TextArea`와 같은 이름·모양이며 DOM `onChange`도 계속 호출됩니다.
  - Native field류에 `description`을 추가합니다(Web과 같은 이름). `supportText`는 deprecated alias로 남습니다.
  - Native `useToastRegion()`에 `publish`를 추가합니다(Web `useToast().publish`와 contract store와 같은 이름). `show`는 deprecated alias로 남습니다.
  - Web `Sheet`에 recipe의 `size`(auto·medium·large·full)를 추가합니다. Native에는 이미 있었습니다. 사용자가 높이를 바꾸는 `detents`가 있으면 `activeDetent`가 우선합니다.

- 3d3a2f0: 렌더러 시나리오 증거를 실제 검사로 바꾸고, 그 검사로 드러난 결함을 고친 뒤 13개 컴포넌트를 stable로 올립니다.

  **증거.** 1.4까지 dark·RTL·큰 글자·모션 줄이기·긴 문구·접근성 시나리오는 모든 컴포넌트가 템플릿으로 일괄
  주장했습니다. 그런데 증명한 것은 SSR 결과에 Provider 속성이 붙었다는 것(Web)과 렌더가 죽지 않았다는 것
  (Native)뿐이었습니다. 긴 문구는 컴포넌트가 아니라 감싸는 요소에 들어가 있었습니다.

  - Web `test/scenario-matrix.browser.test.tsx`: 실제 Chromium에서 계산 스타일을 봅니다.
    - dark: 라이트 전용 팔레트 색이 남으면 실패합니다.
    - 2배 글자: 글자가 1.5배 이상 커지고 가로로 넘치지 않아야 합니다.
    - RTL: 방향을 상속하고 물리적 정렬을 쓰지 않아야 합니다.
    - 모션 줄이기: 투명도 외의 움직임이 없어야 합니다.
    - 접근 이름: 모든 조작 요소에 이름이 있어야 합니다.
    - 긴 문구: 컴포넌트 안에서 줄바꿈되어야 합니다.
  - Native `test/scenario-matrix.test.tsx`: test renderer의 style·props로 같은 축을 봅니다.
    - RTL: LTR 결과의 좌우 반전이어야 합니다.
    - 모션 줄이기: 마운트 때 시작된 `Animated.timing`의 길이를 봅니다.
    - 긴 문구: 레이아웃을 잴 수 없으므로 한 줄로 잘리지 않는지만 증명합니다.
  - 기본 시나리오만 기존 default-render proof에 남깁니다. 두 proof는 공용 fixture 모듈을 씁니다.
  - Web의 "모든 시나리오 증거 완비"는 과대 표시였던 33개에서 실제 16개로 줄었고, 보강 뒤 24개입니다.

  **검사가 찾은 결함과 수정.**

  - Heading·Top 제목이 text scale을 무시하던 문제(Web).
  - FilePicker의 숨은 file input이 이름 없는 두 번째 tab stop이던 문제(Web). 이제 라벨로 이름을 받고 tab 순서에서 빠집니다.
  - Surface·Section·Link에서 끊김 없는 긴 단어(URL·이메일·식별자)가 넘치던 문제(Web). `overflow-wrap: anywhere`를 추가했습니다.

  **승격.** `Text`, `Icon`, `Stack`, `Container`, `DesignSystemProvider`, `IconButton`, `Badge`, `Card`, `Tag`,
  `Notice`, `Progress`, `Spinner`, `Skeleton`을 stable로 올립니다. 두 renderer에서 요구 시나리오가 모두 통과하고
  세 제품 이상이 쓰는 컴포넌트입니다.

  - 필수 foundation bridge의 다섯 항목이 모두 stable이 됐으므로 중앙 app profile의 다음 개정에서 목록을 비웁니다(consumer-policy 1.3.0).
  - 보이는 글자 슬롯이 없는 Icon·IconButton·Skeleton·Spinner·Divider는 long-copy 요구에서 뺐습니다.

  **기타.**

  - 카탈로그 확장 동결(`docs/catalog-freeze.json`): keyboard·platform-parity 증거가 필요한 핵심 beta가 승격될 때까지 새 항목을 추가하지 않습니다.
  - 핵심 컴포넌트의 시각 기준 이미지 검사(`test/core.visual.test.tsx`, `.github/workflows/visual.yml`)를 추가합니다. 기준 이미지는 CI 이미지(ubuntu-latest)에서만 만들고 비교합니다.

- 3d3a2f0: Web Dialog·Sheet·Toast·Button·Field의 표현 값을 recipe에서 만든 CSS 변수로 읽습니다. **Web 화면이 바뀝니다.**

  손으로 쓴 `styles.css`가 recipe 값을 베껴 적으면서 Native와 어긋나 있었습니다. 이번 minor에서 Web을 recipe(=Native)에 맞춥니다.

  - Dialog·Sheet 배경: `surface`(밝은 테마 `#f2f4f6`) → recipe `canvas`(`#ffffff`). 그림자: `0 16px 48px 28%` → `shadow.floating`.
    Sheet 모서리: `lg` → recipe `xl`. 아래 Sheet 최대 크기: `min(88dvh, 48rem)`·폭 48rem → recipe `maxHeightRatio 0.9`(90dvh)·`web.maxWidth 640px`.
    핸들 색: `border-control` → recipe `content.secondary`. detent 높이는 `sheetRecipe.sizes`에서 옵니다.
  - Toast 테두리: `border` → recipe `border.strong`. 그림자: `0 8px 24px 18%` → `shadow.floating`. 닫힘 전환: 160ms `ease` → `motionPreset.exit`(120ms, exit 곡선, 모션 줄이기 시 0ms).
  - Button 누름: `scale(0.98)` → Native와 같은 `opacity.pressed`(0.86). 비활성 불투명도와 Field 테두리·포커스 링·비활성 값은 이미 같았고, 이제 recipe 변수를 읽습니다.
  - 새 CSS 변수: `--hjm-shadow-*`, `--hjm-dialog-*`, `--hjm-sheet-*`, `--hjm-toast-*`, `--hjm-button-*-opacity`, `--hjm-field-*`.
    그림자 토큰은 react-native-web과 같은 방식으로 변환합니다(radius를 blur로 그대로 씀).

  z-index는 바꾸지 않았습니다. Web의 쌓임 순서(toast > tooltip > modal > menu > select)는 layer 토큰과 같습니다.
  숫자는 제품 페이지의 z-index와 함께 쓰이므로 이번 변경에서 옮기지 않습니다.

  `test/recipe-alignment.browser.test.tsx`가 밝은·어두운 테마에서 실제 계산 스타일을 recipe 값과 비교합니다.
  제품 CSS로 Sheet·Dialog 내부를 덮어쓴 앱(다에리 Web 등)은 새 값과 겹치지 않는지 확인이 필요합니다.

### Patch Changes

- 3d3a2f0: Web에서 키보드 포커스 표시가 그려지지 않던 결함을 고칩니다.

  1.4.0까지 `styles.css`는 `--hjm-color-focus`·`--hjm-focus-width`·`--hjm-focus-offset`을 30곳에서 대체값 없이
  읽었지만 어떤 코드도 이 변수를 설정하지 않았습니다. 정의되지 않은 변수를 참조한 선언은 계산 시점에 무효가
  되므로 Chip·Sheet·Popover·Calendar·DatePicker·DataTable·Tree·CommandPalette·TagsInput 등 21개 family의
  포커스 외곽선이 없었습니다. 이제 Provider가 공용 `focusIndicatorContract`에서 세 변수를 내보내고, 기본 포커스
  규칙도 같은 변수를 씁니다. 같은 원인으로 색이 비던 BottomNavigation 누름 배경(recipe `pressedBackground`),
  Statistic 성공·경고 추세, Steps 완료, UploadItem 성공 색과 `--hjm-stroke-*`도 정의된 값으로 연결합니다.

  `test/css-variables.ssr.test.tsx`가 대체값 없는 모든 `var(--hjm-*)` 참조가 renderer가 실제로 설정하는 이름인지
  검사하고, `test/focus-ring.browser.test.tsx`가 실제 브라우저에서 외곽선이 그려지는지 확인합니다.

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

## 1.3.3

## 1.3.2

### Patch Changes

- 8b053b6: AuthScreenLayout의 렌더러 배선을 마칩니다.

  두 렌더러의 granular export(`./auth-screen`), evidence claim과 실행 가능한 default 사례,
  Metro fixture, package boundary 목록, 그리고 새 진입점의 명시적 그래프 예산을 더했습니다.
  1.3.1은 계약·렌더러 소스만 담고 이 배선이 빠져 있어 릴리스 검증에서 막혔습니다.

  공개 API는 1.3.1과 같습니다 — 빠져 있던 진입점이 실제로 열립니다.

## 1.3.1

### Patch Changes

- AuthScreenLayout 계약 모듈 한 개만큼 import 그래프 예산을 올립니다.

  여섯 진입점(`./recipes/all`·`./behaviors`·`./catalog`·`./showcase`·`./evidence`·루트)의 그래프가
  각각 모듈 1개, raw 약 2.8kB, gzip 약 1kB 늘었습니다. 증가분의 정체는 `auth-screen.ts` 하나이며
  기존 helper만 재사용하고 외부 의존성을 들이지 않습니다. 공개 API는 바뀌지 않습니다.

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

- ca7c84d: Document the 1.2.0 `ResolvedDesignSystemEnvironment` migration in docs/density.md.

  `density` is required on the resolved environment because that type exists to say
  every axis is already filled in. The runtime is compatible — the resolver always
  supplies it and the default is `comfortable` — so the only code that breaks is
  code that builds a resolved environment literal by hand. Code that merely
  receives and forwards one is unaffected. The note shows the one-line fix for the
  `TS2741` that follows, which 1.2.0 shipped without explaining.

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

### Major Changes

- 70d0786: 다크 테마 `THEMES.dark`를 라이트와 같은 중성 계열로 옮기고 `primary`의 밝기 역전을 고친다.

  다크는 `bg`·`surface`가 채도 48-55%의 인디고(hsl 228-229°)인데 `surfaceAlt`와 중성 램프는
  채도 14-33%의 슬레이트(hsl 210-217°)여서 두 색 계열이 섞여 있었다. 채도 높은 바탕 위에
  채도 낮은 판을 얹은 구조가 화면을 탁하게 만들었고, 라이트(거의 중성 회색, 채도 9-23%)에는
  짝이 없는 구조였다. 표면과 중성 램프를 라이트와 같은 계열로 내려 채도가 높은 것은 강조색만
  남게 한다.

  `primary`는 다크가 hsl 201° 90% 27%로 라이트의 32%보다 **어두웠다**. 주요 동작이 배경으로
  가라앉아 세 표면 대비 1.93:1~2.49:1이었고, UI 요소가 형태로 식별되는 3:1에 미달했다. 기존
  AA 검사는 버튼 **위의 글자**만 보므로 이 결함을 잡지 못했다. 새 값 `#0476b4`는 3.20:1~3.84:1이고,
  흰 라벨 대비는 7.56:1 → 4.93:1로 줄지만 AA를 유지한다.

  `test/contracts.test.ts`에 두 회귀 게이트를 추가했다(채운 컨트롤의 3:1, 중성 역할의 채도 상한).
  값 변경만이고 키·모듈 수·import 엣지는 그대로다. 근거와 조정 가능한 범위는
  `packages/design-contracts/docs/theme-palette.md`에 있다.

  **소비자 영향:** 다크 테마의 모든 표면·테두리·본문 색 hex가 바뀐다. 제품이 이 토큰 위에
  자체 다크 배경·유리 표면을 얹고 있다면 그 값과 함께 확인한다. 라이트 테마는 바뀌지 않는다.

  **major인 이유:** 값만 바뀌고 키·타입·API는 그대로지만, 소비 제품의 다크 화면이 전부 바뀐다.
  minor로 올리면 범위 설치를 쓰는 소비자가 화면 변경을 예고 없이 받는다. 버전 번호는 변경의
  크기를 나타내야 한다는 docs/RELEASE_GOVERNANCE.md의 원칙을 그대로 적용한 판단이며,
  도구의 부수효과로 나온 major가 아니다. 같은 문서의 "Contracts peer 범위" 절차대로 두 renderer의
  peer 범위를 이 changeset과 같은 커밋에서 `>=1.0.0 <1.1.0`으로 먼저 옮겼다.

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

## 0.9.12

## 0.9.11

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

- edeff8d: Document the npm-only fixed-version installation contract, export the versioned consumer policy with the package, make the HJM organization gradient's product-branding boundary explicit, and distinguish centrally required beta foundations from product-selected beta adoption until the Stable Core grows.
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
