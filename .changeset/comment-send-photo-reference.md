---
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add optional MessageComposer.sendPresentation="circle" for the user's screenshot: a filled primary
circular button inside the growing field. Both comment and DM fixtures use a white ArrowUp instead of the
previous paper plane. Comments have no photo controls; DM retains attachments. Keep the inline ghost presentation as the backward-compatible API default.

Use the small 36px circular control with a 20px arrow, center it vertically inside the field, and keep a 8px trailing inset (9px including the field border). Comment avatars share the field centreline.

Keep attachment removal controls outside the photo-only rounded mask, aligned to the top and trailing edges, and give the native close mark a fixed 24px circle so large text cannot clip it.
