---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Close a swipe-dismissible Sheet from a downward drag on its body, not only the handle strip. A scrollable body hands the pull to the sheet only when it is already at the top; otherwise the same drag scrolls the content back first. Native iOS reads the pull from the body ScrollView's top overscroll, because UIScrollView keeps its own pan under a JS responder. Android and plain bodies use the shared drag responder. Web uses touch pull-downs on the body and leaves mouse text selection alone.
