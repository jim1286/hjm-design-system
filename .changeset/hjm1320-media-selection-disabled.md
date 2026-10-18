---
"@hjmds/react": minor
"@hjmds/react-native": minor
---

MediaSelectionScreen and MediaSelectionCell accept `disabled` (default `false`): while the host builds output from the selection it locks every item's move, rotate and remove actions so the order cannot diverge from the job, and leaves the upload's own retry/cancel live. On Web the locked actions are `aria-disabled`, so a focused action keeps keyboard focus for the length of the job; the list-boundary move buttons stay natively disabled.
