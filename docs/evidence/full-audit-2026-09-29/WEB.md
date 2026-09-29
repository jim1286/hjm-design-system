# Web actual-screen audit — 2026-09-29

Implemented canonical Web components: **100/100 rendered and visually reviewed** in Chromium. All 100 also stayed within a 390px document viewport. **60 major interaction cases**, **8 semantic/geometry checks**, **9 additional story cases**, and **40 input/theme/size captures** passed. Planned components (8) are excluded, not counted as verified.

## Evidence and scope

- `web.json`: per-component render, visual review, responsive result, action or explicit presentation-only classification.
- `web-interactions.json`: actual pointer/keyboard/input assertions and resulting screenshots. Local preview state is observable; no-op callbacks are not counted.
- `web-semantic.json`: anchor scroll, breadcrumb navigation, QR raster decode, Masonry geometry, badge containment, loaded image, hidden accessible label, provider environment.
- `web-extra.json`: ThinkingOrb lifecycle/reduced motion, FloatingActionButton, Rating, TimePicker, Cascader, TreeSelect, ConfirmPopover, AnimatedStatistic/MorphingMenu.
- `web-variants.json`: 20 input families at 390px light/LTR/100% and dark/RTL/200%. These were visually inspected, not just captured.
- `web-screens/`: raw actual browser screenshots. Open overlays were captured after animation settled. `DatePicker-open-final.png` is the corrected calendar evidence.
- `web-source-hashes.json`: final audited source hashes. `web-runners/` preserves the local reproduction scripts; their local absolute paths must be adapted on another host. Run capture before action scripts because the capture runner rewrites its intermediate ledger.

All canonical images were reviewed in contact sheets and suspect areas opened at full resolution: Splitter copy, CounterBadge, calendar alignment/selection, popups/dialogs, and input variants. Presentation components do not claim a nonexistent interaction; consumer-supplied action slots are covered by their action component.

## Fixed during this audit

1. Recipe evidence wrapper painted a guessed inverse foreground, making Splitter copy nearly invisible. The wrapper now records metadata without overriding renderer paint.
2. DateRange day hit layers lacked a per-day containing block; pointer clicks were intercepted by another day. Layers are isolated per day and real pointer regression tests pass.
3. CounterBadge flex shrinking let count text escape its pill. It now preserves intrinsic width; the reference places the count beside its IconButton.
4. DatePicker preview discarded selected display values. It now holds selected state. Its manually wrong February 2027 weekday offset now comes from the shared fixture (February 1 is Monday).
5. DateRange reference used an inaccurate 28-day manual grid; shared September 2026 fixture supplies the correct weekday layout and all 30 dates.
6. DatePicker's inline popup was clipped by Showcase's scrolling stage. Only its stage allows visible overflow; full calendar and selection were rechecked.
7. Eleven canonical previews had no-op actions; they now expose local feedback or controlled state for meaningful checks.
8. Per the user's final color clarification, neutral/pale-blue component fills use theme canvas (white in light theme). Primary/Create draft fills, focus borders, compact functional marks and status colors remain. Secondary actions, cards, menus, tables, input interiors, and selection surfaces are canvas; borders preserve selection distinction. Skeleton uses a canvas fill and thin border. Actual image content, provider brand assets, functional scrims and progress/switch marks retain their colors.

## Validation and limits

Latest targeted browser checks: 19 tests in four files (input canvas + primary retention, action contrast, DateRange pointer and CounterBadge). Showcase typecheck, 20 tests, token boundary check and static build passed after the final DatePicker fix. Surface default-border expectations and explicit opt-out preservation passed all 15 core SSR checks. Shared modal backdrop token wiring was followed by six passing overlay/date-picker interaction checks (`web-final-overlay.json`). Parent owns full workspace release gates.

This is local Chromium proof, not Safari/Firefox, a physical screen-reader session, consumer-app integration, native proof or deployed release proof. The 40 additional variants are a selected input matrix, not every possible theme/state/size permutation of all 100 components.
