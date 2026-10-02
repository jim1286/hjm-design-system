---
"@hjmds/design-contracts": major
"@hjmds/react": major
"@hjmds/react-native": major
---

Remove deprecated compatibility APIs in the 2.0 fixed release train: Native state/content aliases, collection options and legacy Menu items, layout descriptors and numeric Surface geometry, and deprecated raw styling props. Remove Web Menu item onSelect and Tabs glyphSize aliases, plus contract layout-validator and catalog-summary aliases. Migrate renderer internals, both showcases, and managed consumers to canonical composition, items/selection, onAction, and token APIs. See packages/design-contracts/docs/migration-native-legacy-removal.md for the complete replacement table and verification boundaries.
