# Profile studio implementation evidence

2026-10-01. Local implementation only; no npm release, product migration or deployment.

Implemented: shared Avatar fallback context and seed validation, Web/Native optional
Blobatar 2.7.0 factories, Native photo-source recovery, shared localized profile
fixture and two profile/settings stories. Original Blobatar geometry is used.
Other visual-integration phases remain planned.

Passed: three package builds/typechecks, Web browser Avatar regression, Native
Avatar and stable-core regressions (SVG host mocked; actual generation runs),
contract validation test, both showcase checks, library-policy static checks,
document links and API-map checks. Root/base import graphs do not reach Blobatar;
both new optional entry budgets pass at under 0.8 kB local source, excluding peers.

Browser: Chromium, 1200×900 and 390×844. Face selection/application exercised;
no page errors or horizontal overflow. Also rendered dark mode, 200% text,
RTL and reduced motion together; no horizontal overflow. Images in this directory
are actual captures. This is not a screen-reader audit or a Native screenshot.

Native visual verification remains outstanding: Device Hub returned
`timeoutReached` on two connection attempts. No new simulator or release build
was started. Existing native showcase story registration was regenerated.

Full renderer budget gate remains blocked by the existing Native `./overlays`
gzip limit (reported 15.3 kB, slightly over its effective limit). Its local graph
contains overlays/actions/primitives/provider/styles/modal-lifecycle, none of
which this implementation changed. No existing limit was increased to hide it.
The new adapter entries have explicit budgets and optional-peer exemptions;
base imports retain the existing optional-peer prohibition.

The native test configuration inlines only the upstream Blobatar adapter so SVG
imports use the platform test host instead of attempting to execute RN Flow in Node.
The real device render and platform accessibility still need separate verification.

`pnpm peers check` also reports existing workspace compatibility mismatches for
RN/Reanimated/Worklets, Storybook, and safe-area-context. This step did not upgrade
those packages. New Blobatar peers resolve to 2.7.0, but a workspace-wide peer
compatibility pass is not claimed.
