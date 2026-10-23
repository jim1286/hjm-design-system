---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Redesign chat room management after KakaoTalk, Telegram and WhatsApp screens on Web and Native. Member pickers (ChatRoomCreate, ChatRoomInvite) gain a search contract with optional server search and a selected-people strip that deselects on tap; invite confirms from the top bar. ChatRoomMembers adds an invite row (ListRow `tone="brand"`), trailing role marks and a named icon menu (`memberActions`, replacing `actions`). ChatRoomProfile shows an edit mark on the photo, an optional name character count, and reports photo failures (`labels.photoError`) apart from save failures. Adds `chatRoomRecipe`. Quoted reply rails are now a straight bar clipped by the rounded quote box instead of a tapered one-sided border. The 1.43.0 chat room props that changed had no consumers.
