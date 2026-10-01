# Typography studio — 2026-10-01

Web/Native Storybook Foundations/Typography Studio, Default/Dark/LargeText. HJM text sizes/weights stay in use; only specimen font family changes. Samples contain Korean, Latin, numerals, currency, punctuation and a long heading. Source/license metadata accompanies the candidate settings; font binaries are not exported or bundled.

Web accepts a local file as ArrayBuffer with FontFace, shows loading/failure state and compares to the default family. Sequence guards prevent a slower old request from registering after a newer selection/reset/unmount. Registered faces are removed on replacement/reset/unmount. Failure returns to the default typeface. The system fallback may render Korean missing from the candidate; successful loading is not proof of Korean coverage.

[Browser evidence](browser.json) uses locally installed Arial.ttf solely for execution proof; it was not copied into the repository. All three states verify loaded FontFace, replacement by invalid data, previous-face removal, failure fallback and reset. This does not verify a Fontshare candidate license or glyph coverage. Both showcases passed their checks.

Native now loads a user-supplied OTF/TTF URI through guarded Expo Font registration and shows the candidate only after `isLoaded`. Actual Satoshi loading, Latin rendering with Korean fallback, invalid-address recovery and reset are verified in the [Native evidence](../native-visual-integration-2026-10-01/README.md). Font binaries remain outside the repository. Default/Dark/LargeText initial studio views have also been captured; these are not per-glyph font attribution proofs.

Fontshare's [official license page](https://fontshare.com/licenses/sil-ofl) distinguishes open-source and proprietary freeware licenses. Candidate-specific rights must be checked from the selected font's license; this workbench does not assign one blanket license or redistribute fonts.
