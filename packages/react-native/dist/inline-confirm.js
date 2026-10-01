import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AccessibilityInfo, AppState, Platform, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { createAlertDialogSession } from "@hjmds/design-contracts/components/alert-dialog";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
const emptySubscribe = () => () => { };
const emptySnapshot = () => null;
export function InlineConfirm(props) {
    const [session, setSession] = useState(null);
    const [done, setDone] = useState(false);
    const phase = useSyncExternalStore(session?.subscribe ?? emptySubscribe, session?.getSnapshot ?? emptySnapshot, emptySnapshot);
    useEffect(() => {
        if (phase?.status !== "closing")
            return;
        session?.completeExit();
        setDone(phase.result.outcome === "confirmed");
        setSession(null);
    }, [phase, session]);
    const status = done ? props.successLabel : phase?.status === "error" ? phase.message
        : phase?.status === "busy" ? props.pendingLabel : session && phase?.status !== "closing" ? props.prompt : "";
    const previousStatus = useRef("");
    useEffect(() => {
        const changed = previousStatus.current !== status;
        previousStatus.current = status;
        // Android live regions do not speak on iOS. Announce each transition once,
        // excluding background work and ordinary rerenders; the button retains focus.
        if (changed && status && Platform.OS === "ios" && AppState.currentState === "active") {
            AccessibilityInfo.announceForAccessibilityWithOptions(status, { queue: phase?.status !== "error" });
        }
    }, [status, phase?.status]);
    if (done)
        return _jsx(Text, { accessibilityLiveRegion: "polite", children: props.successLabel });
    if (!session)
        return _jsx(Button, { tone: "danger", disabled: props.disabled ?? false, onPress: () => setSession(createAlertDialogSession({ mode: "confirm", tone: "danger", title: props.label, description: props.prompt, confirmLabel: props.confirmLabel, cancelLabel: props.cancelLabel, onConfirm: props.onConfirm, fallbackErrorMessage: props.errorLabel })), children: props.label });
    const busy = phase?.status === "busy";
    return _jsxs(View, { style: { gap: spacing.sm }, children: [_jsx(Text, { accessibilityLiveRegion: "polite", children: props.prompt }), phase?.status === "error" && _jsx(Text, { accessibilityRole: "alert", tone: "danger", children: phase.message }), _jsxs(View, { style: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, children: [_jsx(Button, { tone: "ghost", disabled: busy, onPress: () => session.cancel("cancel-action"), children: props.cancelLabel }), _jsx(Button, { tone: "danger", loading: busy, disabled: busy || (props.disabled ?? false), onPress: () => { void session.confirm(); }, children: busy ? props.pendingLabel : props.confirmLabel })] })] });
}
//# sourceMappingURL=inline-confirm.js.map