# Task list — 2026-10-01

The checks below record the initial implementation checkpoint. The [later Native integration audit](../native-visual-integration-2026-10-01/README.md) adds three-state device captures and selected interaction proofs, and supersedes the earlier unresolved overlay-budget/full-gate status. Native screen-reader and physical-device performance claims are not inferred from those captures.

Web at 390×844: checked `첫 화면 그려보기`, moved it up with the accessible move
button, verified its stable ID became the first row and its checked value remained
true. No horizontal overflow. `mobile-reordered.png` captures that result.

Web checkbox and Native controlled-intent tests passed. Both showcase checks,
package build, API map and documentation links passed. New TaskList import graphs
pass; existing Native overlays gzip failure remains. Actual Native drag/focus and
screen-reader validation have not been completed. The optional drag engine is
composed by the showcase; TaskList itself only imports canonical control modules.
