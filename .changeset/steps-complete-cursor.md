---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Allow `currentStepStatus: "complete"` on Steps. The cursor step and every step before it read as complete, so a finished flow no longer shows its last step as in progress. The cursor gets no `aria-current` when complete. The single-cursor derivation is unchanged.
