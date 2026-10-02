---
"@hjmds/design-contracts": major
"@hjmds/react": major
"@hjmds/react-native": major
---

Unify the Progress `max` default at 100 through `progressRecipe.defaults.max`. Native previously defaulted to 1, so the same `value={76}` rendered on Web but threw a RangeError on Native. Native callers that pass fractions without `max` must either pass percentages or set `max={1}`. Native UploadItem now converts its 0–1 descriptor progress like Web does. Shipped in the 2.0 fixed major; see packages/design-contracts/docs/migration-native-legacy-removal.md.
