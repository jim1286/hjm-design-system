---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Screen footer bottom inset is max(16, safe area), never 16 + inset. Native `ScreenLayout` gains `safeAreaBottom`: the last region (footer, else body) pads `max(16, safeAreaBottom)` (16 while the keyboard is open) instead of the host's bottom SafeAreaView edge plus 16. A `BottomCTA` inside the footer adds only the part of its `safeAreaBottom` the footer does not already cover, on Web (`max(padding, env())` footer) and Native alike, so the button-to-edge gap is 16 without a home indicator and 34 with one, not 50 (2026-10-17 "전체적으로 버튼 아래 여백이 많아").
