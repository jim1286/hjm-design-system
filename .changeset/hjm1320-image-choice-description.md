---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

ImageChoiceGroup gains three additive options (web + native): an item `description` (one muted caption line under the name, read once as the tile's description — `aria-describedby` / `accessibilityHint`), `itemLabelLines` 1 | 2 for word-keeping two-line names, and `virtualized={{ height, overscan? }}` for long lists, where the group scrolls itself and mounts only rows near the viewport (Web windows rows with the VirtualList `resolveVirtualWindow` math, Native uses a FlatList of fixed-height rows; both keep the radiogroup/group semantics). Every tile in a group reserves the same caption block so rows stay even. Contracts add `resolveImageChoiceCaptionLines`, `resolveImageChoiceTileHeight`, `resolveImageChoiceColumns`, `resolveImageChoiceOuterSize`, `validateImageChoiceItemLabelLines` and recipe keys `itemLabelMaxLines`, `itemDescription*`, `virtualViewportInset`; blank descriptions throw. Defaults are unchanged (Web wraps a visible item label in a `hjm-image-choice__caption` span of the same height).
