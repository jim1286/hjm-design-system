import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createAlertDialogSession } from "@hjmds/design-contracts/components/alert-dialog";
import { Button } from "./actions.js";
const emptySubscribe = () => () => { };
const emptySnapshot = () => null;
/** Low-complexity confirmation using the existing async dialog session semantics. */
export function InlineConfirm(props) {
    // The displayed prompt can change while confirmation is open. Execute the
    // current action rather than the callback captured when the prompt opened.
    const confirmRef = useRef(props.onConfirm);
    confirmRef.current = props.onConfirm;
    const [session, setSession] = useState(null);
    const [done, setDone] = useState(false);
    const phase = useSyncExternalStore(session?.subscribe ?? emptySubscribe, session?.getSnapshot ?? emptySnapshot, emptySnapshot);
    const trigger = useRef(null);
    const cancel = useRef(null);
    const confirm = useRef(null);
    const group = useRef(null);
    const result = useRef(null);
    const focusResult = useRef(false);
    useEffect(() => { if (session)
        cancel.current?.focus(); }, [session]);
    useEffect(() => {
        if (phase?.status !== "closing")
            return;
        const confirmed = phase.result.outcome === "confirmed";
        // Completion removes both actions. Move only this group's current focus;
        // an async response must not steal focus from another part of the page.
        focusResult.current = confirmed && (group.current?.contains(document.activeElement) ?? false);
        session?.completeExit();
        setDone(confirmed);
        setSession(null);
        // Cancel returns focus to the original action; success leaves a live result.
        if (!confirmed)
            queueMicrotask(() => trigger.current?.focus());
    }, [phase, session]);
    useEffect(() => { if (done && focusResult.current) {
        focusResult.current = false;
        result.current?.focus();
    } }, [done]);
    if (done)
        return _jsx("span", { ref: result, tabIndex: -1, role: "status", style: props.layoutStyle, children: props.successLabel });
    if (!session)
        return _jsx(Button, { ref: trigger, tone: "danger", disabled: props.disabled ?? false, ...(props.layoutStyle === undefined ? {} : { layoutStyle: props.layoutStyle }), onClick: () => setSession(createAlertDialogSession({ mode: "confirm", tone: "danger", title: props.label, description: props.prompt, confirmLabel: props.confirmLabel, cancelLabel: props.cancelLabel, onConfirm: () => confirmRef.current(), fallbackErrorMessage: props.errorLabel })), children: props.label });
    const busy = phase?.status === "busy";
    return _jsxs("div", { ref: group, role: "group", "aria-label": props.prompt, onKeyDown: event => { if (event.key === "Escape" && !busy) {
            event.stopPropagation();
            session.cancel("escape");
        } }, style: { ...props.layoutStyle, display: "grid", gap: "var(--hjm-space-sm)" }, children: [_jsx("span", { children: props.prompt }), phase?.status === "error" && _jsx("span", { role: "alert", children: phase.message }), _jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: "var(--hjm-space-sm)" }, children: [_jsx(Button, { ref: cancel, tone: "ghost", disabled: busy, onClick: () => session.cancel("cancel-action"), children: props.cancelLabel }), _jsx(Button, { ref: confirm, tone: "danger", loading: busy, disabled: props.disabled ?? false, onClick: event => {
                            // WebKit pointer activation can leave focus on the now-disabled cancel
                            // button. Transfer it before submitting; loading already blocks repeats.
                            if (event.detail > 0 || group.current?.contains(document.activeElement))
                                confirm.current?.focus();
                            void session.confirm();
                        }, children: busy ? props.pendingLabel : props.confirmLabel })] })] });
}
//# sourceMappingURL=inline-confirm.js.map