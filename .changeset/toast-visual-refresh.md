---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Toast visual refresh: tone is shown by a tinted circular icon badge with stroke SVG glyphs (neutral = bell) instead of an edge strip plus text glyph; the action becomes an end-aligned tinted pill; cards use the lg radius and secondary description colour. `toastRecipe` gains `tones.*.badge`, `icon.badgeDiameter`/`badgeRadius` and `action.background`/`radius`/`align`; `toneMark.width` is 0 (retired, slot kept). Native renders the badge around the host's `renderToneIcon`.
