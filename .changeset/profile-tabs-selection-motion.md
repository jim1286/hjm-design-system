---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add plain sliding selection feedback to existing Tabs. Inherit the design profile's selectionMotion when appearance is omitted; explicit standard/slide/gooey wins and vertical tabs keep their canonical line. Preserve selection, keyboard activation and panel mounting, and continue interrupted motion from its current visible position. Default consumers without a profile keep standard appearance. No new controller or animation dependency; actual native geometry/performance remain to be verified.
