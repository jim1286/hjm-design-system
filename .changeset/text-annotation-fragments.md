---
"@hjmds/design-contracts": minor
---

Add mergeTextAnnotationFragments for measured runs on the same visual line.
This prevents overlapping marker washes at font-fallback boundaries while
preserving unselected gaps and distinct lines. A Native Skia diagnostic confirms
range geometry on Korean, emoji, and mixed-direction text, but is not a public
renderer or a replacement for native text selection.
