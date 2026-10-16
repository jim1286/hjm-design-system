---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Polish the hold menu from the simulator review: Native strip reactions are 44pt circles spread across the
row (six reactions fit without scrolling), the floating × is gone (backdrop, Escape and the screen-reader
close target remain), and comment menus accept `reactions.replyIcon` for the automatic reply row.
