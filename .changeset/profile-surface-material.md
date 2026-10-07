---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add portable surface material settings to design profiles and apply real glass backdrop filtering and clay inset shadows to existing Surface/Card. Resolve readable semantic fill from the final product palette, retain opaque unsupported/reduced-transparency fallbacks, and preserve content state independently of decoration. Native products register an optional backdrop host and confirm inset capability once on HjmNativeProvider; no new mandatory peer or wrapper component is added. See docs/design-profile.md for host conditions and device-validation limits.
