---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

ChatMessage and CommentThreadItem accept `mediaAlbum`, a paged photo set whose `renderPage(index)` runs only for the shown photo (counter row with previous/next icon buttons, `mediaAlbumRecipe`), so products that authorize each image fetch one page at a time instead of mounting every preview; `media` is unchanged and passing both throws.
