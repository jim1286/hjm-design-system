"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { timePickerDraft, timePickerItems, resolveTimePickerValue, validateTimePicker, timePickerRecipe } from "@hjmds/design-contracts/components/time-picker";
import { Button } from "./actions.js";
import { Icon } from "./supplemental-display.js";
import { Popover } from "./popover.js";
/** One draft and one confirmation for both columns. Inline mode delegates confirmation to its form. */
export function TimePicker(props) {
    validateTimePicker(props);
    const { value, onValueChange, labels, disabled, readOnly, description, error, presentation = "field", layoutStyle, className } = props;
    const [open, setOpen] = useState(false), [draft, setDraft] = useState(() => timePickerDraft(value));
    const locked = !!(disabled || readOnly);
    const panelRef = useRef(null), firstRef = useRef(null);
    const emitted = useRef(null);
    useEffect(() => {
        // Preserve an incomplete inline draft when the parent echoes its null validity value.
        if (presentation === "inline" && emitted.current?.value === value) {
            emitted.current = null;
            return;
        }
        emitted.current = null;
        setDraft(timePickerDraft(value));
    }, [value, open, presentation]);
    useEffect(() => { if (locked)
        setOpen(false); }, [locked]);
    const resolved = resolveTimePickerValue(draft, props);
    useLayoutEffect(() => {
        panelRef.current?.querySelectorAll('[role="listbox"]').forEach(list => {
            const selected = list.querySelector('[aria-selected="true"]');
            if (selected)
                list.scrollTop = Math.max(0, selected.offsetTop - (list.clientHeight - selected.offsetHeight) / 2);
        });
    }, [draft.hour, draft.minute, open]);
    function select(part, next) {
        if (locked)
            return;
        const updated = { ...draft, [part]: next };
        setDraft(updated);
        const result = resolveTimePickerValue(updated, props);
        if (presentation === "inline") {
            emitted.current = { value: result };
            onValueChange(result);
        }
    }
    const panel = _jsxs("div", { style: { "--hjm-time-row": `${timePickerRecipe.rowHeight}px`, "--hjm-time-height": `${timePickerRecipe.rowHeight * timePickerRecipe.visibleRows}px`, "--hjm-time-summary": `${timePickerRecipe.readoutSize}px`, "--hjm-time-summary-line-height": `${timePickerRecipe.readoutLineHeight}px`, maxWidth: timePickerRecipe.panelWidth }, ref: panelRef, className: "hjm-time-picker__panel", role: "group", "aria-label": labels.label, children: [_jsxs("div", { className: "hjm-time-picker__readout", "aria-live": "polite", "aria-atomic": "true", children: [draft.hour ?? "--", _jsx("span", { children: ":" }), draft.minute ?? "--"] }), _jsx("div", { className: "hjm-time-picker__columns", children: ["hour", "minute"].map(part => {
                    const items = timePickerItems(part, draft, props);
                    const active = items.find(item => item.value === draft[part] && !item.disabled)?.value ?? items.find(item => !item.disabled)?.value;
                    return _jsxs("div", { className: "hjm-time-picker__column", children: [_jsx("div", { className: "hjm-time-picker__caption", children: labels[part] }), _jsx("div", { role: "listbox", "aria-label": labels[part], "aria-disabled": locked, className: "hjm-time-picker__list", children: items.map(item => _jsx("button", { ref: part === "hour" && item.value === active ? firstRef : undefined, type: "button", role: "option", "aria-selected": draft[part] === item.value, "aria-label": `${item.value} ${labels[part]}`, disabled: locked || item.disabled, tabIndex: item.value === active ? 0 : -1, onClick: () => select(part, item.value), onFocus: e => {
                                        const list = e.currentTarget.parentElement;
                                        const row = e.currentTarget;
                                        if (row.offsetTop < list.scrollTop)
                                            list.scrollTop = row.offsetTop;
                                        else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight)
                                            list.scrollTop = row.offsetTop + row.offsetHeight - list.clientHeight;
                                    }, onKeyDown: e => {
                                        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key))
                                            return;
                                        e.preventDefault();
                                        const enabled = Array.from(e.currentTarget.parentElement.querySelectorAll('button:not(:disabled)'));
                                        const index = enabled.indexOf(e.currentTarget);
                                        const target = e.key === "Home" ? enabled[0] : e.key === "End" ? enabled.at(-1) : enabled[index + (e.key === "ArrowDown" ? 1 : -1)];
                                        if (target) {
                                            target.focus();
                                            select(part, target.textContent);
                                        }
                                    }, children: item.value }, item.value)) })] }, part);
                }) }), presentation === "field" ? _jsx(Button, { disabled: locked || resolved === null, onClick: () => { const current = resolveTimePickerValue(draft, props); if (!locked && current !== null) {
                    onValueChange(current);
                    setOpen(false);
                } }, children: labels.confirm }) : null] });
    return _jsxs("div", { className: `hjm-time-picker ${className ?? ""}`, style: layoutStyle, "data-disabled": disabled || undefined, children: [presentation === "inline" ? panel : _jsxs(_Fragment, { children: [_jsx("span", { className: "hjm-time-picker__label", children: labels.label }), _jsx(Popover, { title: labels.label, closeLabel: labels.cancel, closeIcon: _jsx(Icon, { name: "close" }), open: open, onOpenChange: setOpen, initialFocusRef: firstRef, trigger: _jsx("button", { type: "button", className: "hjm-time-picker__trigger", disabled: locked, "aria-label": `${labels.label}, ${value ?? labels.placeholder}`, "aria-invalid": !!error, children: _jsx("span", { children: value ?? labels.placeholder }) }), children: panel })] }), description ? _jsx("span", { className: "hjm-time-picker__description", children: description }) : null, error ? _jsx("span", { role: "alert", className: "hjm-time-picker__error", children: error }) : null] });
}
//# sourceMappingURL=time-picker.js.map