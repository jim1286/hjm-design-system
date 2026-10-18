---
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Card now accepts `onActivate` together with `actions`: the whole card opens while each action stays an independent target (Web keeps an `<article>` with a covering activator button, Native makes media and body one Pressable beside the actions row), so products no longer rebuild an inner Pressable for open-plus-delete cards.
