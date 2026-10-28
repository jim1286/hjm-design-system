import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { visibleControlHeight } from "@hjmds/design-contracts/components/design-system-provider";
import { resolveLinkDescriptor, } from "@hjmds/design-contracts/components/link";
import { glyph, spacing } from "@hjmds/design-contracts/foundations";
import { bottomCtaRecipe, actionGroupRecipe, linkRecipe, iconButtonRecipe, resolveIconButtonPresentation, validateIconButtonElevation, } from "@hjmds/design-contracts/recipes";
import {} from "@hjmds/design-contracts/recipes/base";
import { forwardRef, useContext } from "react";
import { ActivityIndicator, Pressable, View, } from "react-native";
import { RecipeButton } from "./internal/recipe-button.js";
import { iconButtonEdgeMargins } from "./internal/icon-button-edge.js";
import { ScreenFooterContext } from "./internal/screen-footer.js";
import { assertNoRemovedStyleProps, warnOnce } from "./internal/diagnostics.js";
import { minimumTargetStyle, resolveNativeElevationStyle, resolveNativeShadowElevation } from "./internal/styles.js";
import { Icon, Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
// Public callers compose placement through layoutStyle; visual overrides stay inside HJM recipes.
export const Button = forwardRef(function Button(props, ref) {
    // Untyped JS callers must not reach the private recipe override through a spread.
    if ("style" in props || "labelStyle" in props) {
        throw new TypeError("Button style/labelStyle were removed; use layoutStyle and semantic props");
    }
    return _jsx(RecipeButton, { ...props, ref: ref });
});
export const IconButton = forwardRef(function IconButton({ label, children, tone = iconButtonRecipe.defaults.tone, size = iconButtonRecipe.defaults.size, shape = iconButtonRecipe.defaults.shape, selected, disabled = false, loading = false, edge, elevation = iconButtonRecipe.elevation.default, disableWhileLoading = false, hitSlop, layoutStyle, renderLoadingIndicator, onPress, onLongPress, accessibilityState, ...props }, ref) {
    const theme = useHjmNativeTheme();
    assertNoRemovedStyleProps("IconButton", props, ["style"]);
    const resolvedLabel = label;
    const resolvedIcon = children;
    if (resolvedLabel === undefined || resolvedLabel.trim().length === 0) {
        throw new TypeError("IconButton label must not be empty");
    }
    if (resolvedIcon === undefined || resolvedIcon === null || resolvedIcon === false) {
        throw new TypeError("IconButton requires children");
    }
    validateIconButtonElevation(elevation, tone);
    const frame = iconButtonFrame(theme, { tone, size, shape, edge, selected: selected === true });
    const lift = resolveNativeElevationStyle(elevation, theme.tokens.shadow, theme.designProfile !== undefined);
    const unavailable = disabled || (loading && disableWhileLoading);
    return (_jsx(Pressable, { ...props, ref: ref, accessibilityLabel: resolvedLabel, accessibilityRole: "button", accessibilityState: {
            ...accessibilityState,
            ...(selected === undefined ? {} : { selected }),
            disabled: unavailable,
            busy: loading,
        }, disabled: unavailable, hitSlop: hitSlop ?? frame.hitSlop, onPress: loading ? () => undefined : onPress, onLongPress: loading ? () => undefined : onLongPress, style: ({ pressed }) => [frame.style(disabled ? "disabled" : loading ? "idle" : pressed ? "pressed" : "idle"), lift, layoutStyle], children: loading ? (renderLoadingIndicator?.({ color: frame.content, size: "small" }) ?? (_jsx(ActivityIndicator, { color: frame.content, size: "small" }))) : (_jsx(IconButtonGlyph, { size: frame.glyphSize, children: resolvedIcon })) }));
});
/** One frame for IconButton and IconButtonLink: size, tone/selected paint, radius, edge overhang and press opacity. */
function iconButtonFrame(theme, { tone, size, shape, edge, selected }) {
    const presentation = resolveIconButtonPresentation(tone, theme.palette, selected);
    const sizeContract = iconButtonRecipe.sizes[size];
    // Web reads the same size through `--hjm-control-button-*`, which the axis
    // already raises. Native read `diameter` straight from the recipe, so a
    // product that turned `minimumVisualTarget` on got 44pt buttons but 36pt
    // icon buttons — the two renderers disagreed.
    const visibleDiameter = visibleControlHeight(sizeContract.diameter, theme.environment.minimumVisualTarget);
    // Edge alignment from the same contract helper Web reads, on the visible diameter actually drawn.
    const edgeMargins = iconButtonEdgeMargins(edge, tone, size, theme.environment.minimumVisualTarget);
    return {
        content: presentation.content,
        glyphSize: glyph[sizeContract.glyph],
        hitSlop: sizeContract.hitSlop > 0 ? sizeContract.hitSlop : undefined,
        style: (state) => ({
            alignItems: "center",
            backgroundColor: presentation.background ?? "transparent",
            borderColor: presentation.border ?? "transparent",
            borderRadius: theme.tokens.radius[iconButtonRecipe.shapes[shape]],
            borderWidth: 1,
            height: visibleDiameter,
            justifyContent: "center",
            minHeight: visibleDiameter,
            minWidth: visibleDiameter,
            opacity: state === "disabled"
                ? iconButtonRecipe.states.disabledOpacity
                : state === "pressed"
                    ? iconButtonRecipe.states.pressedOpacity
                    : 1,
            width: visibleDiameter,
            ...edgeMargins,
        }),
    };
}
function IconButtonGlyph({ size, children }) {
    return (_jsx(View, { accessible: false, style: {
            alignItems: "center",
            height: size,
            justifyContent: "center",
            width: size,
        }, children: children }));
}
export function IconButtonLink({ label, children, destination, onNavigate, renderLink, current = false, disabled = false, tone = iconButtonRecipe.defaults.tone, size = iconButtonRecipe.defaults.size, shape = iconButtonRecipe.defaults.shape, edge, hitSlop, layoutStyle, ...props }) {
    const theme = useHjmNativeTheme();
    assertNoRemovedStyleProps("IconButtonLink", props, ["style"]);
    if (!label.trim())
        throw new TypeError("IconButtonLink label must not be empty");
    if (children === undefined || children === null || children === false) {
        throw new TypeError("IconButtonLink requires children");
    }
    if (!renderLink && !onNavigate)
        throw new TypeError("IconButtonLink requires renderLink or onNavigate");
    const frame = iconButtonFrame(theme, { tone, size, shape, edge, selected: current });
    const controlProps = {
        ...props,
        accessible: true,
        accessibilityLabel: label,
        accessibilityRole: "link",
        accessibilityState: { selected: current, disabled },
        children: _jsx(IconButtonGlyph, { size: frame.glyphSize, children: children }),
        destination,
        disabled,
        hitSlop: hitSlop ?? frame.hitSlop,
        onPress: () => {
            if (!disabled)
                void onNavigate?.(destination);
        },
        role: "link",
        style: ({ pressed }) => [frame.style(disabled ? "disabled" : pressed ? "pressed" : "idle"), layoutStyle],
    };
    if (renderLink)
        return renderLink(controlProps);
    const { destination: _destination, ...pressableProps } = controlProps;
    return _jsx(Pressable, { ...pressableProps });
}
// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function Link({ descriptor, onNavigate, leading, trailing, renderIcon, accessibilityHint, layoutStyle, ...props }) {
    const { colors, environment } = useHjmNativeTheme();
    const resolved = resolveLinkDescriptor(descriptor);
    assertNoRemovedStyleProps("Link", props, ["style"]);
    // Until 1.12 the resolver validated leadingIcon/trailingIcon but Native never drew them, so a
    // descriptor shared with Web silently lost its chevron. A missing renderIcon now warns instead of
    // throwing: throwing would crash apps that already passed icons which were simply invisible.
    const renderDescriptorIcon = (icon, slot, fallback) => {
        if (icon === null)
            return fallback;
        if (fallback !== undefined && fallback !== null && fallback !== false) {
            warnOnce(`Link.${slot}.conflict`, `Link received both descriptor.${slot} and a ${slot === "leadingIcon" ? "leading" : "trailing"} node; the descriptor icon wins.`);
        }
        if (renderIcon === undefined) {
            warnOnce(`Link.${slot}.renderIcon`, `Link descriptor.${slot} needs renderIcon to draw a glyph; the icon is not rendered.`);
            return null;
        }
        return (_jsx(Icon, { descriptor: { name: icon.name, size: linkRecipe.icon.glyph, tone: "brand", decorative: true }, renderGlyph: renderIcon }));
    };
    const leadingNode = renderDescriptorIcon(resolved.leadingIcon, "leadingIcon", leading);
    const trailingNode = renderDescriptorIcon(resolved.trailingIcon, "trailingIcon", trailing);
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
            layoutStyle,
        ], children: [leadingNode ? _jsx(View, { accessible: false, children: leadingNode }) : null, _jsx(Text, { fontRole: "ui", 
                // Shrink beside a leading/trailing glyph so a long label wraps inside the parent (link.md: long labels wrap);
                // at its natural width the label plus the glyph overran it (2026-10-23 flex audit).
                style: { color: colors.contentBrand, flexShrink: 1, textDecorationLine: "underline" }, variant: "bodyLarge", children: resolved.label }), trailingNode ? _jsx(View, { accessible: false, children: trailingNode }) : null] }));
}
function BottomCTAButton({ action, fallbackTone, }) {
    return (_jsx(Button, { ref: action.buttonRef, ...(action.accessibilityLabel === undefined ? {} : { accessibilityLabel: action.accessibilityLabel }), ...(action.accessibilityHint === undefined ? {} : { accessibilityHint: action.accessibilityHint }), ...(action.disabled === undefined ? {} : { disabled: action.disabled }), ...(action.loading === undefined ? {} : { loading: action.loading }), ...(action.loadingLabel === undefined ? {} : { loadingLabel: action.loadingLabel }), leading: action.leading, trailing: action.trailing, fullWidth: true, onPress: action.onPress, ...(action.size === undefined ? {} : { size: action.size }), tone: action.tone ?? fallbackTone, children: action.label }));
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
export function BottomCTA({ primaryAction, secondaryAction, description, accessibilityLabel, safeAreaBottom = 0, layoutStyle, testID, ...removedProps }) {
    assertNoRemovedStyleProps("BottomCTA", removedProps, ["style"]);
    if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0) {
        throw new RangeError("BottomCTA safeAreaBottom must be non-negative");
    }
    const { colors, environment, designProfile } = useHjmNativeTheme();
    const screenFooter = useContext(ScreenFooterContext);
    // Footer elevation separates the content above it (bottomCtaRecipe rationale).
    // Reuse profile strength but retain the upward direction; a flat profile must
    // also disable Android elevation rather than only its iOS shadow properties.
    const surfaceShadow = designProfile
        ? { ...designProfile.tokens.shadow.floating, offsetY: -Math.abs(designProfile.tokens.shadow.floating.offsetY) }
        : bottomCtaRecipe.shadow;
    const stackActions = environment.textScale >= 1.6;
    const renderedSecondary = secondaryAction === undefined || secondaryAction === null
        ? null
        : isBottomCTAAction(secondaryAction)
            ? _jsx(BottomCTAButton, { action: secondaryAction, fallbackTone: "secondary" })
            : secondaryAction;
    return (_jsxs(View, { accessibilityLabel: accessibilityLabel, accessibilityRole: "toolbar", testID: testID, style: [
            // Inside ScreenLayout's footer the footer owns border, padding, surface and the bottom inset; an explicit
            // safeAreaBottom adds only what the footer padding does not already cover, so the gap is max(footer, inset)
            // rather than their sum (2026-10-17 user report: too much space below buttons; Web data-placement="screen-footer").
            screenFooter ? { gap: bottomCtaRecipe.gap, paddingBottom: Math.max(0, safeAreaBottom - screenFooter.bottomPadding) } : {
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderTopWidth: bottomCtaRecipe.borderWidth,
                ...resolveNativeShadowElevation(surfaceShadow, designProfile !== undefined, bottomCtaRecipe.shadow.elevation),
                gap: bottomCtaRecipe.gap,
                minHeight: bottomCtaRecipe.minHeight + safeAreaBottom,
                paddingBottom: Math.max(safeAreaBottom, bottomCtaRecipe.paddingBottom),
                paddingHorizontal: bottomCtaRecipe.paddingHorizontal,
                paddingTop: bottomCtaRecipe.paddingTop,
                shadowColor: surfaceShadow.color,
                shadowOffset: { width: 0, height: surfaceShadow.offsetY },
                shadowOpacity: surfaceShadow.opacity,
                shadowRadius: surfaceShadow.radius,
            },
            layoutStyle,
        ], children: [description ? _jsx(View, { style: { alignSelf: "center", maxWidth: bottomCtaRecipe.contentMaxWidth, width: "100%" }, children: _jsx(Text, { tone: "muted", variant: "caption", children: description }) }) : null, _jsxs(View, { style: {
                    alignSelf: "center",
                    direction: environment.direction,
                    flexDirection: stackActions ? "column-reverse" : "row",
                    gap: actionGroupRecipe.inlineGap,
                    maxWidth: bottomCtaRecipe.contentMaxWidth,
                    width: "100%",
                }, children: [renderedSecondary !== null ? (_jsx(View, { style: { flex: stackActions ? undefined : 1 }, children: renderedSecondary })) : null, _jsx(View, { style: { flex: stackActions ? undefined : 1 }, children: _jsx(BottomCTAButton, { action: primaryAction, fallbackTone: "primary" }) })] })] }));
}
//# sourceMappingURL=actions.js.map