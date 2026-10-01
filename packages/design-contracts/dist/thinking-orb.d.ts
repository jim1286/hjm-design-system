import type { OrbState, OrbSize, OrbFrame } from "./internal/thinking-orb/types.js";
export type { OrbState, OrbSize, OrbFrame };
export declare const thinkingOrbStates: readonly ["working", "searching", "solving", "listening", "connecting", "weaving", "composing", "breathing", "shaping"];
export type ThinkingOrbAppearance = "state" | "fluid" | "matrix";
export type ThinkingOrbOptions = Readonly<{
    /** Actual operation phase, supplied by the host; the orb never simulates progress. */
    state?: OrbState;
    appearance?: ThinkingOrbAppearance;
    size?: OrbSize;
    /** Localized description of the current operation. */
    label: string;
    speed?: number;
    paused?: boolean;
    /** Host navigation/list visibility; required for mounted but hidden native screens. */
    active?: boolean;
}>;
export { thinkingOrbRecipe } from "./thinking-orb-recipe.js";
export declare function validateThinkingOrb({ state, size, speed, label, appearance }: ThinkingOrbOptions): void;
/** Theme-free, deterministic geometry; no DOM/React/native imports. */
export declare function buildThinkingOrbFrame(state: OrbState, size: OrbSize, time: number, appearance?: ThinkingOrbAppearance): OrbFrame;
/** A local elapsed clock freezes exactly, instead of jumping to wall time after resume. */
export declare function createThinkingOrbClock(): {
    resetDelta(): void;
    sample(now: number, speed: number): number;
    readonly time: number;
};
//# sourceMappingURL=thinking-orb.d.ts.map