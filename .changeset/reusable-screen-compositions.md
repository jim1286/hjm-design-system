---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add opt-in screen-patterns/screens entries for shared settings, notification inbox and chat layouts, reusing the existing login layout and canonical primitives. Products retain routing, localized copy, data, permissions, persistence and keyboard adapters. Existing APIs are unchanged; no automatic consumer migration. Screen state replacement is distinct from refresh/save notices. See design-contracts/docs/screen-patterns.md for ownership and package export rationale.

Add comments/search/saved/profile composition examples, unshaded settings and activity rows, and content-sized message composers without a manual resize handle. Native explicitly bounded multiline inputs grow and shrink from the single-control minimum.

Add opt-in screen-flows entries for list/detail, draft editing, profile/account, moderation, media selection, debounced search, permission and onboarding flows, plus controlled comment threads. Media uses responsive thumbnail grids and separately localized action names; search keeps recent queries in the scrollable body. Products retain OS pickers, uploads, router guards, persistence and server operations.

Separate library selection from post-selection uploads with optional library and selectionSummary slots. Showcase uses a system-picker-style three-column grid with ordered selection and a fixed completion area; align search filter controls with their summary.

Add optional header submit placement and custom moderation reason picker slots while preserving existing defaults. Refine screen header sizing for compact screens and large text, and use a rounded chat composer with unshaded incoming bubbles. Refresh twelve Web/Native screen examples from documented product references.
