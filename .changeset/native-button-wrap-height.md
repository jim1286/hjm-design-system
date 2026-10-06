---
"@hjmds/react-native": patch
"@hjmds/design-contracts": patch
---

Let Native string/number Button labels shrink and wrap within their available width, using the recipe height as a minimum so enlarged text is not clipped. Preserve the label footprint while loading and retain explicit growWithContent for custom visual children. Independent nine-sample guidance validation reproduced the 2x-text clipping on iPhone 17 Pro / iOS 26.5. Align Button and Dialog usage guidance with loading and asynchronous-action contracts; no API migration or publication is performed here.

Native Button now joins string/number children such as `{count}개 공유` into one label. Before, that
array rendered bare inside Pressable and crashed on device with "Text strings must be rendered within a
<Text> component"; Web already accepted mixed text children.
