---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Add the field `align` axis.

A short, ceremonial single value — a nickname, a code — is centred in the
control, and consumers expressed that with `inputStyle={{ textAlign: "center" }}`
or a `text-align` override. `align` (`start` | `center`) makes it a recipe axis;
`start` keeps following the resolved direction, so RTL is unaffected.
