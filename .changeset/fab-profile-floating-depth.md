---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Make FloatingActionButton consume the nearest design profile's existing floating shadow role. Flat profiles also remove Android elevation. Keep legacy depth without a profile and preserve the action instance, focus, scroll collapse, safe-area positioning and content clearance. No new public prop is required.
