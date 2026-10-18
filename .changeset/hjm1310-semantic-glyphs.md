---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Semantic icons add `arrowUp`, `arrowDown`, `rotate` and `unblock`, and their 24-unit paths move into the contract as `semanticIconPaths` (with `isSemanticIconName`). Web draws them built in; Native draws the same paths through the new optional `@hjmds/react-native/icon-svg` entry (`renderSemanticGlyph`, react-native-svg peer).
