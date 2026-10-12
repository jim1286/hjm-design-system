---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Remove the selected outline from Button and IconButton in both renderers. Selection keeps its content color and accessibility state; keyboard focus remains separate. Native resolves an explicit null selected border without falling back to the secondary-tone border. No consumer prop migration is required.
