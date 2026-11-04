---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Table columns centre their header and cells by default (`dataTableColumnDefaults.align` is now `center`) for DataTable on Web and Native and for the Web Table. Record tables hold mostly short counts under headers of very different length, so end-aligned numbers looked scattered. `align` is kept for compatibility. Native non-text cells now follow the resolved column alignment instead of falling back to start when `align` is unset.
