---
"@hjmds/react-native": patch
---

Keep centered header controls stable by applying measured side spacing only to the title, outside the controls' Yoga width constraints.

Measure intrinsic control rows inside equal, non-shrinking side columns. Keep controls in normal flow so their height contributes to the header, preventing title/badge wrapping from feeding back into control measurement and moving the screen body.
