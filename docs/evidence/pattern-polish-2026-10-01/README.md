# Pattern accessibility and recovery follow-up

2026-10-01 · local Web and existing iPhone 17 / iOS 27.0 developer host.

Source changes:

- Onboarding, Search and Dashboard titles now expose heading semantics on both platforms. Profile's Native page and section titles likewise expose header roles; Web section titles use heading level 2. Existing typography stays unchanged.
- Profile's blank or whitespace-only name uses the existing localized error copy on both renderers. Save stays disabled until the name is valid and changed. Native TextField exposes this error in its accessibility help.
- Native Search/Profile scrolling adjusts for the keyboard and dismisses it on drag, retaining handled control taps.

Observed flows:

- Actual Chromium, 390 × 844, LargeText: title queries resolve level-1 headings for onboarding/search/dashboard. Profile blank name shows an error and disables save; entering a valid name and applying restores success. No horizontal overflow. See [browser results](web-results.json) and screenshots.
- Actual Native LargeText: onboarding's title has the Header trait; selecting travel, continuing, completing and resetting succeed. [Completion screenshot](onboarding-large-complete.png) and AX JSON record the result.
- Actual Native LargeText: clearing the name exposes the error as input help and disables apply. The keyboard initially covers the helper text; dragging dismisses it and reveals the full error, input and disabled save together ([visible error](profile-large-empty-visible.png)). Entering a new name and applying restores success ([recovered](profile-large-recovered.png)). A repeat using the already saved name correctly stayed disabled; the final recovery used a different name.

Validation: Web showcase typecheck, 27 tests and token boundary passed; Native story generation, typecheck and 11 tests passed. Web production Storybook and its 103-canonical-story/13-navigation-page check passed before the final section-heading annotation, then affected checks/build were rerun.

Scope: accessibility-tree roles and help were inspected; this does not assert that VoiceOver spoken announcements were manually heard. The development Refreshing banner is present in captures. No package publication, consumer migration or product deployment is claimed.

## Overlay close glyph and remaining LargeText flows

Search's enlarged detail view exposed a clipped × in the Sheet header. Dialog had the
same implementation. Both now use a decorative NativeText glyph at the fixed icon
size, retaining the named IconButton and touch area; titles/body still scale.
The [before](search-large-detail.png) and [after](search-large-close-glyph-fixed.png)
were inspected on the same device, and closing the sheet returned to the filtered list.
Native tests now pass 905 cases, including fixed-glyph/scaled-body and close-action
regressions for both Dialog and Sheet. Native production Metro probe passes at
1,394.0 KiB raw / 340.8 KiB gzip with its existing limits.

The six-module overlays graph grew by exactly 339 raw / 138 gzip bytes against the
recorded unchanged baseline. [Measurement](overlay-close-budget.json) records the
same files and compression method. This accessibility fix is the sole reason for
a 138-byte gzip budget adjustment; module count, raw ceiling, optional-peer and
root-barrel restrictions are unchanged. No general headroom increase is included.

LargeText Search filter → detail → close and Dashboard empty month → restore → date
list were also exercised. Their adjacent screenshots and AX files record these flows.
Spoken VoiceOver announcements and the remaining enlarged Landing interaction are
still separate checks.

## Landing LargeText and iOS status bridge

The enlarged Landing flow now has actual Native proof: opening the editor, submitting
blank content, entering `456` with the iOS keyboard visible, then adding the record
and seeing it in the preview. The input and submit action remain above the keyboard;
see `landing-large-empty`, `landing-large-keyboard`, and `landing-large-saved` PNG/AX pairs.
Starting another record now clears the previous saved state on both Web and Native,
so repeated saves can announce a fresh result.

An accessibility source audit found that pattern status Text used only Android's
accessibilityLiveRegion. The internal showcase PatternStatus retains that visible
text/live region and sends changed iOS copy through the same queued accessibility
bridge used by existing Notice/Toast. It suppresses ordinary rerenders, Strict Effects
replay and background updates; newly mounted success messages explicitly announce.
Onboarding, Search, Dashboard, Landing, Profile, Family Drawer, Typography Studio and
the older time/cascader/renderer galleries use it. Native notification-settings and
theme-sample success Notices opt into their existing polite announcer.

`showcase-pattern-status.test.tsx` exercises the actual React lifecycle and Native
host calls for iOS change/mount, deduplication, Strict Effects, background suppression
and Android live regions. This is host-call proof; recorded screenshots and AX trees
do not establish that spoken VoiceOver audio was manually heard.

## Complete local gate

After all source changes above, `pnpm ci:check` completed successfully: contracts
912, Web SSR 180, Web browser 976, Native 907, Native showcase 11, Web showcase 27.
Web Storybook build/static verification still contains 103 canonical stories and
13 navigation pages. Renderer graph budgets, Native production Metro probe,
workspace/evidence synchronization, documentation and API map checks all passed.
This is local validation, not remote CI or publication.
