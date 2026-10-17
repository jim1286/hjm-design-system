---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Sheets no longer draw a visible title line (2026-10-17 user decision). `title` stays required and names the dialog: Web renders it in a visually hidden `h2` referenced by `aria-labelledby`, Native keeps it as the dialog `accessibilityLabel` plus an off-layout screen-reader header. The header row is drawn only for a description or a visible ×, and the × keeps its inline-end place. Native Select/Combobox selection sheets and `GestureSheet` follow the same rule; a Native element `title` is no longer drawn (`accessibilityTitle` names the sheet). `sheetRecipe.title` visual values are removed. Web: the sheet header sits inside the drag zone, so the `.hjm-sheet > .hjm-sheet__header` rule had stopped matching and the Dialog's 20px top padding leaked in; the rule now scopes by the sheet.

A backdrop press now closes sheets in every placement (2026-10-17 user decision; bottom sheets had been drag-only since 2026-10-16): `resolveSheetDismissPolicy` defaults `outsideDismiss` to true. Closing goes through the same request path as the handle and drag, so `busy`, `dismissPolicy` and a controlled owner's discard confirmation still apply. The Native backdrop is a button named by `closeLabel`.
