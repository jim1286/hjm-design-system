import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { IconButton } from "./actions.js";
import { CounterBadge } from "./supplemental-display.js";
import { useHjmTheme } from "./provider.js";
export function NotificationBell({ label, count, icon, onPress, disabled = false, active = true, layoutStyle }) {
    if (!Number.isSafeInteger(count) || count < 0)
        throw new RangeError("Unread count must be a nonnegative integer");
    const { environment } = useHjmTheme();
    const art = useRef(null);
    const previous = useRef(count);
    useEffect(() => {
        const increased = count > previous.current;
        previous.current = count;
        if (!increased || !active || environment.reducedMotion || document.hidden || !art.current?.animate)
            return;
        // One bounded pulse for new unread items; never ring continuously or on mount.
        const animation = art.current.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0deg)' }], { duration: 400, easing: 'ease-out' });
        const stop = () => { if (document.hidden)
            animation.cancel(); };
        document.addEventListener('visibilitychange', stop);
        return () => { animation.cancel(); document.removeEventListener('visibilitychange', stop); };
    }, [count, active, environment.reducedMotion]);
    // Keep the badge anchored to the icon even in a stretching Stack or grid. layoutStyle comes
    // after the defaults (alignSelf included) except `width`: the floating badge sits on the root's
    // inline-end edge, so a wider root would detach it from the icon. Use margins or alignSelf to place.
    return _jsxs("span", { style: { alignSelf: 'flex-start', position: 'relative', display: 'inline-flex', ...layoutStyle, width: 'max-content' }, children: [_jsx(IconButton, { label: label, disabled: disabled, onClick: onPress, children: _jsx("span", { ref: art, "aria-hidden": "true", style: { display: 'inline-flex', transformOrigin: 'top center' }, children: icon }) }), _jsx("span", { "aria-hidden": "true", style: { position: 'absolute', insetInlineEnd: 0, top: 0, pointerEvents: 'none' }, children: _jsx(CounterBadge, { count: count, variant: "floating" }) })] });
}
//# sourceMappingURL=notification-bell.js.map