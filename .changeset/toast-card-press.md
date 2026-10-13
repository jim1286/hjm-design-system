---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add opt-in whole-card Toast activation with `press: { accessibilityLabel, onPress }` on Web and Native, including Liquid Toast. Keep action/close controls independent, support Web keyboard activation, and reuse the shared once-per-revision lifecycle with callback-then-dismiss ordering and the `press` dismiss reason. Pressable notices persist by default; existing descriptors keep their behavior. Consumers exhaustively handling ToastDismissReason must include `press`.
