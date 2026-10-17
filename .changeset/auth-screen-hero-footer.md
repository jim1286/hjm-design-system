---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Login screen hero and policy links follow `authScreenRecipe` (2026-10-17 user feedback, "굵기랑 크기 줄여" / "간격 줄여"). New `AuthScreenHero` (mark, eyebrow, title, description) and `AuthScreenFooter` (consent notice and policy links) fill the `AuthScreenLayout` slots on Web and Native. The tagline uses `typography.heading` 24/32 at the title weight 500 (`titleLarge` 20/28 in compact) instead of the 32/40 display heading that `Top large` gave, so a Korean slogan fits one line at 402. Policy links are caption, brand colour and underlined, separated by `linkGap` 8 + "·" + 8 (about 19px between texts instead of 40–42 from ghost-button padding plus a Stack gap); the 44px touch target is a background-less height plus an invisible inline extension (Web pseudo-element, Native hitSlop). `authScreenRecipe.title` is now `typography.heading`, and the resolved descriptor carries `titleVariant`.
