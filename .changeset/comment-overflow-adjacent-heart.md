---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Place CommentThreadScreen item actions beside the heart in one inline row on Web and Native.
Comment previews use a vertical-ellipsis Menu trigger. The existing actions and likeAction APIs,
product permissions, and independent action callbacks are preserved. Consumers that used actions
for wide body content should move that content to body; this slot now owns trailing comment actions.
