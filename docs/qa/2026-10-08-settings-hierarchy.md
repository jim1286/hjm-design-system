# Settings hierarchy correction

The Spint user review on 2026-10-08 rejected settings despite use of the shared
screen. Native inspection showed generic editorial Section headings competing
with the screen title, with redundant strong rules above row content.

SettingsScreen now uses subordinate label/strong/muted group names, md group
spacing and xs header/content spacing. Web retains h2 inside semantic sections;
Native retains the header accessibility role. Public props, product-owned state,
scroll ownership and controls remain unchanged. Both renderers remove the extra
group rule. This is an existing screen correction, not a new settings API.

Validation: both renderer typechecks pass; native screen tests 16 pass; web screen
SSR tests 2 pass; all package builds pass. Usage docs and generated distributions
were updated. Product notification permission row separately passes 13 settings
tests and mobile typecheck, with an actual iPhone 17 Pro/iOS 26.5 simulator review.

Browser visual review: local Storybook common-screen-settings default and dark
were inspected in the browser. Screen title remains dominant; group labels and
row controls remain legible with no extra group rules. Semantic h2 headings remain
in the accessibility tree. These are web checks, not native consumer proof.

Pending: package release checks and
publication, official Spint dependency upgrade, native top/middle/bottom review.
The currently installed Spint package is still 1.17.0, so the source fix is not yet
consumer visual proof. No release or store submission is claimed here.

## Official release receipt

Release Packages run 37780813537 completed successfully at 2026-10-08 13:04:56 UTC.
It verified commit 3aae610af02abd4756148ea6a526ec00b535ac04, published all three
@hjmds packages as 1.17.1, and created annotated tag v1.17.1 pointing to that SHA.
The same commit's Showcase and Visual Baselines runs also passed. The additional
local browser screen suite passed all 14 tests (existing React act warnings remain).

At 13:05 UTC the local canonical release importer and npm view still returned 404
for 1.17.1. Publication logs therefore prove the publish step, not yet successful
consumer resolution. Spint adoption/native visual proof remain pending; no local
renderer copy or bypassed package provenance is used to claim adoption.
