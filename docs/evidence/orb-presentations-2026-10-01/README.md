# ThinkingOrb presentations — 2026-10-01

Web Storybook, Chromium, 390 × 844, reduced motion enabled: Default/Dark/LargeText/Fluid/Matrix each rendered one canvas and the localized status label. [Results](browser.json), [fluid](fluid.png), [matrix](matrix.png).

Shared geometry checks passed: deterministic output, finite bounded coordinates at both sizes and several times, distinct animated frames, unchanged default state geometry and upstream golden fixtures (77 checks total). Existing Web lifecycle tests (3) and Native mocked renderer/lifecycle tests (7) passed. Native actual Skia rendering of the new appearances remains unverified; Device Hub timed out. No publication or product update performed.

The new forms use independently authored bounded dot geometry rather than reference-site source or a shader engine. The existing clock, theme, accessibility and suspension logic own both presentations.

Native follow-up: both Fluid and Matrix now have centered, unobstructed captures from the existing iPhone 17 / iOS 27 development simulator (`ThinkingOrb-Fluid.png` and `ThinkingOrb-Matrix.png` in the [Native evidence](../native-visual-integration-2026-10-01/README.md)). This proves Skia rendering of both appearances, not physical-device GPU budgets.
