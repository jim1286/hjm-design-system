export type BottomNavigationPresentation = "bar" | "floating";
export type BottomNavigationDistribution = "equal" | "center-gap";
export type BottomNavigationDensity = "compact" | "regular";
/**
 * Shared defaults kept outside the recipe barrel so behavior-only consumers
 * do not pull the complete visual recipe registry into their import graph.
 */
export declare const bottomNavigationRecipeDefaults: {
    readonly presentation: "bar";
    readonly distribution: "equal";
    readonly density: "regular";
};
//# sourceMappingURL=bottom-navigation-defaults.d.ts.map