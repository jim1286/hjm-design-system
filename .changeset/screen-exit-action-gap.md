---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add `exit` to `ScreenLayout` (and every screen built on it) and `TopBar`: leaving a screen is an icon-only back/close button fixed at the header's leading edge. `ListDetailScreen` detail back and `EditorScreen` cancel now render that icon instead of a text button; Native `ListDetailScreen` `detail.leading` is removed (use the built-in back). Add `actionGroupRecipe` (stacked buttons 8, inline 12) and use it for Sheet/Dialog footers. Web centered `ScreenLayout` header now sizes side columns by their controls with a title-size heading, matching Native.
