---
"@hjmds/react": patch
---

Keep ClipboardButton copy requests single-flight and announce success only for the current source.
Ignore obsolete success/error callbacks after the source changes or the component unmounts, and use
Button loading semantics to retain keyboard focus while the OS clipboard write completes.
No public props change; see usage/components/code-block.md and docs/qa/2026-10-07-command-records.md.
