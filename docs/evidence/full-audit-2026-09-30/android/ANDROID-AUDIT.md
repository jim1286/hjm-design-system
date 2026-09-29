# Android actual-screen audit — 2026-09-30

Device: the existing `emulator-5554` (spint-store AVD, Android 16 / API 36, 1080×2400 @ 420 dpi). The installed development client `dev.hjm.designsystem.showcase` stayed attached to the shared Metro on port 8084, which a concurrent iOS audit was also using. No new emulator, reinstall or native build was used. Input came from adb (`input tap/swipe/text`, `motionevent` for the long-press drag). The accessibility tree came from `uiautomator dump`, and motion came from `screenrecord` frames. Captures were written to `/tmp` and copied here only at the end, so they could not trigger the 9/29 FastRefresh crash.

The baseline is [2026-09-29 ANDROID-AUDIT](../../full-audit-2026-09-29/ANDROID-AUDIT.md). The per-item ledger is [android.json](android.json).

## Counts

| | Count |
| --- | --- |
| Canonical Native components rendered | 83 / 83 |
| Screenshots visually reviewed (images opened, not only XML) | 83 / 83 |
| Interaction verified on screen | 47 (same set as 9/29) |
| Static or layout, visual only | 35 |
| Selected state only (standalone Radio) | 1 |
| Optional adapters, experimental adapters, patterns, scenario stories | 18 entries |
| Defects | 7 (D1–D7) |
| Confirmed regressions versus 9/29 | 0 |

"No confirmed regression" means that nothing which passed on 9/29 failed this time. D1, D3, D5 and D6 are on paths 9/29 did not exercise, so they cannot be called regressions or non-regressions. D2, D4 and D7 were already visible in earlier evidence.

Android back was checked on every overlay:

- **Closed only the overlay:** Dialog, AlertDialog, Sheet, Select, DatePicker, Menu, InputSheet (the first back only hides the IME), ImageViewer, context menu, and the adapter hosts themselves.
- **Left the app:** Toast and Liquid Toast. Both are non-modal, so this is expected.
- **Did not work as expected:** D5.

## Defects

| ID | Component | Repro | Expected | Actual | Evidence | vs 9/29 |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Agreement | Tap Terms of service so the all-row becomes mixed. Then tap it again, or clear everything. | The all-row content-desc stays "Agree to everything". | The content-desc becomes literally `mixed` and stays `mixed` when everything is checked and when nothing is. The label is lost. | [agr-mixed.png](android/agr-mixed.png), [xml](android/agr-mixed.xml) | Mixed state was not exercised on 9/29 |
| D2 | TransferList | Check Walk, tap Add, then toggle Meal. | The select-all description drops ", mixed". | `Available, Select all, mixed` stays when all or none are checked. | [in-transfer2.png](android/in-transfer2.png) | Pre-existing (same in 9/29 `transfer-moved.xml`) |
| D3 | Slider | Start a vertical page scroll with the finger on the track. | The page scrolls and the value does not change. | The page scrolls 361 px and the value jumps 50% → 88%. The PanResponder grant writes the value before the ScrollView takes over. | [in-2.png](android/in-2.png) | Not tested on 9/29. `slider.tsx` is unchanged since publish |
| D4 | DatePicker (also the gallery Sheet, Select/Combobox) | Open Visit date. Open sheet. | Content clears the 63 px navigation bar [2337–2400]. | Calendar row 28 [2251–2367] and "Sheet content" [2313–2366] sit next to the gesture handle. DatePicker has no way to pass `safeAreaInsets` through, and the gallery Sheet omits the prop. | [in-dp-open.png](android/in-dp-open.png), [ov-sheet.png](android/ov-sheet.png) | Pre-existing (identical bounds on 9/29) |
| D5 | GestureSheet (the same root cause affects the shared-transition fixture) | Optional Adapters → 시트 열기 → Android back. | Back closes the sheet only. | Back closes the whole enclosing RN Modal host. GestureSheet's BackHandler never fires inside a Modal. On the shared-transition Detail screen, back also closes the host instead of popping to the list. | [before](android/opt-gs-before-back.png), [after](android/opt-gs-after-back.png), [st-back.png](android/st-back.png) | Not tested on 9/29 |
| D6 | CarouselMotion | Swipe 800 px horizontally on the slide. | The carousel pages. | Swipes paged 0/4 times at 200–600 ms, 3/8 at 300 ms and 2/2 at 1000 ms. A failed swipe moves about 40% and snaps back. The input was injected by adb, so a physical-device fling is still untested. | [ia-cm-frames.png](android/ia-cm-frames.png), [mp4](android/ia-carousel-motion.mp4) | New adapter |
| D7 | Sortable, SwipeActions under provider RTL | Interaction Adapters / Reduced Motion (dark, RTL, 200%). | Button rows start at the right edge. | The rows start at the left (x = 63 / 42) while the text is right-aligned. | [rm-0.png](android/rm-0.png), [rm-1.png](android/rm-1.png) | Android RTL was not covered before. The iOS `native-reduced-top.png` shows the same layout |

## Passed extensions (summary)

- **Patterns:** Cascader, Rating (whole and half steps), TimeSelection, InputSheet and NotificationSettings all passed their flows.
- **Carousel pattern:** Manual paging works, and autoplay stops at the end. Pause and resume work.
- **Optional adapters:**
  - ImageViewer loads the image, double-tap zooms, and close/back close only the viewer.
  - Context menu: long-press shows save/delete and back closes it.
  - KeyboardDock sits flush on top of the IME at 1517 px, the same as 9/29.
  - GestureSheet opens, expands, accepts text, and closes by button, pan-down or backdrop.
- **Experimental adapters:**
  - Sortable reorders by buttons and by long-press drag.
  - SwipeActions reveal the actions without running them. Archive runs once, and the explicit menu toggles.
  - ContentTransition cross-fades and keeps ZWJ emoji intact.
  - Celebration shows teal, orange, purple and blue particles, and they are suppressed under reduced motion.
  - The shared transition expands from the card and returns.
- **Liquid Toast:**
  - The capsule morphs into the card, and the action opens its result.
  - A burst of three queues one at a time, and swipe-up dismisses.
  - LongCopy wraps correctly, and ReducedMotion appears in a single frame.
- **ThinkingOrb:** All states render in light and dark. Frames change while animating and stay identical when paused.
- **QRCode:** The screenshot decodes to `https://example.com/한글`.

## Observations (not counted as defects)

- **SwipeActions:** When a row is revealed, its content slides fully out of view. The earlier 9/30 adapter capture shows the same.
- **Storybook host:** The canvas does not scroll focused inputs above the IME (OTP, Combobox). This is a host limitation, not a component result.
- **TagsInput:** Enter also dismisses the IME. The IME auto-capitalises the first letter.
- **Autoplay:** Resuming at the last slide shows 멈추기 ("pause") but cannot advance, because it does not wrap.
- **ImageViewer:** The controls run edge to edge and the caption touches the screen edge. This is unchanged from 9/29.
- **Metro connection:** The dev client briefly lost its Metro websocket and reconnected. There was no FATAL, Yoga assertion or JS error during the run.

## Limitations

- Emulator only. This is not a physical device, a release build, or a spoken TalkBack pass. uiautomator content-desc is a stand-in for what TalkBack would announce.
- GestureSheet content is not in the uiautomator tree, so its steps were judged from screenshots.
- `screenrecord` only emits changed frames, so the frame counts show that motion exists. They are not frame-rate measurements.
- Host load average peaked at 54. The D6 swipe results were repeated to separate real failures from load-related flakiness.
