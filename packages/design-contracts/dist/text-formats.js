import { fontFamily, radius, spacing, typography } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export const textFormatRecipe = {
    slots: ["root"],
    kbd: {
        fontFamily: fontFamily.code,
        textVariant: "label",
        paddingHorizontal: spacing.xxs,
        radius: radius.sm,
        background: semanticColors.surface.sunken,
        color: semanticColors.content.body,
        border: semanticColors.border.default,
    },
    code: {
        fontFamily: fontFamily.code,
        textVariant: "body",
        paddingHorizontal: spacing.xxs,
        radius: radius.sm,
        background: semanticColors.surface.sunken,
        color: semanticColors.content.primary,
    },
    quote: {
        textVariant: "body",
        paddingInlineStart: spacing.md,
        borderWidth: 2,
        border: semanticColors.border.default,
        color: semanticColors.content.body,
    },
};
export const textFormatBehavior = {
    controlled: [],
    inputs: ["kind"],
    configuration: { kind: ["kbd", "code", "quote"] },
    stateAxes: {},
    web: { roles: [], keyboard: [], focus: "none" },
    native: { roles: [], states: [], actions: [] },
    scenarios: [
        "each-kind-emits-its-own-html-element-so-assistive-technology-reads-it-as-what-it-is",
        "these-are-elements-not-text-sizes-which-is-why-they-are-not-a-text-variant",
        "a-key-name-is-product-copy-because-the-same-key-is-called-different-things-per-platform",
    ],
};
//# sourceMappingURL=text-formats.js.map