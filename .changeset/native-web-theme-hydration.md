---
"@hjmds/react-native": patch
---

Keep automatic system themes consistent across Expo static-web hydration. Start
from the same light server snapshot before applying the browser preference, so
existing surfaces and newly mounted overlays use the same theme. Preserve native
first-frame OS detection, explicit themes, supplied values, and parent inheritance.
