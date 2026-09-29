# Calendar partial-week alignment

The September 2026 showcase revealed collapsed leading/trailing filler columns on
Native: date targets specified a minimum width while fillers and weekdays did not.
Yoga allocated different widths to partial weeks. All three now share the same
flex and minimum-width geometry, preserving the seven-column alignment.

- iPhone 17 simulator, iOS 27, installed full showcase: before/after screenshots
  visually confirm September 1 beneath Tuesday and September 30 beneath Wednesday.
- Device Hub connection previously timed out; these captures use simctl on the same
  existing simulator. This is simulator visual evidence, not physical-device proof.
- Native Calendar focused tests: 8 passed (including LTR/RTL partial-week geometry).
- Chromium Calendar focused tests: 10 passed (including actual column-center
  measurements in LTR/RTL). Web already uses seven equal grid tracks; no Web renderer
  change was needed.
- Android screen verification remains pending; the capture attempt showed launch
  splash, not the Calendar. Do not count it as passed.
