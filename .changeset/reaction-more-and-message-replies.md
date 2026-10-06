---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add an optional plus action to ReactionPicker that expands a product-localized emoji catalog,
with combined validation and same-reaction removal even when the selected value is outside
quick reactions. Existing callers without `more` retain their quick list.

Add ChatMessage horizontal swipe-to-reply (without a visible reply button), accessible message actions, and a separate quote-navigation button;
MessageComposer accepts a controlled reply target and cancel action. Native ScreenLayout can
expose its scroll host ref. Product callbacks retain reply IDs, message loading, scrolling,
and receipt-driven clearing. Web/Native experimental stories demonstrate sending a targeted
reply, cancelling without losing the draft, and scrolling to an existing quoted message.
