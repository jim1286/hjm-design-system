# Gravity Letters verification

The checks below record the initial implementation checkpoint. The [later Native integration audit](../native-visual-integration-2026-10-01/README.md) adds three-state device captures and selected interaction proofs, and supersedes the earlier unresolved overlay-budget/full-gate status. Native screen-reader and physical-device performance claims are not inferred from those captures.

2026-10-01, local source only. Web Chromium viewport 390 × 844.

- Default/Dark/LargeText: explicit replay starts seven glyph animations; all finish within 900ms; stop cancels them; no horizontal overflow. Screenshots were captured at rest and large-text rendering reviewed.
- Storybook `motion:reduced`: zero animations after replay. Storybook's explicit motion global overrides OS emulation, so OS emulation alone is not this fixture's reduced-motion control.
- Contract test preserves emoji graphemes and rejects excessive/invalid units.
- Browser renderer test covers inactive defaults, replay cancellation, reduced motion and decorative semantics.
- Native mock test covers animation bounds/bypass and accessibility hiding. Actual Native rendering remains unverified.
- Build, Web showcase check (23 tests), Native showcase check (9 tests), API map, both import-graph budget checks and documentation links passed.

Measured optional import graphs (Node 26.9.0, gzip level 9; external packages excluded): Web 4 modules / 19,763 raw / 5,556 gzip bytes; Native 4 / 23,498 / 6,194; contracts 1 / 775 / 509.


## Native actual motion follow-up

Existing iPhone 17 / iOS 27 development client, Metro 8187. Device Hub had returned
`timeoutReached` (-10005) in the preceding gallery check; idb taps and simctl recording
were used on the same already-booted device, without a binary build or new simulator.

- `native-replay-stop.mp4` records replay, an early stop, a complete replay, and another
  replay. `native-motion-events.json` records host action times; those clocks are not
  assumed identical to encoded video timestamps.
- Decoded 30 Hz samples in `native-motion-frames.json` measure the dark-pixel bounds of
  the decorative glyph region (crop x=40, y=380, width=450, height=240). At 1.900s the
  first motion starts; at 2.100s the stop restores the resting bounds (134..196) and
  those bounds remain fixed through 3.700s. The next replay moves at 3.733s and settles
  at 4.367s; replay again moves at 5.433s and settles at 6.067s. These frame samples
  prove visible motion/stop/replay, not physical-device frame-rate or GPU cost.
- `native-motion-contact-sheet.png` was visually reviewed alongside the full resting
  screenshot. The development refresh banner is outside the inspected effect region.
- `native-motion-accessibility.json` exposes the readable heading once and both named
  buttons; the individual decorative glyphs are absent. This is accessibility-tree
  evidence, not manually heard VoiceOver speech.
- Default/Dark/LargeText resting states and reduced-motion mock coverage remain in the
  earlier integration evidence. No implementation change or new test was needed for
  this actual-host verification; the existing full gate remains the source baseline.
