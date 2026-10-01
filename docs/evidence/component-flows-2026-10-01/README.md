# Native component flow audit — 2026-10-01

Existing iPhone 17 / iOS 27 simulator, development app `dev.hjm.designsystem.showcase`,
Metro 8187. Used the previously documented idb/simctl fallback after Device Hub failures.
No new device, binary build, publication or consumer migration.

## Step Player · LargeText

Actual taps started playback, paused at 8%, and verified the percentage remained unchanged
for 1.2 seconds (the demo interval is 500 ms). Resuming reached 100%, stopped automatically,
and showed the final panel. Replay restarted below 100% with the pause control available;
pausing again worked. Screenshot/accessibility pairs: `step-player-large-paused`,
`step-player-large-ended`, `step-player-large-replay`.

## Task List · LargeText

Actual taps checked the second task, moved it to the first position, and verified its
checked state persisted. The move-up control became disabled at the first position.
Scrolling reached the last task; checking it succeeded and its move-down control was disabled.
Screenshot/accessibility pairs: `task-list-large-completed`, `task-list-large-reordered`,
`task-list-large-last-completed`.

## Selection artwork correction

Visual inspection of `task-list-large-last-completed.png` shows the decorative checkmark
clipped against the bottom of the fixed selection box at 200% text scale. The source uses
HJM Text for the mark in `packages/react-native/src/inputs.tsx`; it inherits controlled text
scaling while the control box remains fixed. Checkbox checked/mixed and Chip selection artwork now uses non-scaling native text;
readable labels and descriptions retain HJM scaling. `task-list-fixed-large-*` pairs
repeat completion, reorder and the last-row flow after the correction. Visual inspection
of the fixed last-row screenshot confirms the checkmarks fit inside their boxes.
Three host regressions cover fixed glyphs, enlarged labels, semantics and callbacks;
the Native suite passes 910 tests and typecheck/build pass. Chip/mixed device rendering
is not separately claimed by the Task List screenshots.

The persistent blue development Refreshing banner obscures the very top of each story.
Captures do not establish an unobstructed first row, physical-device performance, Android
parity, drag-gesture reorder, or manually heard screen-reader output.

## Bundle measurement

`selection-mark-cost.json` compares the same emitted inputs module with only this correction
reversed. The fixed glyph implementation and rationale comments add 267 raw / 163 gzip bytes.
Only graphs importing inputs receive that exact additional allowance; existing headroom and
module/dependency limits remain unchanged. The previous mentions graph was near its gzip cap.

## Inline Confirm · LargeText

Actual taps opened confirmation, cancelled back to the trigger, enabled the simulated
failure, submitted, observed the localized error, disabled failure and retried successfully.
Reset returned to the initial trigger. `inline-confirm-large-{cancel,error,success,reset}`
contain screenshots and accessibility snapshots. Visual inspection of the error screenshot
confirms the enlarged prompt, error and both actions fit and remain available.

Source follow-up found Android-only live regions were insufficient for iOS status speech.
The renderer now dispatches prompt/pending/error/success through the iOS accessibility API,
deduplicates transitions, suppresses background updates and skips the internal closing phase.
Five compound-control tests pass, including explicit iOS transition sequence and Android
non-dispatch checks. They verify API calls, not manually heard VoiceOver output.

## Grid Reveal · LargeText

Tapped image-error control, visually inspected the fallback, then tapped replay and
visually confirmed the original generated landscape returned. The same image description
and reserved 320×200 frame remain in the accessibility tree for both states by Image's
contract; the visual fallback's own text is deliberately not a second accessible name.
The first automation assertion incorrectly expected that decorative fallback text in
the accessibility tree. The screenshot showed the error correctly, so the audit was
corrected to check the retained image name and visually inspect error/recovery separately.
`grid-reveal-large-error` and `grid-reveal-large-recovered` contain both snapshots.
They prove failure/recovery rendering, not frame-by-frame mask timing or physical GPU cost.

## Scroll Progress · LargeText

Swiped the story's actual inner ScrollView from top to bottom, then back upward.
Measured displayed sequence: 0%, 13%, 31%, 47%, 63%, 83%, 100%, 87%. The progress
control stayed visible and the final document text remained readable in the reserved
scroll area. `scroll-values.json` records the sequence; `scroll-progress-large-*`
contain start/moving/end/back screenshots and accessibility snapshots. This proves
actual Native scroll callbacks update the range in both directions at 200% text scale.
The development refresh banner still overlaps part of the top heading.

## Voice Note · LargeText

Actual taps switched paused→playing→paused, loading→paused, and error→retry→paused.
The snapshots verify loading disables seek/play, error disables seek/play while retry is
available, and retry restores enabled controls at 0:12. The error screenshot was visually
inspected; the localized message and actions wrap without clipping. This is the explicitly
labelled simulated UI fixture: no audio file, sound output, microphone or OS playback session
was exercised. Captures use `voice-note-large-{loading,error,recovered}`.

