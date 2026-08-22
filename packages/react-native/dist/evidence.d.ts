import type { ShowcaseScenarioId } from "@hjm/design-contracts/showcase";
export declare const reactNativeRendererEvidenceSchemaVersion: 2;
export type ReactNativeRendererEvidenceScenario = Exclude<ShowcaseScenarioId, "contract">;
export type ReactNativeRendererEvidenceComponent = Readonly<{
    /** Canonical component id from the design-contracts catalog. */
    componentId: string;
    /** Public symbols that implement this contract on the declared subpath. */
    exportNames: readonly string[];
    /** Granular @hjm/react-native export used by consumers. */
    subpath: `./${string}`;
    /** Scenarios supported by automated first-party renderer evidence. */
    scenarios: readonly ReactNativeRendererEvidenceScenario[];
    /** Repository-local executable proof for every claimed scenario. */
    proofs: readonly Readonly<{
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        file: `test/${string}.test.tsx`;
        caseId: string;
    }>[];
}>;
export type ReactNativeRendererEvidenceManifest = Readonly<{
    schemaVersion: typeof reactNativeRendererEvidenceSchemaVersion;
    packageName: "@hjm/react-native";
    packageVersion: string;
    surface: "native";
    components: readonly ReactNativeRendererEvidenceComponent[];
}>;
/**
 * First-party Native renderer claims. These are automated component-level
 * smoke claims, not device, TalkBack, or VoiceOver certification. Scenario
 * axes are added only after their dedicated runtime evidence exists.
 */
export declare const reactNativeRendererEvidence: {
    readonly schemaVersion: 2;
    readonly packageName: "@hjm/react-native";
    readonly packageVersion: "0.7.1";
    readonly surface: "native";
    readonly components: readonly [Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>, Readonly<{
        /** Canonical component id from the design-contracts catalog. */
        componentId: string;
        /** Public symbols that implement this contract on the declared subpath. */
        exportNames: readonly string[];
        /** Granular @hjm/react-native export used by consumers. */
        subpath: `./${string}`;
        /** Scenarios supported by automated first-party renderer evidence. */
        scenarios: readonly ReactNativeRendererEvidenceScenario[];
        /** Repository-local executable proof for every claimed scenario. */
        proofs: readonly Readonly<{
            scenarios: readonly ReactNativeRendererEvidenceScenario[];
            file: `test/${string}.test.tsx`;
            caseId: string;
        }>[];
    }>];
};
//# sourceMappingURL=evidence.d.ts.map