---
"@hjmds/react-native": patch
---

Unmount the upstream animated Blobatar renderer whenever motion is inactive, hidden, reduced, or backgrounded. Blobatar 2.7.0 runs its frame callback even with animate=false; using its static renderer for these states preserves the seed/expression while stopping that work. No public API change is required.
