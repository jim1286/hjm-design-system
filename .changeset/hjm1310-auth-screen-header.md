---
"@hjmds/react": minor
"@hjmds/react-native": minor
---

AuthScreenLayout accepts `title` and `exit`: it draws the ScreenLayout centered header band (the same icon-only back/close exit, gutter and title step) above the centered sign-in block, so login and signup routes no longer stack a separate TopBar above the layout. On Web the hero tagline defaults to `h2` when a title is present.
