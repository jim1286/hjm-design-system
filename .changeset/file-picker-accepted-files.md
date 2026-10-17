---
"@hjmds/react": minor
---

Web `FilePicker` `onSelect` now receives a second argument, `files: ReadonlyMap<string, File>`, mapping each accepted candidate id to its browser `File`. Before this a Web product could not read or upload the bytes it accepted and fell back to a raw `<input type="file">`. Existing one-argument callbacks keep working; Native keeps its `onPick` adapter, which already owns the file reference.
