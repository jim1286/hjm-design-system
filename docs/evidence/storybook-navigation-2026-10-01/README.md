# Storybook navigation audit

2026-10-01 · Local source/build/device evidence, not publication or consumer adoption.

- 88 CSF titles moved or normalized; shared category definitions and migration table: [navigation contract](../../STORYBOOK_NAVIGATION.md).
- Web static index: 358 IDs before and after, no removed or added IDs; 186 indexed entries have updated titles. Canonical static verification: 103 components and 13 navigation pages.
- Web showcase: typecheck, 27 tests, token boundary check and production Storybook build passed.
- Native showcase: story generation, typecheck and 11 tests passed. Navigation regression checks category validity, duplicate titles/IDs and identical Web/Native category ordering.
- Native runtime 10.4.4 ignores meta.id in prepareStories. An initial attempt to preserve explicit IDs caused MissingStoryFromCsfFileError; explicit IDs were removed on Native. New title-derived links were then verified on the running app. Web retains previous IDs. No dependency update or native binary build was needed.
- Existing iPhone 17 / iOS 27.0 developer host: Blobatar Avatar, Effect Surface, Lucide Icon and Liquid Toast selected and captured at their expected new breadcrumbs. PNG and accessibility JSON files are adjacent. Device Hub had timed out in the ongoing task; these checks used idb/simctl fallback.
- The existing blue development Refreshing banner is visible in captures; these prove navigation and selected content, not an unobstructed physical iPhone 12 result.

## Korean navigation follow-up

At the user's request, all six root labels and the component role categories are Korean.
Pattern, gallery and foundation-tool navigation labels are also Korean; public component/API names remain unchanged.
203 CSF groups were reviewed. Web retains all 358 original IDs. Native uses title-derived Unicode IDs
(e.g. `컴포넌트-피드백-liquid-toast--default`); percent-encode these when opening a URL.
Both showcase checks and the Web build/static index verification were rerun after localization.
The four files whose names begin with 컴포넌트 capture the Korean breadcrumbs on the same existing iPhone 17 / iOS 27.0 host.
