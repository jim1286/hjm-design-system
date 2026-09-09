---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Replace the product style overrides that blocked consumer legacy-style migration with semantic axes.

Auditing what consuming apps actually put in a legacy `style` prop showed five
recurring overrides of recipe-owned values and five components that offered no
`layoutStyle` at all, so placement had no legal expression.

- `Button`: `shape` (`rounded` | `pill`) and `align` (`center` | `leading`)
- `ListRow`: `leadingShape` binds `listRowRecipe.leadingSize`, which was
  declared but never rendered — every consumer rebuilt the avatar frame itself
- `HjmProvider` (web): `host` (`surface` | `contents`) for a nested provider
  inside a product that already paints its own root
- `layoutStyle` on `Chip`, `ListRow`, `Image`, `LoadMore` (native) and
  `DescriptionList` (web); their root `style` is now marked deprecated, and the
  layout-only slot styles narrow to `HjmCompositionStyleProp`
