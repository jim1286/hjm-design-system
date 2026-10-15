"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { consumeAnswerStream } from "@hjmds/design-contracts/streaming-answer";
import { Button } from "./actions.js";
import { Progress } from "./feedback.js";
import { Stack, Text } from "./layout.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
export function StreamingAnswer(props) {
    if (!props.answerId.trim())
        throw new TypeError("Streaming answers require a stable id");
    return _jsx(AnswerBody, { ...props }, props.answerId);
}
function AnswerBody(props) {
    const [text, setText] = useState(props.initialText ?? ""), [phase, setPhase] = useState(props.initialText ? "complete" : "idle");
    const action = useCompositionAction(props.disabled), request = useRef(null), mounted = useRef(true), disabled = useRef(props.disabled), requestWasRegenerate = useRef(false);
    disabled.current = props.disabled;
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; request.current?.abort(); request.current = null; }; }, []);
    const generate = () => {
        if (!mounted.current || disabled.current || request.current)
            return;
        const controller = new AbortController();
        request.current = controller;
        const previousText = text, regenerate = phase !== "idle";
        requestWasRegenerate.current = regenerate;
        setPhase("thinking");
        const current = () => mounted.current && request.current === controller;
        void action.run("generate", async () => {
            try {
                const source = await props.onGenerate({ signal: controller.signal, previousText, regenerate });
                const result = await consumeAnswerStream(source, controller.signal, previousText, value => { if (current()) {
                    setText(value);
                    setPhase("streaming");
                } });
                if (current()) {
                    setText(result.text);
                    setPhase(result.phase);
                }
            }
            catch (error) {
                const aborted = controller.signal.aborted && error && typeof error === "object" && "name" in error && error.name === "AbortError";
                if (current())
                    setPhase(aborted ? "stopped" : "error");
                throw error;
            }
        }).then(() => { if (request.current === controller)
            request.current = null; });
    };
    const stop = () => { if (mounted.current && !disabled.current && request.current && !request.current.signal.aborted) {
        setPhase("stopping");
        request.current.abort();
    } };
    const pending = action.pending;
    const status = phase === "idle" ? null : props.labels[phase];
    return _jsxs(Stack, { gap: "md", children: [_jsx(Text, { emphasis: "strong", children: props.label }), text ? (props.renderText ? props.renderText(text) : _jsx(Text, { style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere" }, children: text })) : null, phase === "thinking" ? _jsx(Stack, { align: "center", justify: "center", children: props.thinkingIndicator ?? _jsx(Progress, { label: props.labels.thinking }) }) : null, _jsxs(Stack, { axis: "inline", gap: "sm", wrap: true, children: [_jsx(Button, { loading: pending, disabled: props.disabled === true, onClick: generate, children: (pending ? requestWasRegenerate.current : phase !== "idle") ? props.labels.regenerate : props.labels.generate }), pending ? _jsx(Button, { tone: "secondary", disabled: props.disabled === true || phase === "stopping", onClick: stop, children: props.labels.stop }) : null] }), status && phase !== "thinking" ? _jsx(Text, { role: phase === "error" ? "alert" : "status", style: { textAlign: "center" }, tone: phase === "error" ? "danger" : "primary", children: status }) : null] });
}
//# sourceMappingURL=streaming-answer.js.map