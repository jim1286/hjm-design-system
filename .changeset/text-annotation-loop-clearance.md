---
"@hjmds/design-contracts": patch
---

Keep experimental surrounding-loop strokes outside the measured text rectangle.
The previous inscribed ellipse crossed end glyphs at large text sizes. The new
outward-bowed loop includes pen width in its clearance and SVG bounds. Its visual
difference from an ellipse remains subject to experiment review.
