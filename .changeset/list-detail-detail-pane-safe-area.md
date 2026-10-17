---
"@hjmds/react-native": patch
---

Native `ListDetailScreen` passes `safeAreaBottom` to the detail pane as well as the list pane; detail content no longer sits under the home indicator. Every native screen composition that renders a ScreenLayout now forwards `safeAreaBottom` (usage: screen-layout.md).
