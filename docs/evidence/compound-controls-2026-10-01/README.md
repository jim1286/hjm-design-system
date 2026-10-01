# Compound control verification — 2026-10-01

The checks below record the initial implementation checkpoint. The [later Native integration audit](../native-visual-integration-2026-10-01/README.md) adds three-state device captures and selected interaction proofs, and supersedes the earlier unresolved overlay-budget/full-gate status. Native screen-reader and physical-device performance claims are not inferred from those captures.

Local working-tree evidence; not publication or consumer deployment.

- Contracts: duration and reactions, 2 tests passed.
- Web real-browser behavior: 3 tests passed, including async confirmation retry,
  deduplication, focus restoration, total duration clamp, controlled reactions,
  reduced-motion suppression and icon badge containment in a stretching layout.
- Native host-action tests: 3 passed, including reactions and background/reduced
  motion. This does not prove actual device rendering or screen-reader behavior.
- Web showcase: typecheck, 20 tests, token boundary passed.
- Native showcase: story generation, typecheck, 3 tests passed.
- Four Web stories rendered at 1100×800 and 390×844; no mobile horizontal overflow.
  Desktop browser capture reported no page errors. PNGs are alongside this file.
  Visual inspection caught the notification badge stretching across its parent;
  the component now keeps an intrinsic width and has a regression assertion.
- Public API map and Markdown links passed. Contracts import-graph budgets passed;
  all eight new renderer entries passed their measured graph budgets.
- Full renderer budget gate still fails on the existing Native `./overlays` gzip
  limit. Its limit was not raised for this change.
- Device Hub actual Native rendering, dark/RTL/large-text rendered captures and
  assistive-technology verification remain pending in the implementation ledger.

[Usage and ownership](../../../packages/design-contracts/docs/compound-controls.md)
