// Recipe stays separate from geometry so catalog consumers do not load animation code.
export const thinkingOrbRecipe = {
    defaults: { state: "working", size: 64, speed: 1 },
    sizes: [20, 64],
    // Use a deterministic representative frame and retain the upstream DPR cap.
    motion: { reducedMotion: "static", staticTime: 0.6, maxDeltaMs: 64 },
    maxPixelRatio: 2,
};
//# sourceMappingURL=thinking-orb-recipe.js.map