# MessageComposer host contract and BurnTok adoption

User request: replace BurnTok's retained message input and photo selection with public HJM APIs, then merge. The existing MessageComposer already owns local attachment preview/removal; MediaSelectionScreen/UploadItem would falsely imply per-file server upload for BurnTok's atomic message/photo send. Reuse MessageComposer instead of adding another attachment engine.

The additive contract separates placeholder from accessible name, forwards blur to typing presence, links description/error/invalid state through TextArea, and offers IME-safe opt-in Enter sending. Default newline and receipt-owned draft clearing remain. Web pending input is readonly to preserve focus after a failed receipt; attachment removal can lock independently during local preparation.

Validation: contracts 10 cases, Web Chromium public renderer 1 behavior case, Native host renderer 1 behavior case passed at default text size. Both renderer typechecks/builds passed. These are distinct from actual-device keyboard/VoiceOver and product consumption. Public API and usage checks passed.

2026-10-07 user excludes OS maximum font size from design, implementation, verification and release conditions. Twelve historical Native tests that explicitly simulate OS 3x maximum are retained with skip declarations; default behavior and non-maximum cases remain enabled. Maximum-size fixtures were not executed for this change. This removes a superseded scope condition rather than hiding a test failure.

Official fixed train and product test/merge evidence are recorded when completed; source availability is not npm publication.
