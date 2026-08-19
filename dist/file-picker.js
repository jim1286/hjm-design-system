import { focusIndicatorContract } from "./component-contracts.js";
import { control, opacity, radius, spacing, stroke, } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export const filePickerDefaults = {
    mode: "single",
};
const ACCEPT_PATTERN = /^(\*\/\*|[a-z0-9.+-]+\/(?:\*|[a-z0-9.+-]+)|\.[a-z0-9]+)$/i;
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`FilePicker ${field} must not be empty`);
    }
}
export function validateFilePickerDescriptor(descriptor) {
    const mode = descriptor.mode ?? filePickerDefaults.mode;
    if (mode !== "single" && mode !== "multiple") {
        throw new TypeError(`Unsupported FilePicker mode: ${String(mode)}`);
    }
    if (descriptor.accept !== undefined) {
        if (descriptor.accept.length === 0) {
            throw new TypeError("FilePicker accept must not be empty when provided");
        }
        const seen = new Set();
        for (const pattern of descriptor.accept) {
            if (!ACCEPT_PATTERN.test(pattern)) {
                throw new TypeError(`Unsupported FilePicker accept pattern: ${pattern}`);
            }
            const normalized = pattern.toLowerCase();
            if (seen.has(normalized)) {
                throw new TypeError(`Duplicate FilePicker accept pattern: ${pattern}`);
            }
            seen.add(normalized);
        }
    }
    if (descriptor.maxSizeBytes !== undefined) {
        if (!Number.isFinite(descriptor.maxSizeBytes) || descriptor.maxSizeBytes <= 0) {
            throw new RangeError("FilePicker maxSizeBytes must be a positive finite number");
        }
    }
    if (descriptor.maxCount !== undefined) {
        if (mode !== "multiple") {
            throw new TypeError("FilePicker maxCount only applies when mode is \"multiple\"");
        }
        if (!Number.isInteger(descriptor.maxCount) || descriptor.maxCount < 1) {
            throw new RangeError("FilePicker maxCount must be a positive integer");
        }
    }
}
export function resolveFilePickerDescriptor(descriptor) {
    validateFilePickerDescriptor(descriptor);
    return { ...descriptor, mode: descriptor.mode ?? filePickerDefaults.mode };
}
export function validateFilePickerCandidate(candidate) {
    assertNonEmpty(candidate.id, "candidate id");
    assertNonEmpty(candidate.name, "candidate name");
    if (typeof candidate.mimeType !== "string") {
        throw new TypeError('FilePicker candidate mimeType must be a string (use "" when unknown)');
    }
    if (!Number.isFinite(candidate.sizeBytes) || candidate.sizeBytes < 0) {
        throw new RangeError("FilePicker candidate sizeBytes must be a non-negative finite number");
    }
}
/** Splits `"type/subtype"` into a fixed-length tuple so both sides are always `string`. */
function splitOnSlash(value) {
    const slash = value.indexOf("/");
    if (slash === -1)
        return [value, ""];
    return [value.slice(0, slash), value.slice(slash + 1)];
}
function fileExtension(name) {
    const dot = name.lastIndexOf(".");
    return dot === -1 ? "" : name.slice(dot).toLowerCase();
}
function matchesPattern(candidate, pattern) {
    if (pattern.startsWith(".")) {
        return fileExtension(candidate.name) === pattern.toLowerCase();
    }
    if (pattern === "*/*")
        return true;
    if (!candidate.mimeType)
        return false;
    const [patternType, patternSubtype] = splitOnSlash(pattern.toLowerCase());
    const [fileType, fileSubtype] = splitOnSlash(candidate.mimeType.toLowerCase());
    if (patternType !== "*" && patternType !== fileType)
        return false;
    return patternSubtype === "*" || patternSubtype === fileSubtype;
}
/**
 * `undefined`/empty `accept` means unrestricted. Exported so a Web renderer's
 * live drag-over preview and the post-drop judgment share one rule.
 */
export function matchesFilePickerAccept(candidate, accept) {
    if (accept === undefined || accept.length === 0)
        return true;
    return accept.some((pattern) => matchesPattern(candidate, pattern));
}
/**
 * Judges one selection batch against the descriptor. `existingCount` is a
 * read-only input — like Select's `selectedItem` — for products that let
 * users add files across repeated picks; FilePicker never accumulates a
 * selection list itself.
 */
