import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { control, glyph, radius, spacing } from "@hjm/design-contracts/foundations";
import { buttonRecipe, } from "@hjm/design-contracts/recipes/base";
import { iconButtonRecipe, resolveIconButtonPresentation, } from "@hjm/design-contracts/recipes";
import { resolveLinkDescriptor, } from "@hjm/design-contracts/components/link";
import { ActivityIndicator, Pressable, View, } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { minimumTargetStyle } from "./internal/styles.js";
export function Button({ label, children, tone = buttonRecipe.defaults.tone, size = buttonRecipe.defaults.size, disabled = false, loading = false, leading, trailing, style, accessibilityLabel, onPress, onLongPress, ...props }) {
    const { colors, environment } = useHjmNativeTheme();
    const inactive = disabled || loading;
    const content = children ?? label;
    if (content === undefined || content === null || content === false) {
        throw new TypeError("Button requires children (or the deprecated label prop)");
    }
    const toneContract = buttonRecipe.tones[tone];
    const sizeContract = buttonRecipe.sizes[size];
    const resolveColor = (key) => key === null ? "transparent" : colors[key];
    const contentColor = resolveColor(toneContract.content);
    return (_jsxs(Pressable, { ...props, accessibilityLabel: accessibilityLabel ?? (typeof content === "string" ? content : undefined), accessibilityRole: "button", accessibilityState: { disabled, busy: loading }, disabled: disabled, hitSlop: sizeContract.hitSlop > 0 ? sizeContract.hitSlop : undefined, onPress: loading ? () => undefined : onPress, onLongPress: loading ? () => undefined : onLongPress, style: ({ pressed }) => [
            {
                alignItems: "center",
                backgroundColor: resolveColor(toneContract.background),
                borderColor: resolveColor(toneContract.border),
                borderRadius: radius.md,
                borderWidth: 1,
                direction: environment.direction,
                flexDirection: "row",
                gap: spacing.xs,
                height: sizeContract.height,
                justifyContent: "center",
                minHeight: sizeContract.height,
                minWidth: control.minTouchTarget,
                opacity: inactive
                    ? buttonRecipe.opacity.disabled
                    : pressed
                        ? buttonRecipe.opacity.pressed
                        : 1,
                paddingHorizontal: sizeContract.paddingHorizontal,
            },
            style,
        ], children: [loading ? _jsx(ActivityIndicator, { color: contentColor, size: "small" }) : leading, _jsx(Text, { align: "center", emphasis: "medium", style: { color: contentColor }, variant: sizeContract.textVariant, children: content }), trailing] }));
}
export function IconButton({ label, accessibilityLabel, children, icon, tone = iconButtonRecipe.defaults.tone, size = iconButtonRecipe.defaults.size, shape = iconButtonRecipe.defaults.shape, disabled = false, loading = false, style, onPress, onLongPress, ...props }) {
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
    return (_jsx(Pressable, { ...props, accessibilityLabel: resolvedLabel, accessibilityRole: "button", accessibilityState: { disabled, busy: loading }, disabled: disabled, hitSlop: sizeContract.hitSlop > 0 ? sizeContract.hitSlop : undefined, onPress: loading ? () => undefined : onPress, onLongPress: loading ? () => undefined : onLongPress, style: ({ pressed }) => [
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
        ], children: loading ? (_jsx(ActivityIndicator, { color: presentation.content, size: "small" })) : (_jsx(View, { accessible: false, style: {
                alignItems: "center",
                height: glyphSize,
                justifyContent: "center",
                width: glyphSize,
            }, children: resolvedIcon })) }));
}
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
    return (_jsx(Button, { ...(action.accessibilityHint === undefined ? {} : { accessibilityHint: action.accessibilityHint }), ...(action.disabled === undefined ? {} : { disabled: action.disabled }), ...(action.loading === undefined ? {} : { loading: action.loading }), onPress: action.onPress, tone: action.tone ?? fallbackTone, children: action.label }));
}
/** Native sticky-action content; products own its screen-edge positioning. */
export function BottomCTA({ primaryAction, secondaryAction, description, accessibilityLabel, safeAreaBottom = 0, style, }) {
    if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0) {
        throw new RangeError("BottomCTA safeAreaBottom must be non-negative");
    }
    const { colors, environment } = useHjmNativeTheme();
    const stackActions = environment.textScale >= 1.6;
    return (_jsxs(View, { accessibilityLabel: accessibilityLabel, accessibilityRole: "toolbar", style: [
            {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderTopWidth: 1,
                elevation: 8,
                gap: spacing.sm,
                minHeight: 64,
                paddingBottom: spacing.sm + safeAreaBottom,
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.sm,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            style,
        ], children: [description ? _jsx(Text, { tone: "muted", variant: "caption", children: description }) : null, _jsxs(View, { style: {
                    direction: environment.direction,
                    flexDirection: stackActions ? "column-reverse" : "row",
                    gap: spacing.sm,
                }, children: [secondaryAction ? (_jsx(View, { style: { flex: stackActions ? undefined : 1 }, children: _jsx(BottomCTAButton, { action: secondaryAction, fallbackTone: "secondary" }) })) : null, _jsx(View, { style: { flex: stackActions ? undefined : 1 }, children: _jsx(BottomCTAButton, { action: primaryAction, fallbackTone: "primary" }) })] })] }));
}
//# sourceMappingURL=actions.js.map