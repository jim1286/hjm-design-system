import { floatingSurfaceContract } from "./component-contracts.js";
import { motionPreset, spacing } from "./foundations.js";

/**
 * Popover is the third corner of a triangle with Tooltip and Menu — all three
 * are "a floating surface anchored to a trigger." Tooltip is explicitly
 * plain-text and never receives focus (docs/tooltip.md: "interactive
 * Popover로 확장하지 않는다"). Menu is a collection of actionable items with
 * its own role/keyboard table (behaviorRegistry.menu). Popover is what is left:
 * arbitrary *interactive* content (a small form, rich text with a link, a
 * mixed layout) that is neither a single plain sentence nor an item list.
 * Focus entering the surface is the decisive, testable difference from
 * Tooltip — everything else here (dismiss reasons, non-modal posture) follows
 * from that one fact.
 */
export type PopoverPlacement = "top" | "bottom" | "start" | "end";
export type PopoverAlign = "start" | "center" | "end";

/**
 * Popover is non-modal: it does not trap focus like Dialog/Sheet and does not
 * block the rest of the page. So its dismiss vocabulary is deliberately
 * narrower than SheetDismissReason — no "back" or "swipe" (this is a web-only
 * surface), but it adds "outside-focus" because, unlike a modal, Tab can
 * legitimately carry focus out of a non-modal surface and that departure is
 * itself a dismiss signal distinct from a pointer click outside.
 */
export type PopoverDismissReason =
  | "close-action"
  | "outside-pointer"
  | "outside-focus"
  | "escape"
  | "programmatic";

/**
 * 여는 사유는 `"trigger"`다. Sheet·SidePanel·CommandPalette가 모두 이 이름을 쓰고,
 * `"trigger-activation"`은 `src/tooltip.ts`에서 **닫는** 사유(열려 있는 툴팁의
 * 트리거를 눌러 닫는다)로 이미 쓰이고 있다. 한 문자열이 여는 뜻과 닫는 뜻을 겸하면
 * 렌더러가 조용히 반대로 처리한다 — 컴파일러는 둘 다 유효한 문자열로만 본다.
 */
export type PopoverOpenChangeReason = "trigger" | PopoverDismissReason;

export type PopoverOpenChangeDetails = Readonly<{
  reason: PopoverOpenChangeReason;
}>;

export type PopoverDescriptor = Readonly<{
  placement?: PopoverPlacement;
  align?: PopoverAlign;
  /**
   * Only needed when the content has no visible heading the platform
   * accessibility tree can already read as the surface's name. Most Popover
   * content should carry its own heading; this is an escape hatch, not the
   * default path.
   */
  accessibilityLabel?: string;
}>;

export type ResolvedPopoverDescriptor = Readonly<{
  placement: PopoverPlacement;
  align: PopoverAlign;
  accessibilityLabel?: string;
}>;

export const popoverDescriptorDefaults = {
  placement: "bottom",
  align: "start",
} as const satisfies Readonly<{ placement: PopoverPlacement; align: PopoverAlign }>;

/**
 * A controlled owner's programmatic close always wins, exactly like
 * SheetDismissPolicy/canDismissSheet. Popover has no `busy` axis: unlike
 * Sheet/AlertDialog it is not modal, so there is no global "block every
 * dismiss" state to defend — a form inside the content that wants to ignore
 * Escape while submitting makes that call itself, at the content level.
 */
export type PopoverDismissPolicy = Readonly<{
  dismissible: boolean;
  outsideDismiss: boolean;
  escapeDismiss: boolean;
  focusOutDismiss: boolean;
}>;

export const popoverBehaviorDefaults = {
  dismissible: true,
  outsideDismiss: true,
  escapeDismiss: true,
  focusOutDismiss: true,
} as const satisfies PopoverDismissPolicy;

export type ControlledPopoverOpenState = Readonly<{
  open: boolean;
  defaultOpen?: never;
  onOpenChange(open: boolean, details: PopoverOpenChangeDetails): void;
}>;

export type UncontrolledPopoverOpenState = Readonly<{
  open?: never;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    details: PopoverOpenChangeDetails,
  ) => void;
}>;

export type PopoverOpenState =
  | ControlledPopoverOpenState
  | UncontrolledPopoverOpenState;

/** Products own what page-change caused this; Popover only needs "did it happen and how." */
export type PopoverChangeHandler = PopoverOpenState["onOpenChange"];

const placements = new Set<PopoverPlacement>(["top", "bottom", "start", "end"]);
const alignments = new Set<PopoverAlign>(["start", "center", "end"]);
const descriptorKeys = new Set(["placement", "align", "accessibilityLabel"]);
const openStateKeys = new Set(["open", "defaultOpen", "onOpenChange"]);

function isObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function rejectUnknownKeys(
  value: Readonly<Record<string, unknown>>,
  allowed: ReadonlySet<string>,
  field: string,
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      throw new TypeError(`Unsupported Popover ${field} field: ${key}`);
    }
  }
}

