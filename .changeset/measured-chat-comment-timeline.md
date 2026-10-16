---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Adopt the measured chat and comment standard. `ChatMessage` gains `groupPosition` (from the new
`resolveChatMessageGroups`) so a run shows its author, avatar and tip once and its time once beside the last
bubble; bubbles are filled, borderless and compact (`chatMessageRecipe`), and `bubbleTail` now defaults to
`true`. `ChatScreen` gains an optional `jumpToLatest` control. Comment rows follow `commentThreadRecipe`:
32/24 avatars, the like count under the heart, quiet text reply/expand actions and replies aligned with the
parent text column. Timeline hosts should drop their own message gaps.
