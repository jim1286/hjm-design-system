import type { ShowcaseScenarioId } from "@hjmds/design-contracts/showcase";
import { getRequiredShowcaseEvidence } from "@hjmds/design-contracts/showcase";
import { componentCatalog, componentIdOf, getComponentSurfaceStatus, type ComponentCatalogEntry } from "@hjmds/design-contracts/catalog";
import { publicExportEntries } from "./public-exports.generated.js";

export const reactRendererEvidenceSchemaVersion = 2 as const;

export type ReactRendererEvidenceScenario = Exclude<ShowcaseScenarioId, "contract" | "native-actions">;

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

const defaultProofFile = "test/default-render.ssr.test.tsx" as const;
const matrixProofFile = "test/scenario-matrix.browser.test.tsx" as const;
const stableCoreProofFile = "test/stable-core.browser.test.tsx" as const;

type ProofFile = `test/${string}.test.tsx`;

/**
 * Scenarios a component does not pass yet. Each entry is promotion debt that
 * the generated evidence projection reports; remove it when the component is
 * fixed and the matrix case passes. Stable surfaces cannot carry a gap
 * (scripts/check-workspace-sync.mjs).
 */
const webScenarioGaps: Readonly<Record<string, readonly ReactRendererEvidenceScenario[]>> = {};

/**
 * Proofs that live outside the shared default/matrix files: keyboard behavior in a dedicated browser test,
 * long copy proven inside a portal by the component's own test, or a whole matrix run in a component file.
 * Everything else about a claim derives from the catalog row (2026-10-18 registration input).
 */
type ClaimExtras = Readonly<{
  /** Extra proofs; their scenarios are removed from the shared matrix proof. */
  proofs?: readonly Readonly<{ scenarios: readonly ReactRendererEvidenceScenario[]; file: ProofFile }>[];
  /** Hooks or helpers published beside the component symbols on the same subpath. */
  exportNames?: readonly string[];
}>;

const keyboard = (file: ProofFile = stableCoreProofFile): ClaimExtras => ({ proofs: [{ scenarios: ["keyboard"], file }] });
const keyboardAndLongCopy = (file: ProofFile): ClaimExtras => ({ proofs: [{ scenarios: ["keyboard", "long-copy"], file }] });

const claimExtras: Readonly<Record<string, ClaimExtras>> = {
  "time-picker": keyboard("test/time-picker.browser.test.tsx"),
  "design-system-provider": { exportNames: ["useHjmTheme"] },
  layout: keyboard(),
  link: keyboard(),
  field: keyboard(),
  "search-field": keyboard(),
  "password-field": keyboard(),
  "otp-field": keyboard(),
  "number-field": keyboard(),
  slider: keyboard(),
  form: keyboard("test/form.keyboard.browser.test.tsx"),
  "date-picker": keyboard(),
  calendar: keyboard("test/calendar.browser.test.tsx"),
  "file-picker": keyboard("test/file-picker.keyboard.browser.test.tsx"),
  checkbox: keyboard(),
  "checkbox-group": keyboard(),
  "radio-group": keyboard(),
  switch: keyboard(),
  "segmented-control": keyboard(),
  chip: keyboard(),
  tabs: keyboard("test/tabs.keyboard.browser.test.tsx"),
  breadcrumb: keyboard("test/page-navigation.browser.test.tsx"),
  pagination: keyboard("test/pagination.keyboard.browser.test.tsx"),
  popover: keyboardAndLongCopy("test/popover.browser.test.tsx"),
  "side-panel": keyboardAndLongCopy("test/side-panel.browser.test.tsx"),
  splitter: keyboard("test/splitter.browser.test.tsx"),
  tour: keyboardAndLongCopy("test/tour.browser.test.tsx"),
  tree: keyboard("test/tree.browser.test.tsx"),
  "transfer-list": keyboard("test/transfer-list.browser.test.tsx"),
  mentions: keyboard("test/mentions.browser.test.tsx"),
  "command-palette": keyboardAndLongCopy("test/command-palette.browser.test.tsx"),
  agreement: keyboard("test/agreement.keyboard.browser.test.tsx"),
  "toggle-group": keyboard(),
  "tags-input": keyboard(),
  "skip-nav": keyboardAndLongCopy("test/skip-nav.browser.test.tsx"),
  sidebar: keyboard("test/sidebar.browser.test.tsx"),
  "date-range-picker": keyboard("test/date-range.keyboard.browser.test.tsx"),
  "auth-provider-button": keyboard(),
  "data-table": keyboard("test/data-table.keyboard.browser.test.tsx"),
  collapsible: keyboard("test/collapsible.keyboard.browser.test.tsx"),
  "context-menu": keyboardAndLongCopy("test/context-menu.interactions.browser.test.tsx"),
  menubar: keyboard("test/menubar.keyboard.browser.test.tsx"),
  anchor: keyboard("test/anchor.browser.test.tsx"),
  "bottom-navigation": keyboard("test/bottom-navigation.keyboard.browser.test.tsx"),
  "load-more": keyboard("test/load-more.interactions.browser.test.tsx"),
  carousel: keyboard("test/carousel.browser.test.tsx"),
  "floating-action-button": keyboard(),
  accordion: keyboard("test/accordion.keyboard.browser.test.tsx"),
  "upload-item": keyboard("test/upload-item.browser.test.tsx"),
  // ThinkingOrb runs its whole environment matrix in its own file (canvas timing), not in scenario-matrix.
  "thinking-orb": { proofs: [{ scenarios: ["dark", "large-text", "rtl", "reduced-motion", "accessibility"], file: "test/thinking-orb.browser.test.tsx" }] },
  "color-picker": keyboard("test/web-additions.browser.test.tsx"),
  // SSR proves semantics but cannot catch the close-only row seen in BurnTok.
  // Keep real geometry evidence attached without promoting catalog maturity.
  toast: {
    exportNames: ["useToast"],
    proofs: [
      { scenarios: ["keyboard"], file: stableCoreProofFile },
      { scenarios: ["dark", "long-copy", "large-text", "rtl"], file: "test/toast-layout.browser.test.tsx" },
    ],
  },
  select: keyboard(),
  combobox: keyboard(),
  dialog: keyboard("test/advanced.browser.test.tsx"),
  "alert-dialog": keyboardAndLongCopy("test/alert-dialog.keyboard.browser.test.tsx"),
  sheet: keyboardAndLongCopy("test/sheet-layout.browser.test.tsx"),
  tooltip: keyboard("test/tooltip.browser.test.tsx"),
  menu: keyboardAndLongCopy("test/menu.keyboard.browser.test.tsx"),
};

