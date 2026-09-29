# Web additions — 2026-09-30

Scope: local ColorPicker, Watermark and Affix source changes. No publication, push or consumer migration. These are Web-only components; no iOS, Android or Flutter implementation is claimed.

- ColorPicker: controlled sRGB hex, alpha, presets, invalid draft preservation, Enter/Escape and native range keys. HEX codes explicitly preserve LTR order inside RTL layouts.
- Watermark: escaped repeated text, unique pattern IDs and pointer/accessibility noninterference. Decorative marking is not tamper protection.
- Affix: nested scrolling, offset/disabled changes without remounting, parent-boundary release and oversized-content fallback.

## Browser review

Built Storybook was exercised in Chromium at 390 × 740. Color edits, save actions and sticky scrolling passed, with no document horizontal overflow. Dark theme, RTL and 200% text were checked together for ColorPicker. The visual review found and corrected reversed HEX punctuation in RTL before the final capture.

- [Color input and alpha](choose-color.png)
- [Dark, RTL and large text](color-dark-rtl-large.png)
- [Nonblocking watermark](mark-document.png)
- [Sticky action after scrolling](sticky-action.png)
- [Machine-readable browser results](browser.json)

The transient browser and local static server are closed after capture. No simulators were started.

## Automated verification

`VITEST_MAX_WORKERS=2 pnpm ci:check` passed with exit code 0 after the RTL correction. It passed contracts (891), React SSR (180), React browser (936), React Native regressions (855), Native showcase (1), and Web showcase (20). Typechecks, bundle budgets, workspace synchronization, renderer evidence, documentation, release governance, showcase token boundaries and the Storybook production build/static inventory all passed. Earlier integration checks identified scenario registry and showcase token-exception drift; both were corrected without suppressing checks.

Verified local catalog: 103 Web Stable entries, no Beta or Planned entries. Native retains 83 Stable / 20 unsupported; Web maturity does not assert Native support. Existing composition patterns are not counted as additional standalone components.
