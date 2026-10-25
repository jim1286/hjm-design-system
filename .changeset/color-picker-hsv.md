---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

ColorPicker edits colour as HSV on Web and Native: a saturation/brightness area, hue and opacity bars, a HEX field with a round preview and preset swatches. `labels` now take `hue`, `saturation`, `brightness` (and `presets` with presets) instead of `color` and the Native RGB channel labels. The new companion `ColorSwatchPicker` picks one of several round swatches with radio semantics, in a wrapping group or a single scrolling toolbar row. Contracts add `pickerHsv`, `pickerHexFromHsv`, `pickerHueColor` and `pickerHueStops`. Native ColorPicker requires `react-native-svg`.
