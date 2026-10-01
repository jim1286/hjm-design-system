# Activity heatmap — 2026-10-01

The checks below record the initial implementation checkpoint. The [later Native integration audit](../native-visual-integration-2026-10-01/README.md) adds three-state device captures and selected interaction proofs, and supersedes the earlier unresolved overlay-budget/full-gate status. Native screen-reader and physical-device performance claims are not inferred from those captures.

Local Web browser capture: `mobile.png`, 390×844 viewport. Grid and list toggle
rendered without document horizontal overflow. The fixture contains 92 calendar
days; missing records remain distinct from zero. Inspection prompted smaller cell
corners so the grid reads as calendar data rather than round controls.

Contracts leap-date/validation test, Web accessible values/list test and Native
accessible-value host test passed. Both showcases passed typecheck and their
registration checks; Default/Dark/LargeText are registered under
Components/Display/Activity Heatmap. Actual Native rendering is not yet verified.
Build passed. New entry budgets pass; the full renderer check still reports the
pre-existing Native overlays gzip regression, not a new heatmap graph failure.
