import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { visibleControlHeight } from "@hjmds/design-contracts/components/design-system-provider";
import { resolveLinkDescriptor, } from "@hjmds/design-contracts/components/link";
import { glyph, radius, spacing } from "@hjmds/design-contracts/foundations";
import { bottomCtaRecipe, iconButtonRecipe, resolveIconButtonPresentation, } from "@hjmds/design-contracts/recipes";
import {} from "@hjmds/design-contracts/recipes/base";
import { forwardRef } from "react";
import { ActivityIndicator, Pressable, View, } from "react-native";
import { RecipeButton } from "./internal/recipe-button.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
// Public callers compose placement through layoutStyle; visual overrides stay inside HJM recipes.
export const Button = forwardRef(function Button(props, ref) {
    // Untyped JS callers must not reach the private recipe override through a spread.
    if ("style" in props || "labelStyle" in props) {
        throw new TypeError("Button style/labelStyle were removed; use layoutStyle and semantic props");
    }
    return _jsx(RecipeButton, { ...props, ref: ref });
});
export const IconButton = forwardRef(function IconButton({ label, children, tone = iconButtonRecipe.defaults.tone, size = iconButtonRecipe.defaults.size, shape = iconButtonRecipe.defaults.shape, selected, disabled = false, loading = false, disableWhileLoading = false, hitSlop, layoutStyle, style, renderLoadingIndicator, onPress, onLongPress, accessibilityState, ...props }, ref) {
    const theme = useHjmNativeTheme();
    const resolvedLabel = label;
    const resolvedIcon = children;
    if (resolvedLabel === undefined || resolvedLabel.trim().length === 0) {
        throw new TypeError("IconButton label must not be empty");
    }
    if (resolvedIcon === undefined || resolvedIcon === null || resolvedIcon === false) {
        throw new TypeError("IconButton requires children");
    }
    const resolvedTone = tone;
    const presentation = resolveIconButtonPresentation(resolvedTone, theme.palette, selected === true);
    const sizeContract = iconButtonRecipe.sizes[size];
    // Web reads the same size through `--hjm-control-button-*`, which the axis
    // already raises. Native read `diameter` straight from the recipe, so a
    // product that turned `minimumVisualTarget` on got 44pt buttons but 36pt
    // icon buttons — the two renderers disagreed.
    const visibleDiameter = visibleControlHeight(sizeContract.diameter, theme.environment.minimumVisualTarget);
    const glyphSize = glyph[sizeContract.glyph];
    const unavailable = disabled || (loading && disableWhileLoading);
    return (_jsx(Pressable, { ...props, ref: ref, accessibilityLabel: resolvedLabel, accessibilityRole: "button", accessibilityState: {
            ...accessibilityState,
            ...(selected === undefined ? {} : { selected }),
            disabled: unavailable,
            busy: loading,
        }, disabled: unavailable, hitSlop: hitSlop ?? (sizeContract.hitSlop > 0 ? sizeContract.hitSlop : undefined), onPress: loading ? () => undefined : onPress, onLongPress: loading ? () => undefined : onLongPress, style: ({ pressed }) => [
            {
                alignItems: "center",
                backgroundColor: presentation.background ?? "transparent",
                borderColor: presentation.border ?? "transparent",
                borderRadius: radius[iconButtonRecipe.shapes[shape]],
                borderWidth: 1,
                height: visibleDiameter,
                justifyContent: "center",
                minHeight: visibleDiameter,
                minWidth: visibleDiameter,
                opacity: disabled
                    ? iconButtonRecipe.states.disabledOpacity
                    : loading
                        ? 1
                        : pressed
                            ? iconButtonRecipe.states.pressedOpacity
                            : 1,
                width: visibleDiameter,
            },
            style,
            layoutStyle,
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
                backgroundColor: colors.bg,
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