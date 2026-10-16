---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Bottom sheets close by dragging (2026-10-16 user decision). `swipeDismiss` now defaults to `true`; bottom
sheets default to no backdrop dismissal (`resolveSheetDismissPolicy`) and no visible × (`showClose`,
`resolveSheetCloseButton`). Web and Native draw the handle on every bottom sheet, follow the drag from the
handle/header and close past `sheetDragRecipe` thresholds with reason `swipe`; the handle is also the
accessible close control, and Escape/back stay. Flutter adds `showHjmBottomSheet` with the same defaults.
`KeyboardAvoiding` pads only the real keyboard overlap, and the icon-mode `MessageComposer` reserves the send
button so typing no longer resizes the field.
