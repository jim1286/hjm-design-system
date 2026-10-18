---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

BottomNavigation gains recipe-driven theme frames and a lifted selected icon: `configuration.shape` (`standard` default · `rounded` · `pill` · `compact` · `square`, floating + emphasis selection only) picks the floating surface's radius token and inner padding from `bottomNavigationRecipe.shapes`, and `configuration.iconEmphasis: "lift"` (default `scale`) raises the selected icon one 4pt step and dims idle icons (`bottomNavigationRecipe.icon.liftEmphasis`) as the non-color cue for full-color app-icon artwork. Defaults render exactly as before.
