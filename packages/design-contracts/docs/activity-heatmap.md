# Activity heatmap

Reviewed: 2026-10-01. `/activity-heatmap` exports ActivityHeatmap on Web and Native.
Use it for a year-sized activity overview; Calendar remains the date-picker owner.
The showcase profile-activity fixture demonstrates its intended consumption. Values
are local demonstration data, not evidence of user engagement or GitHub activity.

The descriptor accepts inclusive ISO `startDate` and `endDate`, unique `days` entries
`{date, value}`, optional increasing positive `thresholds` (default 1, 3, 7), and
`weekStartsOn` (0 Sunday or 1 Monday, default Monday). Values must be finite and
nonnegative. Duplicate/out-of-range dates, invalid calendar dates and inverted or
longer-than-366-day ranges throw. Products paginate longer histories to keep the
visual overview and Native accessibility traversal bounded.

UTC calendar arithmetic avoids daylight-saving day shifts. Missing entries remain
`null`; an explicit zero stays zero. Missing cells have a dashed outline. Nonzero
values map to four intensities: up to the first threshold, then the second, then
the third, then above it. Zero and unknown use the neutral surface. The semantic
brand palette controls intensity; no provider-specific colors or fetching are built in.

Pass localized `label` and `formatDay(date, value)`; handle null explicitly.
Grid cells have those accessible labels and the Web also exposes hover titles.
`view="list"` provides the same information as visible text, so color is not the
only way to inspect values. The product supplies the view toggle using Button.
Native hosts put long lists in their own vertical ScrollView. Grid rendering scrolls
horizontally and is read-only; these small cells are not undersized tap targets.

Both showcases register `컴포넌트/데이터 표시/Activity Heatmap` with Default, Dark and
LargeText, including a functional list toggle. Contract and renderer tests verify
leap dates, missing/zero semantics, invalid data and accessible values. Native host tests are supplemented by the [LargeText simulator flow audit](../../../docs/evidence/component-flows-2026-10-01/README.md):
list/grid switching, unknown-data wording and readable date/value rows were verified.
Physical-device rendering and manually heard VoiceOver traversal remain unverified.
