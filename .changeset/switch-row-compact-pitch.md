---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

A Switch row with a visible description is compact on Web and Native (2026-10-17 user report, notification settings "간격이 커"). `switchRecipe.rowPaddingVertical` (8, the comfortable list-row padding) is drawn above and below the copy and `switchRecipe.rowTwoLineMinHeight` is now 56 (body 20 + 4 + caption 16 + 8 × 2) instead of borrowing ListRow's 68, which is sized for a larger title and left 14 above and below the switch copy. A switch with `labelVisibility="hidden"` keeps the 44 control height even when it has a description. Stacked switch rows go in a `List` without a gap between them; the notification settings and search condition examples no longer add a Stack gap, so the row pitch is 56 instead of 84.
