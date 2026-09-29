# Interaction adapter adoption — 2026-09-30

Scope: all six requested capabilities in the local HJM checkout, as explicit **experimental optional entries**. Existing unrelated dirty work is preserved. This record separates source adoption, automated checks, browser observation and installed iOS development-client evidence. It does not record npm publication or product rollout.

## Observed result for each capability

| Capability | Browser | Existing iPhone 17 / iOS 27.0 development client |
| --- | --- | --- |
| SortableCollection | Pointer drag to last position; keyboard commit/cancel; explicit reorder buttons and Korean announcements | Long press + drag moved forest to last; reorder buttons; localized ordinal accessibility values |
| SwipeActions | Archive button, disabled delete, async dedupe/error regression | Swipe reveals actions without executing them; archive closes the row; explicit actions menu works; closed actions excluded from accessibility |
| ContentTransition / TextTransition | State replacement, Korean/family emoji, focus restoration regression | Current text replaces previous text; Korean/family emoji preserved; reduced-motion scenario works |
| CarouselMotion | Previous/next, controlled selection, inactive slide exclusion | Button and horizontal swipe selection; vertical parent scrolling; next disabled at last slide; return from background remains interactive |
| Celebration | Confirmed-success event, event dedupe regression, reduced-motion suppression | Visible particles recorded, then removed; success text remains; repeated event and reduced-motion scenario exercised |
| Shared screen transition | Not offered on Web | Source → detail; button back; short vertical gesture cancels; long gesture returns; reduced-motion gesture disabled while button back works |

Native control: Device Hub was running but automation returned `timeoutReached`. The user explicitly approved **idb fallback** against the already booted simulator, UDID `9ED1529C-5CAA-45CF-B234-E5301C92C89C`, bundle `dev.hjm.designsystem.showcase`. The existing app consumed `expo start` on 8084. No simulator was created/booted and no native binary was rebuilt.

Both renderers were exercised with dark theme, RTL and 200% text in the reduced-motion scenario. The browser viewport was 390×844, document width stayed 390, and the temporary viewport override was reset afterward. Native captures use the simulator's 402×874-point surface. This is accessibility-tree inspection, not a spoken VoiceOver/TalkBack audit.

## Problems found and corrected during real UI validation

- Web focused content was removed before effect cleanup could detect it. A keyed callback ref now captures focus before removal; a failing Chromium regression passes after the fix.
- Web narrow/large-text sortable rows squeezed labels into single-character columns. Handle/label and wrapped action rows now have separate layout space. Native action rows also wrap.
- pnpm peer instances split the host navigation context and Screen Transitions store, causing `LinkingContext`/`DescriptorsStore` failures. Showcase Metro resolves these engines from the host.
- Screen Transitions loaded optional teleport JS even when its native views were not in the existing client, showing `Unimplemented component: PortalHostView`. The shipped source/ESM/CommonJS patch probes both native views and keeps inline fallback when absent. A real-module regression covers present/absent native views. Teleport is no longer a direct HJM/showcase dependency.
- Retained route content and reset swipe actions remained in the accessibility tree. `SharedTransitionScreen` supplies an opaque HJM surface and hides unfocused routes; swipe actions hide the inactive copy. Native ordinal values use localized text instead of percentages such as 150%.
- Confetti mounted inside scrolled content was effectively offscreen, and atlas startup consumed the short playback window. The showcase now mounts a viewport overlay; playback starts at the engine callback, with a separate five-second startup watchdog. A compact spawn band and faster fall make the bounded effect visible. Delayed-start/stalled-start regressions pass.

Consumer requirements and removal conditions for the pinned patch are in [installation and contracts](../interaction-adapters.md). A package tarball does not automatically register a package-manager patch.

## Automated checks

Final aggregate **`pnpm ci:check` passed**, exit 0, with Node 24.20.0 / pnpm 11.18.0. Unlike the earlier constituent-only run, this includes the complete final chain.

| Check | Final outcome |
| --- | --- |
| Contracts typecheck/tests/build/generated contracts/budgets | passed; 894 tests |
| React typecheck/SSR/Chromium/build | passed; 180 SSR + 942 browser tests |
| React Native typecheck/mock tests/build | passed; 866 tests |
| Native base Metro production bundle | passed; 41 families, 619 modules, 1496.7 KiB raw / 371.2 KiB gzip; pre-Hermes |
| Renderer graph budgets, optional-peer isolation, workspace/evidence sync, docs links | passed |
| Release governance | passed; 15 tests; internal-package-and-showcase scope |
| Native showcase generation/typecheck/tests | passed; 1 test |
| Web showcase typecheck/tests/token boundary | passed; 20 tests |
| Web Storybook production build/static verification | passed; 103 canonical renderer stories + 13 navigation pages; experimental additions do not change canonical counts |
| Full optional Native showcase Expo export after fixes | passed for iOS and Android; Hermes assets about 9.1/9 MB in `/tmp/hjm-interaction-native-export-final`; not a native binary build |
| HJM library policy | passed; 6 manifests, 58 libraries |
| Whole-portfolio library policy | unrelated BurnTok admission findings for `playwright-core`, `pngjs`, `@types/pngjs`; no HJM finding |
| Production dependency audit | 0 moderate/high/critical, 1 existing low esbuild advisory via Storybook; details below |
| Local package tarballs | all new entry JS/declarations present; `SharedTransitionScreen`, Motion Primitives notice and updated consumer patch included; no publication |

