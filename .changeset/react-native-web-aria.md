---
"@hjmds/react-native": patch
---

Give the React Native renderer the DOM accessibility contracts it needs on web.

`accessibilityRole` and `accessibilityState` are translated by react-native-web
into `role` and a subset of ARIA, but not the state attributes a screen reader
reads: an expanded Accordion header, a checked ChoiceRow or Chip, and a selected
Tab all reached the DOM without them. The keyboard contracts were missing too —
`onPress` alone gives a `Pressable` no Space activation and no arrow traversal
inside a radio group or tab list.

`internal/web-a11y.ts` holds one copy of those contracts, spread only on web:

- Accordion: `aria-expanded` / `aria-disabled`
- ChoiceRow and Chip: `aria-checked` / `aria-disabled`, Space activation, and
  the WAI-ARIA radio-group arrow contract (focus and selection move together,
  skipping disabled and hidden options, wrapping, and leaving a `role="toolbar"`
  group to its focus-only contract)
- RadioGroup: roving tabindex on the selected option, or the first enabled one
- Tabs: `aria-selected` / `aria-disabled` / `aria-controls`, roving tabindex,
  Enter and Space activation, and orientation- and direction-aware arrow, Home
  and End traversal. Tab focus now uses DOM focus on web instead of the
  iOS/Android-only `setAccessibilityFocus` bridge call.

This was carried as a `patches/@hjmds__react-native@*.patch` against `dist` in a
consuming app, so every other consumer shipped the gap.
