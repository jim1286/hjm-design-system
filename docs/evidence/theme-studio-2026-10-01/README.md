# Theme studio — 2026-10-01

[Web results](browser.json), [390 × 844 viewport](mobile.png).

Changed the light primary color to white, observed the onPrimary contrast failure, downloaded JSON and verified the actual override, then reset to defaults. No horizontal overflow. Shared tests verify immutable theme separation, exact export and contrast failure calculation. Both showcases passed typecheck and their existing tests. Contract budget and API map checks passed.

Native includes the same three-state foundation entry, existing provider previews, OS Share invocation and selectable settings. Its initial implementation had only source checks; the device follow-up below adds rendered/export evidence. Pair ratios do not certify full screen accessibility. No product palette was changed.


## Component comparison follow-up

Added Notice info/success/warning, semantic Lucide bell, editable name and data comparison. Web uses canonical DataTable; Native uses existing List/ListRow because it has no supported DataTable renderer. This difference is explicit rather than implying table parity. The save action only toggles the local preview notice.

[Comparison results](comparison.json) cover three Web states at 390 × 844, two themed tables per state, button focus/hover/click and success notice. Both showcases passed after the additions. Native and typography follow-up evidence is recorded below.

## Native device follow-up

On the existing iPhone 17 / iOS 27 development simulator, Default, Dark and LargeText were opened and captured. A bare JSX space under ScrollView caused React Native's raw-text warning; it was removed and the six theme/typography studio views were recaptured after relaunch.

Applied the light primary input, scrolled through both previews and contrast reports, opened the iOS share sheet and chose Copy. The actual simulator pasteboard JSON exactly matched `{"brandPalette":{"light":{"primary":"#0369a1"}}}`. This verifies the real Share payload, not just invocation; no recipient was contacted. The [payload](../native-visual-integration-2026-10-01/theme-export.json) and share-sheet screenshot are kept with the [Native evidence](../native-visual-integration-2026-10-01/README.md). It reused the displayed color to verify export; changed-color contrast failure has separate Web/contract proof above.

## Native changed-color contrast and reset

The follow-up on the same iPhone 17 / iOS 27.0 host entered `#ffffff` into the light
primary field and applied it. The actual report showed `onPrimary / primary` at
1.00:1 (below 4.5:1) and `primary / bg` at 1.00:1 (below 3:1). The report was scrolled
into view and inspected. Reset then removed the override and restored the passing
ratios. [Failure capture](../pattern-polish-2026-10-01/theme-native-contrast-failure.png)
and [reset capture](../pattern-polish-2026-10-01/theme-native-contrast-reset.png) have
adjacent AX snapshots. The keyboard was dismissed by dragging before scrolling
through the report. No product theme was changed.
