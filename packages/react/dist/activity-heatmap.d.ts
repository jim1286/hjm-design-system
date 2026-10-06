import { type ActivityHeatmapDescriptor } from '@hjmds/design-contracts/activity-heatmap';
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ActivityHeatmapProps = Readonly<{
    descriptor: ActivityHeatmapDescriptor;
    label: string;
    formatDay: (date: string, value: number | null) => string;
    view?: 'grid' | 'list';
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** The product formats both missing data and measured zero; color never owns meaning. */
export declare function ActivityHeatmap({ descriptor, label, formatDay, view, layoutStyle }: ActivityHeatmapProps): import("react").JSX.Element;
//# sourceMappingURL=activity-heatmap.d.ts.map