import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { imageChoiceRecipe, resolveImageChoiceToggle, validateImageChoiceItems } from "@hjmds/design-contracts/components/image-choice";
/**
 * Picks avatars or photos by image (2026-10-16). Tiles are square, wrap to the available width, and show
 * a brand ring plus a check when chosen; assistive tech hears radios (single) or checkboxes (multiple).
 */
export function ImageChoiceGroup(props) {
    const { label, showLabel = false, items, disabled = false, className } = props;
    validateImageChoiceItems(items);
    const isSelected = (id) => props.selectionMode === "single" ? props.value === id : props.value.includes(id);
    const choose = (id) => {
        if (props.selectionMode === "single")
            props.onValueChange(resolveImageChoiceToggle("single", props.value, id));
        else
            props.onValueChange(resolveImageChoiceToggle("multiple", props.value, id));
    };
    const role = props.selectionMode === "single" ? "radio" : "checkbox";
    const style = { "--hjm-image-choice-size": `${imageChoiceRecipe.tileSize}px`, "--hjm-image-choice-gap": `${imageChoiceRecipe.gap}px`, "--hjm-image-choice-radius": `${imageChoiceRecipe.radius}px`, "--hjm-image-choice-ring": `${imageChoiceRecipe.ringWidth}px`, "--hjm-image-choice-offset": `${imageChoiceRecipe.ringOffset}px`, "--hjm-image-choice-check": `${imageChoiceRecipe.checkSize}px` };
    return _jsxs("div", { className: ["hjm-image-choice", className].filter(Boolean).join(" "), style: style, children: [showLabel ? _jsx("span", { className: "hjm-image-choice__label", children: label }) : null, _jsx("div", { className: "hjm-image-choice__tiles", role: props.selectionMode === "single" ? "radiogroup" : "group", "aria-label": label, children: items.map(item => {
                    const selected = isSelected(item.id);
                    return _jsxs("button", { type: "button", role: role, "aria-checked": selected, "aria-label": item.label, className: "hjm-image-choice__tile", "data-selected": selected || undefined, disabled: disabled || item.disabled, onClick: () => choose(item.id), children: [_jsx("span", { className: "hjm-image-choice__image", children: item.image }), selected ? _jsx("span", { className: "hjm-image-choice__check", "aria-hidden": "true", children: "\u2713" }) : null] }, item.id);
                }) })] });
}
//# sourceMappingURL=image-choice.js.map