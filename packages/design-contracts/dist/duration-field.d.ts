export type DurationUnit = "hours" | "minutes" | "seconds";
export type DurationRange = Readonly<{
    min?: number;
    max: number;
}>;
export type DurationFieldLabels = Readonly<{
    label: string;
    hours: string;
    minutes: string;
    seconds: string;
    increment: (unit: DurationUnit) => string;
    decrement: (unit: DurationUnit) => string;
}>;
export declare function resolveDuration(value: number, range: DurationRange): {
    min: number;
    max: number;
    hours: number;
    minutes: number;
    seconds: number;
};
export declare function changeDurationUnit(value: number, unit: DurationUnit, next: number | null, range: DurationRange): number;
//# sourceMappingURL=duration-field.d.ts.map