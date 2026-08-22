import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { control, glyph, radius, spacing } from "@hjm/design-contracts/foundations";
import { buttonRecipe, } from "@hjm/design-contracts/recipes/base";
import { bottomCtaRecipe, iconButtonRecipe, resolveIconButtonPresentation, } from "@hjm/design-contracts/recipes";
import { resolveLinkDescriptor, } from "@hjm/design-contracts/components/link";
import { forwardRef } from "react";
import { ActivityIndicator, Pressable, View, } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { minimumTargetStyle } from "./internal/styles.js";
export const Button = forwardRef(function Button({ label, children, tone = buttonRecipe.defaults.tone, size = buttonRecipe.defaults.size, disabled = false, loading = false, disableWhileLoading = false, growWithContent = false, loadingLabel, leading, trailing, fullWidth = false, hitSlop, style, labelStyle, renderLoadingIndicator, accessibilityLabel, accessibilityState, onPress, onLongPress, ...props }, ref) {
    const { colors, environment } = useHjmNativeTheme();
    const inactive = disabled || loading;
    const unavailable = disabled || (loading && disableWhileLoading);
    const content = loading && loadingLabel !== undefined
        ? loadingLabel
        : children ?? label;
    if (content === undefined || content === null || content === false) {
        throw new TypeError("Button requires children (or the deprecated label prop)");
    }
    const toneContract = buttonRecipe.tones[tone];
    const sizeContract = buttonRecipe.sizes[size];
    const resolveColor = (key) => key === null ? "transparent" : colors[key];
    const contentColor = resolveColor(toneContract.content);
    return (_jsxs(Pressable, { ...props, ref: ref, accessibilityLabel: accessibilityLabel ?? (typeof content === "string" ? content : undefined), accessibilityRole: "button", accessibilityState: { ...accessibilityState, disabled: unavailable, busy: loading }, disabled: unavailable, hitSlop: hitSlop ?? (sizeContract.hitSlop > 0 ? sizeContract.hitSlop : undefined), onPress: loading ? () => undefined : onPress, onLongPress: loading ? () => undefined : onLongPress, style: ({ pressed }) => [
            {
                alignItems: "center",
                backgroundColor: resolveColor(toneContract.background),
                borderColor: resolveColor(toneContract.border),
                borderRadius: radius.md,
                borderWidth: toneContract.border ? 1 : 0,
                direction: environment.direction,
                flexDirection: "row",
                gap: spacing.xs,
                ...(growWithContent ? {} : { height: sizeContract.height }),
                justifyContent: "center",
                minHeight: sizeContract.height,
                minWidth: control.minTouchTarget,
                opacity: inactive
                    ? buttonRecipe.opacity.disabled
                    : pressed
                        ? buttonRecipe.opacity.pressed
                        : 1,
                paddingHorizontal: sizeContract.paddingHorizontal,
                ...(fullWidth ? { alignSelf: "stretch" } : {}),
            },
            style,
        ], children: [loading
                ? renderLoadingIndicator?.({ color: contentColor, size: "small" }) ?? (_jsx(ActivityIndicator, { color: contentColor, size: "small" }))
                : leading, typeof content === "string" || typeof content === "number" ? (_jsx(Text, { align: "center", emphasis: "medium", style: [{ color: contentColor }, labelStyle], variant: sizeContract.textVariant, children: content })) : content, trailing] }));
});
export const IconButton = forwardRef(function IconButton({ label, accessibilityLabel, children, icon, tone = iconButtonRecipe.defaults.tone, size = iconButtonRecipe.defaults.size, shape = iconButtonRecipe.defaults.shape, disabled = false, loading = false, disableWhileLoading = false, hitSlop, style, renderLoadingIndicator, onPress, onLongPress, accessibilityState, ...props }, ref) {
    const theme = useHjmNativeTheme();
    const resolvedLabel = label ?? accessibilityLabel;
    const resolvedIcon = children ?? icon;
    if (resolvedLabel === undefined || resolvedLabel.trim().length === 0) {
        throw new TypeError("IconButton label must not be empty");
    }
    if (resolvedIcon === undefined || resolvedIcon === null || resolvedIcon === false) {
        throw new TypeError("IconButton requires children (or the deprecated icon prop)");
    }
    const resolvedTone = tone === "link" ? "ghost" : tone;
    const presentation = resolveIconButtonPresentation(resolvedTone, theme.palette);
    const sizeContract = iconButtonRecipe.sizes[size];
    const glyphSize = glyph[sizeContract.glyph];
    const unavailable = disabled || (loading && disableWhileLoading);
    return (_jsx(Pressable, { ...props, ref: ref, accessibilityLabel: resolvedLabel, accessibilityRole: "button", accessibilityState: { ...accessibilityState, disabled: unavailable, busy: loading }, disabled: unavailable, hitSlop: hitSlop ?? (sizeContract.hitSlop > 0 ? sizeContract.hitSlop : undefined), onPress: loading ? () => undefined : onPress, onLongPress: loading ? () => undefined : onLongPress, style: ({ pressed }) => [
            {
                alignItems: "center",
                backgroundColor: presentation.background ?? "transparent",
                borderColor: presentation.border ?? "transparent",
                borderRadius: radius[iconButtonRecipe.shapes[shape]],
                borderWidth: 1,
                height: sizeContract.diameter,
                justifyContent: "center",
                minHeight: sizeContract.diameter,
                minWidth: sizeContract.diameter,
                opacity: disabled
                    ? iconButtonRecipe.states.disabledOpacity
                    : loading
                        ? 1
                        : pressed
                            ? iconButtonRecipe.states.pressedOpacity
                            : 1,
                width: sizeContract.diameter,
            },
            style,
        ], children: loading ? (renderLoadingIndicator?.({ color: presentation.content, size: "small" }) ?? (_jsx(ActivityIndicator, { color: presentation.content, size: "small" }))) : (_jsx(View, { accessible: false, style: {
                alignItems: "center",
                height: glyphSize,
                justifyContent: "center",
                width: glyphSize,
            }, children: resolvedIcon })) }));
});
export function Link({ descriptor, onNavigate, leading, trailing, accessibilityHint, style, ...props }) {
    const { colors, environment } = useHjmNativeTheme();
    const resolved = resolveLinkDescriptor(descriptor);
    return (_jsxs(Pressable, { ...props, accessibilityHint: accessibilityHint, accessibilityLabel: resolved.resolvedAccessibilityLabel, accessibilityRole: "link", onPress: () => void onNavigate(resolved.destination), style: ({ pressed }) => [
            minimumTargetStyle,
            {
                alignItems: "center",
                alignSelf: "flex-start",
                direction: environment.direction,
                flexDirection: "row",
                gap: spacing.xs,
                opacity: pressed ? 0.72 : 1,
            },
            style,
        ], children: [leading ? _jsx(View, { accessible: false, children: leading }) : null, _jsx(Text, { style: { color: colors.contentBrand, textDecorationLine: "underline" }, variant: "bodyLarge", children: resolved.label }), trailing ? _jsx(View, { accessible: false, children: trailing }) : null] }));
}
function BottomCTAButton({ action, fallbackTone, }) {
    return (_jsx(Button, { ...(action.accessibilityLabel === undefined ? {} : { accessibilityLabel: action.accessibilityLabel }), ...(action.accessibilityHint === undefined ? {} : { accessibilityHint: action.accessibilityHint }), ...(action.disabled === undefined ? {} : { disabled: action.disabled }), ...(action.loading === undefined ? {} : { loading: action.loading }), ...(action.loadingLabel === undefined ? {} : { loadingLabel: action.loadingLabel }), fullWidth: true, onPress: action.onPress, ...(action.size === undefined ? {} : { size: action.size }), tone: action.tone ?? fallbackTone, children: action.label }));
}
function isBottomCTAAction(value) {
    return typeof value === "object"
        && value !== null
        && "label" in value
        && typeof value.label === "string"
        && "onPress" in value
        && typeof value.onPress === "function";
}
/** Native sticky-action content; products own its screen-edge positioning. */
export function BottomCTA({ primaryAction, secondaryAction, description, accessibilityLabel, safeAreaBottom = 0, style, testID, }) {
    if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0) {
        throw new RangeError("BottomCTA safeAreaBottom must be non-negative");
    }
    const { colors, environment } = useHjmNativeTheme();
    const stackActions = environment.textScale >= 1.6;
    const renderedSecondary = secondaryAction === undefined || secondaryAction === null
        ? null
        : isBottomCTAAction(secondaryAction)
            ? _jsx(BottomCTAButton, { action: secondaryAction, fallbackTone: "secondary" })
            : secondaryAction;
    return (_jsxs(View, { accessibilityLabel: accessibilityLabel, accessibilityRole: "toolbar", testID: testID, style: [
            {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderTopWidth: bottomCtaRecipe.borderWidth,
                elevation: bottomCtaRecipe.shadow.elevation,
                gap: bottomCtaRecipe.gap,
                minHeight: bottomCtaRecipe.minHeight + safeAreaBottom,
                paddingBottom: Math.max(safeAreaBottom, bottomCtaRecipe.paddingBottom),
                paddingHorizontal: bottomCtaRecipe.paddingHorizontal,
                paddingTop: bottomCtaRecipe.paddingTop,
                shadowColor: bottomCtaRecipe.shadow.color,
                shadowOffset: { width: 0, height: bottomCtaRecipe.shadow.offsetY },
                shadowOpacity: bottomCtaRecipe.shadow.opacity,
                shadowRadius: bottomCtaRecipe.shadow.radius,
            },
            style,
        ], children: [description ? _jsx(Text, { tone: "muted", variant: "caption", children: description }) : null, _jsxs(View, { style: {
                    direction: environment.direction,
                    flexDirection: stackActions ? "column-reverse" : "row",
                    gap: bottomCtaRecipe.gap,
                }, children: [renderedSecondary !== null ? (_jsx(View, { style: { flex: stackActions ? undefined : 1 }, children: renderedSecondary })) : null, _jsx(View, { style: { flex: stackActions ? undefined : 1 }, children: _jsx(BottomCTAButton, { action: primaryAction, fallbackTone: "primary" }) })] })] }));
}
//# sourceMappingURL=actions.js.map