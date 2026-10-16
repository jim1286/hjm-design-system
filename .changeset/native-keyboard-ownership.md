---
"@hjmds/react-native": minor
---

Keyboard handling moves into the components (2026-10-16 keyboard audit): `ScreenLayout` gains
`keyboardAvoidance` (default on) that pads only the real overlap and scrolls the focused input into view,
`Sheet` now defaults `keyboardAvoidance` to `true`, and `KeyboardAvoidanceContext` lets nested layouts inside
KeyboardAvoiding or a keyboard-aware Sheet/Dialog skip duplicate padding. New hooks: `useKeyboardOverlap`,
`useScrollFocusedInputIntoView`.
