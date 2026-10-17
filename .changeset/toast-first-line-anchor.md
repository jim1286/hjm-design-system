---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Toast: align the tone badge (or media top), first text line and close glyph on one first-line anchor and make the inline insets symmetric. `toastRecipe.surface.padding` is now `{ block, inline }` (12/16), with new `toastRecipe.anchor.blockSize` (32) and `toastRecipe.close.blockOverhang`/`inlineOverhang` derived from the badge, touch target and glyph. Web and Native both consume these values; a single-line toast is 12 + 32 + 12 = 56 with every centre at 28 and the close glyph ending 16 from the card edge like the badge's start inset (also under RTL).
