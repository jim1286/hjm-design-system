---
"@hjmds/react": patch
---

AuthScreenFooter policy links keep their horizontal touch target inside the link box. The spacing moved from the
links row `column-gap` to each link's inline padding (same visible gap), replacing the absolutely positioned hit
area that extended past the box and widened a full-width footer's scroll width (scenario-matrix auth-screen long-copy).
