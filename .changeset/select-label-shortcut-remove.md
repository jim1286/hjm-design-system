---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Select items accept an optional `selectedLabel`, shown in the closed field when the item is chosen; the option list and the accessible value keep `label`. A full option name with its code ("도루저지율 (CSP)") wrapped a half-width field to two lines.

ShortcutRail paints a 24px remove (×) part instead of the full 44px target and drops the label's trailing padding beside it, so a removable chip no longer reads about twice its label. The remove target stays 44px by extending past the chip's trailing edge (`shortcutRailRecipe.removeWidth`/`removeHitSlop`).

Horizontal card RadioGroups use the same 8px gap as vertical ones (`selectionGroupRecipe.orientations.horizontal.gap.card`, was 16), so a date-card rail no longer reads as scattered cards.
