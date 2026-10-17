---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add opt-in dotted vertical drops for missing LineChart periods on Web and Native. Each observed edge of a gap drops straight to the plot floor at its own category position; the two sides never connect across missing seasons. Preserve null values, unfilled missing regions, and observed-only focus navigation without assigning zero or changing the domain.
