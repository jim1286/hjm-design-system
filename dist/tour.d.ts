/**
 * Tour has no substitute in this package. Unlike FloatingActionButton
 * (BottomCTA already owns the full-width conclusion) or ConfirmPopover
 * (Popover + AlertDialog already cover its space), walking a user through
 * several distinct screen elements in sequence is not already solved by any
 * existing contract.
 *
 * The hardest boundary: this package knows nothing about the DOM or RN view
 * tree. A step names its target with an opaque `anchorId` the product already
 * uses to identify that element; measuring it, scrolling it into view, and
 * drawing any highlight/cutout is entirely the renderer's job. This module
 * never accepts a ref, node, or coordinate.
 */
export type TourPlacement = "top" | "bottom" | "start" | "end";
export type TourAlign = "start" | "center" | "end";
export type TourStepDescriptor<Id extends string = string> = Readonly<{
    id: Id;
    /** Opaque product-owned key; never a DOM node, RN ref, or measured rect. */
    anchorId: string;
    title: string;
    description: string;
    placement?: TourPlacement;
    align?: TourAlign;
}>;
export type TourLabels = Readonly<{
    next: string;
    previous: string;
    skip: string;
    /** Shown instead of `next` on the last step. */
    done: string;
}>;
/**
 * A single stable cursor (`currentStepId`) is the source of truth, same
 * reasoning as Steps: no per-step status array that could represent two
 * "current" steps at once. Unlike Steps, `anchorId` values are not required
 * to be unique — a product may legitimately explain one element across two
 * consecutive steps ("tap here" / "now hold to reorder").
 */
export type TourDescriptor<Id extends string = string> = Readonly<{
    /** Announced once when the tour opens, before any step content. */
    accessibilityLabel: string;
    steps: readonly TourStepDescriptor<Id>[];
    currentStepId: Id;
    labels: TourLabels;
}>;
export type TourAdvanceReason = "next" | "previous";
/**
 * `skip`/`escape` are the user backing out early, `complete` is finishing the
 * last step, `programmatic` is the controlled owner closing directly, and
 * `interrupted` is an unmount or route replace settling the tour without any
 * of the above — mirroring AlertDialog's cancel-reason vocabulary. There is
 * deliberately no `outside` reason: unlike Popover, an accidental pointer
 * outside the card must not silently end a walkthrough the user did not ask
 * to leave.
 */
export type TourCloseReason = "skip" | "escape" | "complete" | "programmatic" | "interrupted";
/**
 * `onOpenChange`는 여는 것과 닫는 것을 모두 보고하는데 `TourCloseReason`에는 여는
 * 사유가 없었다. 타입 이름이 약속하는 것과 내용이 어긋나 있었고, 오버레이 어휘를
 * 보고하는 다른 일곱 모듈은 전부 `"trigger"`를 쓴다(`docs/architecture.md`의
 * 「오버레이 어휘 규칙」). 여기만 예외로 둘 이유가 없어 같은 이름을 들인다.
 */
export type TourOpenReason = "trigger" | TourCloseReason;
export type TourOpenChangeDetail = Readonly<{
    reason: TourOpenReason;
}>;
export type ControlledTourOpenState = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange(open: boolean, detail: TourOpenChangeDetail): void;
}>;
export type UncontrolledTourOpenState = Readonly<{
    open?: never;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, detail: TourOpenChangeDetail) => void;
}>;
export type TourOpenState = ControlledTourOpenState | UncontrolledTourOpenState;
export type TourStepChangeHandler<Id extends string = string> = (stepId: Id, reason: TourAdvanceReason) => void;
export type TourStepAnnouncementInfo = Readonly<{
    position: number;
    total: number;
    title: string;
    description: string;
}>;
/**
 * Products compose the exact phrase order (Korean "5단계 중 2단계" does not
 * translate structurally to "step 2 of 5"), same reasoning as Steps'
 * `composeAccessibleName`. The composed string is what a renderer moves
 * accessibility focus to and announces on every step change — it is the
 * entire answer to "what does a screen reader user get instead of a visual
 * pointer": the same title, description, and position a sighted user reads.
 */
export type ComposeTourStepAnnouncement = (info: TourStepAnnouncementInfo) => string;
export type ResolveTourOptions = Readonly<{
    composeAnnouncement: ComposeTourStepAnnouncement;
}>;
export type ResolvedTourStepDescriptor<Id extends string = string> = TourStepDescriptor<Id> & Readonly<{
    /** 1-indexed so position and title both preserve reading order for renderers. */
    position: number;
    total: number;
    announcement: string;
}>;
export type ResolvedTourDescriptor<Id extends string = string> = Readonly<{
    accessibilityLabel: string;
    steps: readonly ResolvedTourStepDescriptor<Id>[];
    currentStep: ResolvedTourStepDescriptor<Id>;
    isFirstStep: boolean;
    isLastStep: boolean;
}>;
export type TourAdvanceOutcome<Id extends string = string> = Readonly<{
    type: "step";
    stepId: Id;
}> | Readonly<{
    type: "close";
    reason: "complete";
}> | Readonly<{
    type: "no-op";
}>;
/**
 * The only fixed policy this contract has: outside dismiss is never allowed.
 * There is no `dismissible`/`escapeDismiss` bag to configure, unlike Popover
 * — Escape and the Skip action always work (the brief's "탈출" requirement is
 * non-negotiable), so there is nothing left to make optional.
 */
