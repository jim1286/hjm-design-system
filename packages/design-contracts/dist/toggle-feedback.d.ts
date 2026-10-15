export type ToggleFeedbackEffect = "ripple" | "ribbon" | "burst";
export type ToggleFeedbackState = Readonly<{
    selected: boolean;
    count: number;
}>;
/** The product confirms the resulting count; this immutable proposal is pending feedback only. */
export declare function resolveToggleFeedbackProposal(state: ToggleFeedbackState, selected: boolean): ToggleFeedbackState;
export declare const toggleFeedbackRecipe: {
    readonly duration: 320;
    readonly glyphSize: 24;
    readonly effectSize: 40;
};
export declare const toggleFeedbackPaths: Readonly<Record<ToggleFeedbackEffect, string>>;
/** Host geometry only, never product state or a timer-driven counter. p=1 clears every transient. */
export declare function resolveToggleFeedbackFrame(effect: ToggleFeedbackEffect, progress: number): Readonly<{
    radius: number;
    opacity: number;
    rays: string;
    translateY: number;
    scale: number;
}>;
//# sourceMappingURL=toggle-feedback.d.ts.map