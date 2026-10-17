---
"@hjmds/design-contracts": minor
"@hjmds/react": patch
"@hjmds/react-native": patch
---

SegmentedControl (`connected`) now has the same outer height as Button, IconButton and Chip of its size step: small 36, medium 44 (2026-10-17 user request "높이 맞춰" — the sort control and the saved-only chip in one row were 46 and 36 tall). `segmentedControlRecipe.sizes` gains `height` (outer height); `minHeight` stays the option height inside the track, now height − 2 × (padding + border) = 26 / 34, and `hitSlop` (9 / 5) extends options vertically only to the 44 target. Web draws the track inside a new `.hjm-segmented__scroller` that reaches past a small track by negative margin, so the options' hit area is not clipped by the horizontal scroll and the layout height does not grow; Native does the same with a wrapping View, a ScrollView with negative vertical margin, and an inner track View. Stacked large-text rows keep 44 options with no slop. Visual change: connected segmented controls are 10px shorter (track 46→36 small, 54→44 medium); `pills` and `text` presentations are unchanged.
