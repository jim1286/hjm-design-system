---
"@hjmds/design-contracts": minor
---

Add resolveScrollEdges to the existing scroll-progress subpath so product edge hints disappear at the actual boundary, including fractional offsets, overscroll and content resizing. Existing progress semantics are unchanged; renderers still own their visual effects and focus handling.
