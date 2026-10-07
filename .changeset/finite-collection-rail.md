---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add the granular `collection-rail` entry for finite, independently interactive multi-visible collections. The shared placement/scroll resolver handles measured widths, logical RTL navigation, finite ends and focus exposure; Web and Native keep every keyed item mounted and compose existing Card/Dialog detail actions.

Use CollectionRail for finite horizontal collections, List for vertical rows, and Carousel for a single selected/inert panel. Product selection, drafts, server state and detail data remain product-owned. Existing imports/props are unchanged; no optional peer or root export is introduced. Rationale and usage are in `docs/collection-rail.md` and its usage guides. This addition remains experimental and outside the 1.15.0 publication snapshot.
