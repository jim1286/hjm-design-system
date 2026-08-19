import { componentCatalog, } from "./catalog.js";
/**
 * A small, deliberate environment matrix catches the high-risk differences
 * without multiplying every story into an unreadable Cartesian product.
 */
export const showcaseEnvironmentMatrix = [
    {
        id: "default",
        label: "Light · LTR · 100%",
        theme: "light",
        direction: "ltr",
        textScale: 1,
        motion: "full",
    },
    {
        id: "dark",
        label: "Dark · LTR · 100%",
        theme: "dark",
        direction: "ltr",
        textScale: 1,
        motion: "full",
    },
    {
        id: "large-text",
        label: "Light · LTR · 200%",
        theme: "light",
        direction: "ltr",
        textScale: 2,
        motion: "full",
    },
    {
        id: "rtl",
        label: "Light · RTL · 100%",
        theme: "light",
        direction: "rtl",
        textScale: 1,
        motion: "full",
    },
    {
        id: "reduced-motion",
        label: "Light · LTR · Reduced motion",
        theme: "light",
        direction: "ltr",
        textScale: 1,
        motion: "reduced",
    },
];
export const showcaseScenarios = [
    {
        id: "contract",
        label: "Contract",
        description: "Anatomy, defaults, supported axes, platform and maturity are visible.",
    },
    {
        id: "default",
        label: "Default",
        description: "The normal state renders using recipe defaults without product overrides.",
    },
    {
        id: "dark",
        label: "Dark",
        description: "Semantic colors remain legible on the dark theme.",
    },
    {
        id: "long-copy",
        label: "Long copy",
        description: "Long Korean and English copy wraps without clipping or hiding meaning.",
    },
    {
        id: "large-text",
        label: "200% text",
        description: "Text can grow to 200% without truncating required information.",
    },
    {
        id: "rtl",
        label: "RTL",
        description: "Logical start/end layout and directional icons mirror correctly.",
    },
    {
        id: "reduced-motion",
        label: "Reduced motion",
        description: "Motion follows the recipe reduced-motion fallback.",
    },
    {
        id: "accessibility",
        label: "Accessibility",
        description: "Names, states, relationships, contrast and touch targets are inspectable.",
    },
    {
        id: "keyboard",
        label: "Keyboard",
        description: "Focus order and documented keyboard behavior run as interaction tests.",
    },
    {
        id: "platform-parity",
        label: "Web / Native parity",
        description: "Adaptive renderers preserve intent while using platform-native behavior.",
    },
];
const plannedRequirements = ["contract"];
const visualRequirements = [
    "contract",
    "default",
    "dark",
    "long-copy",
    "large-text",
    "rtl",
    "reduced-motion",
    "accessibility",
];
export function getShowcaseStoryId(entry) {
    const slug = entry.name
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
    return `${entry.category}/${slug}`;
}
export function getRequiredShowcaseScenarios(entry) {
    if (entry.status === "planned" || entry.status === "deprecated") {
        return plannedRequirements;
    }
    const requirements = [...visualRequirements];
    if (entry.behavior) {
        requirements.push("keyboard");
    }
    if (entry.platform === "adaptive") {
        requirements.push("platform-parity");
    }
    return requirements;
}
export function getRequiredShowcaseSurfaces(entry) {
    return getRequiredShowcaseEvidence(entry).map(({ surface }) => surface);
}
export function getRequiredShowcaseEvidence(entry) {
    if (entry.status === "planned" || entry.status === "deprecated") {
        return [{ surface: "contract", scenarios: ["contract"] }];
    }
    const rendererScenarios = getRequiredShowcaseScenarios(entry).filter((scenario) => scenario !== "contract");
    const requirements = [
        { surface: "contract", scenarios: ["contract"] },
    ];
    if (entry.platform !== "native") {
        requirements.push({ surface: "web", scenarios: rendererScenarios });
    }
    if (entry.platform !== "web") {
        requirements.push({ surface: "native", scenarios: rendererScenarios });
    }
    return requirements;
}
export function createShowcaseManifest(entries = componentCatalog) {
    return entries.map((component) => ({
        storyId: getShowcaseStoryId(component),
        component,
        requirements: getRequiredShowcaseEvidence(component),
        requiredScenarios: getRequiredShowcaseScenarios(component),
        requiredSurfaces: getRequiredShowcaseSurfaces(component),
    }));
}
export const showcaseManifest = createShowcaseManifest();
export function createShowcaseCoverage(evidence, manifest = showcaseManifest) {
    return manifest.map(({ storyId, component, requirements }) => {
        const componentEvidence = evidence.filter((entry) => entry.storyId === storyId);
        const missingEvidence = requirements.flatMap(({ surface, scenarios }) => scenarios
            .filter((scenario) => !componentEvidence.some((entry) => entry.surface === surface && entry.scenarios.includes(scenario)))
            .map((scenario) => ({ surface, scenario })));
        const missingSurfaces = [...new Set(missingEvidence.map(({ surface }) => surface))];
        const missingScenarios = [...new Set(missingEvidence.map(({ scenario }) => scenario))];
        return {
            storyId,
            component,
            missingEvidence,
            missingSurfaces,
            missingScenarios,
            complete: missingSurfaces.length === 0 && missingScenarios.length === 0,
        };
    });
}
export function assertShowcaseCoverage(evidence, manifest = showcaseManifest) {
    const missing = createShowcaseCoverage(evidence, manifest).filter(({ complete }) => !complete);
    if (missing.length === 0)
        return;
    const details = missing
        .map(({ storyId, missingEvidence }) => `${storyId} (${missingEvidence.map(({ surface, scenario }) => `${surface}/${scenario}`).join(", ") || "none"})`)
        .join("\n");
    throw new Error(`Showcase evidence is incomplete:\n${details}`);
}
export function summarizeShowcaseMaturity(entries = componentCatalog) {
    return entries.reduce((summary, entry) => {
        summary[entry.status] += 1;
        return summary;
    }, { stable: 0, beta: 0, planned: 0, deprecated: 0 });
}
//# sourceMappingURL=showcase.js.map