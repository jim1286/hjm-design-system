export type TooltipPlacement = "top" | "bottom" | "start" | "end";
export type TooltipAlign = "start" | "center" | "end";

export type TooltipOpenChangeReason =
  | "pointer"
  | "focus"
  | "pointer-leave"
  | "blur"
  | "escape"
  | "trigger-activation"
  | "another-tooltip";

export type TooltipOpenChangeDetails = Readonly<{
  reason: TooltipOpenChangeReason;
}>;

/** Tooltip copy is intentionally plain text and never owns an action. */
export type TooltipDescriptor = Readonly<{
  content: string;
  placement?: TooltipPlacement;
  align?: TooltipAlign;
}>;

export type ResolvedTooltipDescriptor = Readonly<{
  content: string;
  placement: TooltipPlacement;
  align: TooltipAlign;
}>;

export type ControlledTooltipOpenState = Readonly<{
  open: boolean;
  defaultOpen?: never;
  onOpenChange(open: boolean, details: TooltipOpenChangeDetails): void;
}>;

export type UncontrolledTooltipOpenState = Readonly<{
  open?: never;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    details: TooltipOpenChangeDetails,
  ) => void;
}>;

export type TooltipOpenState =
  | ControlledTooltipOpenState
  | UncontrolledTooltipOpenState;

export const tooltipDescriptorDefaults = {
  placement: "top",
  align: "center",
} as const satisfies Readonly<{
  placement: TooltipPlacement;
  align: TooltipAlign;
}>;

export const tooltipBehaviorDefaults = {
  pointerOpenDelayMs: 500,
  focusOpenDelayMs: 0,
  skipDelayMs: 300,
  hoverable: true,
  touchHover: false,
  oneVisiblePerProvider: true,
} as const;

const placements = new Set<TooltipPlacement>([
  "top",
  "bottom",
  "start",
  "end",
]);
const alignments = new Set<TooltipAlign>(["start", "center", "end"]);
const descriptorKeys = new Set(["content", "placement", "align"]);
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
      throw new TypeError(`Unsupported Tooltip ${field} field: ${key}`);
    }
  }
}

export function validateTooltipDescriptor(
  descriptor: TooltipDescriptor,
): void {
  if (!isObject(descriptor)) {
    throw new TypeError("Tooltip descriptor must be an object");
  }
  rejectUnknownKeys(descriptor, descriptorKeys, "descriptor");
  if (
    typeof descriptor.content !== "string" ||
    descriptor.content.trim().length === 0
  ) {
    throw new TypeError("Tooltip content must not be empty");
  }
  if (descriptor.content !== descriptor.content.trim()) {
    throw new TypeError(
      "Tooltip content must not start or end with whitespace",
    );
  }
  if (
    descriptor.placement !== undefined &&
    !placements.has(descriptor.placement)
  ) {
    throw new TypeError(
      `Unsupported Tooltip placement: ${String(descriptor.placement)}`,
    );
  }
  if (descriptor.align !== undefined && !alignments.has(descriptor.align)) {
    throw new TypeError(
      `Unsupported Tooltip align: ${String(descriptor.align)}`,
    );
  }
}

export function resolveTooltipDescriptor(
  descriptor: TooltipDescriptor,
): ResolvedTooltipDescriptor {
  validateTooltipDescriptor(descriptor);
  return {
    content: descriptor.content,
    placement: descriptor.placement ?? tooltipDescriptorDefaults.placement,
    align: descriptor.align ?? tooltipDescriptorDefaults.align,
  };
}

export function validateTooltipOpenState(state: TooltipOpenState): void {
  if (!isObject(state)) {
    throw new TypeError("Tooltip open state must be an object");
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
      throw new TypeError("Tooltip open must be a boolean");
    }
    if (hasDefaultOpen) {
      throw new TypeError(
        "Controlled Tooltip must not provide defaultOpen",
      );
    }
    if (typeof runtime.onOpenChange !== "function") {
      throw new TypeError(
        "Controlled Tooltip must provide onOpenChange",
      );
    }
    return;
  }
  if (hasDefaultOpen && typeof runtime.defaultOpen !== "boolean") {
    throw new TypeError("Tooltip defaultOpen must be a boolean");
  }
  if (
    runtime.onOpenChange !== undefined &&
    typeof runtime.onOpenChange !== "function"
  ) {
    throw new TypeError("Tooltip onOpenChange must be a function");
  }
}
