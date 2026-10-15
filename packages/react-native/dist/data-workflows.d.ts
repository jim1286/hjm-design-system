import { binHistogram, resolveFunnel, resolveImportMapping, resolveTarget, type Cohort, type CorrelationData, type FunnelStage, type HistogramBin, type ImportMapping, type WorkflowField } from "@hjmds/design-contracts/data-workflows";
export type ImportFieldMappingProps = Readonly<{
    label: string;
    sources: readonly WorkflowField[];
    targets: readonly WorkflowField[];
    mapping: ImportMapping;
    onMappingChange: (mapping: ImportMapping) => void;
    onImport: (mapping: ImportMapping) => void | Promise<void>;
    importLabel: string;
    dismissLabel: string;
    skipLabel: string;
    errorLabel: string;
    disabled?: boolean;
    validationLabel: (state: ReturnType<typeof resolveImportMapping>) => string;
    previewRows?: readonly Readonly<{
        id: string;
        values: Readonly<Record<string, string>>;
    }>[];
}>;
export declare function ImportFieldMapping(props: ImportFieldMappingProps): import("react").JSX.Element;
export type ConversionFunnelProps = Readonly<{
    label: string;
    stages: readonly FunnelStage[];
    formatCount: (count: number) => string;
    missingLabel: string;
    detailLabel: (stage: ReturnType<typeof resolveFunnel>[number]) => string;
}>;
export declare function ConversionFunnel(props: ConversionFunnelProps): import("react").JSX.Element;
export type CohortRetentionTableProps = Readonly<{
    label: string;
    cohorts: readonly Cohort[];
    periods: readonly string[];
    cohortColumnLabel: string;
    formatRate: (rate: number, retained: number, size: number) => string;
    missingLabel: string;
}>;
export declare function CohortRetentionTable(props: CohortRetentionTableProps): import("react").JSX.Element;
export type CorrelationMatrixProps = Readonly<{
    label: string;
    data: CorrelationData;
    variableColumnLabel: string;
    formatValue: (value: number) => string;
    missingLabel: string;
}>;
export declare function CorrelationMatrix(props: CorrelationMatrixProps): import("react").JSX.Element;
export type TargetSummaryProps = Readonly<{
    label: string;
    actual: number;
    target: number;
    formatActual: (actual: number) => string;
    summaryLabel: (summary: ReturnType<typeof resolveTarget>) => string;
}>;
export declare function TargetSummary(props: TargetSummaryProps): import("react").JSX.Element;
export type HistogramExplorerProps = Readonly<{
    label: string;
    samples: readonly (number | null)[];
    binCounts: readonly number[];
    binCount: number;
    onBinCountChange: (count: number) => void;
    domain?: readonly [number, number];
    binLabel: (bin: HistogramBin) => string;
    binCountLabel: (count: number) => string;
    formatCount: (count: number) => string;
    missingLabel: string;
    summaryLabel: (histogram: ReturnType<typeof binHistogram>) => string;
}>;
export declare function HistogramExplorer(props: HistogramExplorerProps): import("react").JSX.Element;
//# sourceMappingURL=data-workflows.d.ts.map