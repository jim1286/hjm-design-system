import { designSystemVersion } from "./version.js";
import {
  createShowcaseCoverage,
  showcaseManifest,
  showcaseScenarios,
  type ShowcaseComponentEntry,
  type ShowcaseCoverageEntry,
  type ShowcaseEvidenceEntry,
  type ShowcaseScenarioId,
  type ShowcaseSurface,
} from "./showcase.js";

export const designSystemEvidenceSchemaVersion = 1 as const;

export type DesignSystemEvidenceSourceKind =
  | "storybook"
  | "interaction-test"
  | "accessibility-audit"
  | "visual-regression"
  | "device-test"
  | "contract-test";

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

const scenarioIds = new Set<ShowcaseScenarioId>(showcaseScenarios.map(({ id }) => id));
const evidenceSourceKinds = new Set<DesignSystemEvidenceSourceKind>([
  "storybook",
  "interaction-test",
  "accessibility-audit",
  "visual-regression",
  "device-test",
  "contract-test",
]);
const surfaces = new Set<ShowcaseSurface>(["contract", "web", "native"]);

function requireNonEmptyString(value: string, field: string): void {
  if (value.trim().length === 0) throw new Error(`${field} must not be empty`);
}

/**
 * Returns the canonical component story ids that currently require evidence on
 * one surface. Consumers use this instead of maintaining hard-coded lists.
 */
export function getShowcaseStoryIdsForSurface(
  surface: ShowcaseSurface,
  manifest: readonly ShowcaseComponentEntry[] = showcaseManifest,
): readonly string[] {
  return manifest
    .filter(({ requirements }) => requirements.some((requirement) => requirement.surface === surface))
    .map(({ storyId }) => storyId);
}

/** Compares a product Storybook inventory with the pinned contract package. */
export function compareShowcaseStoryIds(
  surface: ShowcaseSurface,
  storyIds: readonly string[],
  manifest: readonly ShowcaseComponentEntry[] = showcaseManifest,
): ShowcaseStoryIdComparison {
  const expected = getShowcaseStoryIdsForSurface(surface, manifest);
  const expectedSet = new Set(expected);
  const actual = [...new Set(storyIds)];
  const counts = new Map<string, number>();
  for (const storyId of storyIds) counts.set(storyId, (counts.get(storyId) ?? 0) + 1);
  const missing = expected.filter((storyId) => !actual.includes(storyId));
  const unexpected = actual.filter((storyId) => !expectedSet.has(storyId));
  const duplicates = [...counts]
    .filter(([, count]) => count > 1)
    .map(([storyId]) => storyId)
    .sort();
  return {
    surface,
    expected,
    actual,
    missing,
    unexpected,
    duplicates,
    complete: missing.length === 0 && unexpected.length === 0 && duplicates.length === 0,
  };
}

export function assertShowcaseStoryIds(
  surface: ShowcaseSurface,
  storyIds: readonly string[],
  manifest: readonly ShowcaseComponentEntry[] = showcaseManifest,
): void {
  const result = compareShowcaseStoryIds(surface, storyIds, manifest);
  if (result.complete) return;
  throw new Error(
    [
      `${surface} Storybook inventory does not match the design contract manifest.`,
      `Missing: ${result.missing.join(", ") || "none"}`,
      `Unexpected: ${result.unexpected.join(", ") || "none"}`,
      `Duplicates: ${result.duplicates.join(", ") || "none"}`,
    ].join("\n"),
  );
}

/** Runtime validation for evidence artifacts submitted by product repositories. */
export function defineDesignSystemEvidence(
  input: DesignSystemEvidenceManifest,
  manifest: readonly ShowcaseComponentEntry[] = showcaseManifest,
): DesignSystemEvidenceManifest {
  if (input.schemaVersion !== designSystemEvidenceSchemaVersion) {
    throw new Error(`Unsupported evidence schema version: ${input.schemaVersion}`);
  }
  requireNonEmptyString(input.designSystemVersion, "designSystemVersion");
  if (input.designSystemVersion !== designSystemVersion) {
    throw new Error(
      `Evidence designSystemVersion ${input.designSystemVersion} does not match current ${designSystemVersion}`,
    );
  }
  requireNonEmptyString(input.source.id, "source.id");
  requireNonEmptyString(input.source.product, "source.product");
  if (!surfaces.has(input.source.surface)) {
    throw new Error(`Unknown evidence surface: ${input.source.surface}`);
  }
  if (!evidenceSourceKinds.has(input.source.kind)) {
    throw new Error(`Unknown evidence source kind: ${input.source.kind}`);
  }
  if (input.source.revision !== undefined) requireNonEmptyString(input.source.revision, "source.revision");

  const requirementsForSurface = new Map<string, ReadonlySet<ShowcaseScenarioId>>();
  for (const item of manifest) {
    const requirement = item.requirements.find(({ surface }) => surface === input.source.surface);
    if (requirement) {
      requirementsForSurface.set(item.storyId, new Set(requirement.scenarios));
    }
  }
  const seen = new Set<string>();
  for (const entry of input.entries) {
    requireNonEmptyString(entry.storyId, "entries[].storyId");
    const requiredScenarios = requirementsForSurface.get(entry.storyId);
    if (!requiredScenarios) {
      throw new Error(
        `Evidence ${input.source.id} contains unsupported ${input.source.surface} story: ${entry.storyId}`,
      );
    }
    if (seen.has(entry.storyId)) {
      throw new Error(`Evidence ${input.source.id} contains duplicate story: ${entry.storyId}`);
    }
    seen.add(entry.storyId);
    if (entry.scenarios.length === 0) {
      throw new Error(`Evidence ${input.source.id}/${entry.storyId} must include at least one scenario`);
    }
    const entryScenarios = new Set<ShowcaseScenarioId>();
    for (const scenario of entry.scenarios) {
      if (!scenarioIds.has(scenario)) throw new Error(`Unknown evidence scenario: ${scenario}`);
      if (!requiredScenarios.has(scenario)) {
        throw new Error(
          `Evidence ${input.source.id}/${entry.storyId} scenario ${scenario} is not required for ${input.source.surface}`,
        );
      }
      if (entryScenarios.has(scenario)) {
        throw new Error(`Evidence ${input.source.id}/${entry.storyId} repeats scenario: ${scenario}`);
      }
      entryScenarios.add(scenario);
    }
  }
  return input;
}

export function createDesignSystemEvidence(
  source: DesignSystemEvidenceSource,
  entries: readonly DesignSystemEvidenceItem[],
): DesignSystemEvidenceManifest {
  return defineDesignSystemEvidence({
    schemaVersion: designSystemEvidenceSchemaVersion,
    designSystemVersion,
    source,
    entries,
  });
}

export function toShowcaseEvidenceEntries(
  evidence: readonly DesignSystemEvidenceManifest[],
): readonly ShowcaseEvidenceEntry[] {
  return evidence.flatMap(({ source, entries }) =>
    entries.map(({ storyId, scenarios }) => ({ storyId, surface: source.surface, scenarios })),
  );
}

export function createDesignSystemEvidenceCoverage(
  evidence: readonly DesignSystemEvidenceManifest[],
  manifest: readonly ShowcaseComponentEntry[] = showcaseManifest,
): readonly ShowcaseCoverageEntry[] {
  for (const item of evidence) defineDesignSystemEvidence(item, manifest);
  return createShowcaseCoverage(toShowcaseEvidenceEntries(evidence), manifest);
}
