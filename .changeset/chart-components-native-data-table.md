---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Chart and DataTable absorption (2026-10-14 user request to absorb well-known chart and table libraries; Yajalal had rebuilt the same scrubbing line chart, bars and sortable stat table on its own).

- Chart: new `@hjmds/design-contracts/components/chart` geometry contract (line/area/stacked area, grouped and stacked bars, pie/donut, radar, scatter, nice ticks, monotone curve, focus stepping, `describeChart` text alternative) and `LineChart`, `BarChart`, `PieChart`, `RadarChart`, `ScatterChart`, `Sparkline`, `ChartLegend` on Web (`@hjmds/react/chart`, SVG) and Native (`@hjmds/react-native/chart`, react-native-svg). Missing values draw as gaps, bars always include zero, `invert` puts the best rank on top, radar axes share one domain, pie ignores negative values, and series colors come from the product or the dataviz palette (never status colors). Line charts scrub by horizontal drag and step via arrow keys (Web slider) or adjustable increment/decrement (Native). This reverses the earlier tokens-only decision; dataviz token values are unchanged.
- DataTable: new Native renderer `@hjmds/react-native/data-table` (pinned columns plus horizontal scroll, `onRowPress`/`selectedRowId`). Column options `sortDescFirst` and `pinned: "start"`, renderer `summaryRow` slot on Web and Native. `getNextDataTableSortState` takes an optional first direction (default ascending, unchanged behavior).
- Sorting helpers in `@hjmds/design-contracts/components/data-table`: `dataTableFirstSortDirection`, `toDataTableSortValue`, `compareDataTableValues`, `sortDataTableRows` (stable, missing values last in both directions) and `splitPinnedDataTableColumns`. Renderers still never reorder rows.
