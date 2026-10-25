---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Native `SheetPanel` takes `safeAreaBottom`: the space at its bottom edge that something else covers, such as a raised bottom-navigation item. The surface still reaches the edge; the body padding and the folded visible height grow by that amount so content and the handle stay uncovered.
