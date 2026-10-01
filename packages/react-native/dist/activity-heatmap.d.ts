import { type ActivityHeatmapDescriptor } from '@hjmds/design-contracts/activity-heatmap';
export type ActivityHeatmapProps = Readonly<{
    descriptor: ActivityHeatmapDescriptor;
    label: string;
    formatDay: (date: string, value: number | null) => string;
    view?: 'grid' | 'list';
}>;
export declare function ActivityHeatmap({ descriptor, label, formatDay, view }: ActivityHeatmapProps): import("react").JSX.Element;
//# sourceMappingURL=activity-heatmap.d.ts.map