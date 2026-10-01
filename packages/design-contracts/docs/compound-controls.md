# Compound controls

Reviewed: 2026-10-01. Web and React Native expose identical optional entry names:
`/duration-field`, `/inline-confirm`, `/reaction-picker`, `/notification-bell`.
These are compositions of existing canonical controls, not replacements for them.
The 2026-10-01 visual integration request calls for reusable interactions as well as
page examples; keeping the existing controls preserves their disabled, focus and
loading behavior instead of introducing another control implementation.

## DurationField

Use for bounded elapsed time (integer seconds), not clock time or calendar dates.
Pass `value`, `onValueChange`, required `max`, optional `min` (default 0), and
`labels: {label, hours, minutes, seconds, increment(unit), decrement(unit)}`.
All labels are localized by the product. Three existing NumberFields edit the
hours/minutes/seconds representation. The shared `/duration-field` contract
validates safe integers and clamps the *combined* duration to the configured range.
Native field columns wrap according to the text scale so enlarged numeric values stay visible.
Hours are disabled when the maximum is below one hour. `disabled` disables all
inputs. Values outside the range throw rather than silently changing product state.

## InlineConfirm

Use for a local explicit confirmation when an overlay would interrupt the context.
Pass `label`, `prompt`, `confirmLabel`, `cancelLabel`, `pendingLabel`,
`successLabel`, `errorLabel`, and `onConfirm(): void | Promise<void>`.
The existing AlertDialog session owns async deduplication, pending and retry.
No action runs on the initial trigger. Pending disables both actions; rejection
shows the supplied safe error text and permits retry. Web initially focuses cancel,
Escape cancels, and cancellation restores trigger focus. Native exposes the
controls and live error text through its host accessibility APIs.
Native keeps the localized status text available to assistive technology. iOS
receives one explicit announcement per prompt/pending/error/success transition;
errors interrupt queued speech, other updates queue politely. Repeated rendering,
completion's internal closing phase and background updates do not repeat the prompt.
Android retains its live-region/alert semantics. Native bridge calls are lifecycle-tested;
this is not a claim that VoiceOver audio was manually heard.

Success remains visible. Remount with a new entity key to reset the interaction;
the session captures the action and labels when opened. The product owns operation
cancellation, authorization, persistence and server-side idempotency.

## ReactionPicker

Pass a nonempty list of `{id, emoji, label, count?, disabled?}`, controlled
`value: string | null`, `onValueChange`, and the group `label`.
The shared `/reactions` contract rejects duplicate IDs, invalid counts and unknown
selected IDs. Selecting the current reaction clears it; selecting another replaces
it. Existing Buttons own selection and disabled semantics. Counts are product data
and never increment implicitly. Include counts in localized option labels when
needed for screen readers; visible emoji/count artwork is decorative. Native passes
one composed text label to Button so emoji and count use its Text wrapper; sibling
raw strings bypass that wrapper and fail to render on a real device.

## NotificationBell

Pass `label`, nonnegative integer `count`, `icon`, `onPress`, and optionally
`disabled` or `active`. Supply the localized unread information in `label` and a
semantic Icon/Lucide glyph as `icon`. Existing IconButton and CounterBadge own the
control and count presentation. Artwork and badge are hidden from accessibility
so the button is announced once.
A count increase triggers one 400ms pulse; mounting or decreasing does not ring.
Reduced motion, inactive presentation and background document/AppState suppress
motion. Native hosts should set `active={false}` for offscreen items. Pressing does
not mark notifications read automatically; that operation belongs to the product.

## Evidence and examples

Both showcases register `컴포넌트/입력/Duration Field`,
`컴포넌트/동작/Inline Confirm`, `컴포넌트/동작/Reaction Picker` and
`컴포넌트/피드백/Notification Bell`, each with Default, Dark and LargeText.
`갤러리/복합 입력` provides the comparison examples. Web browser and Native
host-action tests exercise clamp, confirmation/retry/deduplication, controlled
reactions and motion suspension. Native host tests are not device-render evidence;
actual iPhone 17 / iOS 27 simulator LargeText cancel/error/retry/success/reset flows
are recorded in the [component flow audit](../../../docs/evidence/component-flows-2026-10-01/README.md).
Remaining device coverage stays tracked in the
[implementation ledger](../../../docs/plans/visual-integration-progress.md).

The same [Native flow audit](../../../docs/evidence/component-flows-2026-10-01/README.md)
also verifies LargeText duration unit increments/decrements and total seconds, reaction
selection/replacement/clearing, and local bell read/add state. These are actual simulator
actions, distinct from backend notification delivery and physical-device screen-reader QA.
