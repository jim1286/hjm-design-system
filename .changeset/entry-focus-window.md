---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Entry focus covers fields that appear after entry (additive). New contracts rule `resolveEntryFocus` (`screen-patterns`, phases `entering` / `open` / `settled`) is shared by Web and Native. A scope that entered without focusing stays open until the user interacts with it (Native touch or scroll, Web pointer, key, wheel or touch while no modal is above): a field registering meanwhile (shown after data loads) gets the entry focus. After entry, a field marked `initialFocusTarget` that mounts is focused when it appears, in any `initialFocus` mode, unless another text field has focus or an overlay is above — a search field revealed by a tap, or each step's field in a multi-step `Sheet` / `EditorScreen`. Products drop `autoFocus` on revealed fields and manual step-change `ref.focus()`.
