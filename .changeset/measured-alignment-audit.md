---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Alignment fixes from the 2026-10-17 measured audit. Web ListRow trailing content (chevrons, switches, text) now centers on the row instead of riding the text baseline 2–2.5px high. Notice icon, title first line and the inline Web action share one first-line anchor (line box, or the 36 small-button height when an action is present); the Native icon box follows the title's scaled line height. Web NavigationBar drops the extra brand inset so brand and end controls both sit at the bar padding (13/13). Timeline dot, label first line and timestamp center on the label's first line on Web and Native. `chatMessageRecipe.avatarSize` is now `avatarRecipe.sizes.small` (32, was 36, which no Web Avatar step could render).
