---
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Expose MessageComposer.inputRef so a comment reply can focus the existing growing field.
Reuse the DM composer in both experimental comment screens without any photo action or attachment
props. The send icon appears only after text entry; cancelling reply context keeps
the draft. Remove the separate always-visible comment submit control.

Use the large field radius for the shared composer so growing text does not intersect tall pill corners.
