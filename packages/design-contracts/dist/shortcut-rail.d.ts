export type ShortcutRailItem = Readonly<{
    id: string;
    label: string;
    description?: string;
    disabled?: boolean;
}>;
/**
 * `default` keeps the Chip idle face (hairline border, muted label). `strong` is for a rail that sits among controls with a
 * resting control outline, such as Spint's recent cities above period pills: the hairline read as disabled next to them
 * (2026-11-26 Spint city sheet). It uses the same control outline and primary label as the pills and secondary Button.
 */
export type ShortcutRailEmphasis = "default" | "strong";
export declare const shortcutRailRecipe: {
    readonly defaults: {
        readonly layout: "scroll";
        readonly emphasis: ShortcutRailEmphasis;
    };
    /** Overrides on top of `chipRecipe.states.idle`; `default` overrides nothing. */
    readonly emphasis: {
        readonly default: {};
        readonly strong: {
            readonly content: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "borderControl";
                alpha?: number;
            }>;
        };
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