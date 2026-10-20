import { jsx as _jsx } from "react/jsx-runtime";
import { keyboardTransitionDuration, resolveKeyboardAvoidanceBehavior, resolveKeyboardInset, } from "@hjmds/design-contracts/components/native-platform";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Keyboard, LayoutAnimation, Platform, TextInput, View, } from "react-native";
import { inputVisibilityFrame } from "./internal/field-visibility.js";
/**
 * Keeps bottom actions above the keyboard. Products were each choosing
 * `KeyboardAvoidingView`'s behavior themselves and re-discovering that a
 * BottomCTA disappears under the keyboard; the platform answer is fixed, so it
 * lives in the contract and this renderer just applies it.
 */
/**
 * True inside a region that already keeps itself above the keyboard (KeyboardAvoiding, a keyboard-aware
 * Sheet or Dialog). Nested layouts skip their own avoidance: both measuring at the same keyboard event
 * would each see the full overlap and pad twice.
 */
export const KeyboardAvoidanceContext = createContext(false);
/**
 * Height of the keyboard overlapping `host`'s bottom edge. Padding only the real overlap keeps hosts above
 * a tab bar or toolbar from showing an empty band (2026-10-16).
 */
export function useKeyboardOverlap(host, enabled = true) {
    const [overlap, setOverlap] = useState(0);
    useEffect(() => {
        if (!enabled) {
            setOverlap(0);
            return;
        }
        // iOS reports the frame before the animation, Android only after it ends;
        // subscribing to both keeps one code path for the measured height.
        const showEvent = Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
        const apply = (next) => {
            LayoutAnimation.configureNext({ duration: keyboardTransitionDuration, update: { type: LayoutAnimation.Types.easeInEaseOut } });
            setOverlap(Math.max(0, next));
        };
        const show = Keyboard.addListener(showEvent, (event) => {
            const keyboardHeight = event.endCoordinates?.height ?? 0;
            const keyboardTop = event.endCoordinates?.screenY;
            if (keyboardTop === undefined || !host.current) {
                apply(keyboardHeight);
                return;
            }
            host.current.measureInWindow((_x, y, _width, viewHeight) => apply(Math.min(keyboardHeight, y + viewHeight - keyboardTop)));
        });
        const hide = Keyboard.addListener(hideEvent, () => apply(0));
        return () => { show.remove(); hide.remove(); };
    }, [enabled, host]);
    return overlap;
}
/**
 * After the keyboard settles, scroll the focused input inside `scroll` into view. A shrunken ScrollView
 * does not do this by itself, so lower fields stayed hidden (2026-10-16 keyboard audit).
 * Returns an onScroll handler that tracks the offset; merge it with any host handler.
 */
export function useScrollFocusedInputIntoView(scroll, enabled = true, margin = 16) {
    const offset = useRef(0);
    useEffect(() => {
        if (!enabled)
            return;
        const shown = Keyboard.addListener("keyboardDidShow", () => {
            const focused = TextInput.State.currentlyFocusedInput?.();
            const input = focused ? inputVisibilityFrame(focused) : null;
            const view = scroll.current;
            if (!input || !view || typeof input.measureInWindow !== "function")
                return;
            view.measureInWindow((_sx, scrollTop, _sw, scrollHeight) => {
                input.measureInWindow((_ix, inputTop, _iw, inputHeight) => {
                    const hiddenBelow = inputTop + inputHeight - (scrollTop + scrollHeight - margin);
                    const hiddenAbove = scrollTop + margin - inputTop;
                    if (hiddenBelow > 0)
                        scroll.current?.scrollTo({ y: offset.current + hiddenBelow, animated: true });
                    else if (hiddenAbove > 0)
                        scroll.current?.scrollTo({ y: Math.max(0, offset.current - hiddenAbove), animated: true });
                });
            });
        });
        return () => shown.remove();
    }, [enabled, margin, scroll]);
    return (event) => { offset.current = event.nativeEvent.contentOffset.y; };
}
export function KeyboardAvoiding({ children, offset, safeAreaBottom, style }) {
    const host = useRef(null);
    const height = useKeyboardOverlap(host);
    const inset = resolveKeyboardInset(height, {
        ...(offset === undefined ? {} : { offset }),
        ...(safeAreaBottom === undefined ? {} : { safeAreaBottom }),
    });
    return _jsx(View, { ref: host, style: [{ paddingBottom: inset }, style], children: _jsx(KeyboardAvoidanceContext.Provider, { value: true, children: children }) });
}
export function useInsideKeyboardAvoidance() { return useContext(KeyboardAvoidanceContext); }
/** Re-exported so a product does not import the contract twice for one value. */
export { resolveKeyboardAvoidanceBehavior };
//# sourceMappingURL=keyboard.js.map