export function resolveFilePickerSelection(candidates, descriptor, existingCount = 0) {
    const resolved = resolveFilePickerDescriptor(descriptor);
    for (const candidate of candidates)
        validateFilePickerCandidate(candidate);
    if (!Number.isInteger(existingCount) || existingCount < 0) {
        throw new RangeError("FilePicker existingCount must be a non-negative integer");
    }
    const accepted = [];
    const rejected = [];
    for (const candidate of candidates) {
        if (!matchesFilePickerAccept(candidate, resolved.accept)) {
            rejected.push({ file: candidate, reason: "unsupported-type", accept: resolved.accept ?? [] });
            continue;
        }
        if (resolved.maxSizeBytes !== undefined && candidate.sizeBytes > resolved.maxSizeBytes) {
            rejected.push({ file: candidate, reason: "too-large", maxSizeBytes: resolved.maxSizeBytes });
            continue;
        }
        accepted.push(candidate);
    }
    const effectiveMaxCount = resolved.mode === "single" ? 1 : resolved.maxCount;
    if (effectiveMaxCount !== undefined) {
        const room = Math.max(0, effectiveMaxCount - existingCount);
        if (accepted.length > room) {
            const overflow = accepted.splice(room);
            for (const candidate of overflow) {
                rejected.push({ file: candidate, reason: "count-exceeded", maxCount: effectiveMaxCount });
            }
        }
    }
    return { accepted, rejected };
}
/**
 * Drag-and-drop is a Web-only enhancement. `validateFilePickerTriggers`
 * enforces the roadmap's adaptive gate: Native never gets a dropzone, and no
 * platform may ship a dropzone without an always-reachable button — the same
 * "automatic mode keeps a manual fallback" principle as LoadMore
 * (`src/load-more.ts`).
 */
export const filePickerTriggerDefaults = {
    web: ["button", "dropzone"],
    native: ["button"],
};
export function validateFilePickerTriggers(platform, triggers) {
    if (triggers.length === 0) {
        throw new TypeError("FilePicker triggers must not be empty");
    }
    if (!triggers.includes("button")) {
        throw new TypeError("FilePicker must always expose a button trigger, even with a dropzone");
    }
    if (platform === "native" && triggers.includes("dropzone")) {
        throw new TypeError("FilePicker dropzone trigger is a Web-only enhancement");
    }
}
export const filePickerRecipe = {
    slots: ["root", "trigger", "dropzone", "hint", "error"],
    defaults: { density: "regular" },
    trigger: {
        minHeight: control.minTouchTarget,
        paddingHorizontal: spacing.md,
        radius: "md",
        color: semanticColors.content.brand,
        textVariant: "label",
        fontWeight: "700",
    },
    dropzone: {
        borderStyle: "dashed",
        borderWidth: stroke.default,
        borderColor: semanticColors.border.default,
        activeBorderColor: semanticColors.border.focus,
        activeBackground: semanticColors.interaction.focus,
        radius: "lg",
        padding: spacing.xl,
    },
    hint: {
        color: semanticColors.content.secondary,
        textVariant: "label",
    },
    error: {
        color: semanticColors.content.danger,
        textVariant: "label",
    },
    states: {
        focus: focusIndicatorContract,
        disabledOpacity: opacity.disabled,
    },
};
/**
 * No `open`/dismiss axis: the platform picker sheet is transient OS chrome
 * FilePicker does not model, unlike Select/Sheet which own their surface.
 */
export const filePickerBehavior = {
    controlled: [],
    inputs: ["descriptor", "existingCount"],
    events: ["onSelect"],
    configuration: { mode: ["single", "multiple"] },
    defaults: filePickerDefaults,
    stateAxes: {
        availability: ["enabled", "disabled"],
        interaction: ["idle", "hover", "focusVisible", "pressed", "dragged"],
    },
    web: {
        roles: ["button"],
        keyboard: ["Tab", "Enter", "Space"],
        focus: "native",
    },
    native: {
        roles: ["button"],
        states: ["disabled"],
        actions: ["activate"],
    },
    scenarios: [
        "selecting-files-never-mutates-already-accepted-items",
        "rejected-files-report-a-reason-without-blocking-the-rest-of-the-batch",
        "type-and-size-are-judged-at-selection-time-not-upload-time",
        "count-cap-accounts-for-already-selected-items-across-repeated-picks",
        "single-mode-behaves-as-an-implicit-one-file-count-cap",
        "web-dropzone-is-always-paired-with-a-reachable-button-trigger",
        "native-never-exposes-a-dropzone-trigger",
        "rejection-is-announced-without-relying-on-color-alone",
    ],
};
//# sourceMappingURL=file-picker.js.map