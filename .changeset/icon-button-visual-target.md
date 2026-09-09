---
"@hjmds/react-native": patch
---

Apply `minimumVisualTarget` to the native `IconButton` diameter.

The web renderer reads the same size through `--hjm-control-button-*`, which the
axis already raises, but the native renderer read `iconButtonRecipe.sizes[size].diameter`
straight from the recipe. A product that turned the axis on therefore got 44pt
buttons and chips but 36pt compact icon buttons, and the two renderers disagreed.
Found by running a consuming app on the iOS simulator and measuring the
accessibility tree.
