export type StatisticTrendDirection = "up" | "down" | "flat";
export type StatisticTrendTone = "neutral" | "success" | "warning" | "danger";
export declare const statisticDefaults: {
    readonly trendTone: "neutral";
};
export type StatisticTrendDescriptor = Readonly<{
    direction: StatisticTrendDirection;
    /** Direction and meaning are independent: an increase is not always good. */
    tone?: StatisticTrendTone;
    /** Visible localized copy ensures the trend is never communicated by color alone. */
    label: string;
}>;
export type StatisticDescriptor<Id extends string = string> = Readonly<{
    id: Id;
    label: string;
    /** Products own number/date/unit formatting and pass the final visible string. */
    value: string;
    prefix?: string;
    suffix?: string;
    hint?: string;
    trend?: StatisticTrendDescriptor;
}>;
export type StatisticGroupDescriptor<Id extends string = string> = Readonly<{
    items: readonly StatisticDescriptor<Id>[];
    columns?: 1 | 2 | 3 | 4;
}>;
export type ResolvedStatisticTrendDescriptor = Omit<StatisticTrendDescriptor, "tone"> & Readonly<{
    tone: StatisticTrendTone;
}>;
export type ResolvedStatisticDescriptor<Id extends string = string> = Omit<StatisticDescriptor<Id>, "trend"> & Readonly<{
    trend?: ResolvedStatisticTrendDescriptor;
}>;
export declare function validateStatisticDescriptor<Id extends string>(descriptor: StatisticDescriptor<Id>): void;
export declare function resolveStatisticDescriptor<Id extends string>(descriptor: StatisticDescriptor<Id>): ResolvedStatisticDescriptor<Id>;
export declare function validateStatisticGroup<Id extends string>(group: StatisticGroupDescriptor<Id>): void;
export declare const statisticTrendMarks: {
    readonly up: "trendUp";
    readonly down: "trendDown";
    readonly flat: "trendFlat";
};
//# sourceMappingURL=statistic.d.ts.map