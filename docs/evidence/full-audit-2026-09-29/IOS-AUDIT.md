# iOS actual-screen audit — 2026-09-29

Final evidence bundle; captures were collected outside the Metro watch tree and copied after device interactions finished.

## Verified scope

**83/83 implemented canonical Native components have reviewed iOS screens**, including final light-theme canvas styling. **47 components have meaningful action evidence; 36 are presentation/layout components with no separate required action.** Four optional adapters also have reviewed screen/action evidence. Five additional compositions passed their recorded main flows; see [composition evidence](ios-compositions.json).

The underlying ledger is [ios.json](ios.json). It preserves earlier action evidence separately from `latestWhiteVisual`, so a new static screenshot does not silently revalidate a previous interaction. `visual` is based on actual screenshot review, not file naming or successful screenshot capture.

Environment recorded by the controlling agent: installed full debug showcase on **iPhone 17 simulator, iOS 27.0**, Metro port8084. Device Hub connection timed out; the controlling agent used the documented idb/simulator fallback. The evidence reviewer read screenshots only and did not control the simulator or build native code.

## Major observable results

- Field editing, search clear, password reveal, OTP128456, quantity increment and slider change were verified by the controlling agent and recorded in the original ledger.
- February2027 date picker selection commits its displayed value; date-range selection marks1–4. Separate Calendar navigation reaches October2026, and October14 selection displays2026-10-14.
- Tags removal, @skyline mention selection, moving Walk to Chosen, checkbox/radio groups, switch, chip, segmented control and Korean→English selection have before/after evidence.
- FilePicker reference callback displays `preview.png`; City commits Busan; menu selection displays `Last action: edit`. These replaced earlier screenshots that did not show a completed selection.
- Standalone checked Radio remains checked when tapped, as appropriate for a radio control.
- Navigation changes Recent→Popular and Home→Profile; refresh and load-more callbacks update visible state.
- Carousel changes1/2→2/2; selecting Morning loop updates row feedback; Accordion/Collapsible expose content; upload cancellation changes No→Yes.
- Toast is shown and dismissed. Dialog/AlertDialog/Sheet open and close; the input Sheet keeps456 visible and its Done action reachable above the keyboard.
- FloatingActionButton opens entry, accepts123 and adds123 at the top of the list.
- Masonry shows nine varied-height cards. VirtualList scroll changes visible items1–7 to9–14.
- The actual QR screenshot raster was independently decoded with jsQR to `https://example.com/한글` ([QR decode](ios-qr-decode.json)).
- ThinkingOrb shows all nine states. This still-image review does not claim new temporal or reduced-motion validation.
- Asset owns framing and animation policy, not a third-party Lottie player; the Fox child is valid static slot content. Third-party media playback is not claimed.

## Final visual direction

Latest screenshots confirm white canvas interiors in light theme, outlined selections and neutral secondary actions, while primary actions such as Create draft retain their strong blue fill. Blue focus borders and compact state marks remain. Meaningful status colors, actual image content and platform-owned system material remain under their own contracts.

All83 `latestWhiteVisual` entries are complete. In particular, final Agreement shows checked controls and `Opened detail: terms`; NumberField/Slider show2/72%; Mentions has a white input frame; Asset's Fox frame is fully visible; Toast is white.

## Optional adapters

| Adapter | Evidence |
| --- | --- |
| Gesture Sheet | Opens half-height, keyboard entry789, parent-observed drag, closes/reopens at half-height |
| Image Viewer | Actual image loads, Close dismisses; single-image previous/next are disabled |
| Keyboard Dock | Entry321, Done above IME, dismissal retains321 |
| Native Context Menu | System menu opens; Save commits visible `save` state |

## Remaining scope and limits

Rating 4-point save, TimeSelection 09:05 confirmation, Cascader Seoul/Jongno selection/reset, NotificationSettings weekly enable/save, and LiquidToast publish/action/close passed. The final OTP wrapper was rechecked with actual entry128 to128645 and keyboard dismissal. This report does not claim physical-device testing, VoiceOver testing, every OS/device/theme/text-size permutation, system photo permissions, provider integration, package publication, store submission or production release. A still image does not establish animation timing; a debug showcase pass does not establish Release-binary first-launch compatibility.

Earlier non-evidence examples were deliberately rejected: `menu-selected` still showed Last action None; `combobox-selected` did not expose a selected value; `file-select` showed attachment None; `white-agreement.png` displayed the wrong story. Their later verified replacements are cited in the ledger.
