---
"@hjmds/react-native": patch
---

Apply the provider's controlled text scale to CodeBlock's header and selectable
source, reusing the existing Native typography helper. Colored token spans inherit
once, while system font scaling and exact-source clipboard selection remain intact.
