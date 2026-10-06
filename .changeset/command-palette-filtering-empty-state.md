---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
---

CommandPalette now implements the filtering, empty-state, and section-naming behaviour its contract already declared.

- Web `CommandPalette` filters `source` by `query` locally by default (case-insensitive substring over `label` and `textValue`, the same rule as the Native Combobox). Pass `queryState={{ filtering: "external", asyncState, queryValue, resultQuery }}` to show product-filtered results verbatim; stale external results (`queryValue !== resultQuery`) stay visible but cannot be activated. Sections emptied by filtering are dropped.
- `CommandPaletteDescriptor` gains optional `emptyMessage` (announced once for the whole list when no result is visible; an `asyncState` message still wins) and optional `closeLabel` (renders a close button that dismisses with `"close-action"`). Both are validated as non-empty when present.
- Section groups are named by `accessibilityLabel ?? label`.

Migration: products that already filter with a substring rule need no change. Products that pass fuzzy, ranked, or server results without `filtering: "external"` must add it, otherwise the renderer narrows those results again. To show empty copy, move it from an ad-hoc `asyncState: { status: "empty" }` to `descriptor.emptyMessage` (the old route still works).

The active row now resets only when the query changes. Previously a parent re-render that
passed `source`/`queryState` as inline objects snapped the active row back to the first item,
so arrow keys and pointer hover could not move it.
