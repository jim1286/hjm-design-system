# Fontshare candidate verification

2026-10-01. Candidate: Satoshi Regular, official family ZIP downloaded from
[Fontshare](https://www.fontshare.com/fonts/satoshi). The files were used from
`/tmp` for comparison and are not stored in this repository or published packages.
`browser.json` records the WOFF2 hash and actual Chromium platform-font use.

The official page identifies Satoshi as closed source under the
[ITF Free Font License](https://www.fontshare.com/licenses/itf-ffl), whose current
page was reviewed as version 2.0 dated 17 Aug 2026. It permits ordinary application
and web use, while modification and independent redistribution have restrictions.
This verification does not relicense the font or package it as HJM open source.

Default/Dark/LargeText were loaded from the real WOFF2 in Web Typography Studio
at 390 × 844. DevTools reported **Satoshi-Regular for 26 glyphs** and **Apple SD
Gothic Neo for 12 glyphs** in the mixed-script heading. No horizontal overflow.
The default screenshot was visually reviewed. Satoshi is therefore a Latin
candidate paired with Korean fallback, not evidence of a Korean-capable font.
No default product font was changed.

## Initial Native checkpoint (superseded by device follow-up below)

Native Typography Studio now performs explicit URI loading with the SDK-matched
expo-font and reports ready only after `isLoaded`. Prior static family/status args
could imply a loaded font without registration; those arguments were removed.
The existing Podfile.lock includes ExpoFont 57.0.4, Native showcase checks passed
(10 tests), and the complete current iOS Metro bundle returned HTTP 200
(25,879,767 bytes). Library policy static checks passed. These do not prove actual
native font loading/rendering. Device Hub timed out again; the existing iPhone 17
on iOS 27.0 was showing another task's BurnTok profile screen. Usage coordination
was requested without creating/rebooting devices or interrupting that UI.

## Native loaded-font follow-up

The existing iPhone 17 / iOS 27.0 developer host loaded the actual Satoshi Regular OTF
from a temporary localhost server. Default loading, failure fallback and reset were
verified in the [Native integration audit](../native-visual-integration-2026-10-01/README.md).
The remaining Dark and LargeText specimens were loaded and inspected on 2026-10-01;
[record](native-loaded-states.json), [dark](native-loaded-dark.png),
[200% text](native-loaded-large-text.png) and adjacent AX snapshots record ready status
and the registered candidate family. The 200% mixed Korean/Latin heading and number
specimen wraps within the card and remains scrollable. This does not establish
per-glyph font identity on Native or a separate bold face from a Regular font file.

Both Native studios now adjust scroll insets for the keyboard, retain action taps
and dismiss the keyboard on drag. The enlarged-font URI was entered through the
actual iOS keyboard and the load action remained reachable after scrolling.
Native showcase generation, typecheck and 11 tests passed after this adjustment.
No font binary was added to the repository and no product default font changed.
