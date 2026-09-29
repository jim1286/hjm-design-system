# Native renderer fixes for the 2026-09-30 audits

These fixes cover the defects in the [iOS audit](../ios/IOS-AUDIT.md) and the [Android audit](../android/ANDROID-AUDIT.md) for HJM 1.9.0. Every fix was re-checked on the screen of both existing devices after `pnpm --filter @hjmds/react-native build`:

- iPhone 17 simulator, iOS 27.0, UDID `9ED1529C-5CAA-45CF-B234-E5301C92C89C`. Driven with idb (approved fallback) and `simctl io screenshot`.
- `emulator-5554`, Android 16 / API 36. Driven with adb `input`, `uiautomator dump` and `screencap`.

Both ran the installed dev client `dev.hjm.designsystem.showcase` on Metro 8084. No simulator or emulator was created or booted.

Captures were written to `/tmp` and copied here only after all device work had finished. Files prefixed `ios-` come from iOS and files prefixed `and-` come from Android. The mock regressions are in `packages/react-native/test/native-audit-2026-09-30.test.tsx` and `native-audit-adapters-2026-09-30.test.tsx`.

Two host changes were needed so the fixes could be seen in the showcase:

- `showcase/native/.rnstorybook/preview.tsx` passes `useSafeAreaInsets()` to `HjmNativeProvider`.
- `OptionalAdapters.stories.tsx` routes the Modal's `onRequestClose` through `dismissTopGestureSheet()`.

