---
"@hjmds/design-contracts": minor
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Remove the large (display) type tier (2026-10-17 user decision, "글자 너무 커", "큰 글자 정책은 없애"). The largest text in HJM is now `typography.heading` 24/32. `heading.level1` (was 40/48/600) and `heading.level2` (was 32/40/600) are deprecated aliases with the same value as `level3` (24/32/500); new code builds hierarchy with `level3` → `level4` (20) → `level5` (18) and sets the document level with `semanticLevel`. `Top size="large"` reads `heading.level3` (24) instead of `level2` (32). Design profiles reject any typography or heading step above 24px with `RangeError`, and profile `typography.heading` overrides now also flow into level1/2. The editorial (56/42/30) and brutalist (48/38/30) enlarged headings are gone; brutalist keeps its 800 heading weight only, and minimal drops its now-redundant medium-weight overrides. The Statistic value keeps semibold 600 explicitly instead of borrowing the removed display weight.
