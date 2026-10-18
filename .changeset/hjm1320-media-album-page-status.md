---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

`MediaAlbumPageStatus` (`/screens`, `mediaAlbumRecipe.pageStatus`, `validateMediaAlbumPageStatus`) draws a loading (spinner named by `label`) or failed (announced text + optional retry Button) page of a ChatMessage/CommentThreadRow `mediaAlbum`, centered in the frame. While it is shown the page frame drops its single accessible image name and `onPress` open action, so the status and retry button are reachable by screen readers and pointer; the frame and page wrapper keep their elements, so the product's page is not remounted. The press-to-open target is now an overlay button over the page instead of a button wrapping it (web `.hjm-media-album__open`; images inside the page are styled through `.hjm-media-album__content > img`).
