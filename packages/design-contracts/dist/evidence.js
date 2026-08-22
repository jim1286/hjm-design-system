import { designSystemVersion } from "./version.js";
import { createShowcaseCoverage, showcaseManifest, showcaseScenarios, } from "./showcase.js";
export const designSystemEvidenceSchemaVersion = 1;
const scenarioIds = new Set(showcaseScenarios.map(({ id }) => id));
const evidenceSourceKinds = new Set([
    "storybook",
    "interaction-test",
    "accessibility-audit",
    "visual-regression",
    "device-test",
    "contract-test",
]);
const surfaces = new Set(["contract", "web", "native"]);
function requireNonEmptyString(value, field) {
    if (value.trim().length === 0)
        throw new Error(`${field} must not be empty`);
}
/**
 * Returns the canonical component story ids that currently require evidence on
 * one surface. Consumers use this instead of maintaining hard-coded lists.
 */
export function getShowcaseStoryIdsForSurface(surface, manifest = showcaseManifest) {
    return manifest
        .filter(({ requirements }) => requirements.some((requirement) => requirement.surface === surface))
        .map(({ storyId }) => storyId);
}
/** Compares a product Storybook inventory with the pinned contract package. */
export function compareShowcaseStoryIds(surface, storyIds, manifest = showcaseManifest) {
    const expected = getShowcaseStoryIdsForSurface(surface, manifest);
    const expectedSet = new Set(expected);
    const actual = [...new Set(storyIds)];
    const counts = new Map();
    for (const storyId of storyIds)
        counts.set(storyId, (counts.get(storyId) ?? 0) + 1);
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
export function assertShowcaseStoryIds(surface, storyIds, manifest = showcaseManifest) {
    const result = compareShowcaseStoryIds(surface, storyIds, manifest);
    if (result.complete)
        return;
    throw new Error([
        `${surface} Storybook inventory does not match the design contract manifest.`,
        `Missing: ${result.missing.join(", ") || "none"}`,
        `Unexpected: ${result.unexpected.join(", ") || "none"}`,
        `Duplicates: ${result.duplicates.join(", ") || "none"}`,
    ].join("\n"));
}
/** Runtime validation for evidence artifacts submitted by product repositories. */
export function defineDesignSystemEvidence(input, manifest = showcaseManifest) {
    if (input.schemaVersion !== designSystemEvidenceSchemaVersion) {
        throw new Error(`Unsupported evidence schema version: ${input.schemaVersion}`);
    }
    requireNonEmptyString(input.designSystemVersion, "designSystemVersion");
    if (input.designSystemVersion !== designSystemVersion) {
        throw new Error(`Evidence designSystemVersion ${input.designSystemVersion} does not match current ${designSystemVersion}`);
    }
    requireNonEmptyString(input.source.id, "source.id");
    requireNonEmptyString(input.source.product, "source.product");
    if (!surfaces.has(input.source.surface)) {
        throw new Error(`Unknown evidence surface: ${input.source.surface}`);
    }
    if (!evidenceSourceKinds.has(input.source.kind)) {
        throw new Error(`Unknown evidence source kind: ${input.source.kind}`);
    }
    if (input.source.revision !== undefined)
        requireNonEmptyString(input.source.revision, "source.revision");
    const requirementsForSurface = new Map();
    for (const item of manifest) {
        const requirement = item.requirements.find(({ surface }) => surface === input.source.surface);
        if (requirement) {
            requirementsForSurface.set(item.storyId, new Set(requirement.scenarios));
        }
    }
    const seen = new Set();
    for (const entry of input.entries) {
        requireNonEmptyString(entry.storyId, "entries[].storyId");
        const requiredScenarios = requirementsForSurface.get(entry.storyId);
        if (!requiredScenarios) {
            throw new Error(`Evidence ${input.source.id} contains unsupported ${input.source.surface} story: ${entry.storyId}`);
        }
        if (seen.has(entry.storyId)) {
            throw new Error(`Evidence ${input.source.id} contains duplicate story: ${entry.storyId}`);
        }
        seen.add(entry.storyId);
        if (entry.scenarios.length === 0) {
            throw new Error(`Evidence ${input.source.id}/${entry.storyId} must include at least one scenario`);
        }
        const entryScenarios = new Set();
        for (const scenario of entry.scenarios) {
            if (!scenarioIds.has(scenario))
                throw new Error(`Unknown evidence scenario: ${scenario}`);
            if (!requiredScenarios.has(scenario)) {
                throw new Error(`Evidence ${input.source.id}/${entry.storyId} scenario ${scenario} is not required for ${input.source.surface}`);
            }
            if (entryScenarios.has(scenario)) {
                throw new Error(`Evidence ${input.source.id}/${entry.storyId} repeats scenario: ${scenario}`);
            }
            entryScenarios.add(scenario);
        }
    }
    return input;
}
export function createDesignSystemEvidence(source, entries) {
    return defineDesignSystemEvidence({
        schemaVersion: designSystemEvidenceSchemaVersion,
        designSystemVersion,
        source,
        entries,
    });
}
export function toShowcaseEvidenceEntries(evidence) {
    return evidence.flatMap(({ source, entries }) => entries.map(({ storyId, scenarios }) => ({ storyId, surface: source.surface, scenarios })));
}
export function createDesignSystemEvidenceCoverage(evidence, manifest = showcaseManifest) {
    for (const item of evidence)
        defineDesignSystemEvidence(item, manifest);
    return createShowcaseCoverage(toShowcaseEvidenceEntries(evidence), manifest);
}
//# sourceMappingURL=evidence.js.map