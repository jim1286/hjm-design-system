---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

MessageComposer now announces `error` assertively when it appears: Web through an always-mounted alert region and iOS through `announceForAccessibility` (Android already used the field message's assertive live region), matching FieldGroup errors.