Package tests total **2,882**. Native mocked cases validate HJM contracts, while the simulator observations above validate the listed engine flows. Existing browser tests emit React `act` warnings; assertions passed. Storybook emits its existing `use client` and large-chunk advisories. Rebuilding all `dist` files while the live web demo was open temporarily invalidated provider identity under HMR; after builds settled and the page reloaded, the final flow ran with no new browser errors.

`pnpm audit --prod --json` exited 1 for the existing Storybook → esbuild 0.27.7 low-severity [Windows development-server file-read advisory](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr); fixed upstream range is ≥0.28.1. This audit found no advisory attributed to the newly added adapter engines. It is a registry snapshot, not a claim that dependencies are vulnerability-free. The unrelated Storybook dependency upgrade was not folded into this adoption.

## Captures and reproducibility

- [Final browser screen](interaction-adapters-2026-09-30/web-verified.png), [390px / dark / RTL / 200% text](interaction-adapters-2026-09-30/web-responsive.png).
- [Native drag result](interaction-adapters-2026-09-30/sortable-drag.png), [native interaction result](interaction-adapters-2026-09-30/native-final.png), [native large text](interaction-adapters-2026-09-30/native-reduced-top.png).
- [Shared detail](interaction-adapters-2026-09-30/shared-detail-final.png), [back result](interaction-adapters-2026-09-30/shared-verified-back.png), [reduced-motion detail](interaction-adapters-2026-09-30/shared-reduced.png).
- [Recorded shared transition/cancellation/return](interaction-adapters-2026-09-30/shared-verified.mp4), [sampled frames](interaction-adapters-2026-09-30/shared-verified-frames.jpg).
- [Recorded native particles and cleanup](interaction-adapters-2026-09-30/celebration-verified.mp4), [sampled frames](interaction-adapters-2026-09-30/celebration-verified-frames.jpg).
- [Machine-readable checks and tarball hashes](interaction-adapters-2026-09-30/verification.json).

Native Storybook IDs: `experimental-interaction-adapters--playground`, `--shared-screen-transition`, `--reduced-motion`, `--shared-reduced-motion`. Open them with `hjm-showcase://storybook?STORYBOOK_STORY_ID=<id>` in the existing development client. Web uses the same Playground ID on the Storybook iframe URL. Screenshots and videos show deterministic sample data, not product writes.

## Adoption and remaining boundaries

All six are implemented and usable through optional subpath imports in HJM and wired into its showcases. Keep their **experimental** designation: Android had no connected device (`adb devices` was empty), and physical devices, spoken assistive-technology journeys, release binaries, retained product-tab recovery, frame-time/memory profiling and consuming-app integration are not covered by this pass. Android JS export is not Android UI evidence. The base RN 0.81 fixture is not an optional-engine compatibility claim; the observed optional lane is Expo 57 / RN 0.86.2.

No npm publication, version bump, consuming-app migration, native binary build, store submission or deployment was performed. Local package tarballs and a minor changeset are prepared for the normal release process.

## Android 16 emulator — promotion check

2026-09-30, existing AVD `spint-store` (Android 16) with the already-installed `dev.hjm.designsystem.showcase` development
client connected to `expo start` on 8084 (no new emulator, no native rebuild). Driven with `adb input`/`motionevent` and read
back through `uiautomator` text, the same flows as iOS:

| Capability | Observed |
| --- | --- |
| SortableCollection | Long press + drag moved 숲길 from first to last ("바닷가 → 작은 카페 → 숲길"); "숲길 앞으로" moved it back one step |
| SwipeActions | Horizontal swipe revealed 보관/삭제 without executing; 삭제 stays disabled; 보관 ran once ("보관했어요") and closed the row |
| ContentTransition / TextTransition | "다음 상태" replaced the text; the family emoji rendered intact |
| CarouselMotion | "다음 장소" and horizontal swipe advanced slides; stopped at the last slide with next disabled |
| Celebration | Multi-color burst after the palette fix, then removed ([video](interaction-adapters-2026-09-30/android-celebration.mp4), [frames](interaction-adapters-2026-09-30/android-celebration-frames.png)) |
| Liquid Toast (capsule) | See the [Liquid Toast record](liquid-toast-2026-09-30/README.md) |

Celebration change found by review: particles used `primary` + `surfaceAccent`; the pale surface tint made the iOS capture a
sparse single-blue burst. Both renderers now use `celebrationColors(primary, statusAccents)` from the contract (regression test
added). Particle count/duration recipes are unchanged pending profiling.

`screen-transition` was not re-run on Android and stays experimental (see [installation and contracts](../interaction-adapters.md)).
Not covered: physical devices, spoken TalkBack/VoiceOver, dark/RTL/200% on Android (covered on Web and iOS above), frame time.

