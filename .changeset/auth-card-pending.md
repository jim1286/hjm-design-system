---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add AuthScreenLayout mainCard and pendingLabel. Login actions become hidden and inaccessible during authentication while their mounted layout preserves the card dimensions and one loader appears at its centre. Clear pendingLabel after cancellation or failure to restore actions. Products supply localized labels and use provider names for visible button text.