export declare const tourBehaviorDefaults: {
    readonly outsideDismiss: false;
};
export declare function validateTourStepDescriptor<Id extends string>(step: TourStepDescriptor<Id>): void;
export declare function validateTourLabels(labels: TourLabels): void;
/**
 * Duplicate `anchorId` values across steps are accepted on purpose (see the
 * type doc above) — only `id` must be unique. A validator that rejected
 * repeated anchors would block a legitimate two-part explanation of one
 * element.
 */
export declare function validateTourDescriptor<Id extends string>(descriptor: TourDescriptor<Id>): void;
export declare function validateTourOpenState(state: TourOpenState): void;
/**
 * Resolves every step eagerly (not just the current one) so a renderer can
 * pre-render adjacent step cards without re-deriving position/total, mirroring
 * `resolveStepsDescriptor`. Throws if the composer returns an empty
 * announcement instead of silently leaving screen reader users with nothing.
 */
export declare function resolveTourDescriptor<Id extends string>(descriptor: TourDescriptor<Id>, options: ResolveTourOptions): ResolvedTourDescriptor<Id>;
/**
 * Pure decision, no stateful session: Tour has no async side effect to guard
 * (unlike AlertDialog's confirm), so there is no busy/error phase to own —
 * only "what step comes next," which is exactly what a renderer needs to call
 * `onStepChange`/`onOpenChange` itself. This follows Popover's lighter
 * pattern rather than AlertDialog's session, since nothing here needs
 * exactly-once side-effect guarding, only the ordinary exactly-once event
 * delivery a renderer's own callback already provides.
 */
export declare function resolveTourAdvance<Id extends string>(descriptor: TourDescriptor<Id>, reason: TourAdvanceReason): TourAdvanceOutcome<Id>;
/**
 * The step card reuses the same anchored floating-surface anatomy as
 * Tooltip/Popover instead of declaring new chrome. The backdrop reuses the
 * stronger `backdrop.modal` veil (not `backdrop.veil`) because Tour, like
 * Dialog/Sheet, blocks background interaction while open — `veil` is used
 * where the surface underneath stays reachable, which Tour's fixed
 * `outsideDismiss: false` policy says it does not.
 */
export declare const tourRecipe: {
    readonly slots: readonly ["backdrop", "card", "title", "description", "counter", "previousAction", "nextAction", "skipAction"];
    readonly card: {
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly borderWidth: 1;
        readonly radius: "md";
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.12;
            readonly radius: 12;
            readonly offsetY: 4;
        };
        readonly padding: 8;
    };
    readonly backdrop: {
        readonly color: "#000000";
        readonly opacity: 0.6;
    };
    readonly maxWidth: 320;
    readonly gap: 12;
    readonly sideOffset: 8;
    /**
     * `context` (320ms, opacity under Reduce Motion): moving from one step's
     * card/highlight to the next is a jump between unrelated parts of the
     * screen, the same "큰 화면 요소와 맥락 전환" tier Sheet/Dialog use, not a
     * small in-place state change.
     */
    readonly transition: {
        readonly enter: {
            readonly duration: 320;
            readonly easing: "emphasized";
            readonly reducedMotion: "opacity";
        };
        readonly exit: {
            readonly duration: 120;
            readonly easing: "exit";
            readonly reducedMotion: "instant";
        };
    };
};
/**
 * Literal scenario names for behaviorRegistry.tour (lead wires into
 * src/behaviors.ts). Kept here, not there, so this module stays
 * self-contained per the authoring brief.
 */
export declare const tourBehaviorScenarios: readonly ["focus-moves-to-the-step-card-on-every-step-change-not-the-anchor", "background-is-inert-while-a-tour-is-open", "escape-and-skip-always-exit-regardless-of-step", "outside-pointer-does-not-dismiss", "next-on-the-last-step-closes-with-reason-complete", "previous-on-the-first-step-is-a-no-op", "controlled-owner-programmatic-close-always-wins", "unmount-or-route-change-settles-as-interrupted-exactly-once", "reduced-motion-crossfades-the-card-without-traveling-between-anchors"];
//# sourceMappingURL=tour.d.ts.map