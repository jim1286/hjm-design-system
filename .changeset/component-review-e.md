---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Component review E (data display): neutral and brand Badge/Tag plates draw `border.default` so they no longer vanish on the canvas; QRCode stacks and centers its fallback under the code (`qrCodeRecipe.fallbackGap`); Carousel and CollectionRail previous/next are icon buttons on both renderers, and Native Carousel shows Web's position dots as one adjustable page control instead of a caption and numbered buttons; LineScore and MatrixTable highlight with `dataTableFamilyRecipe.highlight` (surface tint) instead of the canvas-white selected row, Web LineScore pins the team and total columns, and Native LineScore opens at the live/latest period; Native MatrixTable heat fills the cell like Web; ImageComparison frames take the image radius; Asset accessory sits outside the end/bottom corner on both renderers (RTL-safe); FolderPreview centers artwork, label and open mark. New: `Collapsible` `marker="none"` with `CollapsibleMarker`, Web `ClipboardIconButton`. Korean text wraps between words (Web `word-break: keep-all`, Native `lineBreakStrategyIOS="hangul-word"`).
