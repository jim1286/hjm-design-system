---
"@hjmds/design-contracts": major
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Keep Button and IconButton tone backgrounds and borders unchanged when selected. IconButtonLink follows the same treatment for the current destination. Preserve accessible state and filled-tone foreground contrast.

The selected recipe now contains only foreground treatment; read retained background and border from tones[tone] instead of states.selected. Component selected/current props remain unchanged.
