/** CSS cubic-bezier control points; x is monotonic, y may overshoot. */
export type BezierCoordinates = readonly [number, number, number, number];
export declare function validateBezier(value: BezierCoordinates): void;
export declare function cubicBezierPoint(value: BezierCoordinates, t: number): Readonly<{
    x: number;
    y: number;
}>;
export type Shortcut = Readonly<{
    code: string;
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
}>;
export type ShortcutKeyEvent = Readonly<{
    code: string;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    repeat?: boolean;
    isComposing?: boolean;
    altGraph?: boolean;
}>;
/** Stable physical-key identity; display names remain product-owned and keyboard-layout aware. */
export declare function normalizeShortcut(value: Shortcut): string;
export type ShortcutCapture = Readonly<{
    status: "ignored" | "cancelled" | "invalid" | "reserved" | "conflict";
}> | Readonly<{
    status: "ready";
    shortcut: Shortcut;
}>;
export declare function resolveShortcutCapture(event: ShortcutKeyEvent, options: Readonly<{
    platform: "mac" | "windows" | "linux";
    reserved?: readonly string[];
    conflicts?: readonly string[];
}>): ShortcutCapture;
//# sourceMappingURL=authoring-tools.d.ts.map