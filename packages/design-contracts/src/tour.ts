import { backdrop, motionPreset, spacing } from "./foundations.js";
import { floatingSurfaceContract } from "./component-contracts.js";

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
export type TourCloseReason =
  | "skip"
  | "escape"
  | "complete"
  | "programmatic"
  | "interrupted";

/**
 * `onOpenChange`는 여는 것과 닫는 것을 모두 보고하는데 `TourCloseReason`에는 여는
 * 사유가 없었다. 타입 이름이 약속하는 것과 내용이 어긋나 있었고, 오버레이 어휘를
 * 보고하는 다른 일곱 모듈은 전부 `"trigger"`를 쓴다(`docs/architecture.md`의
 * 「오버레이 어휘 규칙」). 여기만 예외로 둘 이유가 없어 같은 이름을 들인다.
 */
export type TourOpenReason = "trigger" | TourCloseReason;

export type TourOpenChangeDetail = Readonly<{ reason: TourOpenReason }>;

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

export type TourStepChangeHandler<Id extends string = string> = (
  stepId: Id,
  reason: TourAdvanceReason,
) => void;

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

export type ResolvedTourStepDescriptor<Id extends string = string> =
  TourStepDescriptor<Id> &
    Readonly<{
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

export type TourAdvanceOutcome<Id extends string = string> =
  | Readonly<{ type: "step"; stepId: Id }>
  | Readonly<{ type: "close"; reason: "complete" }>
  | Readonly<{ type: "no-op" }>;

/**
 * The only fixed policy this contract has: outside dismiss is never allowed.
 * There is no `dismissible`/`escapeDismiss` bag to configure, unlike Popover
 * — Escape and the Skip action always work (the brief's "탈출" requirement is
 * non-negotiable), so there is nothing left to make optional.
 */
export const tourBehaviorDefaults = {
  outsideDismiss: false,
} as const satisfies Readonly<{ outsideDismiss: false }>;

function assertNonEmpty(value: string, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`Tour ${field} must not be empty`);
  }
}

const placements = new Set<TourPlacement>(["top", "bottom", "start", "end"]);
const aligns = new Set<TourAlign>(["start", "center", "end"]);

export function validateTourStepDescriptor<Id extends string>(
  step: TourStepDescriptor<Id>,
): void {
  assertNonEmpty(step.id, "step id");
  if (step.id !== step.id.trim()) {
    throw new TypeError("Tour step id must not start or end with whitespace");
  }
  assertNonEmpty(step.anchorId, "step anchorId");
  assertNonEmpty(step.title, "step title");
  assertNonEmpty(step.description, "step description");
  if (step.placement !== undefined && !placements.has(step.placement)) {
    throw new TypeError(`Unsupported Tour step placement: ${String(step.placement)}`);
  }
  if (step.align !== undefined && !aligns.has(step.align)) {
    throw new TypeError(`Unsupported Tour step align: ${String(step.align)}`);
  }
}

export function validateTourLabels(labels: TourLabels): void {
  if (labels === null || typeof labels !== "object") {
    throw new TypeError("Tour labels must be an object");
  }
  for (const field of ["next", "previous", "skip", "done"] as const) {
    const value = labels[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new TypeError(`Tour labels.${field} must not be empty`);
    }
  }
}

/**
 * Duplicate `anchorId` values across steps are accepted on purpose (see the
 * type doc above) — only `id` must be unique. A validator that rejected
 * repeated anchors would block a legitimate two-part explanation of one
 * element.
 */
export function validateTourDescriptor<Id extends string>(
  descriptor: TourDescriptor<Id>,
): void {
  assertNonEmpty(descriptor.accessibilityLabel, "accessibilityLabel");
  if (!Array.isArray(descriptor.steps) || descriptor.steps.length === 0) {
    throw new RangeError("Tour must contain at least one step");
  }
  validateTourLabels(descriptor.labels);

  const ids = new Set<Id>();
  for (const step of descriptor.steps) {
    validateTourStepDescriptor(step);
    if (ids.has(step.id)) {
      throw new TypeError(`Duplicate Tour step id: ${step.id}`);
    }
    ids.add(step.id);
  }
  if (!ids.has(descriptor.currentStepId)) {
    throw new RangeError(
      `Tour currentStepId does not match any step id: ${String(descriptor.currentStepId)}`,
    );
  }
}

const openStateKeys = new Set(["open", "defaultOpen", "onOpenChange"]);

export function validateTourOpenState(state: TourOpenState): void {
  if (state === null || typeof state !== "object") {
    throw new TypeError("Tour open state must be an object");
  }
  const runtime = state as Readonly<Record<string, unknown>>;
  for (const key of Object.keys(runtime)) {
    if (!openStateKeys.has(key)) {
      throw new TypeError(`Unsupported Tour open state field: ${key}`);
    }
  }
  const hasOpen = Object.prototype.hasOwnProperty.call(runtime, "open");
  const hasDefaultOpen = Object.prototype.hasOwnProperty.call(runtime, "defaultOpen");
  if (hasOpen) {
    if (typeof runtime.open !== "boolean") {
      throw new TypeError("Tour open must be a boolean");
    }
    if (hasDefaultOpen) {
      throw new TypeError("Controlled Tour must not provide defaultOpen");
    }
    if (typeof runtime.onOpenChange !== "function") {
      throw new TypeError("Controlled Tour must provide onOpenChange");
    }
    return;
  }
  if (hasDefaultOpen && typeof runtime.defaultOpen !== "boolean") {
    throw new TypeError("Tour defaultOpen must be a boolean");
  }
  if (runtime.onOpenChange !== undefined && typeof runtime.onOpenChange !== "function") {
    throw new TypeError("Tour onOpenChange must be a function");
  }
}

