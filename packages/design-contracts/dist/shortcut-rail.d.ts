export type ShortcutRailItem = Readonly<{
    id: string;
    label: string;
    description?: string;
    disabled?: boolean;
}>;
export declare const shortcutRailRecipe: {
    readonly defaults: {
        readonly layout: "scroll";
    };
    readonly gap: 8;
    readonly glyph: 14;
    readonly actionMinWidth: 44;
    /**
     * Visible width of the × part. The full 44pt target used to be painted, so a removable chip ("퓨처스 ×") looked about
     * twice its label (오늘야구 기록실, 2026-11-04). The target keeps 44pt through `removeHitSlop` past the trailing edge,
     * where it overlaps nothing, and the label gives up its trailing padding to the ×.
     */
    readonly removeWidth: 24;
    readonly removeHitSlop: number;
    readonly minTouchTarget: 44;
};
export declare function validateShortcutRail(items: readonly ShortcutRailItem[], label: string, layout?: "scroll" | "wrap"): void;
/** Minimal physical offset that exposes a focused shortcut in either reading direction. */
export declare function revealShortcut(offset: number, viewport: number, start: number, width: number): number;
//# sourceMappingURL=shortcut-rail.d.ts.map