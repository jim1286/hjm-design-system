---
"@hjm/design-contracts": minor
"@hjm/react": minor
"@hjm/react-native": minor
---

Complete the v0.7 renderer expansion with first-party Result, Timeline, Layout,
Image, and Web BottomNavigation surfaces, plus framework navigation and
optimized-image adapters. Align Native input, selection, async collection,
display, feedback, action, layout, and navigation APIs with their canonical
recipes, including a product-ready TopBar action model.

Harden both providers with complete palette validation, safe reduced-motion
initialization, app-controlled values, uncapped typography, and exactly-once
Native text scaling. Add real nested-container measurement, safe-area and
keyboard-aware feedback placement, accessible announcement composition, and a
shared backward-compatible `Badge` `filled | outline` variant.

Make Native modal lifecycles own Android and iOS host teardown, focus return,
motion, and rapid reopen behavior. Prevent eager LoadMore requests while keeping
automatic viewport loading and an always-available manual fallback.

Allow controlled Web Dialog, AlertDialog, and Sheet surfaces to run without a
renderer-owned trigger. Keep only the topmost nested modal interactive, isolate
late-added background portals with `inert` and `aria-hidden`, and restore every
preexisting background value when the modal stack unwinds.

Promote only executable surfaces to beta, synchronize catalog, documentation,
showcase, default-render, and consumer evidence, and enforce family-level Web
and Metro import boundaries with measured bundle budgets. Keep the release
evidence workflow minimal while proving all three consumer surfaces against the
same canonical release.
