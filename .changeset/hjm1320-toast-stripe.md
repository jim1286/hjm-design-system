---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Toast stripe contract: there is no edge stripe — the tone badge (or product media) carries tone, and no option to hide one is offered. Web no longer renders the always-hidden `.hjm-toast__tone-mark` element (and its `display: none` rule), Native drops the unreachable stripe branch, and `toastRecipe.toneMark` (width 0) is marked `@deprecated`, kept only for recipe-shape compatibility until the next major. Visual output is unchanged; product rules or palette overrides that "hide the stripe" can be deleted.
