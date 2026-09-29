# Web actual-screen audit — 2026-09-30

Chromium (Playwright headless) against the static Storybook built 2026-09-30 03:04 from the working tree
(HEAD `f1d28a3` plus uncommitted changes), served locally on port 6016. Nothing under `packages/` or
`showcase/` was edited.

## Result

| Category | Count |
| --- | --- |
| Canonical Web components rendered, no page/console errors | 103/103 |
| Visually reviewed | 103/103 (100 pixel-identical to the accepted 9/29 screenshots except Spinner/Skeleton animation frames; ColorPicker, Watermark, Affix opened full size) |
| 390px, no horizontal document overflow | 103/103 (390px captures reviewed in contact sheets) |
| Interaction verified with observable result | 73/103 — 63 action cases, 8 semantic/geometry, ThinkingOrb lifecycle, FloatingActionButton composed flow |
| Presentation-only (no interaction claimed) | 30 |
| 9/29 extra story cases (Rating, TimePicker, Cascader, TreeSelect, ConfirmPopover, Optional Motion, ...) | 9/9 |
| Variants: 9/29 set (20 inputs × light-LTR-100% / dark-RTL-200%) + ColorPicker, Watermark, Affix, Optional Motion | 48/48 render, no overflow |
| Interaction Adapters cases | 10/10 |

New checks: ColorPicker HEX 6-digit keeps alpha (`#338844cc`), opacity range → `#33884480`, 8-digit HEX sets
opacity 25%, invalid HEX shows alert + `aria-invalid` and Escape restores, preset sets `aria-pressed`;
Watermark renders two `<text>` lines, button under the overlay is hit-testable and text is selectable;
Affix sticks at offset 8px (±1.5) on scroll, keeps focus on Enter, unsticks at top.
Adapters: sortable "뒤로" buttons reorder and keep focus on a button in the moved row (fallback to "앞으로" at the
edge), announcement `숲길, 3개 중 3번째`; dnd-kit handle Space/ArrowDown/Space reorders, Escape cancels;
swipe-actions archive status + disabled delete; content transition fades (opacity 0.30→1); carousel next
animates over 44 distinct frames (0→-640px), snaps under reduced motion; celebration draws particles in ≥3 color
buckets, clears after the preset duration, none under reduced motion; dark/RTL/200% at 390 no overflow and RTL
carousel shows the selected slide.

## Defects

1. **W-0930-1 ColorPicker** (new component): the opacity range uses Chromium's default accent
   (`rgb(0,117,255)`; pale blue in dark) instead of HJM primary like Slider. `web-screens/ColorPicker.png`,
   `ColorPicker-dark-compact.png`.
2. **W-0930-2 MorphingMenu fallback** (pre-existing since 9/29, not a regression — 9/29 only checked the
   motion LTR path): with `motion:reduced` or `direction:rtl` the trigger is an unstyled native `<button>`
   (68×26px, grey outset). Menu still works. `web-screens/OptionalMotion-reduced-trigger.png`,
   `OptionalMotion-rtl-trigger.png`.

Observations, not defects: Affix story fixture has no gap between button and status text; forced RTL with Korean
copy puts neutral punctuation at the line start (expected bidi); BottomNavigation's fullPage 390 capture shows
the fixed bar mid-page (capture artifact).

## Limits

Local headless Chromium only — not Safari/Firefox, a screen reader, consumer apps, native, or deployed release.
Sortable pointer drag was not re-run (keyboard only). Variants are the listed matrix, not every permutation.
`runners/` hold the scripts (absolute paths; `/tmp/hjm-web-audit-0930` was the working output).
