---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Composer fixes from the composition review: the reply card no longer remounts the input when a reply ends
(focus stays in the field), and the send slot reserves the button diameter instead of rendering a hidden
duplicate send button. Native `Combobox` results rise above the keyboard.
