# Gooey navigation

Reviewed: 2026-10-07

Use the existing `Tabs` from `@hjmds/react/navigation` or
`@hjmds/react-native/navigation` with an explicit `appearance="standard"`, `"slide"` or `"gooey"`.
The unpublished follow-up after 1.14.0 inherits `designProfile.interactions.selectionMotion`
when appearance is omitted: `slide` selects a plain moving line and `none` selects
`standard`. Without a profile the default remains `standard`. Explicit appearance
wins over the profile. A new navigation controller would duplicate existing selection,
keyboard, disabled-item and panel contracts, so only the selected indicator is
extended. Vertical tabs deliberately retain the standard line: stretching a
horizontal bridge across a vertical list would obscure unrelated items.

`@hjmds/design-contracts/gooey-navigation` owns the measured source/destination
bridge. It expands to the union of their edges at 45% progress, then contracts to
the destination over 320ms. This independently authored elastic presentation
uses no copied effects, shader or physics engine. Six-point indicator height is
decorative geometry; colors and corner radius reuse tokens. Text and hit targets
never transform. On Web, selected-tab measurements and ResizeObserver track
font/viewport changes; Native uses tab onLayout measurements. Measured physical
coordinates also support RTL and horizontal scrolling.

Reduced motion, backgrounding and cleanup settle the indicator without changing
selection. Native width animation uses Core Animated's JS driver because width
cannot use the native transform driver without distorting corner radii. No new
optional animation dependency is introduced. Rapid re-selection captures the visible intermediate bounds before cancellation
and starts the next animation there, while selection targets the last chosen tab.
This is deterministic selection feedback, not a physics simulation.

Both Storybooks expose `배포/컴포넌트/탐색/선택 표시가 이어지는 탭` with Default,
Dark and LargeText plus a direction toggle. Disabled tabs, existing activation
mode and panel associations remain canonical. The Native renderer is tested with
mock layout events; actual device appearance remains to be verified.

Native horizontal scrollable Tabs centers the selected measured tab within the scroll
content bounds when selection, direction or viewport width changes. This corrects a
LargeText RTL selected-label clipping issue found in the [device flow audit](../../../docs/evidence/component-flows-2026-10-01/README.md).
The standard appearance shares this behavior; fitted and non-scrollable lists do not
programmatically scroll. Selection semantics and the host's panel ownership are unchanged.

## Plain sliding and profile inheritance (unpublished after 1.14.0)

The Aceternity [comparison](../../../docs/plans/aceternity-interaction-adoption-2026-10-07.md)
found that profile sliding reached SegmentedControl but not Tabs. The existing
Tabs renderer now resolves the appearance through `resolveTabsAppearance`;
selection, keyboard, disabled items and panel mounting keep their existing owner.
It does not recreate stacked panels or shared-element content transitions.

`resolveTabIndicator` uses the shared `motion.normal` (200ms) and
`easing.standard` for plain sliding: source and destination x/width interpolate
without the elastic union bridge. Plain/standard indicators keep the existing
2-point height; explicit gooey keeps its 6-point decorative geometry, 320ms bridge
and established platform easing. Vertical orientation always resolves to standard.

Web tracks list and tab measurements, including fitted RTL width changes, and
samples running or paused WAAPI frames before cancellation. Native tracks its
JS-driver frame in a ref through an Animated listener, removed on cleanup. This
adds no animation dependency or per-frame React render. Background/reduced motion
settles the indicator at the selected tab.

`실험/구성/비교와 검증/테마 조합` compares inherited, standard, slide and gooey
through the public Tabs API with visited panel mounting. Changing a theme does
not choose a different panel lifetime: products still own controlled drafts or
`mountPolicy`. The [QA record](../../../docs/qa/2026-10-07-design-profile-research.md)
separates actual Chromium checks from Native mock-host tests; Native device
appearance/performance and experiment promotion remain pending.
