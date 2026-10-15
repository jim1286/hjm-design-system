import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { isLargeTextScale, visibleControlHeight, } from "@hjmds/design-contracts/components/design-system-provider";
import { control, spacing } from "@hjmds/design-contracts/foundations";
import { buttonRecipe, resolveButtonLabelLines, } from "@hjmds/design-contracts/recipes/base";
import { Children, forwardRef, useState } from "react";
import { ActivityIndicator, Pressable, View, } from "react-native";
import { Text } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";
// React Native cannot render a raw string outside <Text>. JSX such as `{count} shared` or
// `Filter{suffix}` produces an array of strings/numbers, which the single-string check used to miss,
// so the label rendered bare inside Pressable and crashed ("Text strings must be rendered within a
// <Text> component", Showcase 2026-10-06). Joining keeps the same Text, wrapping cap and accessible
// name as a single string, matching Web where mixed text children already work. Children that
// contain elements still render as-is.
function joinTextChildren(children) {
    if (!Array.isArray(children))
        return children;
    const parts = Children.toArray(children);
    return parts.length > 0 && parts.every((part) => typeof part === "string" || typeof part === "number")
        ? parts.join("")
        : children;
}
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export const RecipeButton = forwardRef(function RecipeButton({ children, tone = buttonRecipe.defaults.tone, size = buttonRecipe.defaults.size, shape = buttonRecipe.defaults.shape, align = buttonRecipe.defaults.align, selected, disabled = false, loading = false, completion, disableWhileLoading = false, growWithContent = false, loadingLabel, leading, trailing, fullWidth = false, hitSlop, layoutStyle, style, labelStyle, renderLoadingIndicator, accessibilityLabel, accessibilityState, onPress, onLongPress, ...props }, ref) {
    const { colors, environment, tokens, textScaling } = useHjmNativeTheme();
    const labelLines = resolveButtonLabelLines(isLargeTextScale(environment.textScale));
    const inactive = disabled && !loading;
    const unavailable = disabled || (loading && disableWhileLoading);
    // Preserve the idle content's measured width while the pending label remains the accessible name.
    const content = joinTextChildren(children);
    const textContent = typeof content === "string" || typeof content === "number";
    if (completion && (!completion.label.trim() || typeof completion.confirmed !== "boolean" || !textContent)) {
        throw new TypeError("Button completion requires a nonempty label, a boolean confirmed value and text-only children");
    }
    const completed = completion?.confirmed === true && !loading;
    const currentContent = completed ? completion.label : content;
    const announcedContent = loading && loadingLabel !== undefined ? loadingLabel : currentContent;
    if (content === undefined || content === null || content === false) {
        throw new TypeError("Button requires children");
    }
    const toneContract = buttonRecipe.tones[tone];
    const sizeContract = buttonRecipe.sizes[size];
    const selectedContract = selected === true ? buttonRecipe.states.selected : null;
    const resolveColor = (key) => key === null ? "transparent" : colors[key];
    const contentColor = resolveColor(selectedContract?.content ?? toneContract.content);
    const visibleHeight = visibleControlHeight(sizeContract.height, environment.minimumVisualTarget);
    // Yoga has no intrinsic overlapping grid. Hidden flow labels supply the maximum
    // width; a recipe-height slot exists before their first native measurement.
    const measurementKey = completion ? JSON.stringify([content, completion.label, size, tokens.fontFamily, tokens.typography[sizeContract.textVariant], environment.textScale, labelStyle]) : "";
    const [labelMeasurements, setLabelMeasurements] = useState({ key: "", idle: 0, complete: 0 });
    const labelMetric = tokens.typography[sizeContract.textVariant];
    const initialSlotHeight = labelMetric.lineHeight * textScaling.scale * (labelLines ?? 1);
    const measured = labelMeasurements.key === measurementKey ? Math.max(labelMeasurements.idle, labelMeasurements.complete) : 0;
    const slotHeight = Math.max(initialSlotHeight, measured);
    const measureLabel = (label, height) => {
        setLabelMeasurements(previous => {
            const current = previous.key === measurementKey ? previous : { key: measurementKey, idle: 0, complete: 0 };
            return current[label] === height ? current : { ...current, [label]: height };
        });
    };
    return (_jsxs(Pressable, { ...props, ref: ref, accessibilityLabel: accessibilityLabel ??
            (typeof announcedContent === "string" ? announcedContent : undefined), accessibilityRole: "button", accessibilityState: {
            ...accessibilityState,
            ...(selected === undefined ? {} : { selected }),
            disabled: unavailable,
            busy: loading,
        }, disabled: unavailable, hitSlop: hitSlop ??
            (sizeContract.hitSlop > 0 ? sizeContract.hitSlop : undefined), onPress: loading ? () => undefined : onPress, onLongPress: loading ? () => undefined : onLongPress, style: ({ pressed }) => [
            {
                alignItems: "center",
                backgroundColor: resolveColor(selectedContract?.background ?? toneContract.background),
                borderColor: resolveColor((selectedContract ?? toneContract).border),
                borderRadius: tokens.radius[buttonRecipe.shapes[shape]],
                borderWidth: (selectedContract ?? toneContract).border ? 1 : 0,
                direction: environment.direction,
                flexDirection: "row",
                gap: spacing.xs,
                // Wrapped labels need their intrinsic height, especially when large text
                // lifts the line cap. Fixed recipe height clipped the independent 2x fixture.
                ...(growWithContent || textContent ? {} : { height: visibleHeight }),
                justifyContent: buttonRecipe.aligns[align],
                minHeight: visibleHeight,
                minWidth: control.minTouchTarget,
                opacity: inactive
                    ? buttonRecipe.opacity.disabled
                    : pressed
                        ? buttonRecipe.opacity.pressed
                        : 1,
                paddingHorizontal: toneContract.paddingHorizontal ?? sizeContract.paddingHorizontal,
                ...(fullWidth ? { alignSelf: "stretch" } : {}),
            },
            style,
            layoutStyle,
        ], children: [loading && leading != null ? _jsx(View, { style: { opacity: 0 }, children: leading }) : leading, completion ? _jsxs(View, { style: { flexShrink: 1, minWidth: 0, height: slotHeight }, children: [_jsxs(View, { pointerEvents: "none", accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { height: 0, opacity: 0 }, children: [_jsx(Text, { fontRole: "ui", emphasis: "medium", variant: sizeContract.textVariant, ...(labelLines === null ? {} : { numberOfLines: labelLines }), onLayout: event => measureLabel("idle", event.nativeEvent.layout.height), style: [{ color: contentColor, flexShrink: 0, minWidth: 0 }, labelStyle], children: content }), _jsx(Text, { fontRole: "ui", emphasis: "medium", variant: sizeContract.textVariant, ...(labelLines === null ? {} : { numberOfLines: labelLines }), onLayout: event => measureLabel("complete", event.nativeEvent.layout.height), style: [{ color: contentColor, flexShrink: 0, minWidth: 0 }, labelStyle], children: completion.label })] }), _jsx(View, { pointerEvents: "none", style: { position: "absolute", inset: 0, justifyContent: "center", opacity: loading ? 0 : 1 }, children: _jsx(Text, { fontRole: "ui", align: align === "leading" ? "auto" : "center", emphasis: "medium", variant: sizeContract.textVariant, ...(labelLines === null ? {} : { numberOfLines: labelLines }), style: [{ color: contentColor, minWidth: 0 }, labelStyle], children: currentContent }) })] }) : textContent ? (_jsx(Text, { fontRole: "ui", align: align === "leading" ? "auto" : "center", emphasis: "medium", ...(labelLines === null ? {} : { numberOfLines: labelLines }), style: [{ color: contentColor, flexShrink: 1, minWidth: 0 }, labelStyle, loading ? { opacity: 0 } : null], variant: sizeContract.textVariant, children: content })) : (loading ? _jsx(View, { importantForAccessibility: "no-hide-descendants", style: { opacity: 0 }, children: content }) : content), loading && trailing != null ? _jsx(View, { style: { opacity: 0 }, children: trailing }) : trailing, loading ? _jsx(View, { pointerEvents: "none", style: { alignItems: "center", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0 }, children: renderLoadingIndicator?.({ color: contentColor, size: "small" }) ?? _jsx(ActivityIndicator, { color: contentColor, size: "small" }) }) : null] }));
});
//# sourceMappingURL=recipe-button.js.map