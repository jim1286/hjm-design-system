---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

IconTile `icon` also accepts a function that receives `IconTileArtwork` (`{ edge }`: 64 for `size="fixed"`, the measured cell-clamped edge for `size="fill"`), so fixed-size image artwork sizes itself without the product re-computing the 48–68 clamp. Contracts add `resolveIconTileFillEdge(cellWidth)` for layout estimates made before a tile measures. A ReactNode `icon` renders as before.
