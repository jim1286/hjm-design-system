---
"@hjmds/design-contracts": minor
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Consolidate canonical registration metadata in the catalog, derive stable component IDs and renderer evidence from it and generated public exports, and promote 22 screen/composition contracts and their Web/Native surfaces to stable after focused renderer proofs. Optional extensions keep their independent maturity.

Name the Web ScreenLayout scroll region and mirror Native DataTable alignment, indentation and pinned edges in RTL while preserving complete measured cell values. Correct the conversation-row Metro export condition. Renderer evidence imports the granular `@hjmds/design-contracts/catalog` entry, and Native ImageChoiceGroup evidence no longer claims a `native-actions` scenario its contract does not require. Existing component names and shipped IDs remain supported; this change does not publish packages or update consumer apps.
