# Still mockup studio evidence

2026-10-01, local Web Storybook in Chromium, 390 × 844 viewport.

The input was an actual HJM Gravity Letters Storybook capture, not a fabricated
product screen. Original generic frames and locally authored background geometry
are used; no commercial mockup assets or font binaries are included.

- Default portrait PNG 1080 × 1440; Dark square PNG 1080 × 1080; LargeText landscape PNG 1440 × 900.
- Downloaded PNG bytes equal each canvas preview's PNG encoding. All three had no horizontal page overflow.
- Exported portrait and landscape were visually reviewed. A portrait input in a browser frame is contained, leaving side gutters intentionally instead of cropping actual UI.
- Scene JSON roundtrip preserves source/usage and settings. Import clears prior image and disables PNG export until a screenshot is reselected. Malformed image input shows a recoverable error.
- Web showcase typecheck, 25 tests and token boundary passed; Native story navigation tests 10 passed. Frame geometry tests cover all formats/frames, extreme angles and padding.

Web-only authoring follows integration plan §6. This does not add a Native editor
or deploy anything. Scene timeline/video remains a separate unfinished requirement.
