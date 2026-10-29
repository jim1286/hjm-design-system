---
"@hjmds/react": minor
---

`ImageViewer` (Web) closes when an unzoomed photo is pulled down by touch or pen, matching Native: the photo follows the finger and the chrome fades; past 120 px or a fast flick calls `onClose`, a short pull springs back (instantly with reduced motion). A mouse keeps the close button and Escape; pinch and zoomed panning are unchanged.
