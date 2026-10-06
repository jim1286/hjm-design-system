---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add an opt-in noise layer to EffectSurface with a shared static alpha tile and semantic tint. Existing grain and defaults remain unchanged. The Native SVG peer does not implement FeTurbulence, so this original raster texture avoids adding a new runtime. This is a visual experiment, not SVG-filter pixel parity.
