import { jsx as _jsx } from "react/jsx-runtime";
import { keyboardTransitionDuration, resolveKeyboardAvoidanceBehavior, resolveKeyboardInset, } from "@hjmds/design-contracts/components/native-platform";
import { useEffect, useRef, useState } from "react";
import { Keyboard, LayoutAnimation, Platform, View, } from "react-native";
/**
 * Keeps bottom actions above the keyboard. Products were each choosing
 * `KeyboardAvoidingView`'s behavior themselves and re-discovering that a
 * BottomCTA disappears under the keyboard; the platform answer is fixed, so it
 * lives in the contract and this renderer just applies it.
 */
export function KeyboardAvoiding({ children, offset, safeAreaBottom, style }) {
    const [height, setHeight] = useState(0);
    const host = useRef(null);
    useEffect(() => {
        // iOS reports the frame before the animation, Android only after it ends;
        // subscribing to both keeps one code path for the measured height.
        const showEvent = Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
        const show = Keyboard.addListener(showEvent, (event) => {
            const keyboardHeight = event.endCoordinates?.height ?? 0;
            const keyboardTop = event.endCoordinates?.screenY;
            const apply = (overlap) => {
                LayoutAnimation.configureNext({
                    duration: keyboardTransitionDuration,
                    update: { type: LayoutAnimation.Types.easeInEaseOut },
                });
                setHeight(Math.max(0, overlap));
            };
            // Pad only the part the keyboard actually covers. Adding the full height assumed this view
            // ends at the screen bottom; above a tab bar or toolbar it left an empty band (2026-10-16).
            if (keyboardTop === undefined || !host.current) {
                apply(keyboardHeight);
                return;
            }
            host.current.measureInWindow((_x, y, _width, viewHeight) => apply(Math.min(keyboardHeight, y + viewHeight - keyboardTop)));
        });
        const hide = Keyboard.addListener(hideEvent, () => {
            LayoutAnimation.configureNext({
                duration: keyboardTransitionDuration,
                update: { type: LayoutAnimation.Types.easeInEaseOut },
            });
            setHeight(0);
        });
        return () => { show.remove(); hide.remove(); };
    }, []);
    const inset = resolveKeyboardInset(height, {
        ...(offset === undefined ? {} : { offset }),
        ...(safeAreaBottom === undefined ? {} : { safeAreaBottom }),
    });
    return _jsx(View, { ref: host, style: [{ paddingBottom: inset }, style], children: children });
}
/** Re-exported so a product does not import the contract twice for one value. */
export { resolveKeyboardAvoidanceBehavior };
//# sourceMappingURL=keyboard.js.map