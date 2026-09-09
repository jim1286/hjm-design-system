---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Add the `minimumVisualTarget` provider environment axis.

Compact recipes stay at 36pt and reach the 44pt target through hit slop. A
product whose accessibility stance requires a *visible* 44pt frame previously
had to re-add `minHeight` in its own wrapper styles, which put control geometry
back into product code. The axis resolves once on the provider environment and
`visibleControlHeight()` applies it to the native Button and Chip heights and to
the web `--hjm-control-button-*` variables, so every stylesheet rule that reads
a control height follows without its own case.
