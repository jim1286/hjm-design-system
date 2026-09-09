---
"@hjmds/design-contracts": patch
"@hjmds/react-native": patch
"@hjmds/react": patch
---

Add `maxVisibleLines` so a growing multiline field can be capped without a caller style.

Consumers were setting `inputStyle={{ maxHeight }}` on a composer, moving a
recipe-owned dimension into product code. The field recipe already owned
`multilineMinHeight`; this adds the matching upper bound expressed in visible lines,
resolved against the input's own line height and vertical padding. The default stays
unbounded, so existing behaviour is unchanged.
