import { componentCatalog, componentIdOf, getComponentSurfaceStatus, } from "./catalog.js";
/**
 * Stable IDs survive display-name and category changes. Since 2026-10-18 they derive from the catalog row
 * (`id` override, else kebab of `name`) instead of a second hand-kept map that every registration had to touch.
 */
export const componentIds = Object.fromEntries(componentCatalog.map((entry) => [entry.name, componentIdOf(entry)]));
const kindByCategory = {
    foundation: "primitive",
    layout: "primitive",
    action: "component",
    input: "component",
    navigation: "component",
    "data-display": "component",
    feedback: "component",
    overlay: "component",
    provider: "provider",
    utility: "utility",
};
/**
 * Normalized catalog view. Consumers should prefer this shape so a component can evolve to multiple recipes,
 * behaviors, and different Web/Native maturity without another API rewrite.
 */
export const componentDefinitions = componentCatalog.map((rawEntry) => {
    const entry = rawEntry;
    const name = entry.name;
    const id = componentIds[name];
    return {
        id,
        name,
        label: entry.label ?? name,
        category: entry.category,
        companions: entry.companions ?? [],
        extensions: entry.extensions ?? [],
        kind: kindByCategory[entry.category],
        contract: {
            status: entry.status,
            recipes: entry.recipe ? [entry.recipe] : [],
            behaviors: entry.behavior ? [entry.behavior] : [],
            roadmap: entry.roadmap,
        },
        surfaces: {
            parity: entry.platform,
            web: { status: getComponentSurfaceStatus(entry, "web") },
            native: { status: getComponentSurfaceStatus(entry, "native") },
        },
        docs: {
            storyId: `components/${id}`,
            aliases: entry.aliases ?? [],
        },
    };
});
export function getComponentDefinition(idOrName) {
    return componentDefinitions.find((definition) => definition.id === idOrName || definition.name === idOrName);
}
//# sourceMappingURL=component-definitions.js.map