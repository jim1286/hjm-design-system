---
"@hjmds/react-native": minor
---

Dialog actions now wait for a returned promise. While it is pending, the pressed action shows its
loading state and the actions, Close, back and outside dismissal are blocked; the dialog closes
only after the promise resolves. A synchronous action still closes in the same press. When an
action throws or rejects, the dialog stays open with its actions re-enabled and calls the new
optional `onActionError(error)`; without a handler, development builds log the error with
`console.error`. Before, the promise was ignored, the dialog closed at once and a rejection was
lost. Migration: callers that returned a promise only for fire-and-forget work should return
nothing to keep the immediate close; callers that save should pass `onActionError` and show a
localized, recoverable message.

Dialog keeps its title row and Close outside the scrolling body, so Close stays reachable while a
long body scrolls. The description now scrolls with the body at full width instead of sitting
beside Close. Children are inside a ScrollView: do not pass FlatList/SectionList; use a Sheet or a
mapped list for long collections.

ChatMessage accessibility: the row is no longer one element named by `author`, and the reaction
target is no longer named by the picker `label`, both of which hid the message text. The bubble is
read by its own text, author and time are separate elements, and reply/reaction stay available as
accessibility actions (the picker label is now the hint). With `interactiveContent` and no
reactions, the reply action is on the time caption (or the author caption when there is no time).
The reaction modal's Close target now answers the standard activate action, so TalkBack can close it.

NotificationItem no longer passes the deprecated ListRow `titleStyle`, so apps stop receiving the
`ListRow.titleStyle` deprecation warning from HJM itself. Unread titles stay 700, read titles 400.

TextArea `minVisibleLines` keeps the 80pt `multilineMinHeight` floor from 1.12.1. An unreleased change
had lowered it to the 44pt control floor, shrinking `minVisibleLines={2}` fields from 80pt to 64pt.
Only MessageComposer starts at one control row. No migration.

TextField, TextArea, SearchField and PasswordField refs no longer detach and re-attach on every
render. A callback ref receives the editor once, and again only when iOS remounts a multiline
editor after a text-scale change.

CommentThreadScreen's reply toggle exposes `accessibilityState.expanded`.
