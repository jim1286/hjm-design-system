---
"@hjmds/design-contracts": patch
"@hjmds/react-native": patch
"@hjmds/react": patch
---

Fill the contract gaps that blocked consumer migrations off the deprecated `style` prop.

`maxWidth`, `minWidth` and `flexWrap` join the composition key set. Width bounds and
wrapping decide how much room a component may take in the consumer's own layout, which
is placement rather than appearance; height stays out because the recipe owns vertical
rhythm. The web set also accepts `maxInlineSize` and `minInlineSize`.

`Section`'s `headerStyle`, `copyStyle`, `actionStyle` and `contentStyle` are narrowed to
the composition style type, so a consumer can place a slot without moving recipe-owned
appearance into it. `titleStyle` and `descriptionStyle` stay deprecated because
typography belongs to the recipe.

`Sheet` gains a `size` axis — `auto`, `medium`, `large`, `full` — exposing the
`maxHeightRatio` the recipe already owned. Consumers previously set sheet height through
`contentStyle`, which is now narrowed to placement only.
