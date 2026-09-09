import { control, fontFamily, fontWeight, motion, radius, spacing, typography, } from "@hjmds/design-contracts/foundations";
import { visibleControlHeight, } from "@hjmds/design-contracts/components/design-system-provider";
import { listRowRecipe } from "@hjmds/design-contracts/recipes";
function kebab(value) {
    return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
function rem(value) {
    return `${Number((value / 16).toFixed(5))}rem`;
}
export function createHjmThemeStyle(value) {
    const { environment, palette } = value;
    const style = {
        "--hjm-text-scale": environment.textScale,
        "--hjm-motion-scale": environment.reducedMotion ? 0 : 1,
        colorScheme: environment.theme,
        backgroundColor: palette.theme.bg,
        color: palette.theme.text,
    };
    for (const [name, color] of Object.entries(palette.theme)) {
        style[`--hjm-color-${kebab(name)}`] = color;
    }
    for (const [name, color] of Object.entries(palette.statusAccents)) {
        style[`--hjm-accent-${kebab(name)}`] = color;
    }
    for (const [name, color] of Object.entries(palette.statusAccentFills)) {
        style[`--hjm-accent-fill-${kebab(name)}`] = color;
    }
    for (const [name, value] of Object.entries(spacing)) {
        style[`--hjm-space-${kebab(name)}`] = `${value}px`;
    }
    for (const [name, value] of Object.entries(radius)) {
        style[`--hjm-radius-${kebab(name)}`] = `${value}px`;
    }
    for (const [name, value] of Object.entries(typography)) {
        style[`--hjm-type-${kebab(name)}-size`] =
            `calc(${rem(value.fontSize)} * var(--hjm-text-scale))`;
        style[`--hjm-type-${kebab(name)}-line-height`] =
            `calc(${rem(value.lineHeight)} * var(--hjm-text-scale))`;
        style[`--hjm-type-${kebab(name)}-weight`] = value.fontWeight;
    }
    for (const [name, value] of Object.entries(fontWeight)) {
        style[`--hjm-font-weight-${kebab(name)}`] = value;
    }
    for (const [name, value] of Object.entries(motion)) {
        style[`--hjm-motion-${kebab(name)}`] = environment.reducedMotion
            ? "0ms"
            : `${value}ms`;
    }
    style["--hjm-font-family-ui"] = fontFamily.ui.join(", ");
    // Row rhythm and the leading frame come from the recipe so the stylesheet
    // does not carry a second copy of the same numbers.
    style["--hjm-list-row-gap"] = rem(listRowRecipe.gap);
    style["--hjm-list-row-leading-size"] = rem(listRowRecipe.leadingSize);
    for (const [name, value] of Object.entries(listRowRecipe.density)) {
        style[`--hjm-list-row-${kebab(name)}-one-line`] = rem(value.oneLineMinHeight);
        style[`--hjm-list-row-${kebab(name)}-two-line`] = rem(value.twoLineMinHeight);
        style[`--hjm-list-row-${kebab(name)}-padding-inline`] = rem(value.paddingHorizontal);
        style[`--hjm-list-row-${kebab(name)}-padding-block`] = rem(value.paddingVertical);
    }
    style["--hjm-control-min-touch-target"] = `${control.minTouchTarget}px`;
    style["--hjm-control-field-height"] = `${control.fieldHeight}px`;
    for (const [name, value] of Object.entries(control.buttonHeight)) {
        // The axis is applied to the emitted variables rather than to each rule so
        // that every stylesheet consumer of a control height honours it at once.
        style[`--hjm-control-button-${kebab(name)}`] =
            `${visibleControlHeight(value, environment.minimumVisualTarget)}px`;
    }
    return style;
}
//# sourceMappingURL=theme.js.map