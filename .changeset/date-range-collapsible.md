---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add DateRangePicker `collapsible` on Web and Native. The summary becomes a toggle button for the grid while presets stay visible; the grid starts folded and folds again after a preset or a completing date (`resolveDateRangeExpandedAfterSelection`). Add the `{ all: true }` preset length (the empty range) and the standard filter presets `dateRangeRecipe.presets.standard` (1 day, 1 week, 1 month, 3 months, all). Pickers without `collapsible` are unchanged.
