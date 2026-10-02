---
"@hjmds/react": patch
---

Keep Web OtpField focusable while `busy`: the input becomes read-only with `aria-busy` instead of disabled, so focus no longer drops to the document body between submit and the server's answer. Visual dimming is unchanged.