/**
 * Resolves every step eagerly (not just the current one) so a renderer can
 * pre-render adjacent step cards without re-deriving position/total, mirroring
 * `resolveStepsDescriptor`. Throws if the composer returns an empty
 * announcement instead of silently leaving screen reader users with nothing.
 */
export function resolveTourDescriptor<Id extends string>(
  descriptor: TourDescriptor<Id>,
  options: ResolveTourOptions,
): ResolvedTourDescriptor<Id> {
  validateTourDescriptor(descriptor);
  if (typeof options.composeAnnouncement !== "function") {
    throw new TypeError("Tour composeAnnouncement must be a function");
  }

  const total = descriptor.steps.length;
  const cursorIndex = descriptor.steps.findIndex(
    (step) => step.id === descriptor.currentStepId,
  );

  const steps = descriptor.steps.map((step, index) => {
    const position = index + 1;
    const announcement = options.composeAnnouncement({
      position,
      total,
      title: step.title,
      description: step.description,
    });
    if (typeof announcement !== "string" || announcement.trim().length === 0) {
      throw new TypeError("Tour composeAnnouncement must return a non-empty string");
    }
    return { ...step, position, total, announcement };
  });

  return {
    accessibilityLabel: descriptor.accessibilityLabel,
    steps,
    // Safe: validateTourDescriptor already confirmed currentStepId matches a step.
    currentStep: steps[cursorIndex]!,
    isFirstStep: cursorIndex === 0,
    isLastStep: cursorIndex === total - 1,
  };
}

/**
 * Pure decision, no stateful session: Tour has no async side effect to guard
 * (unlike AlertDialog's confirm), so there is no busy/error phase to own —
 * only "what step comes next," which is exactly what a renderer needs to call
 * `onStepChange`/`onOpenChange` itself. This follows Popover's lighter
 * pattern rather than AlertDialog's session, since nothing here needs
 * exactly-once side-effect guarding, only the ordinary exactly-once event
 * delivery a renderer's own callback already provides.
 */
export function resolveTourAdvance<Id extends string>(
  descriptor: TourDescriptor<Id>,
  reason: TourAdvanceReason,
): TourAdvanceOutcome<Id> {
  validateTourDescriptor(descriptor);
  if (reason !== "next" && reason !== "previous") {
    throw new TypeError(`Unsupported Tour advance reason: ${String(reason)}`);
  }

  const cursorIndex = descriptor.steps.findIndex(
    (step) => step.id === descriptor.currentStepId,
  );

  if (reason === "previous") {
    if (cursorIndex === 0) return { type: "no-op" };
    // Safe: cursorIndex > 0 here, so cursorIndex - 1 is always in bounds.
    return { type: "step", stepId: descriptor.steps[cursorIndex - 1]!.id };
  }
  if (cursorIndex === descriptor.steps.length - 1) {
    return { type: "close", reason: "complete" };
  }
  // Safe: cursorIndex is not the last index here, so cursorIndex + 1 is in bounds.
  return { type: "step", stepId: descriptor.steps[cursorIndex + 1]!.id };
}

/**
 * The step card reuses the same anchored floating-surface anatomy as
 * Tooltip/Popover instead of declaring new chrome. The backdrop reuses the
 * stronger `backdrop.modal` veil (not `backdrop.veil`) because Tour, like
 * Dialog/Sheet, blocks background interaction while open — `veil` is used
 * where the surface underneath stays reachable, which Tour's fixed
 * `outsideDismiss: false` policy says it does not.
 */
export const tourRecipe = {
  slots: [
    "backdrop",
    "card",
    "title",
    "description",
    "counter",
    "previousAction",
    "nextAction",
    "skipAction",
  ] as const,
  card: floatingSurfaceContract,
  backdrop: backdrop.modal,
  maxWidth: 320,
  gap: spacing.sm,
  sideOffset: spacing.xs,
  /**
   * `context` (320ms, opacity under Reduce Motion): moving from one step's
   * card/highlight to the next is a jump between unrelated parts of the
   * screen, the same "큰 화면 요소와 맥락 전환" tier Sheet/Dialog use, not a
   * small in-place state change.
   */
  transition: { enter: motionPreset.context, exit: motionPreset.exit },
} as const;

/**
 * Literal scenario names for behaviorRegistry.tour (lead wires into
 * src/behaviors.ts). Kept here, not there, so this module stays
 * self-contained per the authoring brief.
 */
export const tourBehaviorScenarios = [
  "focus-moves-to-the-step-card-on-every-step-change-not-the-anchor",
  "background-is-inert-while-a-tour-is-open",
  "escape-and-skip-always-exit-regardless-of-step",
  "outside-pointer-does-not-dismiss",
  "next-on-the-last-step-closes-with-reason-complete",
  "previous-on-the-first-step-is-a-no-op",
  "controlled-owner-programmatic-close-always-wins",
  "unmount-or-route-change-settles-as-interrupted-exactly-once",
  "reduced-motion-crossfades-the-card-without-traveling-between-anchors",
] as const;
