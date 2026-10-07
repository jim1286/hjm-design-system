import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { isLargeTextScale, visibleControlHeight, } from "@hjmds/design-contracts/components/design-system-provider";
import { control, spacing } from "@hjmds/design-contracts/foundations";
import { buttonRecipe, resolveButtonLabelLines, } from "@hjmds/design-contracts/recipes/base";
import { Children, forwardRef } from "react";
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
export const RecipeButton = forwardRef(function RecipeButton({ children, tone = buttonRecipe.defaults.tone, size = buttonRecipe.defaults.size, shape = buttonRecipe.defaults.shape, align = buttonRecipe.defaults.align, selected, disabled = false, loading = false, disableWhileLoading = false, growWithContent = false, loadingLabel, leading, trailing, fullWidth = false, hitSlop, layoutStyle, style, labelStyle, renderLoadingIndicator, accessibilityLabel, accessibilityState, onPress, onLongPress, ...props }, ref) {
    const { colors, environment, tokens } = useHjmNativeTheme();
    const labelLines = resolveButtonLabelLines(isLargeTextScale(environment.textScale));
    const inactive = disabled && !loading;
    const unavailable = disabled || (loading && disableWhileLoading);
    // Preserve the idle content's measured width while the pending label remains the accessible name.
    const content = joinTextChildren(children);
    const textContent = typeof content === "string" || typeof content === "number";
    const announcedContent = loading && loadingLabel !== undefined ? loadingLabel : content;
    if (content === undefined || content === null || content === false) {
        throw new TypeError("Button requires children");
    }
    const toneContract = buttonRecipe.tones[tone];
    const sizeContract = buttonRecipe.sizes[size];
    const selectedContract = selected === true ? buttonRecipe.states.selected : null;
    const resolveColor = (key) => key === null ? "transparent" : colors[key];
    const contentColor = resolveColor(selectedContract?.content ?? toneContract.content);
    const visibleHeight = visibleControlHeight(sizeContract.height, environment.minimumVisualTarget);
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
                borderColor: resolveColor(selectedContract?.border ?? toneContract.border),
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
        ], children: [loading && leading != null ? _jsx(View, { style: { opacity: 0 }, children: leading }) : leading, textContent ? (_jsx(Text, { align: align === "leading" ? "auto" : "center", emphasis: "medium", ...(labelLines === null ? {} : { numberOfLines: labelLines }), style: [{ color: contentColor, flexShrink: 1, minWidth: 0 }, labelStyle, loading ? { opacity: 0 } : null], variant: sizeContract.textVariant, children: content })) : (loading ? _jsx(View, { importantForAccessibility: "no-hide-descendants", style: { opacity: 0 }, children: content }) : content), loading && trailing != null ? _jsx(View, { style: { opacity: 0 }, children: trailing }) : trailing, loading ? _jsx(View, { pointerEvents: "none", style: { alignItems: "center", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0 }, children: renderLoadingIndicator?.({ color: contentColor, size: "small" }) ?? _jsx(ActivityIndicator, { color: contentColor, size: "small" }) }) : null] }));
});
//# sourceMappingURL=recipe-button.js.map