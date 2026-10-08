# Native floating navigation pressed border

Spint HJM1.16.1, existing iPhone17Pro/iOS26.5 development client,402pt viewport.
Holding the left destination reproduced an opaque pressed fill covering both left frame corners;
the user reported the same on the right. Source used radius.lg for every item while the floating
frame uses radius.xl. Correct the logical first/last corners to the frame inner radius, preserving
interior item corners, shadow, focus outlines and existing actions. No app-specific border overlay.

Native typecheck and navigation-product suite passed (8tests). Added pressed edge assertions to
existing product adapter coverage. Usage/evidence generators completed. A simulator capture proves
the original problem only; candidate runtime confirmation and published consumer installation remain
pending. No claim that the currently installed1.16.1 package is fixed. Unrelated primary QA deletions
were preserved and excluded from this change.
