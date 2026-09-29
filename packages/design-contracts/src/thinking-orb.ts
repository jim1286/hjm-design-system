import { MODE_FRAMES } from "./internal/thinking-orb/registry.js";
import { resolvePreset } from "./internal/thinking-orb/presets.js";
import type { OrbState, OrbSize, OrbFrame } from "./internal/thinking-orb/types.js";
export type { OrbState, OrbSize, OrbFrame };

export const thinkingOrbStates = ["working", "searching", "solving", "listening", "connecting", "weaving", "composing", "breathing", "shaping"] as const;
export type ThinkingOrbOptions = Readonly<{
  /** Actual operation phase, supplied by the host; the orb never simulates progress. */
  state?: OrbState;
  size?: OrbSize;
  /** Localized description of the current operation. */
  label: string;
  speed?: number;
  paused?: boolean;
  /** Host navigation/list visibility; required for mounted but hidden native screens. */
  active?: boolean;
}>;
export { thinkingOrbRecipe } from "./thinking-orb-recipe.js";
import { thinkingOrbRecipe } from "./thinking-orb-recipe.js";

export function validateThinkingOrb({ state = "working", size = 64, speed = 1, label }: ThinkingOrbOptions): void {
  if (!thinkingOrbStates.includes(state)) throw new TypeError("Unknown ThinkingOrb state");
  if (size !== 20 && size !== 64) throw new RangeError("ThinkingOrb size must be 20 or 64");
  if (!Number.isFinite(speed) || speed <= 0 || speed > 4) throw new RangeError("ThinkingOrb speed must be > 0 and <= 4");
  if (typeof label !== "string" || !label.trim()) throw new TypeError("ThinkingOrb requires a localized label");
}

/** Theme-free, deterministic geometry; no DOM/React/native imports. */
export function buildThinkingOrbFrame(state: OrbState, size: OrbSize, time: number): OrbFrame {
  validateThinkingOrb({ state, size, label: state });
  if (!Number.isFinite(time) || time < 0) throw new RangeError("ThinkingOrb time must be finite and non-negative");
  const preset = resolvePreset(state, size);
  return MODE_FRAMES[preset.mode](size, time * preset.speed, preset.opts);
}

/** A local elapsed clock freezes exactly, instead of jumping to wall time after resume. */
export function createThinkingOrbClock() {
  let elapsed = 0;
  let previous: number | undefined;
  return {
    resetDelta() { previous = undefined; },
    sample(now: number, speed: number) {
      // Long scheduling gaps are capped so a stalled JS thread cannot jump the animation.
      if (previous !== undefined) elapsed += Math.min(thinkingOrbRecipe.motion.maxDeltaMs, Math.max(0, now - previous)) * speed / 1000;
      previous = now;
      return elapsed;
    },
    get time() { return elapsed; },
  };
}
