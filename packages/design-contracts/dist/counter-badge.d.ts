export type CounterBadgeTone = "danger" | "brand" | "neutral";
export type CounterBadgeSize = "small" | "medium";
export type CounterBadgeVariant = "inline" | "floating";
/** Shared defaults usable without importing the visual recipe barrel. */
export declare const counterBadgeDefaults: {
    readonly tone: "danger";
    readonly size: "medium";
    readonly variant: "inline";
    readonly max: 99;
};
export declare function formatCounterBadgeCount(count: number, max?: number): string | null;
//# sourceMappingURL=counter-badge.d.ts.map