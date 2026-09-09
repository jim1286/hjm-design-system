---
"@hjmds/react": patch
---

Make zero-delay Tooltip focus and dismissal transitions synchronous, and preserve pointer transit between a trigger and its portaled Tooltip by following `relatedTarget` instead of a timing grace period.
