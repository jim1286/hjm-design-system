---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

`Skeleton` gains `buttonShape` (`rounded` | `pill`, default Button's default) for `shape="button"`: the corner comes from `buttonRecipe.shapes` and the theme radius, the same axis as Button `shape`, so pill-button products get pill placeholders. `skeletonRecipe.shapes.button.radius` now derives from the Button default shape (unchanged value `md`).
