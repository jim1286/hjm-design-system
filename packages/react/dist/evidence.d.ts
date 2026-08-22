import type { ShowcaseScenarioId } from "@hjm/design-contracts/showcase";
export declare const reactRendererEvidenceSchemaVersion: 2;
export type ReactRendererEvidenceScenario = Exclude<ShowcaseScenarioId, "contract">;
export type ReactRendererEvidenceComponent = Readonly<{
    /** Canonical component id from the design-contracts catalog. */
    componentId: string;
    /** Public symbols that implement this contract on the declared subpath. */
    exportNames: readonly string[];
    /** Granular @hjm/react export used by consumers. */
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
    packageName: "@hjm/react";
    packageVersion: string;
    surface: "web";
    components: readonly ReactRendererEvidenceComponent[];
}>;
/**
 * First-party Web renderer claims. Scenario axes remain fail-closed: this
 * manifest claims only table-driven default renders. Dedicated interaction
 * suites exercise richer behavior without promoting those axes until each has
 * a stable, one-to-one executable proof entry.
 */
export declare const reactRendererEvidence: {
    readonly schemaVersion: 2;
    readonly packageName: "@hjm/react";
    readonly packageVersion: "0.7.1";
    readonly surface: "web";
    readonly components: readonly [Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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
        /** Granular @hjm/react export used by consumers. */
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