---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Edge alignment from the 2026-10-17 measured audit. `IconButton` and `Button` gain `edge?: "start" | "end" | "both"` (logical, RTL-aware): a ghost control keeps its touch target but overhangs that container edge so its glyph slot or label sits on the inset — (visible diameter − glyph slot) / 2 for IconButton (`resolveIconButtonEdgeOverhang`, medium 10, follows `minimumVisualTarget`), the inline padding for Button (`resolveButtonEdgeOverhang`, + the 1px transparent border on Web); framed tones do not move. Applied to ScreenLayout/TopBar/SearchScreen `exit`, SavedItemsScreen create, ListDetailScreen refresh, MediaSelectionScreen add, UploadItem cancel/retry, InlineEdit, RepeatableFieldGroup and TableColumnSettings row-end tools, and SearchScreen sort / clear-all (glyph or label 26–31 → 16 from the edge). CommentThreadRow centres its like/actions/more targets on the author's first line (`commentThreadRecipe.actionAnchor`) and its trailing column overhangs so the last glyph slot ends on the row inset (Web 174 → 160 on a 162→160 author line, more 28 → 16); the Web `<time>` no longer inflates that line. Native UploadItem draws its close/refresh glyphs instead of font "×"/"↻", which sat ~5pt below centre.
