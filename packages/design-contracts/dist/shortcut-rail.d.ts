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
    readonly removeWidth: 44;
    readonly minTouchTarget: 44;
};
export declare function validateShortcutRail(items: readonly ShortcutRailItem[], label: string, layout?: "scroll" | "wrap"): void;
/** Minimal physical offset that exposes a focused shortcut in either reading direction. */
export declare function revealShortcut(offset: number, viewport: number, start: number, width: number): number;
//# sourceMappingURL=shortcut-rail.d.ts.map