---
"@hjmds/react-native": patch
---

Refresh existing iOS multiline attributed text when the effective font scale changes. Preserve the field draft, forwarded editor ref, focus and selection; leave Android and single-line editor identity unchanged. No public API migration. BT-QA-025 reproduced the stale text at both scale transitions in BurnTok local QA.
