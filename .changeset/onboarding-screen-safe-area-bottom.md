---
"@hjmds/react-native": patch
---

Native `OnboardingScreen` accepts `safeAreaBottom` and forwards it to its ScreenLayout, so the next/back footer pads `max(16, inset)` without a product wrapper.
