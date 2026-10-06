---
"@hjmds/design-contracts": minor
"@hjmds/react": patch
---

Expose the pure text-annotation geometry subpath and add an internal Web renderer
that measures actual inline line fragments, preserves text selection, and cancels
decorative motion for reduced-motion users. The renderer remains outside public
exports and Storybook until Native fragment measurement and visual review are
complete. See docs/text-annotation.md for the outstanding adoption boundary.

Merge touching Web bidi fragments in the same measured vertical band to remove interior annotation seams; preserve separate lines and unselected gaps.
