---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add PhotoAttachmentField and AttachedPhoto to the image-viewer subpath: one optional photo under written content, shared by Spint marks and Diairy letters. A small "photo" action opens the common PhotoSourceSheet; the attached photo shows as a preview (opens ImageViewer) with an always-visible corner remove button. The product uploads at submit. The contract adds photoAttachmentRecipe, resolvePhotoAttachmentActions and resolvePhotoAttachmentPreviewSize. PhotoSourceSheet keeps its screen-flows export.

Support product decoration around the photo preview and a controlled source sheet, transparent PNG drawing for stickers, and an optional input content font on both renderers.
