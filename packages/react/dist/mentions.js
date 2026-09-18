import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { findActiveMentionTrigger, resolveMentionInsertion, } from "@hjmds/design-contracts/components/mentions";
import { forwardRef, useEffect, useId, useRef, useState, } from "react";
import { TextArea } from "./forms.js";
import { classNames, composeRefs } from "./internal.js";
import { AnchoredPortal, useAnchoredPopup } from "./portal.js";
export const Mentions = forwardRef(function Mentions({ value, onValueChange, triggers, candidates, onMentionQueryChange, emptyMessage, listLabel, renderCandidate, className, ...textAreaProps }, forwardedRef) {
    const inputRef = useRef(null);
    const [match, setMatch] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [list, setList] = useState(null);
    const id = `${useId().replaceAll(":", "")}-mentions`;
    const open = match !== null;
    const activeCandidate = candidates[Math.min(activeIndex, Math.max(candidates.length - 1, 0))];
    const notifyRef = useRef(onMentionQueryChange);
    notifyRef.current = onMentionQueryChange;
    useEffect(() => { notifyRef.current?.(match); }, [match]);
    const syncMatch = (text, cursor) => {
        // The contract owns trigger detection, including "a space closes it" and
        // "the nearer trigger wins"; this component only reports the cursor.
        const next = findActiveMentionTrigger(text, cursor, triggers);
        setMatch((previous) => (previous?.triggerStart === next?.triggerStart && previous?.query === next?.query ? previous : next));
        if (next === null || next.query !== match?.query)
            setActiveIndex(0);
    };
    const commit = (candidate) => {
        const input = inputRef.current;
        if (!match || !input)
            return;
        const result = resolveMentionInsertion(value, match, input.selectionStart ?? value.length, candidate.insertText ?? candidate.label);
        onValueChange(result.text);
        setMatch(null);
        queueMicrotask(() => {
            input.focus();
            input.setSelectionRange(result.cursorPosition, result.cursorPosition);
        });
    };
    const onKeyDown = (event) => {
        if (!open)
            return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            if (candidates.length === 0)
                return;
            event.preventDefault();
            setActiveIndex((previous) => {
                const next = event.key === "ArrowDown" ? previous + 1 : previous - 1;
                return (next + candidates.length) % candidates.length;
            });
            return;
        }
        if (event.key === "Escape") {
            // Dismissing the popup must not touch the text the user already typed.
            event.preventDefault();
            event.stopPropagation();
            setMatch(null);
            return;
        }
        if (event.key === "Enter" && activeCandidate && candidates.length > 0) {
            event.preventDefault();
            commit(activeCandidate);
        }
    };
    const position = useAnchoredPopup(inputRef, open ? list : null, {
        placement: "bottom", align: "start", matchAnchorWidth: true, zIndex: 900,
    });
    return (_jsxs("div", { className: classNames("hjm-mentions", className), children: [_jsx(TextArea, { ...textAreaProps, ref: composeRefs(inputRef, forwardedRef), value: value, role: "combobox", "aria-expanded": open, "aria-controls": open ? id : undefined, "aria-autocomplete": "list", "aria-activedescendant": open && activeCandidate ? `${id}-${activeCandidate.id}` : undefined, onChange: (event) => {
                    onValueChange(event.target.value);
                    syncMatch(event.target.value, event.target.selectionStart ?? event.target.value.length);
                }, onKeyUp: (event) => {
                    // Caret moves without an edit (arrows, clicks) change which trigger is
                    // active, so the match is re-read from the caret, not only from input.
                    if (open && (event.key === "ArrowDown" || event.key === "ArrowUp"))
                        return;
                    const input = event.currentTarget;
                    syncMatch(input.value, input.selectionStart ?? input.value.length);
                }, onClick: (event) => {
                    const input = event.currentTarget;
                    syncMatch(input.value, input.selectionStart ?? input.value.length);
                }, onBlur: (event) => { textAreaProps.onBlur?.(event); setMatch(null); }, onKeyDown: (event) => { textAreaProps.onKeyDown?.(event); onKeyDown(event); } }), open ? (_jsx(AnchoredPortal, { anchorRef: inputRef, children: _jsx("div", { ref: setList, id: id, role: "listbox", "aria-label": listLabel, className: "hjm-mentions__list", style: position.style, children: candidates.length === 0 ? (_jsx("p", { className: "hjm-mentions__empty", role: "status", children: emptyMessage })) : candidates.map((candidate, index) => (_jsx("div", { id: `${id}-${candidate.id}`, role: "option", "aria-selected": candidate.id === activeCandidate?.id, className: "hjm-mentions__option", 
                        // Pointer commit must not blur the textarea first, or the caret
                        // position the insertion depends on would already be gone.
                        onMouseDown: (event) => { event.preventDefault(); commit(candidate); }, onMouseEnter: () => setActiveIndex(index), children: renderCandidate?.(candidate) ?? (_jsxs(_Fragment, { children: [_jsx("span", { children: candidate.label }), candidate.description ? _jsx("span", { className: "hjm-mentions__description", children: candidate.description }) : null] })) }, candidate.id))) }) })) : null] }));
});
//# sourceMappingURL=mentions.js.map