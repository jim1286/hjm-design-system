# Gooey Navigation verification

The checks below record the initial implementation checkpoint. The [later Native integration audit](../native-visual-integration-2026-10-01/README.md) adds three-state device captures and selected interaction proofs, and supersedes the earlier unresolved overlay-budget/full-gate status. Native screen-reader and physical-device performance claims are not inferred from those captures.

2026-10-01, local source. Chromium 390 × 844, Default/Dark/LargeText.

- Selecting a tab starts one elastic indicator animation. After settling, RTL direction toggle and a second selection place the indicator within one pixel of the selected tab, with no document overflow. Screenshots captured and default rendering reviewed.
- Web new behavior plus existing keyboard tests: 3 passed; manual activation, disabled skip, selected panel and reduced-motion cancellation covered.
- Native new behavior plus existing accessibility-action test: 2 passed; measured layout, selection and reduced-motion bypass covered. Actual Native device rendering remains unverified.
- Shared recipe test validates forward/reverse bounds and invalid input.
- Build, Web showcase check (23 tests), Native showcase check (9 tests), renderer import-graph budgets passed.

The emitted navigation module grew by 2,513 raw / 674 gzip bytes on Web and 3,325 / 717 on Native compared with HEAD. Shared graph allowances apply only where navigation.js is imported. No new renderer-local import edge or motion peer was added. Contract helper: 720 raw / 439 gzip bytes.
