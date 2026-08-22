import { InteractionManager, Platform } from "react-native";
/**
 * iOS reports removal of a Modal that reached `onShow`; Android does not.
 * A same-commit open/close never reached a native presentation on either OS.
 */
export function shouldAwaitNativeModalDismiss(wasShown) {
    return Platform.OS === "ios" && wasShown;
}
/**
 * Completes teardown after React removed an `animationType="none"` Modal host.
 * Callers must own visual exit before hiding the host; this is deliberately not
 * an estimator for React Native's built-in fade/slide animation.
 */
export function scheduleAfterNativeModalTeardown(complete) {
    return InteractionManager.runAfterInteractions(complete);
}
//# sourceMappingURL=modal-lifecycle.js.map