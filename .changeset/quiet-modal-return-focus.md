---
"@hjmds/react": patch
"@hjmds/design-contracts": patch
"@hjmds/react-native": patch
---

Preserve Dialog and Sheet return focus after a real pointer click on the backdrop. Prevent the backdrop default blur from undoing modal cleanup or moving focus outside a busy modal; leave inside controls and dismissal policy unchanged. Diairy QA W16 supplies real pointer regression evidence. Native has no corresponding DOM default and remains unchanged. No public API or migration is required.

The Native patch entry follows the fixed release train; no Native implementation changed because it has no browser mousedown default.
