# Instagram navigation and gallery absorption

Date: 2026-10-01. Local source implementation; no package publication or consumer rollout.

## Observed references and implementation

- [uiuxmanuel navigation, slide 2](https://www.instagram.com/p/Ddb8lXmjnV9/?img_index=2): task-manager capsule with expanded current label and a separate creation circle. Added `BottomNavigation` capsule presentation to both renderers, preserving router ownership and accessible destination names.
- [code.xr Glassy Navbar](https://www.instagram.com/reel/Dd8_OYaTwmG/): brand, destination dropdowns, search and login in a translucent top surface. Added `NavigationBar` slots; Menu/SearchField own existing interactions. Native uses a solid semantic fallback, not simulated native blur.
- [UI inspiration carousel](https://www.instagram.com/p/Dd2ErP4jjrC/?img_index=5): SaaSFrame/Mobbin hero hierarchy; Godly/Dribbble/Behance/Httpster category-led gallery, search, compact metadata and preview grids. Added a working **패턴/작품 탐색** on both platforms with query/category intersection, sorting, saved-only filtering, independent saves and a details Sheet. This is UI implementation, not a resource-directory story. Existing landing/search patterns remain available. Preview artwork and fixture data are original; no third-party gallery images or source code are copied.

## Scope and proof

- NavigationBar is a companion composition to TopBar, not a second route/menu engine.
- Both navigation entries and the gallery have Default/Dark/LargeText stories with Korean role paths.
- `web-results.json` records 390px navigation overflow checks and PNGs record rendered states; actions exercise route change, adjacent creation, RTL, dropdown selection and query clear.
- Native rendering uses the existing iPhone 17 / iOS 27 development client. Device Hub inspection returned `timeoutReached` (-10005); idb/simctl is the documented fallback. Screenshots/AX records are evidence only for visible states, not VoiceOver audio or physical-device GPU.
- The development Refreshing banner may obscure the top edge; it is not part of the component.
- Header graph measured Web 4 modules / 18730 raw / 5174 gzip; Native 2 / 7123 / 2264. CSS addition measured 3339 raw / 600 gzip, preserving prior budget headroom. No optional peer was introduced.

Final validation results are appended after checks complete.

## Final validation

- `pnpm ci:check`: PASS. Contracts 913; Web SSR 180 + browser 977;
  Native 916; Native showcase 12; Web showcase 28. Static Storybook build verifies
  103 canonical component stories and 13 navigation pages; three new standalone
  previews are additionally present in the generated story indexes.
- Native Metro production JS fixture includes the new NavigationBar family:
  674 modules, 1396.8 KiB raw / 341.6 KiB gzip, unchanged application caps.
- Source checks include public API map (258 platform names), platform/import budgets,
  token boundary, documentation links and `git diff --check`.
- Actual iOS interactions: capsule route selection, adjacent creation, RTL;
  header dropdown destination and account-preview toggle; gallery category and sort,
  saving a card, saved-only filtering and opening its detail Sheet. `native-*-actions`,
  `native-gallery-saved` and `native-gallery-detail` capture these outcomes.
- All three entries were recaptured in Default/Dark/LargeText on the existing device.
  Gallery artwork now distinguishes mobile screens, editorial typography and dashboard
  bars. The readable content remains outside the non-accessible decorative artwork.
- Web gallery verifies query/category intersection, sorting, save/filter/detail,
  empty results and reset; three 390px states have no horizontal page overflow.
- A tap during native scroll settling initially missed; a fresh accessibility snapshot
  and settled tap confirmed the action. No application callback change was needed.


## Gallery accessibility follow-up

- Both surfaces now name every save action with its artwork title, including the
  details Sheet, while retaining the existing selected state. This distinguishes
  repeated controls when navigating by accessible button names.
- Native result counts reuse PatternStatus, which bridges changed foreground iOS
  status strings and retains Android live-region semantics. Its lifecycle
  regressions run in the Native renderer host suite (`showcase-pattern-status.test.tsx`); this is not heard VoiceOver proof.
- Targeted checks after this story-only correction: Web showcase typecheck, 28 tests
  and token boundary; Native showcase generation, typecheck and 12 tests all pass.
  The full package gate above predates this correction and was not rerun for unchanged
  public packages.
- Refreshed Chromium captures and actions pass in default/dark/200% text at 390px;
  the saved control is located by its artwork name and exposes aria-pressed=true.
- Existing iPhone 17 / iOS 27 development app: save → saved-only filter → detail
  verified again. `native-gallery-accessible-save` and `native-gallery-accessible-detail`
  PNG/AX pairs show the artwork-specific action name and selected button trait.
  Initial automation observations raced asynchronous layout/scroll settlement; a fresh
  settled frame and tap succeeded. Device Hub again timed out (-10005), so the same
  idb/simctl fallback was used. The development refresh banner remains visible.


## Navigation accessibility follow-up — 2026-10-02

- GlassPreview now reuses the same PatternStatus iOS announcement bridge for
  destination/search-result changes. Native showcase generation, typecheck and all
  12 tests pass. The renderer-host PatternStatus regressions were explicitly rerun:
  two pass, covering changed foreground iOS announcements, duplicate/background
  suppression, Strict Effects and Android live regions.
- axe-core 4.13 WCAG 2 A/AA + 2.1 AA audit of the three new Web entries across all
  three states reports zero violations (`web-axe-results.json`). This is a bounded
  automated audit, not full WCAG certification or manual screen-reader verification.
- Manual-review findings were inspected: the closed Menu's aria-controls target is
  mounted on open; `web-navigation-keyboard.json` verifies its target then exists,
  ArrowDown/End/Enter selects the last destination, and selection/Escape restore
  trigger focus. Gallery contrast review flags only the six decorative Unicode
  symbols within aria-hidden preview art, not informational labels or controls.
- Storybook's own axe runner initially overlapped the independent audit. The audit
  retried only the explicit busy result, then completed all nine states without
  disabling any rules. No accessibility violation was ignored to obtain the result.
