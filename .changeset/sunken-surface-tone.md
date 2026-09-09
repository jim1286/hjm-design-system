---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Make `sunken` a real Surface tone that paints `surfaceAlt`.

`semanticColors.surface.sunken` already named this role, but no Surface tone
exposed it, so a consumer that wanted a recessed panel painted `surfaceAlt` in
its own product styles. Worse, the React Native renderer carried `sunken` as a
legacy alias for `subtle` — that is, for `bg`, the opposite direction from the
role its own semantic layer defines. No consumer in this workspace used the
alias, so the mapping is corrected rather than kept.

`brand` remains a deprecated native alias for `accent`.
