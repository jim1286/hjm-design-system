---
"@hjmds/design-contracts": patch
"@hjmds/react-native": patch
"@hjmds/react": patch
---

Open the two entry points consumers were missing.

`layoutStyle` reaches the component roots apps place directly. React Native gains
it on `Stack`, `Text`, `Container`, `Section`, `Card`, `Tag`, `Switch` and
`IconButton`; the web renderer gains the composition-style contract itself plus
`Stack`, `Surface`, `Container`, `Grid`, `Text`, `Badge`, `Tag`, `Button`,
`IconButton`, `CounterBadge`, `Switch` and `ListRow`. Placement is applied after
the deprecated `style`, so layout wins. The allowed key set is unchanged, and the
web set uses CSS logical properties so placement keeps its meaning under RTL.

`resolveDesignSystemProviderValue` accepts a `brandPalette` that layers product
colors over the semantic keys. The key set is untouched, so recipes and contrast
rules keep applying. Without it a consumer had to build its own token layer and
override the CSS variables, which duplicates the canonical palette.

Both additions are additive: existing consumers keep working unchanged.
