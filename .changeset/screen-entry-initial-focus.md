---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Screen entry focus (additive). Text fields (TextField, TextArea, SearchField, PasswordField) register with the nearest screen or overlay scope, which focuses one field after entry using the shared contracts rule `resolveInitialFocusTarget` / `initialFocusDefaults` (`screen-patterns`). New props: `ScreenLayout`/screen compositions `initialFocus` (`"first-input" | "none"`, default `none`; SearchScreen and EditorScreen default `first-input`; ChatScreen and CommentThreadScreen stay `none` so the keyboard does not cover the history), `Sheet`/`Dialog` `initialFocus` (default `single-input`: only a lone text entry is focused; AlertDialog follows the same default), and field `initialFocusTarget` (true prefers the field, false excludes it). Disabled and read-only fields are never chosen; focus is never taken from a field the user is in (Web also not under an open modal). Native focuses after the enter interaction (sheets after they are shown); Web on mount with `preventScroll`. Screens focus once per mount; overlays on every opening. Web `initialFocusRef` still wins. Products replace their own `autoFocus` / delayed `ref.focus()` with these props.
