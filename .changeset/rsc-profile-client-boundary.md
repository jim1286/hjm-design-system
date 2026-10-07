---
"@hjmds/react": patch
---

Declare client boundaries on the granular layout and provider entries so React Server Component pages can pass a serializable product profile and server-owned children without evaluating React context in the server module graph. Other entries and Native renderers are unchanged; applications keep the existing wrapper until a package version containing this fix is published.
