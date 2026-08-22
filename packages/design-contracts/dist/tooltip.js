export const tooltipDescriptorDefaults = {
    placement: "top",
    align: "center",
};
export const tooltipBehaviorDefaults = {
    pointerOpenDelayMs: 500,
    focusOpenDelayMs: 0,
    skipDelayMs: 300,
    hoverable: true,
    touchHover: false,
    oneVisiblePerProvider: true,
};
const placements = new Set([
    "top",
    "bottom",
    "start",
    "end",
]);
const alignments = new Set(["start", "center", "end"]);
const descriptorKeys = new Set(["content", "placement", "align"]);
const openStateKeys = new Set(["open", "defaultOpen", "onOpenChange"]);
function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function rejectUnknownKeys(value, allowed, field) {
    for (const key of Object.keys(value)) {
        if (!allowed.has(key)) {
            throw new TypeError(`Unsupported Tooltip ${field} field: ${key}`);
        }
    }
}
export function validateTooltipDescriptor(descriptor) {
    if (!isObject(descriptor)) {
        throw new TypeError("Tooltip descriptor must be an object");
    }
    rejectUnknownKeys(descriptor, descriptorKeys, "descriptor");
    if (typeof descriptor.content !== "string" ||
        descriptor.content.trim().length === 0) {
        throw new TypeError("Tooltip content must not be empty");
    }
    if (descriptor.content !== descriptor.content.trim()) {
        throw new TypeError("Tooltip content must not start or end with whitespace");
    }
    if (descriptor.placement !== undefined &&
        !placements.has(descriptor.placement)) {
        throw new TypeError(`Unsupported Tooltip placement: ${String(descriptor.placement)}`);
    }
    if (descriptor.align !== undefined && !alignments.has(descriptor.align)) {
        throw new TypeError(`Unsupported Tooltip align: ${String(descriptor.align)}`);
    }
}
export function resolveTooltipDescriptor(descriptor) {
    validateTooltipDescriptor(descriptor);
    return {
        content: descriptor.content,
        placement: descriptor.placement ?? tooltipDescriptorDefaults.placement,
        align: descriptor.align ?? tooltipDescriptorDefaults.align,
    };
}
export function validateTooltipOpenState(state) {
    if (!isObject(state)) {
        throw new TypeError("Tooltip open state must be an object");
    }
    rejectUnknownKeys(state, openStateKeys, "open state");
    const runtime = state;
    const hasOpen = Object.prototype.hasOwnProperty.call(runtime, "open");
    const hasDefaultOpen = Object.prototype.hasOwnProperty.call(runtime, "defaultOpen");
    if (hasOpen) {
        if (typeof runtime.open !== "boolean") {
            throw new TypeError("Tooltip open must be a boolean");
        }
        if (hasDefaultOpen) {
            throw new TypeError("Controlled Tooltip must not provide defaultOpen");
        }
        if (typeof runtime.onOpenChange !== "function") {
            throw new TypeError("Controlled Tooltip must provide onOpenChange");
        }
        return;
    }
    if (hasDefaultOpen && typeof runtime.defaultOpen !== "boolean") {
        throw new TypeError("Tooltip defaultOpen must be a boolean");
    }
    if (runtime.onOpenChange !== undefined &&
        typeof runtime.onOpenChange !== "function") {
        throw new TypeError("Tooltip onOpenChange must be a function");
    }
}
//# sourceMappingURL=tooltip.js.map