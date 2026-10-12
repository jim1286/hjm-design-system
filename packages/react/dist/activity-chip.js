import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import { activityChipRecipe, resolveActivityChipDescriptor, } from "@hjmds/design-contracts/activity-chip";
import { classNames } from "./internal.js";
/**
 * Pressable status of one running task. It is a disclosure trigger for the matching panel toast
 * (composition `activity-status`), so it exposes `aria-expanded` instead of Chip's selection roles.
 */
const recipeStyle = {
    "--hjm-activity-chip-max-width": `${activityChipRecipe.root.maxWidth}px`,
    "--hjm-activity-chip-media-size": `${activityChipRecipe.media.size}px`,
    "--hjm-activity-chip-pressed-opacity": String(activityChipRecipe.root.pressedOpacity),
};
export const ActivityChip = forwardRef(function ActivityChip({ label, accessibilityLabel, emphasis, expanded, media, layoutStyle, className, ...props }, ref) {
    const resolved = resolveActivityChipDescriptor({
        label,
        ...(accessibilityLabel === undefined ? {} : { accessibilityLabel }),
        ...(emphasis === undefined ? {} : { emphasis }),
        ...(expanded === undefined ? {} : { expanded }),
    });
    const hasMedia = media !== undefined && media !== null;
    return (_jsxs("button", { ...props, ref: ref, type: "button", className: classNames("hjm-activity-chip", className), "data-emphasis": resolved.emphasis, "data-media": hasMedia ? "true" : undefined, "aria-expanded": resolved.expanded, "aria-label": accessibilityLabel === undefined ? undefined : resolved.accessibilityLabel, style: { ...recipeStyle, ...layoutStyle }, children: [!hasMedia ? null : (_jsx("span", { className: "hjm-activity-chip__media", "aria-hidden": "true", children: media })), _jsx("span", { className: "hjm-activity-chip__label", children: resolved.label })] }));
});
//# sourceMappingURL=activity-chip.js.map