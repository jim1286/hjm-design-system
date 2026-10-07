---
"@hjmds/react": patch
---

Preserve Menubar, ContextMenu and CommandPalette keyboard selection when positioning the surface generates a mouse enter under a stationary cursor. Actual mouse movement still selects the hovered enabled item. Public props and keyboard/action contracts are unchanged. Reproduction and local verification: docs/qa/2026-10-07-command-records.md.
