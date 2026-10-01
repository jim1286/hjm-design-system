# Native visual integration — 2026-10-01

Existing iPhone 17 simulator, iOS 27.0, 402 × 874 points. The installed HJM development app used the existing Metro service on port 8187; no native rebuild or additional simulator was created.

Device Hub automation repeatedly timed out. These checks used the existing simulator through idb accessibility/taps and simctl screenshots as a disclosed fallback.

- Gravity Letters Default rendered: `gravity-default.png`.
- Liquid Toast Default: selected the role-based story, pressed 알림 띄우기, observed the title, description and independent close button in the accessibility tree and the fully expanded card in `liquid-toast-default.png`.
- Dark: the initial borderless card blended into the canvas. Using the existing surfaceAlt token fixes its separation without a stroke; the corrected expanded card is visible in `liquid-toast-dark.png`. Targeted Liquid Toast regression: 6 tests passed.
- Emitted Liquid Toast + provider graph before/after that theme branch: 17,225/17,479 raw bytes, 4,975/5,081 gzip bytes (Node 26, level 9). The explicit entry budget adds 120 gzip bytes for measured +106; raw/module ceilings stay unchanged.

This evidence covers those views only. iPhone 12, all other stories, animation timing and product-installed versions remain separate verification work.

Development limitation: Fast Refresh of the toast renderer while its store was mounted produced `Cannot use a disposed Toast store`. A fresh app launch succeeded and was used for visual checks; the store lifetime is now guarded across effect replay. Strict Effects regression proves live publish after replay and exactly-once interruption after real unmount. A later renderer rebuild no longer produced a red screen, but it reset the story fixture, so state retention under every Fast Refresh boundary is not claimed.

LargeText (200%) after a fresh launch: title and description wrap inside the expanded card; the corrected close glyph is fully visible in `liquid-toast-large-text.png`. The toast overlays the story content, as expected for an overlay.

Registration/build checks: Native showcase 10 tests and Web showcase 27 tests passed. Web static build completed; static verification confirms 103 canonical stories, while individually registered optional stories are excluded from the canonical exact-count calculation. Source registration checks still verify their role and three states. Renderer graph budgets, workspace/evidence/docs/governance/API-map checks passed separately after the full command stopped at the corrected budget/static checks.

Store replay repair: full Native suite passes 903 tests. The emitted feedback module measured 43,805/44,372 raw bytes and 9,392/9,570 gzip bytes before/after the lifetime guard (before the later local variable readability rename). Its shared-module allowance adds 600 raw/200 gzip bytes, with module count unchanged.

The complete `pnpm ci:check` command passed after the toast lifetime and static-story fixes (contracts 912, Web SSR 180/browser 976, Native 903, Native showcase 10, Web showcase 27). The subsequent Native-only typography loader change separately passed the Native showcase check.

## Native typography loading

The official Satoshi Regular OTF (same Fontshare candidate documented in the Fontshare evidence) was served from a temporary loopback-only server outside the repository. The installed app fetched it successfully after replacing the failed dynamic chunk import with guarded require and reloading the development app.

- Invalid address: error state with system fallback; no crash.
- Valid local HTTP font: `HjmTypographyCandidate1`, `status: ready`, after Expo Font reports registration complete (`typography-loaded.png`).
- Candidate preview visibly uses the registered Latin face alongside Korean fallback (`typography-comparison.png`). This checks appearance/registration, not per-glyph CoreText font attribution or a real bold weight file.
- Reset button: `family: null`, `status: empty`; registration remains process-local by Expo's contract.
- Native showcase typecheck and all 10 tests pass after the loader change. No font binary was added to the repository; the temporary serving process was stopped.

## Individual component matrix and device corrections

The 20 optional component entries audited by `component-stories.test.ts` were opened through their actual Storybook IDs in Default, Dark and LargeText. The 60 screenshots and accessibility snapshots are in `components/` (state suffixes: `default`, `Dark`, `LargeText`). All captures were visually inspected; this proves those initial viewports, not every offscreen state or animation frame. The blue React Native development “Refreshing…” banner obscures the top strip, so unobstructed heading/safe-area verification remains pending.

Device inspection found and corrected three concrete problems:

- ReactionPicker supplied sibling raw strings to Button, bypassing its Text wrapper and producing a blank/error state. One composed label now renders; selecting and clearing were verified by the native Selected trait.
- Tabs panels with `flex: 1` collapsed inside an auto-sized Stack. `flexGrow`/`flexShrink` retain intrinsic panel height. The today and saved panels render, and changing direction preserves the selected panel.
- At 200% text size, DurationField's two-column basis clipped `25` to `2`. Scaling its wrapping basis with text size makes the fields occupy separate rows; the recaptured LargeText screenshot shows `25` in full.

`components/interaction-results.json` records actual native taps for reaction selection/clearing, duration increment, notification read/add, tabs selection/RTL, folder opening, Blobatar expression/start/stop and VoiceNote play/error/retry. VoiceNote is a playback-state fixture, not a real audio player. Theme Studio sharing, remaining interactions and page-pattern verification are still separate pending work.

After these fixes: Native build and showcase typecheck/10 tests, the three targeted renderer test files (5 tests), renderer graph budgets, documentation links and whitespace checks passed. The earlier full CI result predates these three fixes; no new full-CI or product-release claim is made.

