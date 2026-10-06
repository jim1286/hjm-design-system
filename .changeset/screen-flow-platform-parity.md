---
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Align three Web/Native differences in the unreleased screen compositions (`./screen-flows`, `./saved-items`), found in the 2026-10-06 platform parity review.

- Web `CommentThreadScreen`: the reply show/hide button now sets `aria-expanded` from `expandedIds`, matching Native's `accessibilityState.expanded`. Previously screen readers on Web heard only the label.
- Native `OnboardingScreen` now accepts `layoutStyle?: HjmCompositionStyleProp` and applies it to the screen root (`ScreenLayout`), as Web already did.
- Native `ListDetailScreen` and `SavedItemsScreen` now apply `layoutStyle` to the outer host that holds both the list and the detail pane, as Web does. Previously Native passed it to the list `ScreenLayout`, so the placement disappeared whenever a detail (or a saved item) was open.

Migration: no API was removed. Native callers that compensated for the list-only placement (for example by wrapping the detail state in their own margin view) can drop that wrapper; the same `layoutStyle` now holds in both states. Tests that looked for `layoutStyle` on the Native list `ScreenLayout` should look for it on the outer `View`.
