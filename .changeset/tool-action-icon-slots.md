---
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Icon slots for tool actions: `SavedItemsScreen` now requires `createCollectionIcon` (Web and Native) and always renders the create-collection action as an `IconButton` named by `labels.createCollection`; the text-button fallback is removed because header tool actions are icons. Migrate by passing the product's add glyph. Web `Popover` `closeIcon` is optional and renders an `IconButton` named by the existing label; omitting it keeps the text button.
