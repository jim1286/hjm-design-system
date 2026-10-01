# Dashboard pattern — 2026-10-01

Web/Native Storybook Patterns/Dashboard, Default/Dark/LargeText. Existing AnimatedStatistic, ActivityHeatmap, List/ListRow, EmptyState and Button compose the view. All totals derive from seven original synthetic records clearly marked as examples, not real product analytics.

Shared test verifies September: 7 records / 125 minutes / 6 active days; recent week: 4 / 80 / 3; August: zero. Heatmap sums equal record counts. Missing days are known zero because this local fixture is complete, not partially fetched data.

[Browser results](browser.json) cover 390 × 844 in three states: week selection excludes older records, date-list mode reports two entries on September 28, August shows an empty state, and returning to September restores the full list. Both showcase checks passed. Native Default/Dark/LargeText initial views and empty month → restored month were subsequently verified on iPhone 17 / iOS 27.0; see the [Native follow-up](../native-visual-integration-2026-10-01/README.md). No backend/loading/permissions support is claimed for this local synchronous pattern.
