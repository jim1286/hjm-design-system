---
"@hjmds/design-contracts": minor
"@hjmds/react-native": patch
---

Expose contentTransitionMotion geometry on the existing content-transition contract entry, preserving current distances and scale. Native ContentTransition now uses the shared entrance easing and settles an interrupted transition when direction or preset changes. Existing props/imports remain compatible; no new engine, dependency, or automatic consumer adoption is introduced. See docs/expo-interactions.md for Expo support boundaries and the opt-in recovery example.
