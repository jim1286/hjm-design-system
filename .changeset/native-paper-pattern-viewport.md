---
"@hjmds/react-native": patch
---

Render static notebook ruling with an explicit physical SVG tile on iOS. A one-unit tile containing a percentage-width rectangle produced no visible lines on the existing iPhone 17 Pro / iOS 26.5 development host. The tile now uses the configured spacing for both its width and height, while keeping the line one host unit thick and outside the animated layer.

The Native paper comparison uses the existing 640-unit comparison viewport and an outer scroll container so its screen, input, records and actions remain reachable. Public descriptors and product state ownership are unchanged. See `docs/qa/2026-10-07-native-reference-validation.md` for device scope and remaining validation boundaries.
