export type NativeModalTeardownTask = Readonly<{
    cancel(): void;
}>;
/**
 * iOS reports removal of a Modal that reached `onShow`; Android does not.
 * A same-commit open/close never reached a native presentation on either OS.
 */
export declare function shouldAwaitNativeModalDismiss(wasShown: boolean): boolean;
/**
 * Completes teardown after React removed an `animationType="none"` Modal host.
 * Callers must own visual exit before hiding the host; this is deliberately not
 * an estimator for React Native's built-in fade/slide animation.
 */
export declare function scheduleAfterNativeModalTeardown(complete: () => void): NativeModalTeardownTask;
//# sourceMappingURL=modal-lifecycle.d.ts.map