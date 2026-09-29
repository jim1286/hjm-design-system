---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Use theme canvas tokens for neutral component backgrounds and white light-theme input interiors, keeping blue focus/selection outlines and typed primary CTA fills such as Create draft. Secondary buttons use their typed recipe with white fill and a neutral control border. Fix native OTP interaction/rendering, repeated UploadItem progress text, GestureSheet first presentation, Web DateRangePicker pointer hit areas and CounterBadge shrinkage discovered during full showcase device/browser auditing.

Align renderer contracts peers with the authored 1.8 train before version generation, following docs/RELEASE_GOVERNANCE.md; keeping the previous train would incorrectly turn a minor peer update into a major release.
