---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

BottomNavigation's covered height has one owner: ScreenLayout's last region (footer, else body), including `scroll="content"` screens and screens composed on ScreenLayout. The 1.31.0 usage guide told `scroll="content"` screens to add `useBottomNavigationInset()` to their list, which doubled the space; the guide is corrected and both renderers now have a test that the inset is applied exactly once. Rendering is unchanged.
