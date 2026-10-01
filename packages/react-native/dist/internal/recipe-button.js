import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { isLargeTextScale, visibleControlHeight, } from "@hjmds/design-contracts/components/design-system-provider";
import { control, radius, spacing } from "@hjmds/design-contracts/foundations";
import { buttonRecipe, resolveButtonLabelLines, } from "@hjmds/design-contracts/recipes/base";
import { forwardRef } from "react";
import { ActivityIndicator, Pressable, } from "react-native";
import { Text } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";
export const RecipeButton = forwardRef(function RecipeButton({ children, tone = buttonRecipe.defaults.tone, size = buttonRecipe.defaults.size, shape = buttonRecipe.defaults.shape, align = buttonRecipe.defaults.align, selected, disabled = false, loading = false, disableWhileLoading = false, growWithContent = false, loadingLabel, leading, trailing, fullWidth = false, hitSlop, layoutStyle, style, labelStyle, renderLoadingIndicator, accessibilityLabel, accessibilityState, onPress, onLongPress, ...props }, ref) {
    const { colors, environment } = useHjmNativeTheme();
    const labelLines = resolveButtonLabelLines(isLargeTextScale(environment.textScale));
    const inactive = disabled || loading;
    const unavailable = disabled || (loading && disableWhileLoading);
    const content = loading && loadingLabel !== undefined ? loadingLabel : children;
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
            (typeof content === "string" ? content : undefined), accessibilityRole: "button", accessibilityState: {
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
                borderRadius: radius[buttonRecipe.shapes[shape]],
                borderWidth: (selectedContract ?? toneContract).border ? 1 : 0,
                direction: environment.direction,
                flexDirection: "row",
                gap: spacing.xs,
                ...(growWithContent ? {} : { height: visibleHeight }),
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
            style,
            labelStyle,
        ], children: [loading
                ? renderLoadingIndicator?.({
                    color: contentColor,
                    size: "small",
                }) ?? _jsx(ActivityIndicator, { color: contentColor, size: "small" })
                : leading, typeof content === "string" || typeof content === "number" ? (_jsx(Text, { align: align === "leading" ? "auto" : "center", emphasis: "medium", ...(labelLines === null ? {} : { numberOfLines: labelLines }), style: [{ color: contentColor }, labelStyle], variant: sizeContract.textVariant, children: content })) : (content), trailing] }));
});
//# sourceMappingURL=recipe-button.js.map