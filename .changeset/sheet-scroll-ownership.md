---
"@hjmds/design-contracts": patch
"@hjmds/react-native": patch
---

Keep nested list scrolling separate from Sheet dismissal. Connect Select, Combobox, ScreenLayout and SearchScreen to the Sheet scroll owner, expose SheetScrollView for custom and virtualized lists, protect time-input wheels, and retain the activating movement when React Native grants the responder. A gesture starting mid-list remains a list scroll after reaching the top.
