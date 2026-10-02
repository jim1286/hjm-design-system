---
"@hjmds/react-native": patch
---

Floor Native Grid cell widths to a device pixel. Exact fractional widths plus gaps could exceed the row by under a pixel on Android (411dp at 420dpi), so flexWrap moved the last column to a new row (4 columns rendered as 3, 2 as 1). The shared layout contract is unchanged.