## Folder Preview · LargeText

Actual taps opened and closed the folder. The open snapshot exposes expanded state and
real content; closing removes the content from the accessibility tree. An initial automation
helper tried to scroll because the button's top was above its threshold, although the tall
button's center was visible. That helper was stopped and the flow repeated using the visible
center. This was an automation issue, not a component interaction failure.

Visual inspection found oversized text overlapping on the decorative preview cards. Both
showcases now use token-colored document line artwork in those slots; actual names remain
in the expanded content and still scale. Fixed Native captures are `folder-preview-fixed-large-*`.
Web Chromium 390×844 LargeText also opens/closes, reports aria-expanded true/false and has
no horizontal overflow (`folder-preview-web-large-open.png`). Native showcase 11 tests and
Web showcase 27 tests, typechecks and Web token checks pass after this example correction.

## Reaction, notification, duration and heatmap · LargeText

- Reaction Picker: tapped Like, then Love, verified only Love remained selected, then
  tapped Love again to clear it. `reaction-large-{selected,cleared}` records traits and
  appearance. The selected screenshot visibly shows the single chosen outline.
- Notification Bell: tapped the initial 3-unread bell to reach 0, then added a notification
  to reach 1. Both accessible names were verified in `notification-large-{read,added}`.
  This exercises local fixture state, not push delivery or an account backend.
- Duration Field: incremented hours (1500→5100 seconds), decremented hours (→1500),
  incremented minutes (→1560) and seconds (→1561). Scrolling reached the final total.
  `duration-large-edited` visibly shows 0 hours, 26 minutes, 1 second and total 1561.
  Direct keyboard entry and every range limit are not established by these taps.
- Activity Heatmap: switched to list, verified July 1's unknown-data wording, and switched
  back to grid. `heatmap-large-{list,grid}` records the views. The list screenshot was
  inspected and dates/values remain readable. This does not prove traversal of all 92 days.

## Final local gate for these corrections

`pnpm ci:check` exited 0 after the selection-mark correction, InlineConfirm iOS
announcement bridge and folder-artwork example change. Contract tests 912; Web SSR
180 and browser 976; Native 912; Native showcase 11 and Web showcase 27. Storybook
production build verified 103 canonical component stories and 13 navigation pages.
Native production Metro: 673 modules, 1394.2 KiB raw, 340.9 KiB gzip, below unchanged
Metro ceilings. Renderer graph budgets, API map, evidence synchronization and docs
also pass. This is local execution; npm publication and consumer deployment are separate.

## Content transitions, statistics and selected-tab visibility

LargeText actual taps cycled all four content presets to the second scene, then back
to the first; snapshots show four current text nodes and readable wrapping, without
stale scene text. Animated Statistic changed 1,280→1,405→1,280 with actual buttons
and a single composed accessible value. `transition-large-*` and `statistic-large-*`
record these state transitions, not per-frame animation trajectories.

Gooey Navigation switched panels and kept the unavailable tab disabled. Switching to
RTL and choosing the last tab exposed a clipped selected label (`gooey-large-rtl`).
Native Tabs now centers the selected measured tab within clamped content bounds on
selection, width or direction changes. Both standard and gooey appearances use this
behavior, without animated scrolling. The repeated real-device flow verified the selected
label's full frame lies inside x=16…386 (`gooey-fixed-large-rtl`); visual inspection
confirms the complete label and indicator. Two regressions cover both appearances,
controlled selection and viewport resizing. Native suite passes 914 tests and typecheck.

`tab-viewport-cost.json` measures the same emitted navigation module with only this
correction reversed: +1005 raw / +331 gzip bytes. Only importing graphs receive that
exact allowance addition; module and optional-peer boundaries are unchanged.

## Code Block · controlled scaling and real copy

The initial LargeText device capture exposed a real defect: the surrounding description
scaled, but CodeBlock's native Text did not honor the provider's controlled scale. CodeBlock
now reuses the existing internal text-scale helper for the header and selectable parent;
colored spans inherit once. OS-controlled scaling remains available when no scale override
is supplied. No clipboard dependency or second text-scaling policy was added.

`code-block-large-{before,fixed,selection}` records the visual difference and native Copy
menu. A real long press followed by tapping Copy produced the exact 57-byte source, including
whitespace and trailing newline (`code-copy-result.json`). Pasteboard propagation was not
immediate; the subsequent read matched exactly. Full-source copy is verified, not arbitrary
selection ranges or Android clipboard behavior. The horizontal view intentionally scrolls
long enlarged code lines rather than clipping their stored source.

`code-scale-cost.json` measures the actual saved pre-change graph against the new graph:
+1 existing local helper module, +2131 raw / +627 gzip bytes. The entry budget preserves its
previous headroom while accounting for that measured reusable helper, with no new peers.
