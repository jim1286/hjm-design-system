---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

`ScreenLayout` gains `contentInset="body-edge"`: header, notice and footer keep the screen gutter while the body drops its
inline padding, so full-width list rows (ConversationRow, NotificationRow) supply their own 16pt inset instead of stacking
to ~32pt (review S5#9). `contentInset="none"` keeps its host-owns-all-insets meaning. Contracts export
`ScreenContentInset`/`screenContentInsets`.

`CommentThreadScreen` and `CommentThreadRow` gain `commentMenu` (`label(item)`, `items(item)`, `onAction(item, id)`; Native
also `dismissLabel`): HJM renders the trailing vertical-dots IconButton in every comment row and opens the shared Menu with
danger items last (`resolveCommentMenuItems`, `CommentMenuItemDescriptor`, `commentThreadRecipe.menuGlyphSize` in contracts).
The `actions` slot is unchanged.
