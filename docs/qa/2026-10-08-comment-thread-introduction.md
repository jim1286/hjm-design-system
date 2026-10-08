# Comment thread introduction slot

## Problem and change

Spint native inspection showed a tall meadow overview inside a fixed, separately scrolling header.
The height cap clipped spot filters and the list heading. Added optional threadHeader to both Web
and Native CommentThreadScreen: it precedes comments in the shared body, while header remains
fixed navigation and composer remains the fixed action area. Screen replacement states replace
the introduction with the comments, so protected context cannot remain visible in restricted state.
Existing callers omit the slot and retain their structure. No new public component or state resolver
was introduced; this is an additive composition slot.

## Validation

Both renderer typechecks and builds passed. Focused Native and Chromium browser regressions passed
(1 each): introduction and comment share the body, composer stays outside, and restricted state
removes introduction/composer. Usage sync passed after placing guidance in the required sections.
No consumer native visual success is claimed until a published package is installed into Spint and
the introduction, filters, comments and fixed actions are exercised together.

## Release boundary

The concurrent 1.16.2 release is the earlier navigation-frame correction. This optional API is a minor
Changeset for the following release and is not included in 1.16.2.
