---
"@hjmds/design-contracts": patch
"@hjmds/react-native": patch
---

Connect the optional Native liquid Toast's settled corner and raised shadow to the nearest design profile, keeping its circular origin, standard fallback and existing store/actions. Match RN content clipping to Skia geometry and reserve shadow paint bounds on all canvas edges, including negative offsets. Existing calls without a profile retain their recipe corner/depth. The geometry helper accepts an optional finite non-negative settled radius; Native rasterization, gestures and accessibility still require device validation.
