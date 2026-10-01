# Scroll progress

Reviewed: 2026-10-01. Both renderers expose `ScrollProgress` through `/scroll-progress`.
This extension composes canonical Progress; it does not introduce another range,
accessibility or drawing implementation. Use plain Progress for task completion.

Pass `label`, `metrics: {offset, contentSize, viewportSize}` and normal Progress
presentation options. Metrics are logical forward distances in one consistent unit.
The shared resolver clamps bounce/overscroll into 0–1. An unmeasured viewport returns
0; content fitting a measured viewport returns 1. Negative sizes and nonfinite
numbers throw. Horizontal RTL hosts must normalize platform-specific offsets.

On Web use `const metrics = useScrollMetrics(host)` with the actual vertical
scrolling HTMLElement stored by a callback ref. No implicit window listener is
installed. Scroll events are batched per animation frame; ResizeObserver and DOM
changes update the content extent. The hook disconnects when the host changes.

On Native feed `onScroll` contentOffset.y, `onContentSizeChange` height, and
`onLayout` viewport height from the product's ScrollView. Keep the product's
existing callbacks and gesture handling. The renderer adds no scroll responder.
Both showcases contain `컴포넌트/피드백/Scroll Progress` with working scroll
content. Updates are continuous range values, not repeated live announcements.

Regression checks cover overscroll, unknown/fitting dimensions, actual browser
scroll/content resize and Native canonical Progress values. The [Native integration audit](../../../docs/evidence/native-visual-integration-2026-10-01/README.md)
records Default/Dark/LargeText initial-view captures on the existing iPhone 17 / iOS 27
simulator. The subsequent [component flow audit](../../../docs/evidence/component-flows-2026-10-01/README.md)
verifies real LargeText swipes from 0% to 100% and back to 87%, with captures and
accessibility snapshots. VoiceOver speech and physical-device performance remain unverified.
