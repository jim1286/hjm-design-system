---
"@hjmds/design-contracts": minor
"@hjmds/react": patch
"@hjmds/react-native": patch
---

All text weights are one step lighter (2026-10-17 user decision, "굵기 좀더 줄여"). Display headings `heading.level1`/`level2` are semibold 600 (brutalist keeps 800); `typography.title`, `titleLarge`, `heading` and heading levels 3–5 are medium 500; Text emphasis is regular 400, medium 500 and strong 500, with `strong` following the title weight. Label stays 500 and body 400. Component recipes follow the same mapping: titles use the title weight, labels and emphasized text 500, display numbers (Statistic value) and selected/checked states 600. Web CSS reads `--hjm-type-title-weight` and `--hjm-text-emphasis-*` instead of fixed bold/semibold, and card, dialog, sheet, alert dialog, side panel, tour, notice, empty state and result titles no longer fall back to the browser's bold. Native tables, charts and counter badges read the same recipe values, and Pretendard draws 500/600 with the Medium/SemiBold faces.
