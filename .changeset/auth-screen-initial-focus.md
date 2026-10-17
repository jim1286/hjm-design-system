---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

`AuthScreenLayout` gains `initialFocus` (`"first-input" | "none"`, Web and Native) with the ScreenLayout entry-focus rules. The default stays `none` (`initialFocusDefaults.auth`) because auth screens lead with provider buttons; a signup nickname step opts in with `first-input`.
