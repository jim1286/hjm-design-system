---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Extend TopBar and BottomCTA to React DOM using the existing Native recipes and
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

