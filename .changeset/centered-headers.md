---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Route titles are always centered: remove `headerAlignment` from `ScreenLayout` (and screens built on it, `ListDetailScreen.detail`) and `centered` from `TopBar`; extra actions stay at the top-right. `screenHeaderRecipe.titleLevel` is removed (only `centeredTitleLevel`). `ScreenFlowAction.icon` renders header actions such as `ListDetailScreen` refresh as icon buttons so they do not squeeze the centered title.
