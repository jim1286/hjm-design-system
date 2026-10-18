---
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add `scrollEnabled` (default `true`) to Dialog. `false` locks user scrolling while a gesture inside the body owns the pointer, such as dragging an item in a folder popup: Web keeps the card's offset with `overflow: hidden`, Native disables the body ScrollView.
