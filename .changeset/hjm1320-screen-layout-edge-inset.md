---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

ScreenLayout `contentInset="body-bleed"` keeps the header, notice and footer gutters and removes every body padding, so a map or canvas meets the header, both screen edges and the footer. Without a footer the body, as the last region, still clears `safeAreaBottom` (Native) and an overlay BottomNavigation, without the gutter. Fix: with `body-edge` and `body-bleed` the shared loading/empty/error state group keeps the screen gutter (it has no inset of its own and put its copy against the screen edge); ready bodies are unchanged.
