import type { ShowcaseScenarioId } from "@hjmds/design-contracts/showcase";
export declare const reactRendererEvidenceSchemaVersion: 2;
export type ReactRendererEvidenceScenario = Exclude<ShowcaseScenarioId, "contract">;
export type ReactRendererEvidenceComponent = Readonly<{
    /** Canonical component id from the design-contracts catalog. */
    componentId: string;
    /** Public symbols that implement this contract on the declared subpath. */
    exportNames: readonly string[];
    /** Granular @hjmds/react export used by consumers. */
    subpath: `./${string}`;
    /** Scenarios supported by automated first-party renderer evidence. */
    scenarios: readonly ReactRendererEvidenceScenario[];
    /** Repository-local executable proof for every claimed scenario. */
    proofs: readonly Readonly<{
        scenarios: readonly ReactRendererEvidenceScenario[];
        file: `test/${string}.test.tsx`;
        caseId: string;
    }>[];
}>;
export type ReactRendererEvidenceManifest = Readonly<{
    schemaVersion: typeof reactRendererEvidenceSchemaVersion;
    packageName: "@hjmds/react";
    packageVersion: string;
    surface: "web";
    components: readonly ReactRendererEvidenceComponent[];
}>;
/**
 * First-party Web renderer claims. Scenario axes remain fail-closed: this
 * manifest claims a table-driven environment/accessibility smoke matrix.
 * Keyboard and cross-platform parity remain fail-closed until dedicated
 * interaction or paired-renderer proofs are mapped one-to-one.
 */
export declare const reactRendererEvidence: {
    readonly schemaVersion: 2;
    readonly packageName: "@hjmds/react";
    readonly packageVersion: "0.8.2";
    readonly surface: "web";
    readonly components: readonly [Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjmds/react export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>];
};
//# sourceMappingURL=evidence.d.ts.map