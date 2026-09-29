# Data layout implementation verification — 2026-09-29

Masonry, VirtualList and QRCode now have Web/Native renderers. Native Cascader uses
two existing Select controls and resets descendants when the ancestor changes.
The user excluded duplicate/composition replacements; no new TimePicker/Rating
primitive or Chart/AppProvider/BorderBeam/Utility candidate was added.

## Automated verification

Canonical `pnpm ci:check` exited 0 (`/tmp/hjm-ci-final-attempt.log`): contracts 888,
Web SSR 177 + Chromium 909, Native 852, Web showcase 19, Native showcase 1.
Contract/renderer graph budgets, Metro production fixture, evidence/workspace,
doc links, governance and both showcase checks passed. Static Storybook verifies
108 canonical stories: 100 Web renderers and 8 contract-only.

After the canonical run started, installed iOS observation exposed Native
VirtualList's ScrollView flexGrow default overriding its declared viewport height.
The renderer now disables flex growth/shrink, with a focused regression (3 tests
passed). The final Native full check also exited 0: typecheck, 852 tests, build and
the Metro production fixture (`/tmp/hjm-native-final.log`).

## Installed host observations

- Existing iPhone 17, iOS 27 simulator, full development showcase/Metro 8084.
- Masonry: nine variable-height cards render in two nonoverlapping columns, source
  labels retained. `ios-masonry.png`.
- QRCode: visible black/white code and alternative action. `ios-qr.png`.
  Automated jsQR tests separately decode ASCII and Korean/emoji matrices.
- VirtualList: fixed 400-point viewport and scroll from items 1–7 to items 6–11
  confirmed (`ios-virtual-viewport.png`, `ios-virtual-scrolled.png`).
- Cascader: city then district selection and ancestor-change clearing confirmed
  (`ios-cascader-selected.png`, `ios-cascader-reset.png`).
- Android emulator-5554 is responding unreliably and reported missing `activity`
  service. No new data-layout Android runtime pass is claimed.
- Device Hub connection failed earlier; simctl screenshots and idb operate the same
  existing device. No physical-device or screen-reader certification is implied.

Commit/PR, version/publication and consumer migration remain pending.

## Collection sheet refinement

The user found the large region-selection close button visually distracting.
Select and Combobox now share a header close control, with the localized dismiss
label retained for accessibility and a 44-point minimum target. iOS screenshot
`ios-region-header.png` shows the revised region sheet. Native full check passed:
typecheck, 853 tests, build and Metro; renderer graph budgets passed too.
Cascader city/district selection and ancestor-change clearing were observed:
`ios-cascader-selected.png` and `ios-cascader-reset.png`.

## Final pre-release check

After the viewport and collection-header fixes, `pnpm release:check` exited 0
(`/tmp/hjm-release-precommit.log`): contracts 888, Web SSR 177 + Chromium 909,
Native 853, Web showcase 19, Native showcase 1 (2,847 tests). The complete
canonical pipeline and package artifact validation both passed. Android new-story
runtime verification remains pending due to the existing emulator transport/guest
service failure; reconnect and a reboot request did not restore shell responses.
