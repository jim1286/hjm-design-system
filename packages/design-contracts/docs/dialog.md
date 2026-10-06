# Dialog

Dialog provides a modal boundary for a task that needs the user's attention. This
Reviewed: 2026-10-05. The original
contract was recorded during the 2026-09-29 promotion audit because Web and Native
already had different title APIs and dismissal sources, while there was no single
component guide describing their shared behavior.

## Accessible name and modal boundary

- Web renders `role="dialog"`, `aria-modal="true"`, a title reference, and an
  optional description reference. When opened, focus enters the dialog, stays in
  the active modal, and returns to the trigger (or the explicit return-focus
  target) after dismissal. A real backdrop click must not let the browser's
  default blur undo that return, or move focus outside a busy modal. Diairy QA
  W16 reproduced this after outside dismissal while Escape and the close action
  returned correctly; synthetic mousedown dispatch had omitted the browser default.
- Native renders a `role="dialog"` modal boundary with
  `accessibilityViewIsModal`. A string `title` names the dialog. If `title` is a
  React element, pass `accessibilityTitle`; native renderers cannot derive a
  reliable accessible name from arbitrary element children.
- The close action uses the required localized `closeLabel` on both renderers.
  Dialog titles, descriptions, and body copy wrap instead of being clipped to one
  line. Web constrains the dialog to the viewport and allows its content to
  scroll.

## Dismissal behavior

Dismiss requests are ignored while `busy` is true or `dismissible` is false.
Web reports `escape`, `outside`, or `close-action`; Native reports `back`,
`outside`, or `close-action`. A Native primary or secondary action runs its
callback and requests `close-action`; controlled Dialog owners decide when the
dialog actually closes. While an async operation is pending, keep `open` true and
set `busy` so repeated action and dismissal attempts are disabled.

## Renderer proof

The React browser tests cover focus entry, Tab containment, Escape dismissal,
focus restoration (including real pointer backdrop clicks), busy dismissal guards, and long title/description/body copy in
a narrow viewport. React Native renderer tests cover modal role/name/state,
action labels and close requests, back/outside dismissal, busy guards, and long
title/description copy. These tests exercise renderer contracts; device and
screen-reader behavior remains a separate consumer validation concern.

Native accessibility follow-up (2026-10-01): at 200% text scale, the close glyph was clipped inside the fixed IconButton frame. Dialog and Sheet now render that decorative glyph at a fixed icon size, matching Toast; title/body text still scales and the named close action and touch target are preserved. `sheet-viewport.test.tsx` checks both renderers and close callbacks.

Native viewport candidate (BT-QA-027, 2026-10-05): BurnTok local QA exposed a long confirmation extending beyond the visible screen. Dialog and AlertDialog now constrain the content surface and provide a shrinking scroll body, with actions outside that body and provider safe-area padding. Host tests cover those structural contracts and cancellation; they cannot prove Yoga geometry. Ordinary-size iOS confirmation and cancellation were checked. Enlarged-text device verification remains pending: the user stopped that QA scope before the candidate was confirmed, so this is not a completed device fix. Font caps and clipped copy were rejected because they remove readable content.
