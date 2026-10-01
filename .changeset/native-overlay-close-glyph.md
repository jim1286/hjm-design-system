---
"@hjmds/react-native": patch
---

Keep Dialog and Sheet close glyphs at icon size when text is enlarged. At 200% controlled text scaling, the typographic × was clipped inside IconButton's fixed icon frame. Titles/body continue to scale and close action semantics and touch targets are unchanged.
