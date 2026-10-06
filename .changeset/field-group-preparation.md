---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Expose experimental FieldGroup through dedicated subpaths. Keep named groups, independent field feedback and guarded edits separate from form submission. Provide Web fieldset/legend semantics and Native per-control accessibility bindings.

Invalidate retained callbacks after committed field removal even when the same id is reinserted. Preserve active bindings across normal rerenders and Strict Mode effect replay, while blocking edits during cleanup and after unmount.
