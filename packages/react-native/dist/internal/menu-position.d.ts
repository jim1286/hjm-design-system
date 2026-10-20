type Rect = Readonly<{
    x: number;
    y: number;
    width: number;
    height: number;
}>;
/** Coordinates are relative to the measured Modal root, not assumed screen/status-bar offsets. */
export declare function resolveNativeMenuPosition(anchor: Rect, viewport: Readonly<{
    width: number;
    height: number;
    top: number;
    bottom: number;
    left: number;
    right: number;
}>, menuHeight: number, direction: "ltr" | "rtl", menuWidth: number): {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly maxHeight: number;
    readonly placement: "bottom" | "top";
};
export {};
//# sourceMappingURL=menu-position.d.ts.map