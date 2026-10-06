import { effectNoiseTile } from "./internal/effect-noise.js";
import { themeColor } from "./color-references.js";
export function resolveEffectSurface(descriptor = {}) {
    const layers = descriptor.layers ?? ["mesh"];
    if (!layers.length || layers.length > 4 || new Set(layers).size !== layers.length || layers.some(layer => !["mesh", "glow", "grain", "noise"].includes(layer)))
        throw new TypeError("Choose one to four unique effect layers");
    const intensity = descriptor.intensity ?? 0.22;
    if (!Number.isFinite(intensity) || intensity < 0 || intensity > 1)
        throw new RangeError("Effect intensity must be between 0 and 1");
    const period = descriptor.period ?? 12;
    if (!Number.isFinite(period) || period < 2 || period > 120)
        throw new RangeError("Effect period must be between 2 and 120 seconds");
    const seed = descriptor.seed ?? "hjm";
    if (typeof seed !== "string" || seed.length === 0)
        throw new TypeError("Effect seed must not be empty");
    // Small deterministic spatial sampling keeps SSR/native geometry consistent;
    // it is decorative randomness, not a security or account identifier hash.
    let state = 2166136261;
    for (const character of seed)
        state = Math.imul(state ^ character.codePointAt(0), 16777619) >>> 0;
    const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
    const points = Array.from({ length: 32 }, () => ({ x: Math.round(random() * 100), y: Math.round(random() * 100), radius: 0.2 + random() * 0.5 }));
    return { layers, intensity, period, active: descriptor.active ?? false,
        colors: descriptor.colors ?? [themeColor("primary"), themeColor("contentBrand"), themeColor("surfaceAccent")],
        // Fixed periodic raster is shared across hosts; seed shifts its phase, not its pixels.
        noise: layers.includes("noise") ? { uri: effectNoiseTile, size: 64, offset: points[0].x / 4 } : undefined,
        points, anchors: points.slice(0, 3) };
}
//# sourceMappingURL=effect-surface.js.map