---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Keep EffectSurface content usable when an optional decoration host fails. Web retains
static SVG if WAAPI rejects animation creation. Native isolates SVG/Animated render
failures from product content and retains static layers after a failed foreground
animation start. Invalid descriptors still fail validation; no public API changes.
