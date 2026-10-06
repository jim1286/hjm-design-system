---
"@hjmds/react-native": patch
---

Resize single-line TextField and SearchField frames for their effective text scale so large OS
text stays inside the input. Restore the ordinary height when scale returns to normal, preserving
explicit Provider and native input scaling options. No public API or migration changes.
