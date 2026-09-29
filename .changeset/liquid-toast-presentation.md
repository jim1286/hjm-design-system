---
"@hjmds/design-contracts": minor
"@hjmds/react-native": minor
"@hjmds/react": patch
---

Add the opt-in liquid Toast presentation with capsule and explicit island anchors. Native consumers
import `createLiquidToastPresentation` from `@hjmds/react-native/toast-liquid` and provide it to a top,
single-slot ToastRegion. The effect requires optional Skia, Reanimated and Worklets peers; ordinary
imports remain independent of these modules. Shared descriptors retain standard rendering on Web.

Preserve FIFO, action and dismissal ownership in the existing store, account for elapsed time before
Native updates/pauses, and pause while entering or occluded by a host modal. Screen readers, reduced
motion and constrained viewports use the standard surface. This remains beta; device geometry and
performance verification are separate from unit and bundle checks.
