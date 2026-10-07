---
"@hjmds/design-contracts": minor
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Add all five visual heading levels to optional design profiles. Both renderers consume the selected profile without changing semantic heading levels or text scaling. Partial typography overrides keep their existing level3–5 aliases; explicit heading metrics take precedence. Profiles inherit unchanged foundation sizes unless configured, and ordinary consumers without a profile retain the original scale.
