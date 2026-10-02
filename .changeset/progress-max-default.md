---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Unify the Progress `max` default at 100 through `progressRecipe.defaults.max`. Native previously defaulted to 1, so the same `value={76}` rendered on Web but threw a RangeError on Native. Native callers that pass fractions without `max` must either pass percentages or set `max={1}`. Native UploadItem now converts its 0–1 descriptor progress like Web does. Like the 1.11.0 API removals, this ships in a minor because the user decided on 2026-10-02 to migrate every managed consumer together; see packages/design-contracts/docs/migration-native-legacy-removal.md.
