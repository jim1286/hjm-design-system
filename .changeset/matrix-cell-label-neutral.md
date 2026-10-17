---
"@hjmds/react-native": patch
---

MatrixTable cells no longer hard-code a Korean joining word in their accessible names: the default is language-neutral ("row, column: value") and `cellAccessibilityLabel` lets products phrase it.
