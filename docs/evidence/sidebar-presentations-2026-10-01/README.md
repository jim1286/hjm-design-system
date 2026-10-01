# Sidebar presentations — 2026-10-01

Web-only by the existing Sidebar contract. Components/Navigation/Sidebar offers Default/Dark/LargeText and standard/bounce/hook/proximity controls. Existing shell composition remains under Patterns/Sidebar.

[Browser evidence](browser.json): 390 × 844, proximity hover leaves link bounding rectangles unchanged, selection updates current destination, hook presentation renders and collapse retains the accessible names. Three variants have no horizontal overflow.

Eight browser regressions passed across Sidebar, presentation and existing P1C tests: keyboard/collapse/long-copy semantics, current link, bounded icon proximity, provider reduced motion and hook decoration. Web showcase, complete renderer budgets, API map and doc links passed. The Sidebar emitted module grew 1476 raw / 496 gzip bytes; provider access adds two graph modules to honor reduced-motion overrides. Explicit measured allowances and CSS budgets were updated without adding a motion dependency. No Native Sidebar support is claimed or added.
