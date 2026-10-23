---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Chat room screens (ChatRoomDetails, ChatRoomProfile, ChatRoomCreate, ChatRoomInvite) now render inside ScreenLayout, so header placement, the screen gutter and scrolling match every other HJM screen; ChatRoomProfile `title` is required. Room sections are flat, and the exits at the bottom are full-width buttons (history deletion secondary, leave and room deletion danger). Details tools accept `pressed` for toggles such as mute, drawn with the selected surface.
