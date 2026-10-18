---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

BottomNavigation reports the height it covers through `BottomNavigationInsetProvider` / `useBottomNavigationInset` (Web's fixed bar always, Native with the new `placement="overlay"`), and ScreenLayout pads its last region by it; items accept `prominent` for a selectable raised center destination, and `configuration.iconSize` (`large` 44, `xlarge` 52) enlarges the icon slot for app-icon artwork.
