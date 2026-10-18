# @hjmds/design-contracts

## 1.32.1

### Patch Changes

- 47f2a3d: Promote conversation list, chat date separator, typing indicator, and page indicator Storybook entries from experiment to deployment on Web and Native. Update packaged usage guidance while retaining beta API maturity and existing behavior.

## 1.32.0

### Minor Changes

- 784d15b: BottomNavigation gains recipe-driven theme frames and a lifted selected icon: `configuration.shape` (`standard` default · `rounded` · `pill` · `compact` · `square`, floating + emphasis selection only) picks the floating surface's radius token and inner padding from `bottomNavigationRecipe.shapes`, and `configuration.iconEmphasis: "lift"` (default `scale`) raises the selected icon one 4pt step and dims idle icons (`bottomNavigationRecipe.icon.liftEmphasis`) as the non-color cue for full-color app-icon artwork. Defaults render exactly as before.
- 784d15b: IconTile `icon` also accepts a function that receives `IconTileArtwork` (`{ edge }`: 64 for `size="fixed"`, the measured cell-clamped edge for `size="fill"`), so fixed-size image artwork sizes itself without the product re-computing the 48–68 clamp. Contracts add `resolveIconTileFillEdge(cellWidth)` for layout estimates made before a tile measures. A ReactNode `icon` renders as before.
- 784d15b: ImageChoiceGroup gains three additive options (web + native): an item `description` (one muted caption line under the name, read once as the tile's description — `aria-describedby` / `accessibilityHint`), `itemLabelLines` 1 | 2 for word-keeping two-line names, and `virtualized={{ height, overscan? }}` for long lists, where the group scrolls itself and mounts only rows near the viewport (Web windows rows with the VirtualList `resolveVirtualWindow` math, Native uses a FlatList of fixed-height rows; both keep the radiogroup/group semantics). Every tile in a group reserves the same caption block so rows stay even. Contracts add `resolveImageChoiceCaptionLines`, `resolveImageChoiceTileHeight`, `resolveImageChoiceColumns`, `resolveImageChoiceOuterSize`, `validateImageChoiceItemLabelLines` and recipe keys `itemLabelMaxLines`, `itemDescription*`, `virtualViewportInset`; blank descriptions throw. Defaults are unchanged (Web wraps a visible item label in a `hjm-image-choice__caption` span of the same height).
- 784d15b: `MediaAlbumPageStatus` (`/screens`, `mediaAlbumRecipe.pageStatus`, `validateMediaAlbumPageStatus`) draws a loading (spinner named by `label`) or failed (announced text + optional retry Button) page of a ChatMessage/CommentThreadRow `mediaAlbum`, centered in the frame. While it is shown the page frame drops its single accessible image name and `onPress` open action, so the status and retry button are reachable by screen readers and pointer; the frame and page wrapper keep their elements, so the product's page is not remounted. The press-to-open target is now an overlay button over the page instead of a button wrapping it (web `.hjm-media-album__open`; images inside the page are styled through `.hjm-media-album__content > img`).
- 784d15b: Pagination accepts results without a known total: `descriptor={{ currentPage, hasNext }}` with `composeCurrentPageLabel({ page })` renders previous, a product-composed current page label (`paginationRecipe.pageLabel`) and next, with no numbered window. Contracts add `PaginationOpenEndedDescriptor`, `isPaginationOpenEndedDescriptor` and `resolvePaginationOpenEndedDescriptor`; the bounded forms and `composeAccessibleName` are unchanged.
- 784d15b: ChatMessage `reactions.summary.readOnly` (default `false`) draws the reaction counts for readers who cannot react (guests) in the same place beside the time as non-interactive caption text named by `label` (no pill surface, no press target), so products no longer render guest counts as their own caption in `actions`.
- 784d15b: ScreenLayout `contentInset="body-bleed"` keeps the header, notice and footer gutters and removes every body padding, so a map or canvas meets the header, both screen edges and the footer. Without a footer the body, as the last region, still clears `safeAreaBottom` (Native) and an overlay BottomNavigation, without the gutter. Fix: with `body-edge` and `body-bleed` the shared loading/empty/error state group keeps the screen gutter (it has no inset of its own and put its copy against the screen edge); ready bodies are unchanged.
- 784d15b: SearchScreen accepts `filtersRole` (`"narrow"` default, `"scope"`). Scope filters choose what is searched (search kind, region, map area), so the filter rail and sheet trigger now stay on a query-caused zero result as its recovery path instead of being hidden; narrowing filters keep the previous behaviour. The rule moved to the new contract resolver `resolveSearchFilterRailVisible` (with `SearchFiltersRole`) that both renderers call.

### Patch Changes

- 784d15b: BottomNavigation's covered height has one owner: ScreenLayout's last region (footer, else body), including `scroll="content"` screens and screens composed on ScreenLayout. The 1.31.0 usage guide told `scroll="content"` screens to add `useBottomNavigationInset()` to their list, which doubled the space; the guide is corrected and both renderers now have a test that the inset is applied exactly once. Rendering is unchanged.
- 784d15b: Native Metro bundle check runs again: the fixture imports every peer-free public family (16 families were missing, so the check
  stopped before bundling since 1.31). The real graph then showed that `/media-transport`, `/toggle-feedback`,
  `/authoring-tools` (BezierEditor curve) and `/data-workflows` (composes BarChart) need the optional `react-native-svg`
  peer like `/chart`; they now sit in the check's optional-peer boundary, and the authoring-tools and data-workflows
  contract docs state the peer.
- 784d15b: Toast stripe contract: there is no edge stripe — the tone badge (or product media) carries tone, and no option to hide one is offered. Web no longer renders the always-hidden `.hjm-toast__tone-mark` element (and its `display: none` rule), Native drops the unreachable stripe branch, and `toastRecipe.toneMark` (width 0) is marked `@deprecated`, kept only for recipe-shape compatibility until the next major. Visual output is unchanged; product rules or palette overrides that "hide the stripe" can be deleted.

## 1.31.0

### Minor Changes

- 1006160: BottomNavigation reports the height it covers through `BottomNavigationInsetProvider` / `useBottomNavigationInset` (Web's fixed bar always, Native with the new `placement="overlay"`), and ScreenLayout pads its last region by it; items accept `prominent` for a selectable raised center destination, and `configuration.iconSize` (`large` 44, `xlarge` 52) enlarges the icon slot for app-icon artwork.
- 1006160: New `ChatDateSeparator` (`/screens`): a centered, product-formatted date or time row between ChatScreen timeline groups (`chatDateSeparatorRecipe`); Web renders `<time>` when `dateTime` is given.
- 1006160: CommentThreadItem gains `timePlacement: "actions"` to put the time with Reply under a rich (non-text) body, and a `panel` slot for an inline edit/report/block form under the Reply line, outside the long-press target (`commentThreadRecipe.panelGap`).
- 1006160: IconTile adds `frame` (`surface` | `none`), `shape` (`squircle` | `square` | `circle`) and `size` (`fixed` | `fill`, clamped to `iconTileRecipe.fillMinSize`–`fillMaxSize`), so complete product launcher artwork, theme icon shapes and grid-sized icons use the shared tile. Defaults keep the framed 64 squircle.
- 1006160: ImageChoiceGroup accepts `showItemLabels` to show each item's name under its tile inside the same press target (one ellipsized caption line, `imageChoiceRecipe.itemLabel*`), without changing what assistive tech reads.
- 1006160: Add `ImmersiveOverlay`, a Dialog companion for edge-to-edge presentations (no card, scrim or header; Native presents full screen with the status bar hidden and rotation allowed) that keeps the HJM modal stack, focus trap, focus return and reasoned dismissal, with values in `dialogRecipe.immersive`.
- 1006160: ChatMessage and CommentThreadItem accept `mediaAlbum`, a paged photo set whose `renderPage(index)` runs only for the shown photo (counter row with previous/next icon buttons, `mediaAlbumRecipe`), so products that authorize each image fetch one page at a time instead of mounting every preview; `media` is unchanged and passing both throws.
- 1006160: MediaSelectionScreen exports its item cell as `MediaSelectionCell` so virtualized hosts (VirtualList, FlatList renderItem) render the same preview, upload status and actions, and both accept an optional `rotate` action placed before remove.
- 1006160: ModerationScreen adds `variant="review"` for operator decisions (required free-text reason, product-labelled decisions with optional confirmations, one decision at a time, `resolution` once decided), and the new companion `ModerationForm` renders the same report or review fields without screen chrome for letters, cards and sheets.
- 1006160: New `PageIndicator` exposes Carousel's position dot row for product-owned pagers, backed by the `resolvePageIndicator` / `getPageIndicatorTarget` contracts and `carouselRecipe.dot`; Carousel now renders the same dot row.
- 1006160: ProfileScreen accepts `editPlacement="summary"`, which draws the edit action first in the action row of the ProfileSummary inside `summary` as a small secondary button (`profileSummaryRecipe.editAction`) instead of the ghost button below the summary.
- 1006160: ChatMessage `reactions.summary` draws the current reaction counts beside the time as one button that opens the same hold menu (`chatMessageRecipe.reactionSummary`, validated by `resolveChatReactionSummary`), so products no longer show counts as status tags that cannot open the menu.
- 1006160: Semantic icons add `arrowUp`, `arrowDown`, `rotate` and `unblock`, and their 24-unit paths move into the contract as `semanticIconPaths` (with `isSemanticIconName`). Web draws them built in; Native draws the same paths through the new optional `@hjmds/react-native/icon-svg` entry (`renderSemanticGlyph`, react-native-svg peer).
- 1006160: Steps accepts `onStepPress`: steps before the cursor (new resolved `revisitable` flag) become one named button over marker and label with a 44 minimum target (`stepsRecipe.press`), while the current and later steps stay static.
- 1006160: Tabs accept `indicator="filled"`, which marks the selected tab with a brand-tinted pill (`tabsRecipe.indicators.filled`) instead of the underline and drops the list divider; the moving indicator becomes a sliding pill.
- 1006160: New `TypingIndicator` (`/screens`): an incoming-bubble row of pulsing dots for a ChatScreen timeline with a localized `label` announced politely and an optional `avatar`; the dots stay still under reduced motion (`typingIndicatorRecipe`).

### Patch Changes

- 032a453: Classify TypingIndicator and PageIndicator as textless for the long-copy evidence scenario: their copy is an announced label or accessible names only, like Pagination.

## 1.30.0

### Minor Changes

- bb640b7: Consolidate canonical registration metadata in the catalog, derive stable component IDs and renderer evidence from it and generated public exports, and promote 22 screen/composition contracts and their Web/Native surfaces to stable after focused renderer proofs. Optional extensions keep their independent maturity.

  Name the Web ScreenLayout scroll region and mirror Native DataTable alignment, indentation and pinned edges in RTL while preserving complete measured cell values. Correct the conversation-row Metro export condition. Renderer evidence imports the granular `@hjmds/design-contracts/catalog` entry, and Native ImageChoiceGroup evidence no longer claims a `native-actions` scenario its contract does not require. Existing component names and shipped IDs remain supported; this change does not publish packages or update consumer apps.

## 1.29.0

### Minor Changes

- 9cbd80b: 22 screen compositions shipped from `./screens` and `./screen-flows` (`ScreenLayout`, `CompositionLayout`, `SettingsScreen`, `SearchScreen`, `EditorScreen`, `PermissionScreen`, `OnboardingScreen`, `ModerationScreen`, `ChatScreen`, `NotificationInboxScreen`, `CommentThreadScreen`, `ListDetailScreen`, `MediaSelectionScreen`, `ProfileScreen`, `ChatMessage`, `NotificationRow`, `NotificationItem`, `CommentThreadRow`, `ProfileSummary`, `IconTile`, `MessageComposer`, `PhotoSourceSheet`) are canonical catalog rows now (`beta` on both surfaces) with stable component ids, overview/individual Storybook items on both platforms, and first-party renderer evidence claims. Products that already use them stop failing the consumer source gate with "does not resolve to the pinned component catalog"; as beta rows they are declared through `optionalBetaAdoptions` until promoted. Their recipes (`screenPatternRecipe`, `searchScreenRecipe`, `chatMessageRecipe`, `commentThreadRecipe`, `notificationRowRecipe`, `profileSummaryRecipe`, `iconTileRecipe`, `composerQuickInsertRecipe`) join `recipeRegistry`. Known promotion debt is recorded in the evidence gap maps (Web: MediaSelectionScreen accessibility, NotificationItem and CommentThreadRow long-copy; Native: CommentThreadRow long-copy, and no Native OnboardingScreen claim until its mount scroll guards the host method). `AuthScreenHero`/`AuthScreenFooter` and `ClipboardIconButton` are classified as companions in the public component map.

### Patch Changes

- 9cbd80b: `AuthScreenLayout` gains `initialFocus` (`"first-input" | "none"`, Web and Native) with the ScreenLayout entry-focus rules. The default stays `none` (`initialFocusDefaults.auth`) because auth screens lead with provider buttons; a signup nickname step opts in with `first-input`.
- 9cbd80b: Entry focus covers fields that appear after entry (additive). New contracts rule `resolveEntryFocus` (`screen-patterns`, phases `entering` / `open` / `settled`) is shared by Web and Native. A scope that entered without focusing stays open until the user interacts with it (Native touch or scroll, Web pointer, key, wheel or touch while no modal is above): a field registering meanwhile (shown after data loads) gets the entry focus. After entry, a field marked `initialFocusTarget` that mounts is focused when it appears, in any `initialFocus` mode, unless another text field has focus or an overlay is above — a search field revealed by a tap, or each step's field in a multi-step `Sheet` / `EditorScreen`. Products drop `autoFocus` on revealed fields and manual step-change `ref.focus()`.

## 1.28.1

### Patch Changes

- 1190b17: `AuthScreenFooter` links take an optional `accessibilityHint` (Native `accessibilityHint`, Web visually hidden `aria-describedby` text; blank strings throw) and, on Web, `target`/`rel` for `href` links (`rel` defaults to `noreferrer noopener` for `_blank`, as on Link). The visible label stays the link name.
- 1190b17: Screen entry focus (additive). Text fields (TextField, TextArea, SearchField, PasswordField) register with the nearest screen or overlay scope, which focuses one field after entry using the shared contracts rule `resolveInitialFocusTarget` / `initialFocusDefaults` (`screen-patterns`). New props: `ScreenLayout`/screen compositions `initialFocus` (`"first-input" | "none"`, default `none`; SearchScreen and EditorScreen default `first-input`; ChatScreen and CommentThreadScreen stay `none` so the keyboard does not cover the history), `Sheet`/`Dialog` `initialFocus` (default `single-input`: only a lone text entry is focused; AlertDialog follows the same default), and field `initialFocusTarget` (true prefers the field, false excludes it). Disabled and read-only fields are never chosen; focus is never taken from a field the user is in (Web also not under an open modal). Native focuses after the enter interaction (sheets after they are shown); Web on mount with `preventScroll`. Screens focus once per mount; overlays on every opening. Web `initialFocusRef` still wins. Products replace their own `autoFocus` / delayed `ref.focus()` with these props.
- 1190b17: `Skeleton` gains `buttonShape` (`rounded` | `pill`, default Button's default) for `shape="button"`: the corner comes from `buttonRecipe.shapes` and the theme radius, the same axis as Button `shape`, so pill-button products get pill placeholders. `skeletonRecipe.shapes.button.radius` now derives from the Button default shape (unchanged value `md`).

## 1.28.0

### Minor Changes

- f5d88f4: All text weights are one step lighter (2026-10-17 user decision, "굵기 좀더 줄여"). Display headings `heading.level1`/`level2` are semibold 600 (brutalist keeps 800); `typography.title`, `titleLarge`, `heading` and heading levels 3–5 are medium 500; Text emphasis is regular 400, medium 500 and strong 500, with `strong` following the title weight. Label stays 500 and body 400. Component recipes follow the same mapping: titles use the title weight, labels and emphasized text 500, display numbers (Statistic value) and selected/checked states 600. Web CSS reads `--hjm-type-title-weight` and `--hjm-text-emphasis-*` instead of fixed bold/semibold, and card, dialog, sheet, alert dialog, side panel, tour, notice, empty state and result titles no longer fall back to the browser's bold. Native tables, charts and counter badges read the same recipe values, and Pretendard draws 500/600 with the Medium/SemiBold faces.
- f5d88f4: Remove the large (display) type tier (2026-10-17 user decision, "글자 너무 커", "큰 글자 정책은 없애"). The largest text in HJM is now `typography.heading` 24/32. `heading.level1` (was 40/48/600) and `heading.level2` (was 32/40/600) are deprecated aliases with the same value as `level3` (24/32/500); new code builds hierarchy with `level3` → `level4` (20) → `level5` (18) and sets the document level with `semanticLevel`. `Top size="large"` reads `heading.level3` (24) instead of `level2` (32). Design profiles reject any typography or heading step above 24px with `RangeError`, and profile `typography.heading` overrides now also flow into level1/2. The editorial (56/42/30) and brutalist (48/38/30) enlarged headings are gone; brutalist keeps its 800 heading weight only, and minimal drops its now-redundant medium-weight overrides. The Statistic value keeps semibold 600 explicitly instead of borrowing the removed display weight.
- f5d88f4: SegmentedControl (`connected`) now has the same outer height as Button, IconButton and Chip of its size step: small 36, medium 44 (2026-10-17 user request "높이 맞춰" — the sort control and the saved-only chip in one row were 46 and 36 tall). `segmentedControlRecipe.sizes` gains `height` (outer height); `minHeight` stays the option height inside the track, now height − 2 × (padding + border) = 26 / 34, and `hitSlop` (9 / 5) extends options vertically only to the 44 target. Web draws the track inside a new `.hjm-segmented__scroller` that reaches past a small track by negative margin, so the options' hit area is not clipped by the horizontal scroll and the layout height does not grow; Native does the same with a wrapping View, a ScrollView with negative vertical margin, and an inner track View. Stacked large-text rows keep 44 options with no slop. Visual change: connected segmented controls are 10px shorter (track 46→36 small, 54→44 medium); `pills` and `text` presentations are unchanged.
- f5d88f4: Sheets no longer draw a visible title line (2026-10-17 user decision). `title` stays required and names the dialog: Web renders it in a visually hidden `h2` referenced by `aria-labelledby`, Native keeps it as the dialog `accessibilityLabel` plus an off-layout screen-reader header. The header row is drawn only for a description or a visible ×, and the × keeps its inline-end place. Native Select/Combobox selection sheets and `GestureSheet` follow the same rule; a Native element `title` is no longer drawn (`accessibilityTitle` names the sheet). `sheetRecipe.title` visual values are removed. Web: the sheet header sits inside the drag zone, so the `.hjm-sheet > .hjm-sheet__header` rule had stopped matching and the Dialog's 20px top padding leaked in; the rule now scopes by the sheet.

  A backdrop press now closes sheets in every placement (2026-10-17 user decision; bottom sheets had been drag-only since 2026-10-16): `resolveSheetDismissPolicy` defaults `outsideDismiss` to true. Closing goes through the same request path as the handle and drag, so `busy`, `dismissPolicy` and a controlled owner's discard confirmation still apply. The Native backdrop is a button named by `closeLabel`.

- f5d88f4: Skeleton is a filled, clearly visible placeholder again (2026-10-17 user request "스켈레톤 유아이 개선해줘": the Native story showed one faint outlined bar on white). Cause: `skeletonRecipe.background` was `semanticColors.canvas` — the page color itself — and both renderers added a hard-coded 1px `border` outline, so the shape disappeared on white and read as an empty input in dark. New `semanticColors.surface.placeholder` (`text` at 12% alpha) is the fill; it tints whatever it sits on, so it stays visible on canvas, Card surfaces and profile palettes. Web now reads the fill from the recipe through the provider variable `--hjm-skeleton-background` instead of a stylesheet copy; both renderers drop the outline. ListRow `loading` placeholders use the same fill so a loading screen mixing both reads as one state.

  Additive API: `shape` gains `media` (16:9 by width, `aspectRatio` in the recipe) and `button` (medium button height 44, radius `md`); new `lines` prop (text only) draws N lines with the last one at 60% (`skeletonRecipe.lines`) under one pulse, so paragraph placeholders are not rebuilt from loose bars. Native unlabelled Skeletons are also hidden from Android accessibility (`importantForAccessibility="no-hide-descendants"`), and circles no longer shrink in a row. Existing props, defaults (`block`, pulse on, reduced motion static) and Native `width`/`height`/`radius` precedence are unchanged. Visual change: every Skeleton becomes a grey fill without an outline.

### Patch Changes

- f5d88f4: Login screen hero and policy links follow `authScreenRecipe` (2026-10-17 user feedback, "굵기랑 크기 줄여" / "간격 줄여"). New `AuthScreenHero` (mark, eyebrow, title, description) and `AuthScreenFooter` (consent notice and policy links) fill the `AuthScreenLayout` slots on Web and Native. The tagline uses `typography.heading` 24/32 at the title weight 500 (`titleLarge` 20/28 in compact) instead of the 32/40 display heading that `Top large` gave, so a Korean slogan fits one line at 402. Policy links are caption, brand colour and underlined, separated by `linkGap` 8 + "·" + 8 (about 19px between texts instead of 40–42 from ghost-button padding plus a Stack gap); the 44px touch target is a background-less height plus an invisible inline extension (Web pseudo-element, Native hitSlop). `authScreenRecipe.title` is now `typography.heading`, and the resolved descriptor carries `titleVariant`.
- f5d88f4: NotificationBell takes `edge` like IconButton; the overhang goes on the bell root, so its glyph slot lands on the top-bar inset while the badge keeps the icon corner. The Native scrollable Sheet body now reaches the sheet's padding edge with the padding inside its scroll content (as the Web body), so ListRow surfaces inside it are no longer cut; content does not move. VirtualList and the Sheet share one internal bleed-room rule, and the Web VirtualList room now reads the rem bleed variable. Usage docs record that the screen gutter belongs to ScreenLayout: an outer Container gutter with contentInset="none" is not a supported shape.
- f5d88f4: List `indented` separators follow the text column of the row above them instead of a fixed 52 start: 52 (leading 40 + gap 12) after a ListRow with a leading element, 0 after one without, ending on the row's trailing content edge (0) instead of bleeding −8. `listRecipe.separators` gains `leadingInsetStart`; ListRow exposes its leading presence (Web root `data-leading`, Native List item context). `full` is unchanged.
- f5d88f4: A Switch row with a visible description is compact on Web and Native (2026-10-17 user report, notification settings "간격이 커"). `switchRecipe.rowPaddingVertical` (8, the comfortable list-row padding) is drawn above and below the copy and `switchRecipe.rowTwoLineMinHeight` is now 56 (body 20 + 4 + caption 16 + 8 × 2) instead of borrowing ListRow's 68, which is sized for a larger title and left 14 above and below the switch copy. A switch with `labelVisibility="hidden"` keeps the 44 control height even when it has a description. Stacked switch rows go in a `List` without a gap between them; the notification settings and search condition examples no longer add a Stack gap, so the row pitch is 56 instead of 84.

## 1.27.2

### Patch Changes

- 548ecba: Edge alignment from the 2026-10-17 measured audit. `IconButton` and `Button` gain `edge?: "start" | "end" | "both"` (logical, RTL-aware): a ghost control keeps its touch target but overhangs that container edge so its glyph slot or label sits on the inset — (visible diameter − glyph slot) / 2 for IconButton (`resolveIconButtonEdgeOverhang`, medium 10, follows `minimumVisualTarget`), the inline padding for Button (`resolveButtonEdgeOverhang`, + the 1px transparent border on Web); framed tones do not move. Applied to ScreenLayout/TopBar/SearchScreen `exit`, SavedItemsScreen create, ListDetailScreen refresh, MediaSelectionScreen add, UploadItem cancel/retry, InlineEdit, RepeatableFieldGroup and TableColumnSettings row-end tools, and SearchScreen sort / clear-all (glyph or label 26–31 → 16 from the edge). CommentThreadRow centres its like/actions/more targets on the author's first line (`commentThreadRecipe.actionAnchor`) and its trailing column overhangs so the last glyph slot ends on the row inset (Web 174 → 160 on a 162→160 author line, more 28 → 16); the Web `<time>` no longer inflates that line. Native UploadItem draws its close/refresh glyphs instead of font "×"/"↻", which sat ~5pt below centre.
- 08e0253: ListRow text now sits on its container's content edge (the 16 screen gutter on a default screen) and only the row surface — pressed/hover/selected fill, focus ring, hit area — bleeds outward by `listRowRecipe.surfaceBleed` (= density `paddingHorizontal`, 8). Rows used to keep that 8 inside the content box, so row text started at 24 while section titles and result headers started at 16 (Native also added its transparent 1pt selection border: 25). `listRecipe.separators` are measured from the content edge (indented 52 → still at the text; full spans the row surface) and `listRecipe.grouped.paddingInline` keeps room for the bleed inside a grouped list's clip. Plain Web lists no longer clip. VirtualList viewports keep the bleed as padding and bleed by the same amount on both platforms. Web `trailingAction` now shares one frame/surface with the row like Native, and SearchScreen recent queries use `trailingAction` with an `edge="end"` IconButton on both platforms. Rows need a container with at least 8 of inline inset; put ListRow/NotificationItem in a `default` screen body, not `body-edge`.
- 548ecba: Alignment fixes from the 2026-10-17 measured audit. Web ListRow trailing content (chevrons, switches, text) now centers on the row instead of riding the text baseline 2–2.5px high. Notice icon, title first line and the inline Web action share one first-line anchor (line box, or the 36 small-button height when an action is present); the Native icon box follows the title's scaled line height. Web NavigationBar drops the extra brand inset so brand and end controls both sit at the bar padding (13/13). Timeline dot, label first line and timestamp center on the label's first line on Web and Native. `chatMessageRecipe.avatarSize` is now `avatarRecipe.sizes.small` (32, was 36, which no Web Avatar step could render).
- c053d95: Toast: align the tone badge (or media top), first text line and close glyph on one first-line anchor and make the inline insets symmetric. `toastRecipe.surface.padding` is now `{ block, inline }` (12/16), with new `toastRecipe.anchor.blockSize` (32) and `toastRecipe.close.blockOverhang`/`inlineOverhang` derived from the badge, touch target and glyph. Web and Native both consume these values; a single-line toast is 12 + 32 + 12 = 56 with every centre at 28 and the close glyph ending 16 from the card edge like the badge's start inset (also under RTL).

## 1.27.1

## 1.27.0

### Minor Changes

- 56ada36: Register `ImageChoiceGroup` in the component catalog (beta on both renderers) and add `screenHeaderRecipe`; Native `ScreenLayout` reads its header heights and padding from it instead of literals.
- de29daf: Route titles are always centered: remove `headerAlignment` from `ScreenLayout` (and screens built on it, `ListDetailScreen.detail`) and `centered` from `TopBar`; extra actions stay at the top-right. `screenHeaderRecipe.titleLevel` is removed (only `centeredTitleLevel`). `ScreenFlowAction.icon` renders header actions such as `ListDetailScreen` refresh as icon buttons so they do not squeeze the centered title.
- 6dcb898: Add opt-in dotted vertical drops for missing LineChart periods on Web and Native. Each observed edge of a gap drops straight to the plot floor at its own category position; the two sides never connect across missing seasons. Preserve null values, unfilled missing regions, and observed-only focus navigation without assigning zero or changing the domain.
- ab7bddb: Extend the measured chat and comment standard. The hold menu now shows the reaction strip (only when
  options exist), the message preview and an action card: the exact time, reply, product `menuActions` and a
  danger-tone `reportAction` last. `ChatMessage` gains `replyQuote` (an HJM-drawn "X에게 답장" quote whose tap
  opens the original) and `media` photos (`resolveChatMediaColumns`; photo-only messages drop the bubble), hides
  the author on own messages and draws a flat-topped tip. `ChatScreen` centers its header by default, takes an
  `avatar` and uses a 10pt timeline gutter. `MessageComposer` wraps the reply target and input in one card.
  Comments accept `reactions` (long press, action-only when no options), `reactionSummary` and optional
  `media`; the like count is a bare number under the heart.
- 5e505a6: Component review B: ReactionPicker `wrap` draws chip frames on both renderers; `bottomCtaRecipe.contentMaxWidth` (720) caps BottomCTA content and the OverviewScreen toolbar; Native evidence registers ImageChoiceGroup.
- 0ab0539: Component review C (inputs): Agreement and TransferList rows draw the Checkbox indicator (`selectionControlRecipe.indicatorBorderWidth`), Agreement items share the all-row inset (`agreementRecipe.itemLayout.paddingHorizontal`), TransferList move buttons stack with gap 8 and draw direction icons, Native TransferList matches the Web panel structure; DatePicker draws a calendar icon and icon clear/close buttons; Web PasswordField uses the `visibility`/`visibilityOff` icons; Sortable/TaskList rows fit on one line with icon move buttons; FieldGroup inline parts use `inline.minWidth` (128) on both renderers and split rows evenly on Native; NumberField value inset is `xxs`/`xs`; Calendar caps at `calendarRecipe.maxWidth` (360); Native Select/Combobox/NumberField use the control border, TagsInput tags get `tagsInputRecipe.tag.border`, Rating cells round and start-align the clear action, plain Statistic drops its inset.
- 9e39cc7: Component review D: `bottomNavigationRecipe.presentations.*.contentMaxWidth` (480 for `bar`) centers the bar items on both renderers; Native Steps take all colors from `stepsRecipe`; Native NavigationBar actions wrap in one row; Native connected SegmentedControl keeps one-line labels and scrolls sideways like Web; Native tab divider spans the full width.
- 3739d81: Component review E (data display): neutral and brand Badge/Tag plates draw `border.default` so they no longer vanish on the canvas; QRCode stacks and centers its fallback under the code (`qrCodeRecipe.fallbackGap`); Carousel and CollectionRail previous/next are icon buttons on both renderers, and Native Carousel shows Web's position dots as one adjustable page control instead of a caption and numbered buttons; LineScore and MatrixTable highlight with `dataTableFamilyRecipe.highlight` (surface tint) instead of the canvas-white selected row, Web LineScore pins the team and total columns, and Native LineScore opens at the live/latest period; Native MatrixTable heat fills the cell like Web; ImageComparison frames take the image radius; Asset accessory sits outside the end/bottom corner on both renderers (RTL-safe); FolderPreview centers artwork, label and open mark. New: `Collapsible` `marker="none"` with `CollapsibleMarker`, Web `ClipboardIconButton`. Korean text wraps between words (Web `word-break: keep-all`, Native `lineBreakStrategyIOS="hangul-word"`).
- 148f258: Component review F: `resultRecipe.glyphs` gives Result the same default status mark on both renderers; Web `Progress` shows the percentage as default `valueText` (as documented and as Native already did); Native `GravityLetters` gains an optional `level`; ActivityChip fits its content on Web.
- 3aecab0: `MessageComposer` gains `quickInserts`: an evenly spread emoji row above the input that appends the emoji to
  the draft (Instagram comment sheet). The Web hold menu follows the measured look: 18px card radius with
  actions, 28px emoji in 48px targets, 56px touch rows and an optional `submenu` chevron.
- de37950: Design profiles: `OverviewScreen` lays its tools and collection out in one reading-width column (`overviewContentLayout`, replacing the unreleased `overviewToolbarLayout`), so card edges line up with the fields above them; the grid minimum column width is derived from that column so three columns still resolve. `resolveDesignProfileCollectionItem` gives both renderers the same item framing: rows are now unframed items divided by rule lines, cards/grid stay framed. The minimal, editorial and terminal presets are distinct: minimal uses achromatic hairlines with no shadows and framed cards, editorial uses a system serif display/reading stack with a larger heading scale and ruled rows, terminal uses monospace with square corners, a green-grey light canvas (the darkest on which the fixed accent inks stay readable) and a black console in dark mode. Native translates a generic serif stack to Georgia on iOS and `serif` elsewhere.
- e1d81cb: Native hold menu follows `holdMenuRecipe` measured from the Instagram DM hold menu: full-width 60pt
  reaction strip with 28pt emoji, the pressed bubble as its own preview on its side, and a 200pt action
  card with 56pt rows and optional `submenu` chevrons.
- 52f2c21: Add `ImageChoiceGroup` (image tile single/multiple selection) with `imageChoiceRecipe`; Native `Chip` forwards its ref; `ListDetailScreen` places screen actions beside refresh; register `KeyboardAvoidanceContext` in the public map.
- 5ca0cee: Add an optional inline DescriptionList layout with aligned labels, wrapping values and row separators for long read-only records. Preserve the existing stacked layout by default.
- 71f741d: Render `Text variant="label"` at medium (500) by default and draw `heading.level1`/`level2` bold (700) instead of heavy (800) on Web and Native (2026-10-17 user decision).

  - `typography.label.fontWeight` is now `"500"` and `heading.level1`/`level2` are `"700"`; `Top size="large"` titles follow `heading.level2`.
  - New `textRecipe.variantWeight` and `resolveTextDefaultWeight(variant, typography, designProfileActive)`: both renderers use it when `emphasis` is omitted, so label renders its token weight even without a design profile. Other variants keep `regular` outside a profile. Explicit `emphasis` still wins.
  - Web Text now places the default variant weight before caller `style`/`layoutStyle`, matching Native's style order (previously a profile weight overrode an explicit style weight).
  - The brutalist preset pins its level1/2 headings to 800 explicitly to keep its documented strong emphasis.
  - Native `fonts="pretendard"` draws these weights with the bundled `Pretendard-Medium` and `Pretendard-Bold` faces.

- 92723e8: Adopt the measured chat and comment standard. `ChatMessage` gains `groupPosition` (from the new
  `resolveChatMessageGroups`) so a run shows its author, avatar and tip once and its time once beside the last
  bubble; bubbles are filled, borderless and compact (`chatMessageRecipe`), and `bubbleTail` now defaults to
  `true`. `ChatScreen` gains an optional `jumpToLatest` control. Comment rows follow `commentThreadRecipe`:
  32/24 avatars, the like count under the heart, quiet text reply/expand actions and replies aligned with the
  parent text column. Timeline hosts should drop their own message gaps.
- ddfda06: Bundle Pretendard (SIL OFL 1.1) as the default UI face. Web: `import "@hjmds/react/fonts/pretendard.css"` (variable dynamic subset). Native: register `hjmPretendardFonts` from `@hjmds/react-native/fonts` (e.g. expo-font) and pass `fonts="pretendard"` to `HjmNativeProvider`; Text picks the face for its final weight. `fontFamily.ui` now starts with Pretendard Variable/Pretendard (Inter removed). `typography.heading` and `titleLarge` drop from 800 to 700.
- 71f741d: `ScreenLayout` gains `contentInset="body-edge"`: header, notice and footer keep the screen gutter while the body drops its
  inline padding, so full-width list rows (ConversationRow, NotificationRow) supply their own 16pt inset instead of stacking
  to ~32pt (review S5#9). `contentInset="none"` keeps its host-owns-all-insets meaning. Contracts export
  `ScreenContentInset`/`screenContentInsets`.

  `CommentThreadScreen` and `CommentThreadRow` gain `commentMenu` (`label(item)`, `items(item)`, `onAction(item, id)`; Native
  also `dismissLabel`): HJM renders the trailing vertical-dots IconButton in every comment row and opens the shared Menu with
  danger items last (`resolveCommentMenuItems`, `CommentMenuItemDescriptor`, `commentThreadRecipe.menuGlyphSize` in contracts).
  The `actions` slot is unchanged.

- b1d07e4: Add `exit` to `ScreenLayout` (and every screen built on it) and `TopBar`: leaving a screen is an icon-only back/close button fixed at the header's leading edge. `ListDetailScreen` detail back and `EditorScreen` cancel now render that icon instead of a text button; Native `ListDetailScreen` `detail.leading` is removed (use the built-in back). Add `actionGroupRecipe` (stacked buttons 8, inline 12) and use it for Sheet/Dialog footers. Web centered `ScreenLayout` header now sizes side columns by their controls with a title-size heading, matching Native.
- ed78e1c: Web/Native parity from the reference screen comparison: route titles use `Heading` at `screenHeaderRecipe.titleLevel` (start, level3) and `centeredTitleLevel` (centered, level5) on both renderers — Native previously drew regular-weight Text. `Switch` defaults to `presentation="row"` on Web as on Native (label first, track trailing); pass `inline` for compact toolbars. Native `Heading` gains `align`.
- b394f91: Bottom sheets close by dragging (2026-10-16 user decision). `swipeDismiss` now defaults to `true`; bottom
  sheets default to no backdrop dismissal (`resolveSheetDismissPolicy`) and no visible × (`showClose`,
  `resolveSheetCloseButton`). Web and Native draw the handle on every bottom sheet, follow the drag from the
  handle/header and close past `sheetDragRecipe` thresholds with reason `swipe`; the handle is also the
  accessible close control, and Escape/back stay. Flutter adds `showHjmBottomSheet` with the same defaults.
  `KeyboardAvoiding` pads only the real keyboard overlap, and the icon-mode `MessageComposer` reserves the send
  button so typing no longer resizes the field.
- 4004b6a: Web/Native parity from the reference screen comparison: Native Avatar uses `avatarRecipe` colors and size-stepped bold initials (`resolveAvatarInitialsTextVariant`); Native NotificationItem shows status·time as a muted caption; Native AuthScreenLayout hero centers its copy like Web; Native Top title no longer collapses inside a centered hero; Web ListRow title/description follow `listRowRecipe` (bodyLarge/body); Web ConversationRow keeps the space before its "·" separator.

### Patch Changes

- 55e3c79: Align design guidance with shared layout ownership, make source examples readable after npm installation, correct ActivityChip availability, and retire the fulfilled catalog freeze while preserving its history.
- ef1b418: Web Progress paints the brand fill on the sunken track (native `<progress>` appearance no longer falls back to UA green); UploadItem cancel/retry are ghost IconButtons on both renderers (unused `uploadItemRecipe.action` colors removed); showcase scenario labels and the Tabs roadmap summary are Korean.

## 1.26.1

### Patch Changes

- d5f01c2: Align static and actionable profile statistics in equal-width, vertically centered cells, preserving independent callbacks and disabled states.

## 1.26.0

### Minor Changes

- 1bae9c1: Share notification rows, profile summaries and icon tiles across product screens, add Native Pagination, preserve heading semantics and expose complete centered state announcements. Use platform-correct accessibility properties for Native charts rendered on Web.

## 1.25.0

### Minor Changes

- 13127b9: Expose TopBar titleContent for an independently interactive product control in the shared title slot, exclusive with text title affordances.

## 1.24.0

### Minor Changes

- e73ae51: Provide shared conversation rows and product composition slots for toolbar subtitles, branded loading artwork, centered screen content, transparent product canvases, and native scroll host events. Preserve product data, branding, and navigation while moving common layout and state behavior into HJM.

## 1.23.0

### Patch Changes

- 33855df: Expose CompositionLayout for shared composition regions and CommentThreadRow for virtualized comment lists. Add ScreenLayout titleBadge placement and reuse composition layout in profile screens. Align all screen/composition ownership guidance: HJM owns structure and presentation; products connect data and extensions.

## 1.22.0

### Patch Changes

- 4fa2a54: Allow ComparisonTable to hide duplicate side names while keeping accessible row identity; improve comparison row spacing and contrast.
- 4fa2a54: Add optional SearchScreen resultSummary.countVisibility for searches that show a list without a visual result total. Hidden totals preserve sorting, loading rows, empty states, and accessible announcements. Requested for Yajalal Expo search on 2026-10-14.

## 1.21.0

### Minor Changes

- fb292cc: Chart and DataTable absorption (2026-10-14 user request to absorb well-known chart and table libraries; Yajalal had rebuilt the same scrubbing line chart, bars and sortable stat table on its own).

  - Chart: new `@hjmds/design-contracts/components/chart` geometry contract (line/area/stacked area, grouped and stacked bars, pie/donut, radar, scatter, nice ticks, monotone curve, focus stepping, `describeChart` text alternative) and `LineChart`, `BarChart`, `PieChart`, `RadarChart`, `ScatterChart`, `Sparkline`, `ChartLegend` on Web (`@hjmds/react/chart`, SVG) and Native (`@hjmds/react-native/chart`, react-native-svg). Missing values draw as gaps, bars always include zero, `invert` puts the best rank on top, radar axes share one domain, pie ignores negative values, and series colors come from the product or the dataviz palette (never status colors). Line charts scrub by horizontal drag and step via arrow keys (Web slider) or adjustable increment/decrement (Native). This reverses the earlier tokens-only decision; dataviz token values are unchanged.
  - DataTable: new Native renderer `@hjmds/react-native/data-table` (pinned columns plus horizontal scroll, `onRowPress`/`selectedRowId`). Column options `sortDescFirst` and `pinned: "start"`, renderer `summaryRow` slot on Web and Native. `getNextDataTableSortState` takes an optional first direction (default ascending, unchanged behavior).
  - Sorting helpers in `@hjmds/design-contracts/components/data-table`: `dataTableFirstSortDirection`, `toDataTableSortValue`, `compareDataTableValues`, `sortDataTableRows` (stable, missing values last in both directions) and `splitPinnedDataTableColumns`. Renderers still never reorder rows.

- e8a0a15: Add controlled inline editing, repeatable field groups, scoped selection actions, search filter recovery and table column settings through collection-editing subpaths on Web and Native. Reuse existing FieldGroup and ActionSession behavior, retain drafts on failure and leave persistence and operation-specific undo with products.
- 4b1dbef: Add six controlled data-workflow compositions including CSV mapping with validated funnel/cohort/correlation/target/histogram calculations and matching Web/Native entrypoints.

  Add independent controlled PieChart category exclusion with real totals, recalculated percentages, stable colors and a total-aware center slot.

  Add SplitAction, AccountSwitcher, PasswordRulesField and PricingChoice compositions with controlled selections, actual async callbacks, failure recovery and product-owned password rules and billing contracts.

  Add MediaTransport with real engine-controlled play/pause/seek, matching Web/Native morphing controls, unknown-duration handling, pending request guards and failure recovery. Keep SVG frame updates outside React rendering.

  Add TransferTask and StreamingAnswer compositions driven by actual transfer observations, explicit stream completion, confirmed cancellation and retained partial output.

  Add BezierEditor, Web ShortcutRecorder, FollowProfileCard, EventAttendanceCard, ExpandableSearch, ReplyMessage/ReplyComposer and ToggleFeedbackButton with product-owned adapters, request guards and failure recovery.

  Add Button completion sizing, MessageComposer near-limit feedback, continuously observed Tabs pager position, BarChart geometry transitions and LineChart transitions/scrub emphasis. Preserve existing selection contracts and motion cancellation without React frame renders.

- 6603ac4: Add an opt-in compact Calendar size with 28px date indicators and unchanged 44px minimum date targets, for dense annotated calendars such as baseball schedules. Medium and large keep their existing appearance.

## 1.20.0

### Minor Changes

- 5ad946d: BottomNavigation: add `configuration.surface: "raised"` for tile selection. The bar uses the surfaceAlt role with a thick borderControl lower edge instead of the floating shadow, and the selected tile gets a darker lower edge over the brand fill. The default `flat` keeps the existing appearance. Requested by Spint for its wooden-sign tab bar (2026-10-13).

## 1.19.0

### Minor Changes

- fde269f: Complete layer guidance and recovery flows: add independent detail state/notice/retry slots to ListDetailScreen, keep empty-chat input, lock onboarding navigation during persistence, and center empty collections. Index comment replies and saved covers without repeated per-row scans, preserve virtual-list keyboard focus, and handle native reduced-motion snapshot races. Refresh token/component guidance and runnable composition/screen recovery examples.

  Audit runtime recovery paths: ignore superseded action outcomes even during synchronous completion subscribers, and restore list focus after a detail trigger is removed. Verify actual input-sheet and staged-drawer failure/retry flows on Web and Native hosts.

  Fix interaction lifecycle defects found by focused runtime audits: IME and readonly input guards, date reselection, picker/form cancellation, controlled overlay dismissal and nested Escape ownership, stable list focus, stale media/gesture callbacks, and toast/progress behavior.

  Preserve navigation context after collection deletion: recover VirtualList focus/viewport and reconcile uncontrolled Carousel selection, numbering and focus. Keep Native CounterBadge hook order stable across zero/nonzero values.

  Handle dynamic interaction changes: stop disabled or interrupted splitters, recover removed menu/tree/accordion selections and focus, close locked selects, isolate Avatar requests, cancel abandoned native photo choices, and keep message gestures owned by their initiating pointer.

  Complete focused lifecycle fixes: validate search counts before loading/nonempty shortcuts, restore authentication focus after pending, dismiss locked date pickers and preserve field focus, respect RTL menu navigation and dynamic disabled state, cancel abandoned long presses, and finish number transitions on hidden/unmount.

  Continue remaining runtime checks: preserve retryable pagination cursors and suppress retired footer callbacks, keep inline confirmations bound to the current action, recover dynamic tab focus, prevent stale native menu actions, and suspend optional avatar/statistic motion safely.

  Close additional public interaction gaps: reconcile removed consent/selection values, report only accepted agreement state, retain retryable transfer selections, preserve collection/pagination/collapse focus, guard IME color commits, repair skip-link and RTL tour behavior, and clean up partially started decoration animations.

  Keep native Dialog, AlertDialog, and Sheet accessibility visibility separate from their animation hosts so reopening an iOS modal preserves its controls in the accessibility tree. Clarify explicit return-focus wiring for externally controlled web modals and provide working edit/cancel/save and named-delete examples on both platforms.

  Keep native centered modal actions above docked keyboards using measured modal bounds, sharing Sheet's resize/floating-keyboard handling. Ignore locked or empty file-picker completions and evaluate native selections against current capacity and callbacks.

  Center document preview/export state messages with their respective actions. Keep local previews usable when native sharing is unavailable, and reset preview state when switching example documents.

  Prevent editor submission while its content is unavailable, retire discard prompts when leaving becomes locked, and require a fresh confirmation after a moderation action is withdrawn. Preserve web screen keyboard context when focused content is replaced.

  Preserve web media-selection keyboard context after accepted removals and reorders, including disabled boundary moves, without overriding intentional external focus.

  Keep Web Collapsible focus on its disclosure trigger after pointer dismissal so keyboard reopening also works in WebKit.

  Preserve Web InlineConfirm focus during pending and return the retiring confirmation group to its successful result without stealing intentional external focus.

  Remove the remaining Native deprecated visual style props and style merges (breaking). Keep canonical layoutStyle, platform/renderer slots, and general development diagnostics. Add semantic ListRow danger tone on both renderers and AlertDialog size; allow EmptyState illustrations to retain their intrinsic size. AlertDialog/Sheet contentStyle now accepts placement keys only. Published consumers must migrate and upgrade together; this changeset does not publish or update installed dependencies.

  Fill lower-level contracts used by larger compositions: add inline FieldGroup layout and reuse it in DateEntry/DurationField; centralize saved-draft feedback and search debounce policy; expose StatusText as Text's inline announcement companion; add Native ListRow loading parity and use shared row geometry in both SearchScreen renderers. Bind repeated touch targets to the existing control token.

  Include the approved shared changes: support floating BottomNavigation tile selection with equal widths and persistent labels, and use platform-owned accessibility focus for Expo web hosts. The photo-album-navigation and toast-card-press changesets describe the accompanying carousel, viewer, chat and toast behavior.

- fde269f: Add opt-in whole-card Toast activation with `press: { accessibilityLabel, onPress }` on Web and Native, including Liquid Toast. Keep action/close controls independent, support Web keyboard activation, and reuse the shared once-per-revision lifecycle with callback-then-dismiss ordering and the `press` dismiss reason. Pressable notices persist by default; existing descriptors keep their behavior. Consumers exhaustively handling ToastDismissReason must include `press`.

## 1.18.0

### Minor Changes

- 32eec30: Add opt-in inward timestamp reveal (incoming right, outgoing left) to ChatMessage and connected bubble tails across Web and Native. Measure bounded native composer text at its available width independently of the iOS editor viewport, growing before the maximum line cap enables scrolling.

  Support forward/backward content slides for paged grids, and keep segmented-control artwork and labels aligned horizontally.

- 8989fbd: Make the panel the Toast (2026-10-10 user request). Every Toast — Web, Native and the optional Native liquid card — now draws the panel: `xl` (24) corner, an optional decorative `media` (any ReactNode, 44 units, hidden from assistive technology) that replaces the tone badge, an optional step `progress` (`{ steps: readonly string[]; current: number }`, 2–5 non-empty steps; dots plus labels under the description, current step appended to the default announcement) and the action pill under the copy at the start edge (`toastRecipe.action.align` `"end"` → `"start"`). The liquid card drops its two-row banner/footer action for the same columns and its unprofiled settled corner becomes 24 (`liquidToastRecipe.radius`). `ToastProgressDescriptor` is exported; `ResolvedToastDescriptor` gains `media` (null when absent) and `progress`. Existing descriptors keep working; the visual change is the larger corner and the action position.

  Add `ActivityChip` (`/activity-chip` on contracts, `@hjmds/react` and `@hjmds/react-native`; contracts also re-export from the root): a 44-unit status pill with decorative `media`, a one-line `label`, `emphasis` (`default` | `emphasis`) and `expanded`, exposed as a disclosure button (`aria-expanded` / `accessibilityState.expanded`). It is a new name because `Chip` carries selection roles; it stays outside the frozen catalog (supplemental in the public API map). Add the `activity-status` composition guide and experimental Storybook items: pressing the chip opens a persistent panel Toast (stable id, `durationMs: null`, media + progress), pressing again closes it, and completion updates the chip and the panel in place.

- 8989fbd: Add accessible whole-card activation with selected and disabled feedback, retaining passive Card and actions-slot behavior.

### Patch Changes

- 8989fbd: Remove the selected outline from Button and IconButton in both renderers. Selection keeps its content color and accessibility state; keyboard focus remains separate. Native resolves an explicit null selected border without falling back to the secondary-tone border. No consumer prop migration is required.

## 1.17.2

### Patch Changes

- 692a733: Align settings-row Switch labels to the shared body typography role on Web and Native. Preserve inline typography, touch targets, descriptions and interaction contracts; no consumer API migration is required.

## 1.17.1

### Patch Changes

- ba7d815: Reduce SettingsScreen group headings to subordinate labels and remove redundant group rules. Retain heading semantics, row controls and screen scrolling on Web and Native. No consumer API migration is required.

## 1.17.0

### Minor Changes

- 56ce875: Add an optional CommentThreadScreen threadHeader slot to both renderers. Product introductions and filters scroll with comments instead of requiring a tall fixed header or nested scroll region. Existing callers remain unchanged.

## 1.16.2

## 1.16.1

### Patch Changes

- a3a01b6: Place CommentThreadScreen item actions beside the heart in one inline row on Web and Native.
  Comment previews use a vertical-ellipsis Menu trigger. The existing actions and likeAction APIs,
  product permissions, and independent action callbacks are preserved. Consumers that used actions
  for wide body content should move that content to body; this slot now owns trailing comment actions.

## 1.16.0

### Minor Changes

- 89d03ba: Add the granular `collection-rail` entry for finite, independently interactive multi-visible collections. The shared placement/scroll resolver handles measured widths, logical RTL navigation, finite ends and focus exposure; Web and Native keep every keyed item mounted and compose existing Card/Dialog detail actions.

  Use CollectionRail for finite horizontal collections, List for vertical rows, and Carousel for a single selected/inert panel. Product selection, drafts, server state and detail data remain product-owned. Existing imports/props are unchanged; no optional peer or root export is introduced. Rationale and usage are in `docs/collection-rail.md` and its usage guides. This addition remains experimental and outside the 1.15.0 publication snapshot.

- 0a7ddfc: Add optional display/reading font stacks to app-owned design profiles and a Text fontRole override. Heading and titled/body Text default to their family roles; ui/code-only profiles keep their current fonts. Font assets and native registration stay product-owned. This resolves the independent display/reading reference gap without changing text metrics, heading semantics, input state or adding a typography engine.
- 13d5525: Add a static ruled layer and validated ruledSpacing to EffectSurface. Paper profiles compose it with grain. Ruling stays in host units outside decorative motion, while existing input, focus, content and optional SVG-host failure contracts are preserved. Tape, rotation and torn boundaries are not supplied by this layer.

## 1.15.0

### Minor Changes

- ca12e8a: Add ten experimental reference design profiles with validated light/dark palettes, appearance tokens, interaction defaults and composition/screen choices. Products define partial overrides once and pass the normalized profile to their Web or Native provider; explicit component props and brand overrides retain precedence. Add optional OverviewScreen using existing screen/state/grid/disclosure engines, plus persistent inline/collapsible tools. Existing consumers without a profile keep their defaults. Real glass backdrop blur and clay inset shadows remain unsupported; see the design-profile contract and research/QA report for coverage.
- d465249: Add all five visual heading levels to optional design profiles. Both renderers consume the selected profile without changing semantic heading levels or text scaling. Partial typography overrides keep their existing level3–5 aliases; explicit heading metrics take precedence. Profiles inherit unchanged foundation sizes unless configured, and ordinary consumers without a profile retain the original scale.
- e6a9ab4: Add portable surface material settings to design profiles and apply real glass backdrop filtering and clay inset shadows to existing Surface/Card. Resolve readable semantic fill from the final product palette, retain opaque unsupported/reduced-transparency fallbacks, and preserve content state independently of decoration. Native products register an optional backdrop host and confirm inset capability once on HjmNativeProvider; no new mandatory peer or wrapper component is added. See docs/design-profile.md for host conditions and device-validation limits.
- 7c56dbc: Add plain sliding selection feedback to existing Tabs. Inherit the design profile's selectionMotion when appearance is omitted; explicit standard/slide/gooey wins and vertical tabs keep their canonical line. Preserve selection, keyboard activation and panel mounting, and continue interrupted motion from its current visible position. Default consumers without a profile keep standard appearance. No new controller or animation dependency; actual native geometry/performance remain to be verified.

### Patch Changes

- 21aeab3: Add separate composer placeholder, blur notification, linked validation copy, and opt-in IME-safe Enter sending. Local attachments can disable removal while preparation runs without locking text entry. Existing newline behavior and receipt-owned draft clearing remain the defaults.
- 1eb5583: Connect the optional Native liquid Toast's settled corner and raised shadow to the nearest design profile, keeping its circular origin, standard fallback and existing store/actions. Match RN content clipping to Skia geometry and reserve shadow paint bounds on all canvas edges, including negative offsets. Existing calls without a profile retain their recipe corner/depth. The geometry helper accepts an optional finite non-negative settled radius; Native rasterization, gestures and accessibility still require device validation.
- 3021ce0: Connect native editor, numeric, slider and code-header text hosts to the product UI font profile. Preserve drafts and neutral OS defaults, and apply controlled text scaling once in TagsInput. Document native font registration ownership and the reference review scope; no new public API or dependency.
- 1bb40eb: Connect existing native form, collection, navigation and optional gesture input presentation to inherited design-profile radius and typography roles. Preserve selection and drafts, grow large password frames from the same scaled metrics, and provide the profile code font on both renderers. Keep code syntax LTR inside RTL shells without altering its original text. No public component, mandatory peer or product-state API changes. See docs/design-profile.md and docs/code-block.md for semantic-role and native font ownership details.

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

### Minor Changes

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
