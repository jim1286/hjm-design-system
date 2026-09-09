---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Give `IconButton` the same `selected` toggle treatment `Button` has.

`aria-pressed` / `accessibilityState.selected` already carried the state on an
icon toggle — a sound switch, a notification bell — but without a paired visual
every consumer painted the pressed state in product styles.
`iconButtonRecipe.states.selected` mirrors `buttonRecipe.states.selected`, and
`resolveIconButtonPresentation` takes the state as its third argument.
