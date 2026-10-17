---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

ScreenLayout with `contentInset="none"` no longer tells BottomCTA that the footer owns its bar, so BottomCTA keeps its own border, padding and surface there; the Web footer drops its top rule under `none`, as on Native.
