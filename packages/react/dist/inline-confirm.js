import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createAlertDialogSession } from "@hjmds/design-contracts/components/alert-dialog";
import { Button } from "./actions.js";
const emptySubscribe = () => () => { };
const emptySnapshot = () => null;
/** Low-complexity confirmation using the existing async dialog session semantics. */
export function InlineConfirm(props) {
    const [session, setSession] = useState(null);
    const [done, setDone] = useState(false);
    const phase = useSyncExternalStore(session?.subscribe ?? emptySubscribe, session?.getSnapshot ?? emptySnapshot, emptySnapshot);
    const trigger = useRef(null);
    const cancel = useRef(null);
    useEffect(() => { if (session)
        cancel.current?.focus(); }, [session]);
    useEffect(() => {
        if (phase?.status !== "closing")
            return;
        const confirmed = phase.result.outcome === "confirmed";
        session?.completeExit();
        setDone(confirmed);
        setSession(null);
        // Cancel returns focus to the original action; success leaves a live result.
        if (!confirmed)
            queueMicrotask(() => trigger.current?.focus());
    }, [phase, session]);
    if (done)
        return _jsx("span", { role: "status", children: props.successLabel });
    if (!session)
        return _jsx(Button, { ref: trigger, tone: "danger", disabled: props.disabled ?? false, onClick: () => setSession(createAlertDialogSession({ mode: "confirm", tone: "danger", title: props.label, description: props.prompt, confirmLabel: props.confirmLabel, cancelLabel: props.cancelLabel, onConfirm: props.onConfirm, fallbackErrorMessage: props.errorLabel })), children: props.label });
    const busy = phase?.status === "busy";
    return _jsxs("div", { role: "group", "aria-label": props.prompt, onKeyDown: event => { if (event.key === "Escape" && !busy) {
            event.stopPropagation();
            session.cancel("escape");
        } }, style: { display: "grid", gap: "var(--hjm-space-sm)" }, children: [_jsx("span", { children: props.prompt }), phase?.status === "error" && _jsx("span", { role: "alert", children: phase.message }), _jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: "var(--hjm-space-sm)" }, children: [_jsx(Button, { ref: cancel, tone: "ghost", disabled: busy, onClick: () => session.cancel("cancel-action"), children: props.cancelLabel }), _jsx(Button, { tone: "danger", loading: busy, disabled: busy || (props.disabled ?? false), onClick: () => { void session.confirm(); }, children: busy ? props.pendingLabel : props.confirmLabel })] })] });
}
//# sourceMappingURL=inline-confirm.js.map