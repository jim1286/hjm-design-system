---
"@hjmds/design-contracts": patch
---

Document the 1.2.0 `ResolvedDesignSystemEnvironment` migration in docs/density.md.

`density` is required on the resolved environment because that type exists to say
every axis is already filled in. The runtime is compatible — the resolver always
supplies it and the default is `comfortable` — so the only code that breaks is
code that builds a resolved environment literal by hand. Code that merely
receives and forwards one is unaffected. The note shows the one-line fix for the
`TS2741` that follows, which 1.2.0 shipped without explaining.
