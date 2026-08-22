import { radius } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export const progressRecipe = {
    slots: ["root", "track", "indicator", "label", "value"],
    defaults: { size: "medium", tone: "brand" },
    sizes: { small: 4, medium: 8, large: 12 },
    tones: {
        brand: semanticColors.content.brand,
        success: semanticColors.feedback.success.foreground,
        warning: semanticColors.feedback.warning.foreground,
        danger: semanticColors.content.danger,
    },
    track: semanticColors.surface.sunken,
    radius: "full",
};
//# sourceMappingURL=progress-recipe.js.map