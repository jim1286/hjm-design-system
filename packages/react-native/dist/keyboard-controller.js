import { jsx as _jsx } from "react/jsx-runtime";
import { KeyboardProvider, KeyboardStickyView, KeyboardAwareScrollView } from "react-native-keyboard-controller";
/** Install once at the app root; never nest providers per input or CTA. */
export function KeyboardMotionProvider({ children }) {
    // Do not eagerly summon the OS keyboard merely to warm up an optional adapter.
    return _jsx(KeyboardProvider, { preload: false, children: children });
}
/** Wrap BottomCTA or a chat composer. The host owns bottom safe-area padding. */
export function KeyboardDock({ children, enabled = true, clearance = 0, style }) {
    if (!Number.isFinite(clearance) || clearance < 0)
        throw new TypeError("KeyboardDock clearance must be nonnegative");
    // StickyView's offset is a translation: clearance above the keyboard is negative.
    return _jsx(KeyboardStickyView, { enabled: enabled, offset: { closed: 0, opened: -clearance }, style: style, children: children });
}
export function KeyboardFormScrollView(props) {
    return _jsx(KeyboardAwareScrollView, { ...props, keyboardShouldPersistTaps: "handled" });
}
//# sourceMappingURL=keyboard-controller.js.map