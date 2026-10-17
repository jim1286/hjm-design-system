---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

List `indented` separators follow the text column of the row above them instead of a fixed 52 start: 52 (leading 40 + gap 12) after a ListRow with a leading element, 0 after one without, ending on the row's trailing content edge (0) instead of bleeding −8. `listRecipe.separators` gains `leadingInsetStart`; ListRow exposes its leading presence (Web root `data-leading`, Native List item context). `full` is unchanged.
