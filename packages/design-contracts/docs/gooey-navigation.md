# Gooey navigation

Reviewed: 2026-10-01

Use the existing `Tabs` from `@hjmds/react/navigation` or
`@hjmds/react-native/navigation` with `appearance="gooey"`. The default remains
`standard`. A new navigation controller would duplicate existing selection,
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
optional animation dependency is introduced. Rapid re-selection targets the last
selected tab; this is deterministic selection feedback, not a physics simulation.

Both Storybooks expose `컴포넌트 / 탐색 / Gooey Navigation` with Default,
Dark and LargeText plus a direction toggle. Disabled tabs, existing activation
mode and panel associations remain canonical. The Native renderer is tested with
mock layout events; actual device appearance remains to be verified.

Native horizontal scrollable Tabs centers the selected measured tab within the scroll
content bounds when selection, direction or viewport width changes. This corrects a
LargeText RTL selected-label clipping issue found in the [device flow audit](../../../docs/evidence/component-flows-2026-10-01/README.md).
The standard appearance shares this behavior; fitted and non-scrollable lists do not
programmatically scroll. Selection semantics and the host's panel ownership are unchanged.
