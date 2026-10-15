import { motion } from "./foundations.js";
/** The product confirms the resulting count; this immutable proposal is pending feedback only. */
export function resolveToggleFeedbackProposal(state, selected) {
    if (!Number.isSafeInteger(state.count) || state.count < 0 || (state.selected && state.count === 0))
        throw new RangeError("Invalid confirmed selection count");
    const count = state.count + Number(selected) - Number(state.selected);
    if (!Number.isSafeInteger(count) || count < 0)
        throw new RangeError("Invalid proposed selection count");
    return Object.freeze({ selected, count });
}
export const toggleFeedbackRecipe = { duration: motion.slow, glyphSize: 24, effectSize: 40 };
export const toggleFeedbackPaths = {
    ripple: "M6 10C6 2 18 2 18 10V15L20 18H4L6 15ZM9 21H15",
    ribbon: "M6 3H18V21L12 17L6 21Z",
    burst: "M12 21L3.8 12.8C-2 7 6 0 12 7C18 0 26 7 20.2 12.8Z",
};
/** Host geometry only, never product state or a timer-driven counter. p=1 clears every transient. */
export function resolveToggleFeedbackFrame(effect, progress) {
    if (!Object.hasOwn(toggleFeedbackPaths, effect))
        throw new TypeError("Unknown toggle feedback effect");
    if (!Number.isFinite(progress))
        throw new TypeError("Feedback progress must be finite");
    const p = Math.min(1, Math.max(0, progress)), opacity = 1 - p;
    const rays = Array.from({ length: 8 }, (_, index) => {
        const a = index * Math.PI / 4, inner = 9 + 7 * p, outer = 12 + 7 * p;
        return `M${20 + Math.cos(a) * inner} ${20 + Math.sin(a) * inner}L${20 + Math.cos(a) * outer} ${20 + Math.sin(a) * outer}`;
    }).join(" ");
    const pulse = p === 1 ? 0 : Math.sin(Math.PI * p);
    return Object.freeze({ radius: 2 + p * 16, opacity: effect === "ribbon" ? 0 : opacity,
        rays, translateY: effect === "ribbon" && pulse !== 0 ? -6 * pulse : 0, scale: effect === "ripple" ? 1 : 1 + .12 * pulse });
}
//# sourceMappingURL=toggle-feedback.js.map