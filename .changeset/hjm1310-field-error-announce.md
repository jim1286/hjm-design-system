---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Announce Field errors the same way on every Field-based control. Web keeps one pre-mounted assertive region that carries the error id (linked by `aria-describedby`) and hides the visible copy from assistive technology, so the error is announced once and read once; MessageComposer drops its own hidden alert. Native announces each new error on iOS for TextField, TextArea, Select, Combobox, NumberField and choice groups, as Android's live region already did.
