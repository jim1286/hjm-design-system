---
"@hjmds/react": patch
---

Cancel deferred page-entry focus as soon as the user clicks or opens a context menu. Activate the entry window before its deferred attempt, so it cannot reset a user's interaction and close an already opened message reaction menu. Preserve pending entry for a screen revealed by its enclosing modal.
