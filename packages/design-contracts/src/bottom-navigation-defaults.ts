export type BottomNavigationPresentation = "bar" | "floating";
export type BottomNavigationDistribution = "equal" | "center-gap";
export type BottomNavigationDensity = "compact" | "regular";

/**
 * Shared defaults kept outside the recipe barrel so behavior-only consumers
 * do not pull the complete visual recipe registry into their import graph.
 */
export const bottomNavigationRecipeDefaults = {
  presentation: "bar",
  distribution: "equal",
  density: "regular",
} as const satisfies Readonly<{
  presentation: BottomNavigationPresentation;
  distribution: BottomNavigationDistribution;
  density: BottomNavigationDensity;
}>;
