---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

NotificationBell takes `edge` like IconButton; the overhang goes on the bell root, so its glyph slot lands on the top-bar inset while the badge keeps the icon corner. The Native scrollable Sheet body now reaches the sheet's padding edge with the padding inside its scroll content (as the Web body), so ListRow surfaces inside it are no longer cut; content does not move. VirtualList and the Sheet share one internal bleed-room rule, and the Web VirtualList room now reads the rem bleed variable. Usage docs record that the screen gutter belongs to ScreenLayout: an outer Container gutter with contentInset="none" is not a supported shape.
