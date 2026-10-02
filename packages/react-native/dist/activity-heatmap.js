import { jsx as _jsx } from "react/jsx-runtime";
import { ScrollView, View } from 'react-native';
import { Text } from './primitives.js';
import { useHjmNativeTheme } from './provider.js';
import { spacing, radius } from '@hjmds/design-contracts/foundations';
import { resolveActivityHeatmap } from '@hjmds/design-contracts/activity-heatmap';
// Match the compact Web data-cell radius rather than the full control corner.
export function ActivityHeatmap({ descriptor, label, formatDay, view = 'grid' }) { const { days, columns } = resolveActivityHeatmap(descriptor); const { colors } = useHjmNativeTheme(); if (view === 'list')
    return _jsx(View, { accessibilityLabel: label, children: days.map(day => _jsx(Text, { children: formatDay(day.date, day.value) }, day.date)) }); return _jsx(ScrollView, { horizontal: true, accessibilityLabel: label, children: _jsx(View, { style: { flexDirection: 'row', gap: spacing.xxs }, children: Array.from({ length: columns }, (_, column) => _jsx(View, { style: { gap: spacing.xxs }, children: Array.from({ length: 7 }, (_, row) => { const day = days.find(day => day.column === column && day.row === row); return _jsx(View, { accessible: Boolean(day), accessibilityLabel: day ? formatDay(day.date, day.value) : undefined, style: { width: spacing.md, height: spacing.md, borderRadius: radius.sm / 4, overflow: 'hidden', backgroundColor: day ? colors.surfaceAlt : 'transparent', borderWidth: day?.value === null ? 1 : 0, borderStyle: 'dashed', borderColor: colors.border }, children: day && day.level > 0 ? _jsx(View, { pointerEvents: "none", style: { flex: 1, backgroundColor: colors.contentBrand, opacity: day.level / 4 } }) : null }, row); }) }, column)) }) }); }
//# sourceMappingURL=activity-heatmap.js.map