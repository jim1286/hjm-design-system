import type { ShowcaseScenarioId } from "@hjmds/design-contracts/showcase";
import { getRequiredShowcaseEvidence } from "@hjmds/design-contracts/showcase";
import { componentCatalog, componentIdOf, getComponentSurfaceStatus, type ComponentCatalogEntry } from "@hjmds/design-contracts/catalog";
import { publicExportEntries } from "./public-exports.generated.js";

export const reactNativeRendererEvidenceSchemaVersion = 2 as const;

export type ReactNativeRendererEvidenceScenario = Exclude<ShowcaseScenarioId, "contract" | "keyboard">;

export type ReactNativeRendererEvidenceComponent = Readonly<{
  /** Canonical component id from the design-contracts catalog. */
  componentId: string;
  /** Public symbols that implement this contract on the declared subpath. */
  exportNames: readonly string[];
  /** Granular @hjmds/react-native export used by consumers. */
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
  packageName: "@hjmds/react-native";
  packageVersion: string;
  surface: "native";
  components: readonly ReactNativeRendererEvidenceComponent[];
}>;

const defaultProofFile = "test/default-render.test.tsx" as const;
const matrixProofFile = "test/scenario-matrix.test.tsx" as const;
const stableCoreProofFile = "test/stable-core.test.tsx" as const;

type ProofFile = `test/${string}.test.tsx`;

/**
 * Scenarios a component does not pass yet; reported as promotion debt and
 * forbidden on stable surfaces (scripts/check-workspace-sync.mjs). The test
 * renderer cannot lay out text, so long-copy here proves the copy sits in a
 * wrapping Text (no single-line truncation), not measured overflow.
 */
const nativeScenarioGaps: Readonly<Record<string, readonly ReactNativeRendererEvidenceScenario[]>> = {};

/**
 * Proofs outside the shared default/matrix files: host accessibility actions in a dedicated test, long copy
 * proven inside a Modal by the component's own test, or a whole matrix run in a component file. Everything
 * else about a claim derives from the catalog row (2026-10-18 registration input).
 */
type ClaimExtras = Readonly<{
  /** Extra proofs; their scenarios are removed from the shared matrix proof. */
  proofs?: readonly Readonly<{ scenarios: readonly ReactNativeRendererEvidenceScenario[]; file: ProofFile }>[];
  /** Hooks or helpers published beside the component symbols on the same subpath. */
  exportNames?: readonly string[];
  /** Symbols to claim instead of the row name when the Native renderer publishes a different surface. */
  symbols?: readonly string[];
}>;

const nativeAction = (file: ProofFile = stableCoreProofFile): ClaimExtras => ({ proofs: [{ scenarios: ["native-actions"], file }] });
const nativeActionAndLongCopy = (file: ProofFile): ClaimExtras => ({ proofs: [{ scenarios: ["native-actions", "long-copy"], file }] });

const claimExtras: Readonly<Record<string, ClaimExtras>> = {
  "time-picker": nativeAction("test/time-picker.test.tsx"),
  "design-system-provider": { exportNames: ["useHjmNativeTheme"] },
  link: nativeAction(),
  field: nativeAction(),
  "search-field": nativeAction(),
  "password-field": nativeAction(),
  "otp-field": nativeAction(),
  "number-field": nativeAction(),
  slider: nativeAction(),
  form: nativeAction("test/form.interaction.test.tsx"),
  "date-picker": nativeAction(),
  calendar: nativeAction("test/calendar.test.tsx"),
  agreement: nativeAction("test/agreement.interaction.test.tsx"),
  "toggle-group": nativeAction(),
  collapsible: nativeAction("test/collapsible-actions.test.tsx"),
  "tags-input": nativeAction(),
  "date-range-picker": nativeAction("test/date-range-actions.test.tsx"),
  mentions: nativeAction("test/mentions-actions.test.tsx"),
  "transfer-list": nativeAction("test/transfer-list-actions.test.tsx"),
  "auth-provider-button": nativeAction(),
  "file-picker": nativeAction("test/file-picker-host-action.test.tsx"),
  checkbox: nativeAction(),
  "checkbox-group": nativeAction(),
  "radio-group": nativeAction(),
  switch: nativeAction(),
  "segmented-control": nativeAction(),
  select: nativeAction(),
  combobox: nativeAction(),
  chip: nativeAction(),
  tabs: nativeAction("test/tabs-actions.test.tsx"),
  carousel: nativeAction("test/carousel.test.tsx"),
  "floating-action-button": nativeAction(),
  menu: nativeActionAndLongCopy("test/menu-actions.test.tsx"),
  "upload-item": nativeAction("test/upload-item.test.tsx"),
  // ThinkingOrb runs its whole environment matrix in its own file (Skia timing), not in scenario-matrix.
  "thinking-orb": { proofs: [{ scenarios: ["dark", "large-text", "rtl", "reduced-motion", "accessibility"], file: "test/thinking-orb.test.tsx" }] },
  dialog: nativeAction("test/dialog-actions.test.tsx"),
  "alert-dialog": nativeAction("test/alert-dialog-actions.test.tsx"),
  sheet: nativeActionAndLongCopy("test/sheet-viewport.test.tsx"),
  "bottom-navigation": nativeAction("test/bottom-navigation.interaction.test.tsx"),
  "load-more": nativeAction("test/load-more.interactions.test.tsx"),
  accordion: nativeAction("test/accordion-actions.test.tsx"),
  // The Native toast surface is the region host, not a Toast element. This claim covers standard chrome;
  // Liquid's mock lifecycle tests and showcase do not certify device motion, VoiceOver/TalkBack, or the
  // optional runtime support matrix.
  toast: { symbols: ["ToastRegion"], exportNames: ["useToastRegion"], ...nativeAction() },
};

