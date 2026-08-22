import { resolveColorReference, } from "./color-references.js";
import { opacity, radius, } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export const iconButtonRecipe = {
    slots: ["root", "icon", "spinner"],
    defaults: { tone: "ghost", size: "medium", shape: "rounded" },
    tones: {
        primary: {
            background: semanticColors.action.brand.background,
            content: semanticColors.action.brand.content,
            border: null,
        },
        secondary: {
            background: semanticColors.action.neutral.background,
            content: semanticColors.action.neutral.content,
            border: semanticColors.border.default,
        },
        ghost: {
            background: null,
            content: semanticColors.content.secondary,
            border: null,
        },
        danger: {
            background: semanticColors.action.danger.background,
            content: semanticColors.action.danger.content,
            border: null,
        },
    },
    sizes: {
        small: { diameter: 36, hitSlop: 4, glyph: "sm" },
        medium: { diameter: 44, hitSlop: 0, glyph: "md" },
        large: { diameter: 52, hitSlop: 0, glyph: "lg" },
    },
    shapes: { rounded: "md", circle: "full" },
    states: {
        pressedOpacity: opacity.pressed,
        disabledOpacity: opacity.disabled,
    },
};
/** Resolve one recipe tone for non-CSS renderers without a second tone table. */
export function resolveIconButtonPresentation(tone, palette) {
    const contract = iconButtonRecipe.tones[tone];
    return {
        background: contract.background === null
            ? null
            : resolveColorReference(contract.background, palette),
        content: resolveColorReference(contract.content, palette),
        border: contract.border === null
            ? null
            : resolveColorReference(contract.border, palette),
    };
}
//# sourceMappingURL=icon-button-recipe.js.map