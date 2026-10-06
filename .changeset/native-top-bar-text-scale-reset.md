---
"@hjmds/react-native": patch
"@hjmds/design-contracts": patch
---

Recreate Native TopBar's internal layout subtree when OS text scaling switches
between large-text and compact layouts. This prevents a full-width large-text
host from retaining its layout when reused as a compact side slot. Public props
remain compatible; slot-local state/focus can reset during this structural change,
so persistent product state should live outside TopBar. Web keeps its existing
DOM/CSS layout. Consumer installs and package publication are separate steps.
