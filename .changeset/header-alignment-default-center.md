---
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Keep `headerAlignment` (ScreenLayout and screens built on it, `ListDetailScreen.detail`) and TopBar `centered`, with centered as the default: `headerAlignment` now defaults to `"center"` (was `"start"`). Web ScreenLayout uses the same fixed header band as Native (`screenHeaderRecipe`), so the title sits at the same height with or without exit/action buttons.
