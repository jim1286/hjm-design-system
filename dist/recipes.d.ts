import { control } from "./foundations.js";
export type ButtonTone = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = keyof typeof control.buttonHeight;
export type SurfaceTone = "default" | "raised" | "accent";
export type FieldVariant = "surface" | "inset";
export type FieldShape = "medium" | "large" | "full";
/** Typed recipe; platform renderers translate the same intent to their own primitives. */
export declare const buttonRecipe: {
    readonly tones: {
        readonly primary: {
            readonly background: "primary";
            readonly content: "onPrimary";
            readonly border: null;
        };
        readonly secondary: {
            readonly background: "surfaceAlt";
            readonly content: "text";
            readonly border: "border";
        };
        readonly ghost: {
            readonly background: null;
            readonly content: "textMuted";
            readonly border: null;
        };
        readonly danger: {
            readonly background: "dangerFill";
            readonly content: "onDanger";
            readonly border: null;
        };
    };
    readonly sizes: {
        readonly small: {
            readonly height: 36;
            readonly hitSlop: 4;
            readonly paddingHorizontal: 12;
            readonly textVariant: "label";
        };
        readonly medium: {
            readonly height: 44;
            readonly hitSlop: 0;
            readonly paddingHorizontal: 16;
            readonly textVariant: "body";
        };
        readonly large: {
            readonly height: 52;
            readonly hitSlop: 0;
            readonly paddingHorizontal: 20;
            readonly textVariant: "bodyLarge";
        };
    };
    readonly opacity: {
        readonly disabled: 0.5;
        readonly pressed: 0.86;
    };
};
export declare const surfaceRecipe: {
    readonly default: {
        readonly background: "surface";
        readonly border: "border";
        readonly borderAlpha: 1;
        readonly elevated: false;
    };
    readonly raised: {
        readonly background: "bg";
        readonly border: "border";
        readonly borderAlpha: 1;
        readonly elevated: true;
    };
    readonly accent: {
        readonly background: "surfaceAccent";
        readonly border: "primary";
        readonly borderAlpha: 0.3;
        readonly elevated: false;
    };
};
export declare const fieldRecipe: {
    readonly variants: {
        readonly surface: {
            readonly background: "surface";
        };
        readonly inset: {
            readonly background: "bg";
        };
    };
    readonly shapes: {
        readonly medium: "md";
        readonly large: "lg";
        readonly full: "full";
    };
    readonly states: {
        readonly idle: {
            readonly border: "textWeak";
        };
        readonly focused: {
            readonly border: "primary";
        };
        readonly invalid: {
            readonly border: "danger";
        };
    };
    readonly minHeight: 44;
    readonly multilineMinHeight: 80;
    readonly paddingHorizontal: 16;
    readonly paddingVertical: 12;
    readonly textVariant: "body";
    readonly disabledOpacity: 0.6;
};
//# sourceMappingURL=recipes.d.ts.map