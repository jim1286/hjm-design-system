---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Skeleton is a filled, clearly visible placeholder again (2026-10-17 user request "스켈레톤 유아이 개선해줘": the Native story showed one faint outlined bar on white). Cause: `skeletonRecipe.background` was `semanticColors.canvas` — the page color itself — and both renderers added a hard-coded 1px `border` outline, so the shape disappeared on white and read as an empty input in dark. New `semanticColors.surface.placeholder` (`text` at 12% alpha) is the fill; it tints whatever it sits on, so it stays visible on canvas, Card surfaces and profile palettes. Web now reads the fill from the recipe through the provider variable `--hjm-skeleton-background` instead of a stylesheet copy; both renderers drop the outline. ListRow `loading` placeholders use the same fill so a loading screen mixing both reads as one state.

Additive API: `shape` gains `media` (16:9 by width, `aspectRatio` in the recipe) and `button` (medium button height 44, radius `md`); new `lines` prop (text only) draws N lines with the last one at 60% (`skeletonRecipe.lines`) under one pulse, so paragraph placeholders are not rebuilt from loose bars. Native unlabelled Skeletons are also hidden from Android accessibility (`importantForAccessibility="no-hide-descendants"`), and circles no longer shrink in a row. Existing props, defaults (`block`, pulse on, reduced motion static) and Native `width`/`height`/`radius` precedence are unchanged. Visual change: every Skeleton becomes a grey fill without an outline.