const exportEntries: Readonly<Record<string, readonly `./${string}`[] | undefined>> = publicExportEntries;

/**
 * One claim per active Web row of the catalog. The subpath is the symbol's canonical granular entry, the export
 * names are the row's own symbol plus the companions published on that entry, and the scenarios are the row's
 * required Web evidence minus recorded gaps. Keyboard is never implied: it comes only from a dedicated proof.
 */
function derivedClaim(entry: ComponentCatalogEntry): ReactRendererEvidenceComponent {
  const componentId = componentIdOf(entry);
  const extras = claimExtras[componentId] ?? {};
  const symbols = entry.name === "DesignSystemProvider" ? ["HjmProvider"] : [entry.name, ...(entry.companions ?? [])];
  // A row whose own name is not a symbol (Chart) claims through its first published companion.
  const subpath = symbols.map((symbol) => exportEntries[symbol]?.[0]).find((entry) => entry !== undefined);
  if (!subpath) throw new Error(`${entry.name} has no granular @hjmds/react export to claim evidence on`);
  const exportNames = [
    ...symbols.filter((symbol) => exportEntries[symbol]?.includes(subpath)),
    ...(extras.exportNames ?? []),
  ];
  const required = getRequiredShowcaseEvidence(entry).find((evidence) => evidence.surface === "web")?.scenarios ?? [];
  const gaps = webScenarioGaps[componentId] ?? [];
  const extraProofs = extras.proofs ?? [];
  const proven = new Set(extraProofs.flatMap((proof) => proof.scenarios));
  const matrix = required.filter((scenario): scenario is ReactRendererEvidenceScenario =>
    scenario !== "default" && scenario !== "keyboard" && scenario !== "native-actions" && scenario !== "contract"
    && !gaps.includes(scenario as ReactRendererEvidenceScenario) && !proven.has(scenario as ReactRendererEvidenceScenario));
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

const activeWebEntries: readonly ComponentCatalogEntry[] = componentCatalog.filter((entry) => {
  const status = getComponentSurfaceStatus(entry, "web");
  return status === "stable" || status === "beta";
});

/**
 * First-party Web renderer claims. Scenario axes remain fail-closed: the
 * default scenario is an SSR render, the environment and accessibility
 * scenarios are computed-style assertions in scenario-matrix.browser.
 * Keyboard and cross-platform parity remain fail-closed until dedicated
 * interaction or paired-renderer proofs are mapped one-to-one.
 */
export const reactRendererEvidence = {
  schemaVersion: reactRendererEvidenceSchemaVersion,
  packageName: "@hjmds/react",
  packageVersion: "2.0.0",
  surface: "web",
  components: activeWebEntries.map(derivedClaim),
} as const satisfies ReactRendererEvidenceManifest;
