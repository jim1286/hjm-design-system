"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { isConfirmedTransferAbort, resolveTransferObservation } from "@hjmds/design-contracts/transfer-task";
import { Button } from "./actions.js";
import { Progress } from "./feedback.js";
import { Stack, Text } from "./layout.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
export function TransferTask(props) {
    const action = useCompositionAction(props.disabled), mounted = useRef(true), disabled = useRef(props.disabled);
    disabled.current = props.disabled;
    const request = useRef(null), latest = useRef(null);
    const [observation, setObservation] = useState(null), [cancelRequested, setCancelRequested] = useState(false), [cancelled, setCancelled] = useState(false);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; request.current?.abort(); request.current = null; }; }, []);
    const start = () => {
        if (!mounted.current || disabled.current || request.current)
            return;
        const controller = new AbortController();
        let accepting = true;
        request.current = controller;
        latest.current = null;
        setObservation(null);
        setCancelled(false);
        setCancelRequested(false);
        void action.run("transfer", async () => {
            try {
                await props.onTransfer({ signal: controller.signal, report: next => {
                        if (!accepting || !mounted.current || request.current !== controller || controller.signal.aborted)
                            return;
                        const value = resolveTransferObservation(next, latest.current);
                        latest.current = value;
                        setObservation(value);
                    } });
            }
            catch (error) {
                if (mounted.current && request.current === controller && isConfirmedTransferAbort(error, controller.signal))
                    setCancelled(true);
                throw error;
            }
            finally {
                accepting = false;
            }
        }).then(() => { if (request.current === controller)
            request.current = null; });
    };
    const cancel = () => { if (mounted.current && !disabled.current && request.current && !request.current.signal.aborted) {
        setCancelRequested(true);
        request.current.abort();
    } };
    const phase = action.session.getSnapshot().status;
    const status = action.pending ? cancelRequested ? props.labels.cancelling : observation ? props.labels.transferring : props.labels.queued
        : cancelled ? props.labels.cancelled : phase === "success" ? props.labels.success : action.failed ? props.labels.error : null;
    const known = observation !== null && observation.total !== null;
    return _jsxs(Stack, { gap: "md", children: [_jsxs(Stack, { axis: "inline", gap: "xs", wrap: true, children: [_jsx(Button, { loading: action.pending, disabled: props.disabled === true, onClick: start, children: props.labels.start }), action.pending ? _jsx(Button, { tone: "secondary", disabled: props.disabled === true || cancelRequested, onClick: cancel, children: props.labels.cancel }) : null] }), action.pending || known ? _jsx(Progress, { label: status ?? props.labels.transferring, ...(known ? { value: observation.completed, max: observation.total } : {}), ...(observation ? { valueText: props.formatProgress(observation) } : {}) }) : null, observation && !action.pending && !known ? _jsx(Text, { variant: "caption", children: props.formatProgress(observation) }) : null, status && !action.pending ? _jsx(Text, { role: action.failed && !cancelled ? "alert" : "status", style: { textAlign: "center" }, tone: action.failed && !cancelled ? "danger" : "primary", children: status }) : null] });
}
//# sourceMappingURL=transfer-task.js.map