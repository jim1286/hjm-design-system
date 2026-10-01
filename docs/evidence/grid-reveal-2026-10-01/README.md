# GridReveal — 2026-10-01

The checks below record the initial implementation checkpoint. The [later Native integration audit](../native-visual-integration-2026-10-01/README.md) adds three-state device captures and selected interaction proofs, and supersedes the earlier unresolved overlay-budget/full-gate status. Native screen-reader and physical-device performance claims are not inferred from those captures.

Both Storybooks: Components/Display/Grid Reveal, Default/Dark/LargeText. The PNG fixture is an original procedural landscape painted locally with Canvas; no external image was incorporated.

[Browser results](browser.json) cover actual image load, invalid-image fallback, retry to a valid image and settled mask at 390 × 844 in three states. Browser regression verifies 16 one-shot masks only when ready, unchanged image accessible name, noninteractive overlay and cancellation for reduced motion/inactive host. Native mocked renderer verifies bounded timing calls and reduced-motion/inactive bypass with hidden decorative layers. Actual Native rendering remains unverified.

Both showcases, contract/renderer budgets, public map and build passed. New optional entries do not add a motion peer or replace Image semantics. Native uses Core Animated and host AppState; Web uses WAAPI/document visibility. The host must pass active=false when a mounted screen becomes hidden.
