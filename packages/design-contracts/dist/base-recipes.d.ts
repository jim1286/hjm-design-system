import { control, radius, spacing } from "./foundations.js";
export type ButtonTone = "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = keyof typeof control.buttonHeight;
export type SurfaceTone = "default" | "raised" | "accent" | "subtle";
export type SurfacePadding = "none" | keyof typeof spacing;
export type SurfaceRadius = keyof typeof radius;
export type FieldVariant = "surface" | "inset";
export type FieldShape = "medium" | "large" | "full";
/** Small renderer entry point for the three foundational visual recipes. */
export declare const buttonRecipe: {
    readonly slots: readonly ["root", "leading", "label", "trailing", "spinner"];
    readonly defaults: {
        readonly tone: "primary";
        readonly size: "medium";
    };
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
        readonly link: {
            readonly background: null;
            readonly content: "contentBrand";
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
        readonly borderAlways: false;
    };
    readonly raised: {
        readonly background: "bg";
        readonly border: "border";
        readonly borderAlpha: 1;
        readonly elevated: true;
        readonly borderAlways: false;
    };
    readonly accent: {
        readonly background: "surfaceAccent";
        readonly border: "primary";
        readonly borderAlpha: 0.3;
        readonly elevated: false;
        readonly borderAlways: false;
    };
    readonly subtle: {
        readonly background: "bg";
        readonly border: "border";
        readonly borderAlpha: 1;
        readonly elevated: false;
        readonly borderAlways: true;
    };
};
export declare const fieldRecipe: {
    readonly slots: readonly ["root", "label", "control", "leading", "input", "trailing", "hint", "error"];
    readonly defaults: {
        readonly variant: "surface";
        readonly shape: "medium";
    };
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
            readonly border: "textMuted";
        };
        readonly focused: {
            readonly border: "contentBrand";
        };
        readonly invalid: {
            readonly border: "danger";
        };
    };
    readonly minHeight: 44;
    readonly multilineMinHeight: 80;
    readonly borderWidth: 1;
    readonly focusRingWidth: 2;
    readonly focusRingOffset: 2;
    readonly paddingHorizontal: 16;
    readonly paddingVertical: 12;
    readonly textVariant: "body";
    readonly label: {
        readonly color: "textBody";
        readonly textVariant: "body";
        readonly fontWeight: "600";
        readonly gap: 8;
    };
    readonly support: {
        readonly hintColor: "textMuted";
        readonly errorColor: "danger";
        readonly textVariant: "label";
        readonly gap: 6;
    };
    readonly placeholder: {
        readonly color: "textMuted";
    };
    readonly disabledOpacity: 0.6;
};
/**
 * Renderer-neutral Surface geometry. Tone colors stay in `surfaceRecipe` for
 * compatibility; these axes make the previously implicit Web/Native defaults
 * explicit without changing that public recipe shape.
 */
export declare const surfaceDefaults: {
    readonly tone: "default";
    readonly padding: "none";
    readonly radius: "lg";
    readonly bordered: false;
};
export declare const surfaceGeometry: {
    readonly paddings: {
        readonly xxs: 4;
        readonly xs: 8;
        readonly sm: 12;
        readonly md: 16;
        readonly lg: 20;
        readonly xl: 24;
        readonly xxl: 32;
        readonly xxxl: 40;
        readonly none: 0;
    };
    readonly radii: {
        readonly sm: 8;
        readonly md: 12;
        readonly lg: 16;
        readonly xl: 24;
        readonly full: 999;
    };
};
//# sourceMappingURL=base-recipes.d.ts.map