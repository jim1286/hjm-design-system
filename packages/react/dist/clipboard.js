import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./actions.js";
const defaultFeedbackDuration = 2000;
/**
 * Copying is three things products kept re-deriving: the async clipboard call,
 * the temporary "copied" state, and announcing that state to a screen reader.
 * The last one is the part that was always missing — a label that only changes
 * visually tells a non-sighted user nothing happened.
 */
export const ClipboardButton = forwardRef(function ClipboardButton({ value, labels, feedbackDuration = defaultFeedbackDuration, onCopy, onCopyError, ...props }, forwardedRef) {
    const [copied, setCopied] = useState(false);
    const timer = useRef(undefined);
    useEffect(() => () => { if (timer.current !== undefined)
        clearTimeout(timer.current); }, []);
    useEffect(() => {
        // A new value makes the previous "copied" claim false: it referred to the
        // old string, and leaving it up tells the user something untrue.
        setCopied(false);
        if (timer.current !== undefined)
            clearTimeout(timer.current);
    }, [value]);
    const copy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            onCopy?.(value);
            if (timer.current !== undefined)
                clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), feedbackDuration);
        }
        catch (error) {
            // Clipboard access can be denied; swallowing that would leave the user
            // believing the value was copied.
            onCopyError?.(error);
        }
    }, [value, feedbackDuration, onCopy, onCopyError]);
    return (_jsxs(_Fragment, { children: [_jsx(Button, { ...props, ref: forwardedRef, onClick: () => { void copy(); }, children: copied ? labels.copied : labels.idle }), _jsx("span", { role: "status", className: "hjm-visually-hidden", children: copied ? labels.copied : "" })] }));
});
//# sourceMappingURL=clipboard.js.map