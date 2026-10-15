export type WorkflowField = Readonly<{
    id: string;
    label: string;
    required?: boolean;
}>;
export type ImportMapping = Readonly<Record<string, string | null>>;
export declare function resolveImportMapping(sources: readonly WorkflowField[], targets: readonly WorkflowField[], mapping: ImportMapping): {
    valid: boolean;
    duplicateTargets: string[];
    missingTargets: string[];
    skipKey: string;
    mapping: ImportMapping;
};
export type FunnelStage = Readonly<{
    id: string;
    label: string;
    count: number;
    reason?: string;
}>;
export declare function resolveFunnel(stages: readonly FunnelStage[]): {
    conversion: number | null;
    previousConversion: number | null;
    lost: number | null;
    id: string;
    label: string;
    count: number;
    reason?: string;
}[];
export type Cohort = Readonly<{
    id: string;
    label: string;
    size: number;
    retained: readonly (number | null)[];
}>;
export declare function resolveCohorts(rows: readonly Cohort[], periodCount: number): {
    retained: (number | null)[];
    rates: (number | null)[];
    id: string;
    label: string;
    size: number;
}[];
export type CorrelationData = Readonly<{
    variables: readonly WorkflowField[];
    values: readonly (readonly (number | null)[])[];
}>;
export declare function validateCorrelation({ variables, values }: CorrelationData): void;
export declare function resolveTarget(actual: number, target: number): {
    actual: number;
    target: number;
    difference: number;
    ratio: number | null;
    progress: number | null;
};
export type HistogramBin = Readonly<{
    id: string;
    lower: number;
    upper: number;
    includesUpper: boolean;
    count: number;
}>;
export declare function binHistogram(samples: readonly (number | null)[], binCount: number, domain?: readonly [number, number]): {
    bins: readonly HistogramBin[];
    domain: readonly [number, number];
    underflow: number;
    overflow: number;
    observed: number;
    missing: number;
    maxCount: number;
};
//# sourceMappingURL=data-workflows.d.ts.map