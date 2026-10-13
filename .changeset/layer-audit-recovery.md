---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": major
---

Complete layer guidance and recovery flows: add independent detail state/notice/retry slots to ListDetailScreen, keep empty-chat input, lock onboarding navigation during persistence, and center empty collections. Index comment replies and saved covers without repeated per-row scans, preserve virtual-list keyboard focus, and handle native reduced-motion snapshot races. Refresh token/component guidance and runnable composition/screen recovery examples.

Audit runtime recovery paths: ignore superseded action outcomes even during synchronous completion subscribers, and restore list focus after a detail trigger is removed. Verify actual input-sheet and staged-drawer failure/retry flows on Web and Native hosts.

Fix interaction lifecycle defects found by focused runtime audits: IME and readonly input guards, date reselection, picker/form cancellation, controlled overlay dismissal and nested Escape ownership, stable list focus, stale media/gesture callbacks, and toast/progress behavior.

Preserve navigation context after collection deletion: recover VirtualList focus/viewport and reconcile uncontrolled Carousel selection, numbering and focus. Keep Native CounterBadge hook order stable across zero/nonzero values.

Handle dynamic interaction changes: stop disabled or interrupted splitters, recover removed menu/tree/accordion selections and focus, close locked selects, isolate Avatar requests, cancel abandoned native photo choices, and keep message gestures owned by their initiating pointer.

Complete focused lifecycle fixes: validate search counts before loading/nonempty shortcuts, restore authentication focus after pending, dismiss locked date pickers and preserve field focus, respect RTL menu navigation and dynamic disabled state, cancel abandoned long presses, and finish number transitions on hidden/unmount.

Continue remaining runtime checks: preserve retryable pagination cursors and suppress retired footer callbacks, keep inline confirmations bound to the current action, recover dynamic tab focus, prevent stale native menu actions, and suspend optional avatar/statistic motion safely.

Close additional public interaction gaps: reconcile removed consent/selection values, report only accepted agreement state, retain retryable transfer selections, preserve collection/pagination/collapse focus, guard IME color commits, repair skip-link and RTL tour behavior, and clean up partially started decoration animations.

Keep native Dialog, AlertDialog, and Sheet accessibility visibility separate from their animation hosts so reopening an iOS modal preserves its controls in the accessibility tree. Clarify explicit return-focus wiring for externally controlled web modals and provide working edit/cancel/save and named-delete examples on both platforms.

Keep native centered modal actions above docked keyboards using measured modal bounds, sharing Sheet's resize/floating-keyboard handling. Ignore locked or empty file-picker completions and evaluate native selections against current capacity and callbacks.

Center document preview/export state messages with their respective actions. Keep local previews usable when native sharing is unavailable, and reset preview state when switching example documents.

Prevent editor submission while its content is unavailable, retire discard prompts when leaving becomes locked, and require a fresh confirmation after a moderation action is withdrawn. Preserve web screen keyboard context when focused content is replaced.

Preserve web media-selection keyboard context after accepted removals and reorders, including disabled boundary moves, without overriding intentional external focus.

Keep Web Collapsible focus on its disclosure trigger after pointer dismissal so keyboard reopening also works in WebKit.

Preserve Web InlineConfirm focus during pending and return the retiring confirmation group to its successful result without stealing intentional external focus.

Remove the remaining Native deprecated visual style props and style merges (breaking). Keep canonical layoutStyle, platform/renderer slots, and general development diagnostics. Add semantic ListRow danger tone on both renderers and AlertDialog size; allow EmptyState illustrations to retain their intrinsic size. AlertDialog/Sheet contentStyle now accepts placement keys only. Published consumers must migrate and upgrade together; this changeset does not publish or update installed dependencies.

Fill lower-level contracts used by larger compositions: add inline FieldGroup layout and reuse it in DateEntry/DurationField; centralize saved-draft feedback and search debounce policy; expose StatusText as Text's inline announcement companion; add Native ListRow loading parity and use shared row geometry in both SearchScreen renderers. Bind repeated touch targets to the existing control token.

Include the approved shared changes: support floating BottomNavigation tile selection with equal widths and persistent labels, and use platform-owned accessibility focus for Expo web hosts. The photo-album-navigation and toast-card-press changesets describe the accompanying carousel, viewer, chat and toast behavior.
