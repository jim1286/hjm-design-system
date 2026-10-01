# Gravity Letters

Reviewed: 2026-10-01

Optional `@hjmds/react/gravity-letters` and `@hjmds/react-native/gravity-letters`
provide an independently authored promotional drop/rebound accent. This is not a
replacement for Text or ContentTransition: the whole effect is decorative and
hidden from accessibility APIs. Keep the meaningful static heading outside it.
The Web presentation inherits typography; Native uses canonical heading Text.

Pass `glyphs` as host-segmented graphemes/words (at most 32 nonempty single-line
strings). Never split emoji or complex scripts with UTF-16 `split("")`. Spaces
are preserved. The bound prevents a headline effect becoming paragraph-scale
animation work. `active` defaults to false; set true and change `replayKey` for an
explicit replay. No timer, physics dependency or pointer gesture is installed.

The contract owns the 36-point drop, small rebound, alternating tilt and 24ms
stagger. These are decorative geometry, not layout spacing tokens. The reserved
upper inset keeps the drop inside the component bounds. Web WAAPI and Native Core
Animated cancel on inactivity, reduced motion, backgrounding, replacement or
unmount; text rests at its final position. Foregrounding alone does not replay.

Both Storybooks: `컴포넌트 / Display / Gravity Letters`, with Default, Dark
and LargeText. Web glyph typography can be inherited from a surrounding heading
Text. Renderer behavior tests cover explicit replay and motion bypass; Native
mock tests do not prove actual device rendering.
