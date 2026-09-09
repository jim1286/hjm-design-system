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

- `Button`: `selected` paints the toggle treatment that `accessibilityState` /
  `aria-pressed` already claimed, and the `link` tone drops the size axis'
  horizontal padding so it aligns with the copy around it
- `borderControl` joins `ThemeColors` as the resting outline of an interactive
  control, exposed as `semanticColors.border.control`. The secondary Button and
  IconButton tones drew that outline in `textSub`, a text color, which is the
  same mistake `chipRecipe` already documents; a product that needs a stronger
  control boundary than its surface hairline can now inject one semantic key
  through `brandPalette` instead of overriding `borderColor` per wrapper. The
  default value matches what the outline already resolved to in both themes.
- Web `ListRow` binds the same density recipe the native renderer does. It used
  a single hardcoded `min-block-size: 56px` and never distinguished a one-line
  from a two-line row, so `oneLineMinHeight` / `twoLineMinHeight` /
  `paddingHorizontal` / `paddingVertical` / `gap` and the `leadingShape` frame
  are now emitted as `--hjm-list-row-*` variables and read by the stylesheet.
- Web `Switch` binds `switchRecipe.sizes`. It had no `size` prop and the
  stylesheet carried 48/28/22/3px, which matched neither recipe size, so the
  axis was unbound on web and consumers re-implemented it with their own
  variables. Track and thumb geometry now read `--hjm-switch-*`.
- `surfaceRecipe` gains `clipsContent`. A child image spilled past the rounded
  corner in every consumer, which each fixed with `overflow: hidden` in product
  styles — including the discovery that an elevated tone must opt out because
  clipping cuts off its own shadow. Both renderers bind it.