export function validatePopoverDescriptor(descriptor: PopoverDescriptor): void {
  if (!isObject(descriptor)) {
    throw new TypeError("Popover descriptor must be an object");
  }
  rejectUnknownKeys(descriptor, descriptorKeys, "descriptor");
  if (
    descriptor.placement !== undefined &&
    !placements.has(descriptor.placement)
  ) {
    throw new TypeError(
      `Unsupported Popover placement: ${String(descriptor.placement)}`,
    );
  }
  if (descriptor.align !== undefined && !alignments.has(descriptor.align)) {
    throw new TypeError(`Unsupported Popover align: ${String(descriptor.align)}`);
  }
  if (descriptor.accessibilityLabel !== undefined) {
    if (
      typeof descriptor.accessibilityLabel !== "string" ||
      descriptor.accessibilityLabel.trim().length === 0
    ) {
      throw new TypeError("Popover accessibilityLabel must not be empty");
    }
    if (descriptor.accessibilityLabel !== descriptor.accessibilityLabel.trim()) {
      throw new TypeError(
        "Popover accessibilityLabel must not start or end with whitespace",
      );
    }
  }
}

export function resolvePopoverDescriptor(
  descriptor: PopoverDescriptor,
): ResolvedPopoverDescriptor {
  validatePopoverDescriptor(descriptor);
  return {
    placement: descriptor.placement ?? popoverDescriptorDefaults.placement,
    align: descriptor.align ?? popoverDescriptorDefaults.align,
    ...(descriptor.accessibilityLabel !== undefined
      ? { accessibilityLabel: descriptor.accessibilityLabel }
      : {}),
  };
}

export function validatePopoverOpenState(state: PopoverOpenState): void {
  if (!isObject(state)) {
    throw new TypeError("Popover open state must be an object");
  }
  rejectUnknownKeys(state, openStateKeys, "open state");
  const runtime = state as Readonly<Record<string, unknown>>;
  const hasOpen = Object.prototype.hasOwnProperty.call(runtime, "open");
  const hasDefaultOpen = Object.prototype.hasOwnProperty.call(
    runtime,
    "defaultOpen",
  );
  if (hasOpen) {
    if (typeof runtime.open !== "boolean") {
      throw new TypeError("Popover open must be a boolean");
    }
    if (hasDefaultOpen) {
      throw new TypeError("Controlled Popover must not provide defaultOpen");
    }
    if (typeof runtime.onOpenChange !== "function") {
      throw new TypeError("Controlled Popover must provide onOpenChange");
    }
    return;
  }
  if (hasDefaultOpen && typeof runtime.defaultOpen !== "boolean") {
    throw new TypeError("Popover defaultOpen must be a boolean");
  }
  if (
    runtime.onOpenChange !== undefined &&
    typeof runtime.onOpenChange !== "function"
  ) {
    throw new TypeError("Popover onOpenChange must be a function");
  }
}

/**
 * Resolves an attempted close without platform knowledge, mirroring
 * canDismissSheet. Programmatic close is always an owner override.
 */
export function canDismissPopover(
  reason: PopoverDismissReason,
  policy: PopoverDismissPolicy = popoverBehaviorDefaults,
): boolean {
  if (reason === "programmatic") return true;
  if (!policy.dismissible) return false;
  if (reason === "outside-pointer") return policy.outsideDismiss;
  if (reason === "outside-focus") return policy.focusOutDismiss;
  if (reason === "escape") return policy.escapeDismiss;
  return true;
}

/**
 * Positioning boundary is identical to Tooltip's: HJM owns preferred
 * placement, spacing, and motion; DOM measurement, portal, flip/shift, and
 * RTL logical-to-physical translation stay in the product Web renderer's
 * private AnchoredOverlay (see docs/tooltip.md "Positioning boundary"). This
 * module never exposes that internal tool, so Popover cannot regress Tooltip's
 * "no public collision/portal API" boundary.
 */
export const popoverRecipe = {
  slots: ["trigger", "content", "arrow", "closeAction"] as const,
  surface: floatingSurfaceContract,
  arrow: { size: spacing.xxs, offset: spacing.xxs },
  sideOffset: spacing.xs,
  collisionPadding: spacing.xs,
  minWidth: 240,
  maxWidth: 360,
  transition: { enter: motionPreset.enter, exit: motionPreset.exit },
} as const satisfies {
  slots: readonly string[];
  surface: typeof floatingSurfaceContract;
  arrow: { size: number; offset: number };
  sideOffset: number;
  collisionPadding: number;
  minWidth: number;
  maxWidth: number;
  transition: { enter: typeof motionPreset.enter; exit: typeof motionPreset.exit };
};

/**
 * Literal scenario names for behaviorRegistry.popover (lead wires into
 * src/behaviors.ts). Kept here, not there, so this module stays self-contained
 * per the authoring brief.
 */
export const popoverBehaviorScenarios = [
  "focus-enters-surface-on-open",
  "escape-closes-and-restores-trigger-focus",
  "outside-pointer-close-does-not-cancel-the-original-interaction",
  "tabbing-past-last-focusable-child-closes-without-trapping",
  "controlled-owner-programmatic-close-always-wins",
  "close-action-inside-content-closes-exactly-once",
  "trigger-while-open-does-not-reopen",
  "one-visible-popover-per-trigger",
] as const;
