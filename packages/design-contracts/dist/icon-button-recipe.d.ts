import { type ColorReferencePalette } from "./color-references.js";
export type IconButtonSize = "small" | "medium" | "large";
export type IconButtonShape = "rounded" | "circle";
export type IconButtonTone = "primary" | "secondary" | "ghost" | "danger";
export declare const iconButtonRecipe: {
    readonly slots: readonly ["root", "icon", "spinner"];
    readonly defaults: {
        readonly tone: "ghost";
        readonly size: "medium";
        readonly shape: "rounded";
    };
    readonly tones: {
        readonly primary: {
            readonly background: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
            readonly border: null;
        };
        readonly secondary: {
            readonly background: Readonly<{
                source: "theme";
                key: "surfaceAlt";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
        };
        readonly ghost: {
            readonly background: null;
            readonly content: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly border: null;
        };
        readonly danger: {
            readonly background: Readonly<{
                source: "theme";
                key: "dangerFill";
                alpha?: number;
            }>;
            readonly content: Readonly<{
                source: "theme";
                key: "onDanger";
                alpha?: number;
            }>;
            readonly border: null;
        };
    };
    readonly sizes: {
        readonly small: {
            readonly diameter: 36;
            readonly hitSlop: 4;
            readonly glyph: "sm";
        };
        readonly medium: {
            readonly diameter: 44;
            readonly hitSlop: 0;
            readonly glyph: "md";
        };
        readonly large: {
            readonly diameter: 52;
            readonly hitSlop: 0;
            readonly glyph: "lg";
        };
    };
    readonly shapes: {
        readonly rounded: "md";
        readonly circle: "full";
    };
    readonly states: {
        readonly pressedOpacity: 0.86;
        readonly disabledOpacity: 0.5;
    };
};
export type ResolvedIconButtonPresentation = Readonly<{
    background: string | null;
    content: string;
    border: string | null;
}>;
/** Resolve one recipe tone for non-CSS renderers without a second tone table. */
export declare function resolveIconButtonPresentation(tone: IconButtonTone, palette: ColorReferencePalette): ResolvedIconButtonPresentation;
//# sourceMappingURL=icon-button-recipe.d.ts.map