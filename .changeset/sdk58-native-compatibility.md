---
"@hjmds/react-native": patch
---

Support the Expo SDK 58 / React Native 0.88 development dependency train. Replace the removed InteractionManager API with the same cancellable post-commit scheduling, derive native host refs from React ComponentRef, and keep emitted declarations on public React Native exports. Expand the native adapter peers for the SDK 58 combination. Native binary and device verification remain separate from package build/type checks.
