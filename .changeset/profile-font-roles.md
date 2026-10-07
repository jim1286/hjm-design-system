---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add optional display/reading font stacks to app-owned design profiles and a Text fontRole override. Heading and titled/body Text default to their family roles; ui/code-only profiles keep their current fonts. Font assets and native registration stay product-owned. This resolves the independent display/reading reference gap without changing text metrics, heading semantics, input state or adding a typography engine.
