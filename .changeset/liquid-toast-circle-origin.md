---
"@hjmds/design-contracts": patch
"@hjmds/react-native": patch
---

Use a circular in-app Liquid Toast origin and a less rounded 12-unit card. Share the card radius
with Native content clipping, retaining existing anchor API keys and default settled card placement.

Reduce Liquid Toast depth with the raised shadow token, fade out the goo-filtered surface during
expansion, and reveal content at its final scale to avoid an inflated card silhouette.

Refine the liquid card hierarchy and narrow-screen text space with a top-aligned title/body,
a rounded-square status badge, and an independent trailing close target.

Redesign the liquid card as a two-row banner with an unboxed heading glyph, full-width description
and a separated full-width action footer instead of a badge column and pill action.

Fix the settled surface losing its fill when the goo layer fades: retain the shape under its shadow
so the light card stays crisp and the dark card remains visible.

Use the light background and dark accent-surface tokens for a cleaner white / blue-tinted card,
retaining its single outline so the light card remains distinct from the page.
