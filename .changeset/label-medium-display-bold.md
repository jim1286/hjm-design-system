---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Render `Text variant="label"` at medium (500) by default and draw `heading.level1`/`level2` bold (700) instead of heavy (800) on Web and Native (2026-10-17 user decision).

- `typography.label.fontWeight` is now `"500"` and `heading.level1`/`level2` are `"700"`; `Top size="large"` titles follow `heading.level2`.
- New `textRecipe.variantWeight` and `resolveTextDefaultWeight(variant, typography, designProfileActive)`: both renderers use it when `emphasis` is omitted, so label renders its token weight even without a design profile. Other variants keep `regular` outside a profile. Explicit `emphasis` still wins.
- Web Text now places the default variant weight before caller `style`/`layoutStyle`, matching Native's style order (previously a profile weight overrode an explicit style weight).
- The brutalist preset pins its level1/2 headings to 800 explicitly to keep its documented strong emphasis.
- Native `fonts="pretendard"` draws these weights with the bundled `Pretendard-Medium` and `Pretendard-Bold` faces.
