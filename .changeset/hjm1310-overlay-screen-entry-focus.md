---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Fix entry focus for a screen rendered inside a modal: a product modal that wraps the screen no longer blocks it on Web, and a ScreenLayout inside a Dialog or Sheet now enters with the overlay (after its activation or native presentation) instead of losing focus to the overlay's first control or focusing before the Modal is shown.
