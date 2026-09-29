# HJM full implemented-component audit — 2026-09-29

Release candidate for the 1.8 train. Catalog maturity and actual runtime evidence are different records: this audit verifies the currently implemented 100 Web and 83 Native entries. Planned and unsupported entries are not counted as implemented or verified.

| Surface | Actual-screen scope | Main action evidence | Details |
| --- | --- | --- | --- |
| Chromium | 100/100 canonical components; 390px overflow check | 60 canonical cases; 8 semantic/geometry checks; 9 extra examples; 40 selected input/environment variants | [Web](WEB.md), [ledger](web.json) |
| iPhone 17 simulator / iOS 27.0 | 83/83 canonical components, final canvas appearance | 47 component action records; 36 static/layout records; optional adapters and composition examples recorded separately | [iOS](IOS-AUDIT.md), [ledger](ios.json) |
| Android 16 / API 36 emulator | 83/83 canonical components | 47 component action records; 35 static/layout records; 1 initially selected Radio; 10 extra examples | [Android](ANDROID-AUDIT.md), [ledger](android.json) |

`release-check.log` records a successful `pnpm release:check`: 888 contracts, 177 Web SSR, 913 Chromium, 855 Native, 20 Web showcase and 1 Native showcase tests (2,854 total), bundle/Metro budgets, generated contracts/evidence, workspace/docs/governance, showcase builds and release-artifact checks. CSS size was brought within the existing budget by shortening comments, with non-comment stylesheet bytes unchanged; the budget was not raised.

The user-requested visual direction is shared theme canvas backgrounds (white in light mode), retained blue focus/selection outlines, typed primary button fills including Create draft, and meaningful semantic colors. No per-screen white hex overrides were introduced. Platform-owned system material and actual image content retain their colors.

## Evidence limits

These are debug showcase and Chromium results, not physical-device, VoiceOver/TalkBack, every browser/OS/prop combination, consumer-app regression, npm publication or production deployment evidence. Static captures do not prove animation timing. Reference FilePicker/auth callbacks do not prove Photos permission or OAuth-provider integration. The Android report retains the one observed development FastRefresh/Yoga failure and distinguishes non-reproduction from a Yoga fix.

Earlier captures remain as before-state evidence. Per-component ledgers identify final retakes; rejected wrong-story/unchanged-state captures are not evidence of a successful action.
