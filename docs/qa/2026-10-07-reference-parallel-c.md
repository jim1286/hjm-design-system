# Reference parallel C — source reading and selected live states

- Date: 2026-10-07. Scope: Component Gallery, Uiverse, 3dicons, Refero.
- This is research evidence, not implementation, adoption, release, or exhaustive interaction QA.
- Existing captures were preserved. Only this report, its own reading index, and three proof PNGs were added. No shared source/ledger, package, lock, dist, Git, remote CI, or native runtime was changed.
- Reading means actually reading captured text; HTTP 200, inventory, and screenshots do not count as reading or interaction completion. Captured sources may differ from the current site.

## Coverage and remaining denominator

| Site | Earlier baseline, not new work | New reading / live work | Still unverified |
| --- | --- | --- | --- |
| Refero | 1,394 captured URL bodies: 1,342 style details + 52 general pages; capture alone was pending reading | All 52 captured general bodies read: 23 ai-agents, 13 design-md, 11 design-styles, 4 examples, 1 home. Own per-URL hash and semantic finding in [reading index](2026-10-07-reference-parallel-c-ledger.json). Wise and Cursor live style detail sections partially read; export tabs not all complete | 1,327 complete style-body reads pending after the first fifteen sorted detail reads; original websites, all export formats, responsive, keyboard, hover, disabled/loading/error states not exhausted |
| Component Gallery | 131 URL variants, 66 equivalent component paths; 2,671 card images / 189 contact sheets / 756 tiles were basic visual evidence | Search → Carousel via ArrowDown/Enter; React filter 22→10; name sort; clear→22. Dark theme menu selection then restored System. Linked Cedar Filmstrip full text read | 66 linked implementation families and their original behavior/variants remain pending. One linked implementation read is not all 22 Carousel examples |
| 3dicons | 224 variants / 222 public views: 211 icons + 11 general basic views previously read/seen | Explore clay/front selected; Notebook search + detail; gradient/iso real asset loaded; download menu; Escape; no-result state | Every icon style/angle combination and similar/footer details remain pending. Two observed URLs do not cover 211 icons × variants |
| Uiverse | Earlier two selected surfaces + blog were partial | Home, 3D-buttons category, thin-owl-11 post read. One post complete HTML (5 lines) and CSS (88 lines) read; Space/focus appearance observed | All posts, categories, paging/filter combinations, full behavior remain pending. Home’s 7,450 and category’s 1,995 are site claims, not independently verified exhaustive URL counts |

## Refero: why extracted tokens cannot be adopted unchanged

