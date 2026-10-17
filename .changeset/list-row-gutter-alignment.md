---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

ListRow text now sits on its container's content edge (the 16 screen gutter on a default screen) and only the row surface — pressed/hover/selected fill, focus ring, hit area — bleeds outward by `listRowRecipe.surfaceBleed` (= density `paddingHorizontal`, 8). Rows used to keep that 8 inside the content box, so row text started at 24 while section titles and result headers started at 16 (Native also added its transparent 1pt selection border: 25). `listRecipe.separators` are measured from the content edge (indented 52 → still at the text; full spans the row surface) and `listRecipe.grouped.paddingInline` keeps room for the bleed inside a grouped list's clip. Plain Web lists no longer clip. VirtualList viewports keep the bleed as padding and bleed by the same amount on both platforms. Web `trailingAction` now shares one frame/surface with the row like Native, and SearchScreen recent queries use `trailingAction` with an `edge="end"` IconButton on both platforms. Rows need a container with at least 8 of inline inset; put ListRow/NotificationItem in a `default` screen body, not `body-edge`.
