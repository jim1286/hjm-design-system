import { Platform } from "react-native";

export type NativeModalTeardownTask = Readonly<{ cancel(): void }>;

/**
 * iOS reports removal of a Modal that reached `onShow`; Android does not.
 * A same-commit open/close never reached a native presentation on either OS.
 */
export function shouldAwaitNativeModalDismiss(wasShown: boolean): boolean {
  return Platform.OS === "ios" && wasShown;
}

/**
 * Completes teardown after React removed an `animationType="none"` Modal host.
 * Callers must own visual exit before hiding the host; this is deliberately not
 * an estimator for React Native's built-in fade/slide animation.
 */
export function scheduleAfterNativeModalTeardown(
  complete: () => void,
): NativeModalTeardownTask {
  // RN 0.88 removed InteractionManager, while Expo browser hosts lack setImmediate.
  // A cancellable zero-delay timer preserves the post-removal turn on both hosts.
  const task = setTimeout(complete, 0);
  return { cancel: () => clearTimeout(task) };
}