## Page patterns and studios

All eight entries (Onboarding, Search, Dashboard, Landing, Profile studio, Family drawer, Theme Studio and Typography Studio) were opened in Default/Dark/LargeText. Screenshots and accessibility snapshots use the corresponding names in `components/`. Initial viewports were visually inspected; long content uses the existing ScrollView. Theme Studio's invalid raw JSX space was removed after real-device warning evidence, and both studio matrices were recaptured after the correction.

Verified native interaction paths now include onboarding topic selection/completion/reset; family drawer next/back/finish; dashboard empty month and return to the populated month; memo filtering and opening/closing a search detail; profile avatar change and applying it. Two automation taps initially landed while scrolling was still settling; repeating the tap after the screen was stationary confirmed the expected result.

Theme Studio export opened the native iOS share sheet. Copy placed exactly the applied light primary override into the simulator pasteboard; see `theme-export.json` and `components/ThemeStudio-share-sheet-interaction.png`. No external share was sent. These device paths do not establish Android parity, performance budgets or all remaining motion states.

Landing follow-up exposed the form underneath the docked iOS keyboard. The example now opts into Sheet's existing keyboardAvoidance/scrollable contract; no new keyboard engine was introduced. `Landing-input-interaction.png` shows the input and submit button above the keyboard, and `Landing-added-interaction` verifies the `123` sample in the resulting list. Search and Family drawer now also opt into scrolling for enlarged content.

Latest complete `pnpm ci:check` passed after the reaction/tabs/duration and studio/form fixes: contracts 912, Web SSR 180, Web browser 976, Native 903, Native showcase 10, Web showcase 27; static verification 103 canonical stories and 13 navigation pages. This is local execution, not remote CI or publication.

ThinkingOrb Fluid/Matrix and OtpField Default/Dark/LargeText were additionally opened and captured. The dev banner obscures part of the small orb at the top, so this does not complete unobstructed orb visual/performance verification. OTP input behavior still needs its device interaction follow-up.

## Motion cost and real pause

Measured the existing Debug simulator process with eight one-second `ps` samples after a two-second settle for each condition. Raw CPU/RSS samples are in `simulator-motion-cost.json` and `simulator-blobatar-pause-after.json`. This is macOS simulator-process cost, not GPU frame timing, thermal behavior or physical-device battery measurement.

| Condition | Median CPU before | Median CPU after |
| --- | ---: | ---: |
| Blobatar stopped | 29.05% | 2.05% |
| Blobatar active | 29.05% | 24.05% |
| Blobatar stopped again | 26.95% | 2.20% |
| Four EffectSurface examples static | 2.10% | unchanged |
| Four EffectSurface examples active | 10.20% | unchanged |
| EffectSurface host backgrounded | 0.00% | unchanged |

Inspection of installed Blobatar 2.7.0 found an unconditionally active `useFrameCallback` even when animate=false. The Native adapter now unmounts the animated renderer when inactive, hidden, reduced or backgrounded, using the upstream static renderer with identical seed/expression props. Re-enabling restarts its idle clock. The regression checks actual absence of the animated subtree, not merely an animate prop. Native package check passes all 903 tests and the 56-family Metro probe; optional entry and all renderer budgets pass. Native showcase check still passes 10 tests.

OTP device interaction verifies both styles share `123456`, error/recovery retain the value, and the example supports keyboard-aware scrolling. ThinkingOrb Fluid and Matrix were recaptured centered and fully visible, resolving the banner occlusion for those two views. The blue development banner still affects other top-aligned stories.

A fresh `pnpm peers check` identifies compatibility work separate from these passing gates: renderer test RN 0.81.6 against Reanimated/Worklets requiring 0.83–0.86; Native Storybook 10.4.4 against transitive Storybook UI 10.6.0; and UI 10.6.0 requiring safe-area-context 5.8.0 while the native binary uses 5.7.0. No dependencies or installed binary were changed during this audit.

## Peer alignment follow-up

The RN test graph now uses RN/metro-config 0.86.2 and Metro 0.84.3, matching the existing showcase host and Reanimated/Worklets requirements. The Native Storybook transitive UI/theming/common modules are pinned to 10.4.4 and their React renderer to 10.4.0, preserving installed safe-area-context 5.7.0; Web's Storybook stays 10.6.0. The exact registry manifests supplied the compatibility evidence. No native binary was rebuilt.

Fresh installation (`--ignore-scripts`) and `pnpm peers check` completed with no peer issues. The central HJM library policy static check passed (6 manifests, 65 libraries). Native production Metro probe now includes 673 modules / 1,393.9 KiB raw / 340.8 KiB gzip and remains below unchanged ceilings. The HJM-only Metro service was restarted with a clean cache after old and new dependency copies caused native-view duplicate registration during Fast Refresh; the private proxy URL and port 8187 were retained.

The complete local `pnpm ci:check` passed again after peer alignment, including all package tests, both showcases and the static Web build. Fresh iOS bundling completed with 5,017 modules; the existing app reopened centered Fluid/Matrix stories without duplicate-view errors. The continuing blue development refresh banner is still a preview limitation and is not hidden in captures.
