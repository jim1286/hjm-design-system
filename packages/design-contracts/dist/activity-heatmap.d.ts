export type ActivityDay = Readonly<{
    date: string;
    value: number;
}>;
export type ActivityHeatmapDescriptor = Readonly<{
    startDate: string;
    endDate: string;
    days: readonly ActivityDay[];
    thresholds?: readonly [number, number, number];
    weekStartsOn?: 0 | 1;
}>;
export declare function resolveActivityHeatmap(input: ActivityHeatmapDescriptor): {
    days: {
        date: string;
        value: number | null;
        level: number;
        row: number;
        column: number;
    }[];
    columns: number;
};
//# sourceMappingURL=activity-heatmap.d.ts.map