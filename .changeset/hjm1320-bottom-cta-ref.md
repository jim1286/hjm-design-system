---
"@hjmds/react": minor
"@hjmds/react-native": minor
---

BottomCTA actions accept `buttonRef` (Web `Ref<HTMLButtonElement>`, Native `Ref<View>`) pointing at that action's button, so a Dialog, Sheet or ImmersiveOverlay opened from the footer action can return focus to it through `returnFocusRef`. The component `ref` (Web) still names the bar.
