---
"@hjmds/react-native": patch
---

Give `BottomNavigation` destinations an activatable trait on iOS. React Native maps `accessibilityRole="tab"` to `UIAccessibilityTraitNone`, so items reached VoiceOver with no trait and never announced that they can be activated. `Tabs` already branched on `Platform.OS`; `BottomNavigation` now uses the same branch and keeps the ARIA `tab` role on web.
