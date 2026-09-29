# Liquid Toast fixes and promotion — 2026-09-30

Trigger: a consumer (BurnTok) enabled `presentation: "liquid"` and the user reported the result "looked wrong" against the
expo-dynamic-notifications reference (the Dynamic Island dripping into a card).

## Defects found on the installed iPhone 17 / iOS 27.0 simulator (Expo Go, existing device)

| Symptom | Cause | Fix |
| --- | --- | --- |
| Dark rectangular band behind the card, straight left/right/bottom edges | Skia `Shadow` received `shadow.floating.color` (#000) without its 0.12 opacity; the canvas was exactly region-wide | Fold opacity with `withAlpha`, halve radius to a Skia sigma, extend the canvas by 3σ + offset on each side |
| A dark pill left under the real island for the whole visible time ("two islands") | Capsule anchor opacity only depended on `drop` | Capsule fades with `expand` and returns on exit; a verified island frame stays opaque |
| Gray blob appearing below the island instead of the island dripping | `tint` started 110 ms into the drop | `delay.tint` 420 ms, after the card starts widening |

## Observed after the fixes

- iOS, island anchor (host-supplied frame measured from the simulator: centered, y 14, 125.33×36.67 pt): the island stretches a
  black droplet that detaches, widens into the card and lightens. [video](ios-island.mp4), [frames](ios-island-frames.png).
- Android 16 emulator, capsule anchor: capsule → neck → droplet → card; the capsule is gone once the card settles.
  [video](../interaction-adapters-2026-09-30/android-liquid-toast.mp4), [frames](../interaction-adapters-2026-09-30/android-liquid-toast-frames.png).

Not covered: physical devices, other island models' frames (the island frame is host-owned and must be measured per model),
spoken screen-reader journeys, frame-time profiling. Reduced motion and screen readers keep the standard Toast (unchanged).
