---
"@hjmds/react-native": minor
---

Allow ImageViewer to render product image hosts and report per-image loading, readiness and error states. Preserve host cache/display events while keeping retry and feedback in HJM. Ignore callbacks from retired attempts and sessions, and retain errors until retry.

Move retry feedback above the gallery gesture layer so real native taps reach it, and give feedback an opaque semantic surface for legibility over decoded images.
