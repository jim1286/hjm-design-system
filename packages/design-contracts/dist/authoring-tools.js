export function validateBezier(value) {
    if (value.length !== 4 || value.some(n => !Number.isFinite(n)) || value[0] < 0 || value[0] > 1 || value[2] < 0 || value[2] > 1)
        throw new RangeError("Bezier requires four finite coordinates with x in [0, 1]");
}
export function cubicBezierPoint(value, t) {
    validateBezier(value);
    if (!Number.isFinite(t) || t < 0 || t > 1)
        throw new RangeError("Bezier parameter must be in [0, 1]");
    const u = 1 - t;
    return { x: 3 * u * u * t * value[0] + 3 * u * t * t * value[2] + t * t * t, y: 3 * u * u * t * value[1] + 3 * u * t * t * value[3] + t * t * t };
}
/** Stable physical-key identity; display names remain product-owned and keyboard-layout aware. */
export function normalizeShortcut(value) {
    return [value.ctrl && "Ctrl", value.alt && "Alt", value.shift && "Shift", value.meta && "Meta", value.code].filter(Boolean).join("+");
}
export function resolveShortcutCapture(event, options) {
    if (event.repeat || event.isComposing || event.altGraph || /^(Shift|Control|Alt|Meta)(Left|Right)$/.test(event.code))
        return { status: "ignored" };
    if (event.code === "Escape")
        return { status: "cancelled" };
    // Bare printable/navigation keys would hijack normal typing and focus navigation.
    if (!event.ctrlKey && !event.altKey && !event.metaKey || !/^(Key[A-Z]|Digit[0-9]|F([1-9]|1[0-9]|2[0-4])|Space|Enter|Arrow(Up|Down|Left|Right)|Backspace|Delete|Home|End|PageUp|PageDown|BracketLeft|BracketRight|Comma|Period|Slash|Backslash|Minus|Equal|Semicolon|Quote|Backquote)$/.test(event.code))
        return { status: "invalid" };
    const shortcut = Object.freeze({ code: event.code, ctrl: event.ctrlKey, alt: event.altKey, shift: event.shiftKey, meta: event.metaKey });
    const key = normalizeShortcut(shortcut), primary = options.platform === "mac" ? shortcut.meta : shortcut.ctrl;
    // Common browser/OS ownership is deliberately conservative. Apps add environment-specific reservations.
    const browserOwned = primary && !shortcut.alt && ["KeyQ", "KeyW", "KeyT", "KeyN", "KeyR", "KeyL", "KeyP", "KeyS", "KeyO", "KeyF", "KeyC", "KeyV", "KeyX", "KeyA", "KeyZ"].includes(shortcut.code);
    const systemOwned = (shortcut.alt && ["Tab", "F4"].includes(shortcut.code)) || (shortcut.ctrl && shortcut.alt && shortcut.code === "Delete") || (shortcut.meta && options.platform !== "mac") || (options.platform === "mac" && shortcut.meta && shortcut.code === "Space");
    if (browserOwned || systemOwned || options.reserved?.includes(key))
        return { status: "reserved" };
    if (options.conflicts?.includes(key))
        return { status: "conflict" };
    return { status: "ready", shortcut };
}
//# sourceMappingURL=authoring-tools.js.map