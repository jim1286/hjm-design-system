---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Add `minVisibleLines` to the multiline field, and bind the web field's multiline
minimum to the recipe.

`maxVisibleLines` already replaced `inputStyle={{ maxHeight }}`; a composer that
should open several lines tall was still reaching for `inputStyle={{ minHeight }}`.
The web renderer additionally carried `min-block-size: 80px` / `78px` in the
stylesheet — numbers that duplicated `fieldRecipe.multilineMinHeight` and
`paddingVertical` — and had neither bound axis. Both bounds are now expressed in
lines on both renderers, so line height and vertical padding stay recipe-owned.
