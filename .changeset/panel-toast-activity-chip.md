---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Make the panel the Toast (2026-10-10 user request). Every Toast — Web, Native and the optional Native liquid card — now draws the panel: `xl` (24) corner, an optional decorative `media` (any ReactNode, 44 units, hidden from assistive technology) that replaces the tone badge, an optional step `progress` (`{ steps: readonly string[]; current: number }`, 2–5 non-empty steps; dots plus labels under the description, current step appended to the default announcement) and the action pill under the copy at the start edge (`toastRecipe.action.align` `"end"` → `"start"`). The liquid card drops its two-row banner/footer action for the same columns and its unprofiled settled corner becomes 24 (`liquidToastRecipe.radius`). `ToastProgressDescriptor` is exported; `ResolvedToastDescriptor` gains `media` (null when absent) and `progress`. Existing descriptors keep working; the visual change is the larger corner and the action position.

Add `ActivityChip` (`/activity-chip` on contracts, `@hjmds/react` and `@hjmds/react-native`; contracts also re-export from the root): a 44-unit status pill with decorative `media`, a one-line `label`, `emphasis` (`default` | `emphasis`) and `expanded`, exposed as a disclosure button (`aria-expanded` / `accessibilityState.expanded`). It is a new name because `Chip` carries selection roles; it stays outside the frozen catalog (supplemental in the public API map). Add the `activity-status` composition guide and experimental Storybook items: pressing the chip opens a persistent panel Toast (stable id, `durationMs: null`, media + progress), pressing again closes it, and completion updates the chip and the panel in place.