| # | Defect | Change | iOS on screen | Android on screen |
| --- | --- | --- | --- | --- |
| 1 | Agreement check 2.19:1, name becomes "mixed" | The glyph uses `onPrimary`. The all-row has an explicit label. `mixedCheckboxState` (internal/state) adds `busy:false` so RN Android rebuilds the description when the state leaves mixed. Checkbox and TransferList use the same helper. | White ✓ on `#075985`. AX: `Agree to everything` checked → mixed → checked (`ios-agreement-*.png`) | content-desc `Agree to everything, mixed` → `Agree to everything` (all) → `Agree to everything` (none) (`and-agreement-*.xml`) |
| 2 | UploadItem Cancel unreachable | The row is a plain container. The file text is one element with busy state and status value. Cancel/Retry are separate buttons. | Separate `Cancel` button; tapping it gives "Upload cancelled: Yes" (`ios-upload-ax.json`) | `Cancel` node is focusable and clickable, separate from `profile-photo.png, busy, 64% uploaded` (`and-upload.xml`) |
| 3 | NumberField "20%" | `accessibilityValue.text` falls back to the displayed number | AXValue `2` → `3` | `Quantity, 2` |
| 4 | Sheet/DatePicker under system bars | New `HjmNativeProvider safeAreaInsets` prop. Sheet, Select, Combobox and GestureSheet default to it. DatePicker gains `safeAreaInsets` pass-through. | Sheet content ends at 827 pt (was 861). The calendar's last row ends at 827 pt (`ios-sheet.png`, `ios-datepicker.png`) | Sheet content ends at 2303 px (was 2366). The calendar's last row ends at 2304 px, above the navigation bar at 2337 px (`and-sheet.png`, `and-datepicker.png`) |
| 5 | Switch 8–10 pt high | On iOS the track gets `alignSelf` centre, because RN's iOS Switch composes `alignSelf: flex-start` | Track centre matches the label centre (`ios-switch-before.png` → `ios-switch.png`) | Already centred; unchanged (`and-switch.png`) |
| 6 | Combobox keyboard reopens | Blur on commit, plus a 600 ms focus guard, because iOS restores first responder when the modal dismisses | Busan committed with no keyboard and no reopened sheet (`ios-combobox-after.png`) | Busan committed, `mInputShown=false` |
| 7 | TagsInput keyboard closes | `submitBehavior="submit"` | Tags 42 and 77 added and the keyboard stayed up (`ios-tags-*.png`) | IME action ✓ added "hi" with `mInputShown=true` (`and-tags.png`). See the limitation on hardware Enter below. |
| 8 | TransferList stale ", mixed" | `mixedCheckboxState` (same root cause as #1) | mixed → checked → unchecked | `Available, Select all, mixed` → `Available, Select all` (checked) → `Available, Select all` (unchecked) |
| 9 | Slider changes on vertical scroll | Nothing is written on grant. The move responder waits until dx dominates past 6 pt. A tap still seeks on release. Termination is yielded until the drag is horizontal. | Vertical swipe from the track scrolled the page 524 pt and the value stayed at 72%. Drag gave 95% and tap gave 21%. | Page scrolled 448 px and the value stayed at 72%. Drag gave 98% and tap gave 14%. |
| 10 | Sortable/SwipeActions LTR under RTL | Rows use Yoga `direction`. The grip and label are a row. | 앞으로 right of 뒤로, 보관 right of 삭제, ⠿ at the start (`ios-rtl-top.png`) | Rows start at x=1017/1038 on the right edge (`and-rtl*.png`) |
| 11 | CarouselMotion snap-back | Pan `onEnd` fallback: past half a slide, with no fling back (opposite velocity ≤ 300 px/s), page one slide in the drag direction. RTL-aware. | Paging at 0.3 s and 0.6 s works (`ios-carousel.png`) | Before the fix, 1 in 5 swipes at 450–600 ms snapped back from about 74% (`and-carousel-before-fix-*`). After: 22/22 at 200/300/450/600/1000 ms. A 300 px drag and the end bound still behave as before. |
| 12 | GestureSheet a11y, top overlap, input, back | Container `accessible={false}` with the title as its label. The library background, which is hardcoded as "Bottom Sheet" adjustable, is replaced. The handle is hidden. The backdrop is labelled with `closeLabel`. `topInset` and bottom padding come from the insets. `GestureSheetInput` is framed. `dismissTopGestureSheet()` is added for hosts inside a Modal. | Title, input, text and 닫기 are separate elements with no English labels. The full snap puts the title at 187 pt (`ios-gesture-*.png`). | Tree has `닫기` backdrop, `상세 보기`, `시트 메모`, `닫기`. Back closes only the sheet; the host stays (`and-gesture-after-back.png`). Full snap title at 477 px. |
| 13 | ImageViewer edge-to-edge | Controls and caption sit inside the Container default gutter | Caption and buttons at x=20 pt | Caption and buttons at x=52 px |

## Checks

- `cd packages/react-native && npx tsc -p tsconfig.json --noEmit && npx vitest run`: 55 files, 879 tests passed.
- `node scripts/check-renderer-budgets.mjs` passed. Seven React Native budgets were raised, each with a one-line reason: provider, inputs, number-field, slider, calendar, agreement (+1 module for `internal/state.js`) and data-display.
- `node packages/react-native/scripts/check-metro-bundle.mjs` passed.
- The existing `contract-audit` Switch expectation was updated from `style: undefined` to `{ alignSelf: "center" }`.

## Not fixed or not claimed

- **Hardware Enter on Android TagsInput.** `adb keyevent 66` still hides the IME. RN's `ReactEditText.onKeyUp` hides the keyboard on a hardware Enter for single-line inputs, whatever `submitBehavior` says. The on-screen IME action key keeps it open.
- **Shared transition Detail + Android back.** This was not changed in code. Its root cause is the RN Modal host, the same as GestureSheet's. The host owns its navigation container, so it must route `onRequestClose` to `navigation.goBack()` while it can go back. This is documented in `packages/design-contracts/docs/optional-adapters.md`. The showcase fixture was not changed.
- **CarouselMotion swipe distance.** A short, slow drag of about 28% can still page, because of the library's own velocity rule. This did not change with the fix.
- **What these checks do not cover.** The carousel was tested with emulator-injected swipes, not a physical fling. There was no spoken VoiceOver or TalkBack pass; the uiautomator and idb trees stand in for it. No Release builds were tested.
