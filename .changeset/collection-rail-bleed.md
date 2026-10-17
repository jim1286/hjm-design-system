---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

`CollectionRail` gains `bleed`: inside the default inset ScreenLayout body it scrolls to the screen edges while its first and last items rest on the body gutter (viewport reaches across the gutter and pads it back — the ListRow bleed room rule; Web `--hjm-screen-body-inline`, Native body inset context, 0 inside overlays and `body-edge`/`none` bodies). New `useScreenBodyScrollRoom()` (`/screens`, both platforms) gives a product scroller that owns a `scroll="content"` body the same room, so a bleeding rail inside a FlatList is not clipped. Web ScreenLayout body inline padding is now expressed through `--hjm-screen-body-inline` (values unchanged).
