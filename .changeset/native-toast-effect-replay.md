---
"@hjmds/react-native": patch
---

Preserve the ToastRegion store during Strict Effects and Fast Refresh replay. Cancel pending disposal when the same region immediately resumes, seed defaults once, and interrupt remaining notifications on a real unmount. This fixes the development red screen without replaying existing notifications.
