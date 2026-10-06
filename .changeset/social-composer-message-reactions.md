---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Extend experimental screen compositions with controlled multi-photo previews, individual removal,
photo-only sending and an optional inline send icon. Preserve the existing text-button API and
receipt-owned draft clearing. Extend TextArea with a trailing action slot rather than duplicating
its growing-input behavior.

Connect ChatMessage long press and accessible activation to the existing ReactionPicker, with
single-row layout, same-reaction removal and dismissal. Web movement cancels the hold gesture.
Native uses core Modal and requires no optional context-menu package. Missing native safe-area
edges contribute zero to dialog viewport padding rather than producing NaN.

These changes include Web/Native experimental stories and interaction tests; they do not publish
packages, promote stories, or migrate consumers from the currently installed 1.12.1 release.
