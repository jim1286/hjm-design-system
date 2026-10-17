---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

`AuthScreenLayout` owns the bottom safe area like ScreenLayout. Native gains `safeAreaBottom` (default 0): the layout's bottom padding is `max(paddingBlock, safeAreaBottom)` (paddingBlock while the keyboard is open), never their sum, and the iOS-only automatic content inset adjustment is removed (it summed the home indicator onto paddingBlock on iOS while Android got nothing). The top safe area is host-owned, as for ScreenLayout. Web pads `max(paddingBlock, env(safe-area-inset-bottom))`. Migration: drop the bottom `SafeAreaView` / `paddingBottom: insets.bottom` wrapper and pass `safeAreaBottom={insets.bottom}`; a screen that relied on the iOS automatic top inset must inset its top in the host (TopBar `safeAreaTop` or SafeAreaView top).
