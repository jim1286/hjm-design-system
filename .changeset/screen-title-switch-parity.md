---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Web/Native parity from the reference screen comparison: route titles use `Heading` at `screenHeaderRecipe.titleLevel` (start, level3) and `centeredTitleLevel` (centered, level5) on both renderers — Native previously drew regular-weight Text. `Switch` defaults to `presentation="row"` on Web as on Native (label first, track trailing); pass `inline` for compact toolbars. Native `Heading` gains `align`.
