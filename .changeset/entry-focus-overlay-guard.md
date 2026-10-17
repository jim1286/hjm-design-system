---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Entry focus no longer reaches under an open overlay on Native either (Web already skipped open modals). HJM `Dialog`, `AlertDialog` and `Sheet` join an overlay stack while presented (until their exit and dismissal finish, where return focus runs); a screen or sheet scope below does not choose a field while an overlay above it is open, and taps inside that overlay do not count as interaction with the screen. When the overlay closes and the user has not touched the screen yet, the pending entry focus runs then (first-signup consent dialog over a nickname screen). Web now enters after the commit's effects so a modal opening in the same commit blocks entry instead of taking focus and handing it back, and it retries when an HJM modal closes. Native sees only HJM overlays, so full-screen app modals should be HJM overlays.
