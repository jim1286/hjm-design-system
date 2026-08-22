import { type ShowcaseComponentEntry, type ShowcaseCoverageEntry, type ShowcaseEvidenceEntry, type ShowcaseScenarioId, type ShowcaseSurface } from "./showcase.js";
export declare const designSystemEvidenceSchemaVersion: 1;
export type DesignSystemEvidenceSourceKind = "storybook" | "interaction-test" | "accessibility-audit" | "visual-regression" | "device-test" | "contract-test";
export type DesignSystemEvidenceSource = Readonly<{
    /** Stable repository or product identifier, for example `burntok-web`. */
    id: string;
    /** Human-readable owner shown in generated reports. */
    product: string;
    surface: ShowcaseSurface;
    kind: DesignSystemEvidenceSourceKind;
    /** Optional immutable Git revision or release identifier. */
    revision?: string;
}>;
export type DesignSystemEvidenceItem = Readonly<{
    /** Canonical `category/component-id` from `showcaseManifest`. */
    storyId: string;
    scenarios: readonly ShowcaseScenarioId[];
    /** Product Storybook id when it differs from the canonical HJM id. */
    storybookStoryId?: string;
}>;
export type DesignSystemEvidenceManifest = Readonly<{
    schemaVersion: typeof designSystemEvidenceSchemaVersion;
    designSystemVersion: string;
    source: DesignSystemEvidenceSource;
    entries: readonly DesignSystemEvidenceItem[];
}>;
export type ShowcaseStoryIdComparison = Readonly<{
    surface: ShowcaseSurface;
    expected: readonly string[];
    actual: readonly string[];
    missing: readonly string[];
    unexpected: readonly string[];
    duplicates: readonly string[];
    complete: boolean;
}>;
/**
 * Returns the canonical component story ids that currently require evidence on
 * one surface. Consumers use this instead of maintaining hard-coded lists.
 */
export declare function getShowcaseStoryIdsForSurface(surface: ShowcaseSurface, manifest?: readonly ShowcaseComponentEntry[]): readonly string[];
/** Compares a product Storybook inventory with the pinned contract package. */
export declare function compareShowcaseStoryIds(surface: ShowcaseSurface, storyIds: readonly string[], manifest?: readonly ShowcaseComponentEntry[]): ShowcaseStoryIdComparison;
export declare function assertShowcaseStoryIds(surface: ShowcaseSurface, storyIds: readonly string[], manifest?: readonly ShowcaseComponentEntry[]): void;
/** Runtime validation for evidence artifacts submitted by product repositories. */
export declare function defineDesignSystemEvidence(input: DesignSystemEvidenceManifest, manifest?: readonly ShowcaseComponentEntry[]): DesignSystemEvidenceManifest;
export declare function createDesignSystemEvidence(source: DesignSystemEvidenceSource, entries: readonly DesignSystemEvidenceItem[]): DesignSystemEvidenceManifest;
export declare function toShowcaseEvidenceEntries(evidence: readonly DesignSystemEvidenceManifest[]): readonly ShowcaseEvidenceEntry[];
export declare function createDesignSystemEvidenceCoverage(evidence: readonly DesignSystemEvidenceManifest[], manifest?: readonly ShowcaseComponentEntry[]): readonly ShowcaseCoverageEntry[];
//# sourceMappingURL=evidence.d.ts.map