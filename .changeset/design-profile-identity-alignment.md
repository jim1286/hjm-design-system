---
"@hjmds/design-contracts": minor
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Design profiles: `OverviewScreen` lays its tools and collection out in one reading-width column (`overviewContentLayout`, replacing the unreleased `overviewToolbarLayout`), so card edges line up with the fields above them; the grid minimum column width is derived from that column so three columns still resolve. `resolveDesignProfileCollectionItem` gives both renderers the same item framing: rows are now unframed items divided by rule lines, cards/grid stay framed. The minimal, editorial and terminal presets are distinct: minimal uses achromatic hairlines with no shadows and framed cards, editorial uses a system serif display/reading stack with a larger heading scale and ruled rows, terminal uses monospace with square corners, a green-grey light canvas (the darkest on which the fixed accent inks stay readable) and a black console in dark mode. Native translates a generic serif stack to Georgia on iOS and `serif` elsewhere.
