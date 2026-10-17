---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Bundle Pretendard (SIL OFL 1.1) as the default UI face. Web: `import "@hjmds/react/fonts/pretendard.css"` (variable dynamic subset). Native: register `hjmPretendardFonts` from `@hjmds/react-native/fonts` (e.g. expo-font) and pass `fonts="pretendard"` to `HjmNativeProvider`; Text picks the face for its final weight. `fontFamily.ui` now starts with Pretendard Variable/Pretendard (Inter removed). `typography.heading` and `titleLarge` drop from 800 to 700.
