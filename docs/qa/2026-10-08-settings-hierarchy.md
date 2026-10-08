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

Pending: browser visual review of this shared change, package release checks and
publication, official Spint dependency upgrade, native top/middle/bottom review.
The currently installed Spint package is still 1.17.0, so the source fix is not yet
consumer visual proof. No release or store submission is claimed here.
