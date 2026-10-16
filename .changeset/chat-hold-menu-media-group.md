---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Extend the measured chat and comment standard. The hold menu now shows the reaction strip (only when
options exist), the message preview and an action card: the exact time, reply, product `menuActions` and a
danger-tone `reportAction` last. `ChatMessage` gains `replyQuote` (an HJM-drawn "X에게 답장" quote whose tap
opens the original) and `media` photos (`resolveChatMediaColumns`; photo-only messages drop the bubble), hides
the author on own messages and draws a flat-topped tip. `ChatScreen` centers its header by default, takes an
`avatar` and uses a 10pt timeline gutter. `MessageComposer` wraps the reply target and input in one card.
Comments accept `reactions` (long press, action-only when no options), `reactionSummary` and optional
`media`; the like count is a bare number under the heart.
