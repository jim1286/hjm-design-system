# Android actual-screen audit — 2026-09-29

Device: existing `emulator-5554`, spint-store AVD, Android 16 / API 36, 1080×2400. Installed development client `dev.hjm.designsystem.showcase` with Metro 8084; no new emulator, reinstall, or native binary build was used.

## Result and scope

The 83 supported Native registry components were displayed and visually inspected. The per-component ledger is [android.json](android.json): 47 components have a meaningful interaction result, 35 are static/layout presentation, and standalone Radio was observed in its initially selected state. RadioGroup separately exercised selection changes. Ten composition/optional examples also passed their recorded major flows.

This is baseline installed-emulator coverage, not every prop combination, TalkBack traversal, physical-device, release-build, or OS-matrix coverage. FilePicker uses the showcase adapter returning `preview.png`; provider login is an observable callback, not an OAuth login. EmptyState's Create draft slot is visual only because its fixture handler is a noop. Asset is a frame/motion-policy slot; the Fox fixture is not a Lottie playback claim.

The final images named `final-*`, `sheet-fixed-*`, `dock-fullscreen-*`, and `gesture-*-confirm` supersede earlier captures for corrected components. Earlier captures are retained as before-state evidence. Thin progress/slider markers, switches/checks, the small selected calendar date, semantic success colors, and strong primary CTA fills are intentionally retained; broad gray/pale-blue surfaces use white and borders.

## Bugs found and corrected

- GestureSheet never opened from initial closed state. Calling Gorhom 5.2 dismissal before presentation left its status at DISMISSING, which prevented its portal render. The adapter now dismisses only an already presented modal and resets state when native dismissal finishes. Actual first open, drag expansion, text entry, close, and reopen passed.
- Sheet footer remained behind the Android keyboard. Density conversion reported a full-width keyboard 0.000013 dp narrower than the window, rejecting it as floating. A 1 dp horizontal tolerance preserves floating-keyboard rejection while accepting density rounding. Actual typed input and Done dismissal now work with the footer above the IME.
- ImageViewer close overlapped the status bar. The showcase SafeAreaProvider was inside the canvas and measured zero for fullscreen Modal content. It now wraps the registered app root; actual close and navigation controls respect system insets.
- KeyboardDock appeared 276 px above the keyboard. Its Storybook canvas had toolbar/padding space beneath it while sticky movement uses window coordinates. The optional fixture now uses an app-sized fullscreen Modal. Its button bottom aligns exactly with IME top, and Done dismisses the keyboard.
- OTP backing text leaked over and between digit slots after the iOS hit-testing repair. The parent-owned opaque, non-interactive slot presentation now hides Android composing text; 128 → 128645 entry passed without duplicate text.
- The parent also corrected the image fixture, duplicate UploadItem progress copy/padding, and controlled DatePicker fixture. These were rechecked on Android.

## Refresh-related crash

One native Yoga ownership assertion occurred at 19:16 while repository screenshot writes repeatedly triggered Metro FastRefresh. Captures were moved outside the Metro tree. Fresh carousel next and the full scroll → upload cancel → return → accordion expand → next sequence then passed without a crash. This is recorded as an observed development-refresh failure, not a proven fix to Yoga or a claim that all refresh races are resolved.

## Validation

- React Native unit suite: 51 files, 855 tests passed (`hjm-native-final-tests.log`).
- Sheet viewport regression suite: 13 tests passed (`hjm-sheet-viewport-test.log`).
- Optional adapter lifecycle suite: 5 tests passed (`hjm-gesture-lifecycle-test.log`).
- Native showcase TypeScript check passed (`hjm-optional-fullscreen-typecheck.log`).
- Screenshot/XML references in the ledger: 103 PNG references, all present when finalized. Actual UI evidence was reviewed; unit tests are supporting evidence, not substitutes for it.

The only observed JS warning in the final log was the dependency's InteractionManager deprecation. No additional runtime error was observed during the stable final flows.
