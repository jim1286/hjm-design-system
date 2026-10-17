---
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Remove the free `leading` slot from `ScreenLayout` and every screen built on it; the header's leading edge is only the icon `exit`. Every product use was a hand-made back button. `SavedItemsScreen` renders its collection back as the `exit` icon. Migrate `leading={<Back… />}` to `exit={{ kind: "back", label, onClick | onPress }}`. `TopBar` keeps `leading` for non-exit content such as a brand link.
