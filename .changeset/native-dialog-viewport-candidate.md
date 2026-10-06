---
"@hjmds/react-native": patch
---

Constrain Dialog and AlertDialog content with an internal shrinking scroll body, keep actions outside it, and apply provider safe-area padding. BT-QA-027 is a local candidate: host checks and ordinary-size iOS confirmation/cancel pass, while enlarged-text device geometry is still unverified after that QA scope was stopped. Resolve that evidence gap before presenting the release as a completed device fix.
