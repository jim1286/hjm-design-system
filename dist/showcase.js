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
    if (entry.status === "planned") {
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
    if (entry.status === "planned")
        return ["contract"];
    if (entry.platform === "web")
        return ["contract", "web"];
    if (entry.platform === "native")
        return ["contract", "native"];
    return ["contract", "web", "native"];
}
export function createShowcaseManifest(entries = componentCatalog) {
    return entries.map((component) => ({
        storyId: getShowcaseStoryId(component),
        component,
        requiredScenarios: getRequiredShowcaseScenarios(component),
        requiredSurfaces: getRequiredShowcaseSurfaces(component),
    }));
}
export const showcaseManifest = createShowcaseManifest();
export function createShowcaseCoverage(evidence, manifest = showcaseManifest) {
    return manifest.map(({ storyId, component, requiredScenarios, requiredSurfaces }) => {
        const componentEvidence = evidence.filter((entry) => entry.storyId === storyId);
        const coveredSurfaces = new Set(componentEvidence.map(({ surface }) => surface));
        const coveredScenarios = new Set(componentEvidence.flatMap(({ scenarios }) => scenarios));
        const missingSurfaces = requiredSurfaces.filter((surface) => !coveredSurfaces.has(surface));
        const missingScenarios = requiredScenarios.filter((scenario) => !coveredScenarios.has(scenario));
        return {
            storyId,
            component,
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
        .map(({ storyId, missingSurfaces, missingScenarios }) => `${storyId} (surfaces: ${missingSurfaces.join(", ") || "none"}; scenarios: ${missingScenarios.join(", ") || "none"})`)
        .join("\n");
    throw new Error(`Showcase evidence is incomplete:\n${details}`);
}
export function summarizeShowcaseMaturity(entries = componentCatalog) {
    return entries.reduce((summary, entry) => {
        summary[entry.status] += 1;
        return summary;
    }, { stable: 0, beta: 0, planned: 0 });
}
//# sourceMappingURL=showcase.js.map