const exportEntries: Readonly<Record<string, readonly `./${string}`[] | undefined>> = publicExportEntries;

/**
 * One claim per active Native row of the catalog. The subpath is the symbol's canonical granular entry, the
 * export names are the row's own symbol plus the companions published on that entry, and the scenarios are
 * the row's required Native evidence minus recorded gaps. native-actions is never implied: it comes only from
 * a dedicated proof.
 */
function derivedClaim(entry: ComponentCatalogEntry): ReactNativeRendererEvidenceComponent {
  const componentId = componentIdOf(entry);
  const extras = claimExtras[componentId] ?? {};
  const symbols = extras.symbols ?? (entry.name === "DesignSystemProvider" ? ["HjmNativeProvider"] : [entry.name, ...(entry.companions ?? [])]);
  // A row whose own name is not a symbol (Chart) claims through its first published companion.
  const subpath = symbols.map((symbol) => exportEntries[symbol]?.[0]).find((entry) => entry !== undefined);
  if (!subpath) throw new Error(`${entry.name} has no granular @hjmds/react-native export to claim evidence on`);
  const exportNames = [
    ...symbols.filter((symbol) => exportEntries[symbol]?.includes(subpath)),
    ...(extras.exportNames ?? []),
  ];
  const required = getRequiredShowcaseEvidence(entry).find((evidence) => evidence.surface === "native")?.scenarios ?? [];
  const gaps = nativeScenarioGaps[componentId] ?? [];
  const extraProofs = extras.proofs ?? [];
  const proven = new Set(extraProofs.flatMap((proof) => proof.scenarios));
  const matrix = required.filter((scenario): scenario is ReactNativeRendererEvidenceScenario =>
    scenario !== "default" && scenario !== "native-actions" && scenario !== "keyboard" && scenario !== "contract"
    && !gaps.includes(scenario as ReactNativeRendererEvidenceScenario) && !proven.has(scenario as ReactNativeRendererEvidenceScenario));
  const proofs = [
    { scenarios: ["default" as const], file: defaultProofFile, caseId: componentId },
    ...(matrix.length === 0 ? [] : [{ scenarios: matrix, file: matrixProofFile, caseId: componentId }]),
    ...extraProofs.map((proof) => ({ ...proof, caseId: componentId })),
  ];
  return {
    componentId,
    exportNames,
    subpath,
    scenarios: proofs.flatMap((proof) => proof.scenarios),
    proofs,
  };
}

const activeNativeEntries: readonly ComponentCatalogEntry[] = componentCatalog.filter((entry) => {
  const status = getComponentSurfaceStatus(entry, "native");
  return status === "stable" || status === "beta";
});

/**
 * First-party Native renderer claims. These are automated component-level
 * smoke claims, not device, TalkBack, or VoiceOver certification. Scenario
 * axes are added only after their dedicated runtime evidence exists.
 */
export const reactNativeRendererEvidence = {
  schemaVersion: reactNativeRendererEvidenceSchemaVersion,
  packageName: "@hjmds/react-native",
  packageVersion: "1.40.0",
  surface: "native",
  components: activeNativeEntries.map(derivedClaim),
} as const satisfies ReactNativeRendererEvidenceManifest;
