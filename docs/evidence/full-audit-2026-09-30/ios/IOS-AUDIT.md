# iOS actual-screen audit — 2026-09-30

Release-gate re-run of the [2026-09-29 iOS audit](../../full-audit-2026-09-29/IOS-AUDIT.md) on current sources. The ledger is [ios.json](ios.json). Captures were written outside the Metro watch tree and copied here only after every device interaction finished. That rule comes from the Fast Refresh crash in the 9/29 audit.

## Environment and method

- Existing booted **iPhone 17 simulator, iOS 27.0** (UDID `9ED1529C-5CAA-45CF-B234-E5301C92C89C`). No simulator was created or booted. Installed development client `dev.hjm.designsystem.showcase` on Metro 8084. Metro was shared with a concurrent Android audit and was not restarted.
- Sources: checkout `f1d28a3` (1.8.0), plus uncommitted work from other sessions. Canonical renderer sources had no change after 01:30. Only interaction-adapter files changed during the audit.
- Control: `idb ui tap/swipe/text`, and `idb ui describe-all` for labels, values and traits. Long-press drag used idb gRPC HID events (0.9 s hold, then stepped moves). Screens came from `simctl io screenshot/recordVideo`. Device Hub was running, but this session had no automation channel to it. The earlier passes recorded `timeoutReached`, and the user approved the idb fallback for HJM validation.
- Bundle note: the client first ran a bundle that predated another session's 03:20 `design-contracts` dist rebuild, so Celebration showed only blue particles. I terminated and reopened the client on Metro 8084 at about 03:38. After that, colors matched source. Every interaction-adapter check was repeated on the fresh bundle. Canonical findings were re-confirmed on it too.

## Counts

| Scope | Result |
| --- | --- |
| Canonical Native components | **83/83 rendered and visually reviewed** (images were opened and read, not just captured) |
| Interaction verified on screen | **48** (the 47 from 9/29, plus ThinkingOrb temporal/paused via pixel diff) |
| Presentation-only (no required action) | 35 |
| Components with findings | 7: agreement, number-field, switch, combobox, tags-input, upload-item, sheet |
| Regressions vs 2026-09-29 | **none found**. Every visual finding also appears in the 9/29 captures, or in code unchanged since then. |
| Optional entries | Interaction adapters (Playground, Shared transition, both reduced-motion scenarios), Liquid Toast (Capsule/LongCopy/Reduced), gesture sheet, image viewer, keyboard dock, native context menu: all flows passed. Findings are listed below. |
| Compositions | Cascader, Rating (whole/half/read-only), Time selection, Notification settings: passed |

## Findings

| # | Component | Repro | Expected | Actual | Evidence | vs 9/29 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Agreement | Agreement story → Agree to everything | Check mark ≥3:1 against its fill (the Checkbox renderer uses a white ✓) | Dark ✓ `#191F28` on `#075985` = **2.19:1**. AX labels also carry the glyph (`✓, Terms of service`) | agreement-all.png, agreement-fresh.png | pre-existing (same in 9/29 white-agreement-selected.png) |
| 2 | UploadItem | Data display → upload row | Cancel/Retry reachable by assistive tech | Row root is `accessible` with a label, so the whole row is one AX element (`profile-photo.png`, busy). Cancel is not in the tree and has no custom action. Touch Cancel works | data-middle.png, upload-cancel.png | pre-existing code; 9/29 did not inspect the AX tree |
| 3 | NumberField | Inputs → Quantity | Announced value matches the display (2, 3) | AXValue `20%` / `30%`: `min/max/now` without `text` becomes a percentage in UIKit | number-slider-form.png | pre-existing code |
| 4 | Sheet | Overlays → Open sheet | Content clears the home indicator | `safeAreaInsets` defaults to `{}`. "Sheet content" ends at about 861 pt, inside the indicator zone (>840 pt) | sheet-open.png | pre-existing (9/29 sheet-open-final.png) |
| 5 | Switch | Inputs Notifications row; Notification settings | Track centered on its label | Track sits about 8–10 pt above the label center | choices-after.png, notif-saved.png | pre-existing (9/29 inputs-choices.png) |
| 6 | Combobox | Inputs → City → Busan | Value visible after commit | Input refocuses and the keyboard covers the committed value | city-value.png | pre-existing (9/29 recorded the same state) |
| 7 | TagsInput | Type 42 ⏎, then more | Keyboard stays up for the next tag | Default blur-on-submit dismisses the keyboard after every tag | tags-korean.png | code unchanged; not previously exercised |
| 8 | SortableCollection / SwipeActions (experimental) | Reduced Motion scenario (dark, RTL, 200%) | Reorder and action rows mirror in RTL | Rows stay LTR (`앞으로` left of `뒤로`, `보관` left of `삭제`); ⠿ stays before the label | reduced-top.png, reduced-result.png | new adapters; also visible in the 02:26 adapter capture |
| 9 | Gesture Sheet (optional) | Experimental/Optional Adapters → 시트 열기 | Title, input and 닫기 individually accessible | One AX element `Bottom Sheet`, plus handle and backdrop with English library defaults. The full-height snap draws the title under the status bar. Input has no field frame | gesture-open.png, gesture-expanded.png | pre-existing (overlap and frame visible in 9/29 gesture-typed-final.png) |
| 10 | Image Viewer (optional) | 이미지 보기 | Controls and caption share the content gutter | Caption at x=0; buttons full-bleed with radius | imageviewer.png | pre-existing (identical 9/29) |

## Verified behaviour (summary)

Actions/Link/Auth/BottomCTA callbacks. Agreement master mixed/all states. Field/Search clear/TextArea/Password reveal. OTP 128→128645. NumberField 2↔3. Slider 72→95%. Form save. DatePicker 2027-02-16. Range 1–4. Calendar Oct 14. Tags add/remove. Mentions @skyline. TransferList Walk→Chosen. FilePicker `preview.png`. Checkbox/Radio/groups/Switch/Chip/Segmented/Toggle. Select English, Combobox Busan. Tabs/TopBar/BottomNav/LoadMore/Menu edit. Carousel manual/swipe/autoplay pause-resume. ListRow, Accordion, Collapsible, Upload cancel. Toast show/dismiss. Dialog/Alert/Info alert/Sheet close paths including backdrop. FAB adds 123. VirtualList 1–7→10–15. The QR raster decodes to `https://example.com/한글` ([decode](ios-qr-decode.json)). ThinkingOrb nine states in light/dark, animated vs paused. Liquid Toast morph (video frames), action, 3-item queue, swipe dismiss, reduced direct card. Adapters: drag and buttons, swipe reveal/run/menu, content/text transition, carousel motion, multi-color celebration and its reduced-motion suppression, shared transition with button/short-cancel/long-return and reduced instant/gesture-off. Gesture sheet, keyboard dock 321, context menu save/delete.

## Not claimed

Spoken VoiceOver, physical devices, Release binaries, other device sizes or system text sizes, Photos permission, provider login, and external links. A debug-client pass does not establish Release first-launch compatibility.
