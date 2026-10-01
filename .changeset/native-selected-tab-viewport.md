---
"@hjmds/react-native": patch
---

Keep the selected horizontal scrollable Tab visible after selection, direction and
viewport changes. Use measured tab bounds for standard and gooey appearances;
fixes clipped selected labels in large-text RTL layouts without changing panel
or selection semantics. Fitted and non-scrollable lists retain their layout.
