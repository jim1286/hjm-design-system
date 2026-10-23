---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

ChoiceRow passes ListRow `density` through and requires `errorLabel` only for async saves; a synchronous `onValueChange` closes the sheet without an unused error message.
