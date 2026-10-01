# EffectSurface host failure fallback

2026-10-02. Local implementation and evidence for integration plan §5.

The earlier pause checks did not cover an SVG host render failure or animation-start
exception. Both supported renderers now isolate those failures from product content.

- Web catches a rejected WAAPI creation and retains static SVG. The real Chromium
  390×844 Storybook run overrides SVG animation creation with NotSupportedError:
  `web-failed-animation.json` records six intercepted attempts as surfaces enter the
  viewport, four surviving content buttons, an operable motion toggle, and no page
  errors. `web-failed-animation.png` captures the static fallback.
- Native puts only the SVG/Animated decoration inside an error boundary, keeping
  product children outside. A host regression checks that a stateful button retains
  its count through a forced SVG render error and continues accepting presses.
- Native foreground callbacks separately catch animation creation failure because
  event callbacks are outside React error boundaries. The regression verifies one
  failed start, no repeated starts on repeated foreground events, and retained content.
- Invalid descriptors remain outside the boundary. Host rendering failure removes
  the decoration until remount; content stays on the existing semantic background.
  No new public API, dependency, catalog item or Storybook entry was added. Under the
  new approval policy this is an existing component fix, not a new experimental UI.
- Targeted tests: Native three, Chromium three. Three-package builds and unchanged
  renderer budgets pass; EffectSurface graphs are Web 22.1 kB raw/6.2 kB gzip and
  Native 10.4 kB raw/3.4 kB gzip. Native production Metro also passes unchanged caps.
- The existing iPhone 17 / iOS 27 development app was recaptured at Default/Dark/200%
  text after refactoring. PNG/AX pairs verify the normal initial viewport, not a
  forced native-host crash. Fault injection is proved by the renderer-host test.
  Device Hub's previously recorded timeout leaves idb/simctl as the current fallback;
  no device or native binary was created. The blue refresh banner remains visible.

Full `VITEST_MAX_WORKERS=2 pnpm ci:check` completed successfully after this change:
914 contract tests, 180 Web SSR tests, 978 browser tests, 925 Native tests,
12 Native showcase tests and 28 Web showcase tests. Static Storybook build verifies
103 canonical stories and 13 navigation pages. Renderer boundaries, Metro budgets,
API map, generated evidence and documentation checks also pass. This is local source
validation, not a package publication, product adoption or deployment.


## Moving-background label contrast follow-up

The small brand-colored layer labels failed the 4.5:1 normal-text target on the
light glow and combined surfaces (minimum sampled ratio 4.08:1). Both showcase
renderers now use their normal semantic text color for these labels; the effect
geometry, intensity and product API are unchanged.

`web-effect-contrast-before.json` and `web-effect-contrast.json` record Chromium
390px measurements for four surfaces × light/dark × four sampled animation phases
(0, 3, 6, 9 seconds). Each animation is paused at the sampled time, the label's
computed foreground is recorded for calculation, and the label alone is temporarily
hidden to sample its actual rendered background rectangle. The minimum pixel-wise
WCAG luminance ratio across that rectangle is reported. Final minima are 8.94:1
light and 11.13:1 dark. This samples those compositions and phases; it does not
promise contrast for arbitrary consumer colors or intensities.

Native Default/Dark/LargeText PNG/AX pairs were refreshed after the label change.
Both showcase checks pass (Native 12 tests; Web 28 tests plus token checks), as do
documentation links and diff whitespace checks. The full package gate above
predates this final showcase-only contrast correction; no package code changed.
