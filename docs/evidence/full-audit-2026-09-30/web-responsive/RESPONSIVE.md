# Web responsive audit — 2026-09-30

Extends [`../web/WEB.md`](../web/WEB.md) (desktop 1100 interactions, 390 screenshots/overflow) with tablet, wide
desktop, touch phone and landscape phone. Static Storybook rebuilt with `pnpm showcase:web:build` at 03:21
(after the 03:15 `menu-morph.tsx`/`styles.css` change; `verify-static`: 103 canonical stories, 103 Web
renderers), served by `runners/serve.cjs` on 6026. Playwright Chromium headless; touch = CDP touch emulation
(`hasTouch`, `isMobile`, DSF 3). Nothing under `packages/` or `showcase/` was edited.

## Result

| Viewport | Rendered, no errors | No horizontal scroll | Visually reviewed | Interaction verified (tap) |
| --- | --- | --- | --- | --- |
| Tablet 768×1024 | 120/120 (103 canonical + 17 optional/pattern) | 120/120 | 120/120 (contact sheets, renderer crops) | — (not re-run) |
| Wide 1440×900 | 120/120 | 120/120 | 120/120 | — (not re-run) |
| Phone 390×844 touch | (renders in `../web`) | 70/71 open states; DatePicker widens page to 391 | 25 open/step captures | 69/71 cases (62/64 canonical + 7 pattern) |
| Landscape 844×390 | 20/20 overlay + full-height stories | 20/20 | 20 static + 20 open/step captures | 19/20 |
| 44px census (390 touch, real hit test) | 111 stories scanned | — | — | 11 stories have controls with hit area < 44 |

Overlay protocol at 390 (20 cases) and 844×390 (17): open by tap, measure `getBoundingClientRect` against the
fixed device size, check page width, tap outside, re-open, close by control. Inside the viewport: all except
DatePicker. Tap-outside dismisses 15 at 390 (Dialog, Sheet, Popover, ConfirmPopover, Menu, ContextMenu via 800ms
long-press, Menubar, Select, Combobox, DatePicker, TimePicker, CommandPalette, Cascader, TreeSelect,
MorphingMenu); AlertDialog and Tour stay (expected), SidePanel fills the 390 screen (no outside area; dismisses in
landscape). Every close control closed its surface.

Runner note: under `isMobile`, overflow widens the layout viewport (`innerWidth` 391) instead of producing
`scrollX`, so the first run's `scrollX` check missed DatePicker; `touch.cjs` now compares against the fixed
device width.

## Defects

1. **WR-0930-1 Tooltip — never shows on touch** (390 and 844×390). Tap → `data-state` open→closed within 1ms:
   `focusOpenDelayMs: 0` opens on focus, then the same tap's click runs the `trigger-activation` close in
   `overlays.tsx`; `pointerenter` is skipped for touch. `screens/mobile-touch/Tooltip-open.png`,
   `runners/diag-tooltip.cjs`.
2. **WR-0930-2 Tree — nodes cannot be expanded by pointer** (all viewports). Tapping the 9월 row only selects
   (`aria-selected=true`, `aria-expanded` stays false). The ▸ glyph is `aria-hidden` and has no handler.
   Expand/collapse exists only on ArrowRight/Left, which is how the 1100 pass verified it.
   `screens/mobile-touch/Tree-failed.png`, `runners/diag-tree.cjs`.
3. **WR-0930-3 DatePicker popover overflows** (390, 360, 320). Popover `left` = trigger (33) but
   `width` = viewport−32 → `right` 391; page widens to 391 and the right corner is clipped. In landscape the
   bottom sits 20px below the fold (it is absolutely positioned, so the page can scroll to it).
   `screens/mobile-touch/DatePicker-open-390.png`, `-320.png`, `screens/landscape-touch/DatePicker-open.png`.
4. **WR-0930-4 Menubar panel clipped by an overflow ancestor** (390 touch; 1100 mouse confirmed). The panel is
   `absolute` and not portaled, so the showcase `.hjm-stage` (`overflow:auto`) cuts it off: at 1100 the 열기 item
   is not hit-testable. Menu, Select and ContextMenu portal and are fine.
   `screens/mobile-touch/Menubar-open-clipped-crop.png`, `runners/diag-menubar-clip.cjs`.
5. **WR-0930-5 DataTable targets below its own contract**: row/all checkboxes hit 16×16 (the 44-wide selection
   cell is not clickable); sort buttons 36×44. `dataTableRecipe` sets both to `minTouchTarget`.
6. **WR-0930-6 SearchField/Field clear button** `.hjm-search-field__clear` is hardcoded to 32×32, while
   `.hjm-date-picker__clear` uses the 44 token.
7. **WR-0930-7 TransferList select-all checkboxes** hit 16×16.

## Observations (not defects)

- Masonry fixture passes `width={320}`, so at 768/1440 it occupies the left 320px (`screens/wide/Masonry-renderer.png`).
- BottomNavigation `bar` at 1440 spreads 2 items 720px apart (`screens/wide/BottomNavigation.png`). The contract's
  web adaptive mode is `fixed-compact-viewport`, so the host should switch to Sidebar on wide screens.
- Width policy at 1440 is inconsistent: Field caps at ~420px and Calendar at ~500px. SearchField, Select,
  Combobox, PasswordField, TextArea, NumberField, Slider, AuthProviderButton, BottomCTA and DateRangePicker
  (cells ~165px apart) fill 1158px.
- Chip `small` is 36px tall with no hit slop; Card 자세히 hit 64×42; Anchor tabs 38px tall; standalone text links
  are 17–20px tall. TagsInput remove reaches 44×44 through `::after` slop.
- Landscape: Popover/Select/Combobox/Menu flip above the trigger; Sheet is 640px centred; SidePanel is 400px
  docked right.

## Limits

CDP touch emulation in headless Chromium only. Not tested: iOS Safari or Android devices, on-screen keyboard
resizing, real long-press. Hit extents are sampled along the centre axes (capped at 81px). Interactions were not
re-run at 768/1440. FilePicker (file chooser), SkipNav (keyboard by nature) and VirtualList scroll were not
tap-tested. Full-resolution tablet/wide captures stay in `/tmp/hjm-web-resp-0930/shots`. Contact sheets and the
key captures are under `contact-sheets/` and `screens/`.
