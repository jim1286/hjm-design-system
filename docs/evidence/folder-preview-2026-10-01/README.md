# Folder preview — 2026-10-01

The checks below record the initial implementation checkpoint. The [later Native integration audit](../native-visual-integration-2026-10-01/README.md) adds three-state device captures and selected interaction proofs, and supersedes the earlier unresolved overlay-budget/full-gate status. Native screen-reader and physical-device performance claims are not inferred from those captures.

`mobile-open.png`: Web at 390×844 after activating the folder trigger. Expanded
state was true and document width did not overflow. Overlapping cards are decorative;
actual collection names are repeated in the expanded content.

Web expansion/unmount/inert regression and Native controlled/accessibility-boundary
regression passed. Build, both showcase checks, API map and document links passed.
Both new folder-preview import graphs pass. Full renderer budgets still report the
pre-existing Native overlays gzip failure. Native visual/motion verification remains
pending; the host-action test is not device-render evidence.