[Wise style detail](https://styles.refero.design/style/367c0c6e-73a7-441c-a8ff-91d139ac60dc) places #9fe870 lime in conflicting roles. Its color-role prose/export says “Do not promote it to the primary CTA color”; its Guidelines recommend lime for primary-action fills and active controls. The description and segmented-control prose also use lime for active states. The page’s no-drop-shadow guidance conflicts with its Elevation recipes, including 10px/32px and 40px/40px card shadows. The observation is an inconsistency within Refero’s generated recommendations, not a finding about the original Wise product.

[Cursor style detail](https://styles.refero.design/style/4e3b4717-84c8-4599-baaf-a343c3d619b6) repeatedly exports invalid five-digit #26251 in prose/CSS examples while the palette’s Ink value is #26251e. Guidance about avoiding pill treatment conflicts with pill/button descriptions. Do not mechanically turn these exports into registered presets. Each role requires validation against HJM semantic intent and real rendered states.

Both pages distinguish normalized measurement, interpreted roles, and reconstructed HTML from original source components. Their image previews and component reconstructions provide visual direction; they do not establish original keyboard, responsive, loading, or business behavior. Original Wise/Cursor sites were not exercised here. Wise DesignTokens initial section and DESIGN.md major sections were read; remaining JSON and other export tabs remain pending. Cursor major DESIGN.md sections were read; the full quick-start/export set remains pending.

The 52 general pages consistently put product purpose and actual content first. Useful shared additions are usage guidance for display/reading/technical typography roles, section density/rhythm, screenshot crop/frame/mobile alternatives, and how a composition selects quiet versus operational presentation. Product requirements still own transaction rules, commercial prices, data, permissions, and state transitions. A proposed DESIGN.md specification and vendor-history assertions were read as page claims, not independently verified standards.

![Refero Cursor live detail](assets/parallel-c-refero-cursor.png)

Proof PNG SHA-256: `b8e3af24af908f1061fdf79127f9fc991f1b3e5be6b81736039148c1561f1ab9`.

## 3dicons: selected live interaction chain

[Explore](https://3dicons.co/explore): clay + front radio state selected; visible image currentSrc paths and complete images matched front/clay. Typing Notebook alone did not update results; Enter returned one result. [Notebook detail](https://3dicons.co/icons/628100-notebook?color=clay) opened as a Dialog over Explore. Gradient + iso changed the real image to the 400px gradient isometric asset after an initial loading placeholder. The placeholder was transient, not a persistent defect.

Download opened a menu for current icon, angle bundles, .fbx, .blend, and all icons; no file was downloaded. Pressing Escape on the download trigger closed both the menu and the detail dialog, restoring the prior Notebook search with clay/front. This is observed nested Escape propagation; its code cause was not isolated. Popular sort was selected with one result, so ordering correctness was not demonstrated. Searching `no-such-icon-qa` with Enter displayed No icon to display and preserved clay/front.

Absorb through existing Asset/Image, Dialog/Menu, SearchField/EmptyState, and finite collection composition. A theme can select a material/angle bundle while products own asset meaning and license mapping. Decorative 3D illustrations should not replace functional Icon semantics or official provider assets. Preserve a loading fallback and image layout stability.

![3dicons no-result state](assets/parallel-c-3dicons-no-results.png)

Proof PNG SHA-256: `1d9338bbe3f0882df5cae6c62c345ddcf9df1e29714f39a7b947d13a2af6ffe1`.

## Component Gallery: one linked contract read, not complete original behavior

[Carousel page](https://component.gallery/components/carousel) has 22 examples. React filter showed 10, clear filters restored 22, name sort persisted. Gallery global search accepted Carousel by ArrowDown/Enter. The theme menu used System/Light/Dark menuitemradio; Dark changed the site canvas while static example images retained their original appearance. System was restored.

[Cedar Filmstrip](https://cedar.rei.com/components/filmstrip) full body was read: purpose, applicability, anatomy, interaction, content, accessibility responsibility, adapter/model/frame implementation, events, API. It uses five parts, finite related items, partially visible frames to communicate overflow, and owner-provided data adapters. Whole-frame navigation and nested actions need distinct focus handling. The page says Storybook documentation is not available for this component; no working Filmstrip demo was exercised.

Current HJM web Carousel is a single active finite panel; inactive panels are hidden/inert. Cedar’s multiple-visible scroll model is therefore a distinct collection presentation contract, not a safe cosmetic theme switch. A finite filmstrip/peek composition is a candidate for an explicit presentation capability with focus, scroll, and announcement contracts. It should not silently change Carousel semantics.

## Uiverse: reuse a treatment, retain the Button contract

[3D-buttons category](https://uiverse.io/ui/3d-buttons) and [thin-owl-11](https://uiverse.io/njesenberger/thin-owl-11) were read. The post has a native button plus top/bottom/base decorative layers. CSS uses inset shading, radial gradients, 200ms transitions, and a 6px active translation. Space/focus appearance was observed; an application action result or a held pressed frame was not verified. The inspected CSS has no explicit disabled/loading or prefers-reduced-motion handling; this is a source observation, not complete accessibility QA.

The useful addition is an optional press-feedback treatment on the existing HJM Button engine, with disabled/pending, keyboard, reduced motion and native equivalents preserved. Do not add a second functional Button simply to copy this skin. HJM profiles currently expose contentTransition and selectionMotion; press feedback can be assessed as a separate capability. The post’s MIT notice was read; substantial copied code would require its attribution. No code was copied or installed.

## Outcome and follow-up

This pass reduces Refero’s captured general-body pending denominator from 52 to zero, without marking visual/behavior completeness. The owned JSON contains one URL/hash/finding for every completed general page. Fixed sorted style detail reading is next; any further completion must record an actually read body, not a keyword match. Whole-site completion still requires remaining bodies and real UI/interaction coverage. Research judgments above are proposals; source implementation changes remain parent-owned.

## Ordered style-body reading checkpoint

Full captured text, including canonical DESIGN.md, generated CSS/Tailwind quick starts and similar-card labels, was read for the first fifteen lexically sorted style URLs. This is 15/1,342 style bodies; complete visual and behavioral review of these fifteen remains pending. The owned index records each hash and reading judgment.

- [pampam.city](https://styles.refero.design/style/001480cb-05f4-4802-be39-84b942169481): paper canvas, display serif and tilted browser-frame composition. Periwinkle role prohibits primary CTA while Guidelines and reconstructed Button prescribe it; the agent guide also says no distinct CTA. Nineties fallback is sans in quick-start CSS despite a serif substitute recommendation. OpenType features are described but absent from quick-start recipes. This strengthens the case for role validation rather than raw preset imports.
- [Getburnt](https://styles.refero.design/style/002cc5a7-0d34-4d8d-afa0-c5fad69477d5): body text description uses 1.5 line height at 16px, while CSS exports `--leading-body: 24` and other large unitless leading values. Direct use as CSS line-height would mean a multiplier, not a pixel height; no rendered failure was tested. Captured 1440px pill radius is a shape choice rather than a new common spacing/radius scale. Monochrome recommendations must not suppress semantic error/status accessibility.
- [David Kirschberg](https://styles.refero.design/style/004f4856-4b01-4c23-a9fb-866303d5013b): dark gallery, two surface levels and shadowless thumbnails; imagery supplies color. The floating navigation and horizontal gallery are composition capabilities. Never-grid and single-weight rules are this reference’s recommendation, not a global HJM requirement.

Validation: `node scripts/check-doc-links.mjs` passed: documentation links ready, 573 Markdown files. This checks document links only, not external source correctness or UI behavior.

- [Gsap](https://styles.refero.design/style/00537a20-e99e-4ef2-b119-c6f532c44cc9): category colors serve taxonomy, while hero type and organic imagery overlap. The palette stores a gradient under a color token; generated CSS separately exports solid green and a gradient recipe. HJM should preserve color versus material distinctions. Actual original animation, reduced motion and category behavior are unverified.
- [Haus Otto](https://styles.refero.design/style/0057e55a-8a66-4ffc-9c21-f0b757e580b3): typographic composition with sharp corners. `--card-padding: 12-20px` exports a textual range; it is not a directly usable padding value. Preview display line-height 0.12 differs from the canonical/export 1.0. Fixed 216px/minimum120px heading recommendations need responsive review; compact consent/navigation styling cannot override hit targets or product/legal behavior.

- [Cowboy](https://styles.refero.design/style/00ce9181-45be-4340-b6a6-75a4d5d60cef): Moss is supporting/non-status in token role but success in agent guide; no-card-shadow guidance differs from feature-card Elevation. Third-party Intercom fonts are explicitly excluded in prose but present in generated foundation CSS. Preserve original product variant contracts and photo/scrim roles; exclude third-party widget contamination.
- [Paper](https://styles.refero.design/style/01771d1f-43c6-4e91-88c5-e4d213fe4ff2): two-tone heading description uses invalid #83837 while palette/export uses #83837e. Tags are 4px in guidance but 9999px in export. Suppressing all semantic status color is a marketing recommendation, not a safe universal system rule.
- [Simone Sniekers](https://styles.refero.design/style/017ce823-c338-417d-849d-497c97701c4c): extracted reds/golds are explicitly photographic, not functional UI tokens. The black-text-on-any-photo recommendation does not prove adequate contrast. Bottom overlay composition requires real focus, hit targets and safe areas.
- [Amaterasu](https://styles.refero.design/style/01b3bfc1-95df-425f-9b7a-15cff09adc5f): invalid #0a1a2 hero-surface hex; CSS section-gap50-60px and card-padding30-40px are textual ranges. Gradient recipes and solid colors must retain distinct types. Outline text/radius recommendations differ between component and prompt; tiny tracked labels need accessibility review.
- [Azione](https://styles.refero.design/style/01d00b5d-5afe-4940-97b6-90ee994f62f6): campaign photograph/rust-copy diptych is a useful composition choice; serif/sans/mono roles matter more than copying the brand fonts. A trial-named font requires actual license review. Continuous 20s client marquee recommendation has no verified pause/reduced-motion behavior in the captured text, so it cannot override HJM motion contracts.

Checkpoint: 67/1,394 captured Refero bodies actually read (52 general + 15 full detail). Remaining detail bodies: 1,327. These fifteen details were read in lexical URL order, not selected as the easiest examples. All fifteen complete detail visual/state coverage remains pending; the fourteenth had selected live provenance inspection. Next sorted URL is recorded in the index for continuation.

- [Oevra](https://styles.refero.design/style/01d6013d-a176-4a22-b7dd-fbd113592956): sage wash, light display and photograph inset inside a heading suggest a forest composition, not a palette-only change. Invalid #4e4e4 appears in body/footer/divider recommendations while palette uses #4e4e4e. Quick-start CSS wraps Suisse Int’l with a literal apostrophe inside a single-quoted string without escaping it; this requires valid CSS string handling. Duplicated raw font aliases are capture artifacts, not eight shared font requirements. White text on the suggested soft pale wash needs actual contrast review.

- [Grafik](https://styles.refero.design/style/0226e028-3cd3-440d-b469-ca459267161d): hairline/flush gallery is an explicit composition option; work colors remain outside functional palette. `--radius-all` contains prose after0px, not a directly usable radius. Preview40px line-height0.6 differs from canonical1.2. Captured spacing values do not become a normative global grid.
- [Apple (España), AirPods Pro](https://styles.refero.design/style/022cf675-42d1-44e7-953a-68facc802117): separate buy/link colors, product-centered imagery and asymmetric headline. Intro calls large tracking negative while measured scale/philosophy opens it positively. Captured `numr` OpenType flags need contextual interpretation, not global enablement. Original Apple product behavior was not tested; imagery/material gradient and UI action colors retain different roles.

## Live provenance mismatch: labelled TeePublic

The fourteenth sorted [Refero detail](https://styles.refero.design/style/0231caf5-0347-4f2d-ba20-5bab8fcaf2ce) is titled TeePublic throughout its description and DESIGN.md, but the origin link is https://unfurproject.com. The current live page reproduces that title/link mismatch. Its visible preview contains unrelated lottery promotion imagery; this is not verified evidence of the original TeePublic brand design. No original-domain browsing, registration, transaction or external mutation was performed. This is an observed provenance problem within the reference record, not a claim about the cause or current state of TeePublic itself.

Exclude the record from official-brand implementation evidence until its origin/capture/identity are reconciled. Its body also recommends no large violet fills while describing full-width violet promo/trust bands, and its red role differs from urgent-state recommendations. Those source recommendations were read, but should not enter a preset without validation.

![Refero title and unrelated preview](assets/parallel-c-refero-provenance.png)

Proof PNG SHA-256: `4ddad916a2a6e97d8cf7115ceff3b5145eaa9d123949104b7efe46886677d333`.

- [Break Maiden](https://styles.refero.design/style/02610b06-d16e-47bd-a1ea-18979a9ed4f5): pure-black irregular three-column portfolio is an explicit composition choice. Preserve logical reading/focus order before considering an irregular layout variant. Invalid #8e8e8 differs from palette #8e8e8e; preview display line-height0.63 differs from canonical1/normal. Fixed153px/min96px display sizing still needs real responsive content review.
