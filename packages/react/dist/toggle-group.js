import { jsx as _jsx } from "react/jsx-runtime";
import { reconcileToggleGroupSelection, toggleGroupRecipe, toggleGroupSelection, validateToggleGroupDescriptor, } from "@hjmds/design-contracts/components/toggle-group";
import { forwardRef, useMemo } from "react";
import { classNames, useControllableState } from "./internal.js";
export const ToggleGroup = forwardRef(function ToggleGroup({ descriptor, pressedIds: controlledPressed, defaultPressedIds, onPressedIdsChange, size = toggleGroupRecipe.defaults.size, className, }, forwardedRef) {
    validateToggleGroupDescriptor(descriptor);
    const [rawPressed, setPressed] = useControllableState({
        ...(controlledPressed === undefined ? {} : { value: controlledPressed }),
        defaultValue: defaultPressedIds ?? new Set(),
        ...(onPressedIdsChange === undefined ? {} : { onChange: onPressedIdsChange }),
    });
    const pressed = useMemo(() => reconcileToggleGroupSelection(descriptor, rawPressed), [descriptor, rawPressed]);
    const metrics = toggleGroupRecipe.sizes[size];
    return (_jsx("div", { ref: forwardedRef, role: "group", "aria-label": descriptor.accessibilityLabel, className: classNames("hjm-toggle-group", className), "data-size": size, style: {
            "--hjm-toggle-min-height": `${metrics.minHeight}px`,
            "--hjm-toggle-padding": `${metrics.paddingHorizontal}px`,
            "--hjm-toggle-gap": `${toggleGroupRecipe.gap}px`,
            "--hjm-toggle-radius": `${toggleGroupRecipe.radius}px`,
        }, children: descriptor.items.map((item) => (_jsx("button", { type: "button", "aria-pressed": pressed.has(item.id), "aria-disabled": item.disabled || undefined, disabled: item.disabled, className: "hjm-toggle-group__item", onClick: () => setPressed(toggleGroupSelection(descriptor, pressed, item.id)), children: item.label }, item.id))) }));
});
//# sourceMappingURL=toggle-group.js.map