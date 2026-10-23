import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { Animated, AppState, View } from "react-native";
import { IconButton } from "./actions.js";
import { CounterBadge } from "./data-display.js";
import { iconButtonRecipe, resolveIconButtonBadgeOffset } from "@hjmds/design-contracts/recipes";
import { visibleControlHeight } from "@hjmds/design-contracts/components/design-system-provider";
import { useHjmNativeTheme } from "./provider.js";
import { iconButtonEdgeMargins } from "./internal/icon-button-edge.js";
export function NotificationBell({ label, count, icon, onPress, disabled = false, active = true, edge }) {
    if (!Number.isSafeInteger(count) || count < 0)
        throw new RangeError("Unread count must be a nonnegative integer");
    const { environment } = useHjmNativeTheme();
    const previous = useRef(count);
    const angle = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const increased = count > previous.current;
        previous.current = count;
        angle.setValue(0);
        if (!increased || !active || environment.reducedMotion || AppState.currentState !== 'active')
            return;
        // Match the Web's one-shot notification, without adding a motion engine.
        const animation = Animated.sequence([1, -1, 0.5, 0].map(toValue => Animated.timing(angle, { toValue, duration: 100, useNativeDriver: true })));
        animation.start();
        const sub = AppState.addEventListener('change', state => { if (state !== 'active') {
            animation.stop();
            angle.setValue(0);
        } });
        return () => { animation.stop(); angle.setValue(0); sub.remove(); };
    }, [count, active, environment.reducedMotion, angle]);
    // The IconButton edge overhang goes on the root, not the button: the badge is anchored to the root's end, and a
    // margin on the inner button would shrink the root and pull the badge in by the overhang (2026-10-17 1.27.2 adoption).
    const edgeMargins = iconButtonEdgeMargins(edge, iconButtonRecipe.defaults.tone, "small", environment.minimumVisualTarget);
    // Badge size and offset come from iconButtonRecipe.badge, as on Web: it rides above the glyph so only its floating
    // ring touches it (2026-10-23 web check: the medium badge at top 0 hid 82% of an 18px glyph).
    const badgeOffset = resolveIconButtonBadgeOffset("small", visibleControlHeight(iconButtonRecipe.sizes.small.diameter, environment.minimumVisualTarget));
    return _jsxs(View, { style: { position: 'relative', alignSelf: 'flex-start', ...edgeMargins }, children: [_jsx(IconButton, { size: "small", hitSlop: 0, label: label, disabled: disabled, onPress: onPress, children: _jsx(Animated.View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { transform: [{ rotate: angle.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] }) }] }, children: icon }) }), _jsx(View, { pointerEvents: "none", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { position: 'absolute', end: badgeOffset.inlineEnd, top: badgeOffset.blockStart }, children: _jsx(CounterBadge, { count: count, size: iconButtonRecipe.badge.size, variant: iconButtonRecipe.badge.variant }) })] });
}
//# sourceMappingURL=notification-bell.js.map