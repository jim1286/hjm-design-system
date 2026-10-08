---
"@hjmds/react-native": patch
---

Restore the floating BottomNavigation top border to the existing all-edge recipe.
React Native's explicit borderTopWidth=0 overrode borderWidth=1, leaving the top edge
missing unless a consumer supplied deprecated surfaceStyle. Bar and capsule geometry,
router activation, center actions, safe-area padding and keyboard behavior are preserved.
Consumers may remove that compatibility override after installing the corrected published train.
