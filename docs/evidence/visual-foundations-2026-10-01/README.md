# Visual foundations — local implementation evidence

The checks below record the initial implementation checkpoint. The [later Native integration audit](../native-visual-integration-2026-10-01/README.md) adds three-state device captures and selected interaction proofs, and supersedes the earlier unresolved overlay-budget/full-gate status. Native screen-reader and physical-device performance claims are not inferred from those captures.

2026-10-01. Part of the active full-integration goal, not a claim of full completion.

Implemented source: optional EffectSurface with mesh/glow/seeded grain layers;
selective Web/Native Lucide factories within existing Icon semantics; existing
ContentTransition/TextTransition presets; separate component showcase entries.

Browser captures: effects.png, icons.png, avatars.png. Actual Chromium rendering
from the local Storybook. Effect activation produced running browser animations;
no page errors occurred. Grain was refined from large points to a repeating fine
tile after visual inspection. Upstream Blobatar is used unchanged for faces.

Native tests substitute SVG host elements but execute the upstream Lucide and
Blobatar generators. They are not Native pixel proof. Device Hub is running and
the existing iPhone 17 / iOS 27 simulator is booted, but the CUA connection still
returns timeoutReached after a fresh kernel retry. No new device or release build
was created. Native visual verification remains open in the implementation ledger.

New renderer entries and all contracts fit explicit import-graph budgets. Web
Icon's callback adds measured 142 raw / 31 gzip bytes to supplemental-display;
the allowance is limited to graphs that include that module. Native's existing
unrelated overlays gzip failure remains; its limit is not relaxed. Static library
policy, API-map and document checks are tracked with the source changes. Existing
workspace peer mismatches are listed in the earlier profile implementation evidence.

See [remaining requirements](../../plans/visual-integration-progress.md). These
changes have not been published or migrated into consumer products.
