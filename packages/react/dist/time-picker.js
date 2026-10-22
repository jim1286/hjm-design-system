"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { timePickerDraft, timePickerItems, resolveTimePickerValue, resolveTimePickerWheelIndex, validateTimePicker, timePickerRecipe } from "@hjmds/design-contracts/components/time-picker";
import { Button } from "./actions.js";
import { Icon } from "./supplemental-display.js";
import { Popover } from "./popover.js";
import { useHjmTheme } from "./provider.js";
/** One draft and one confirmation for both columns. Inline mode delegates confirmation to its form. */
export function TimePicker(props) {
    validateTimePicker(props);
    const { value, onValueChange, labels, disabled, readOnly, description, error, presentation = "field", layoutStyle, className } = props;
    const [open, setOpen] = useState(false), [draft, setDraft] = useState(() => timePickerDraft(value));
    const locked = !!(disabled || readOnly);
    const firstRef = useRef(null);
    const [moving, setMoving] = useState({ hour: false, minute: false });
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
    const panel = _jsxs("div", { style: { "--hjm-time-row": `${timePickerRecipe.rowHeight}px`, "--hjm-time-height": `${timePickerRecipe.rowHeight * timePickerRecipe.visibleRows}px`, "--hjm-time-summary": `${timePickerRecipe.readoutSize}px`, "--hjm-time-summary-line-height": `${timePickerRecipe.readoutLineHeight}px`, maxWidth: timePickerRecipe.panelWidth }, className: "hjm-time-picker__panel", role: "group", "aria-label": labels.label, children: [_jsxs("div", { className: "hjm-time-picker__readout", "aria-live": "polite", "aria-atomic": "true", children: [draft.hour ?? "--", _jsx("span", { children: ":" }), draft.minute ?? "--"] }), _jsx("div", { className: "hjm-time-picker__columns", children: ["hour", "minute"].map(part => _jsx(TimeColumn, { part: part, draft: draft, options: props, locked: locked, firstRef: firstRef, onSelect: next => select(part, next), onMoving: next => setMoving(current => current[part] === next ? current : { ...current, [part]: next }) }, part)) }), presentation === "field" ? _jsx(Button, { disabled: locked || resolved === null || moving.hour || moving.minute, onClick: () => { const current = resolveTimePickerValue(draft, props); if (!locked && current !== null) {
                    onValueChange(current);
                    setOpen(false);
                } }, children: labels.confirm }) : null] });
    return _jsxs("div", { className: `hjm-time-picker ${className ?? ""}`, style: layoutStyle, "data-disabled": disabled || undefined, children: [presentation === "inline" ? panel : _jsxs(_Fragment, { children: [_jsx("span", { className: "hjm-time-picker__label", children: labels.label }), _jsx(Popover, { title: labels.label, closeLabel: labels.cancel, closeIcon: _jsx(Icon, { name: "close" }), open: open, onOpenChange: setOpen, initialFocusRef: firstRef, trigger: _jsx("button", { type: "button", className: "hjm-time-picker__trigger", disabled: locked, "aria-label": `${labels.label}, ${value ?? labels.placeholder}`, "aria-invalid": !!error, children: _jsx("span", { children: value ?? labels.placeholder }) }), children: panel })] }), description ? _jsx("span", { className: "hjm-time-picker__description", children: description }) : null, error ? _jsx("span", { role: "alert", className: "hjm-time-picker__error", children: error }) : null] });
}
function TimeColumn({ part, draft, options, locked, firstRef, onSelect, onMoving }) {
    const { environment } = useHjmTheme();
    const wheel = options.selectionStyle === "wheel";
    const listRef = useRef(null);
    const interacting = useRef(false);
    const emitted = useRef(null);
    const items = timePickerItems(part, draft, options);
    const active = items.find(item => item.value === draft[part] && !item.disabled)?.value ?? items.find(item => !item.disabled)?.value;
    const index = items.findIndex(item => item.value === draft[part]);
    const rowHeight = timePickerRecipe.rowHeight;
    const label = options.labels[part];
    useLayoutEffect(() => {
        const list = listRef.current;
        if (!list)
            return;
        // Our own scroll edits must not interrupt momentum when a controlled parent echoes the draft.
        if (wheel && emitted.current === draft[part] && draft[part] !== null) {
            emitted.current = null;
            return;
        }
        interacting.current = false;
        onMoving(false);
        list.scrollTop = wheel ? Math.max(0, index) * rowHeight : Math.max(0, (index - 2) * rowHeight);
    }, [draft[part], wheel, locked, options.minuteStep]);
    function emit(index) {
        const item = items[index];
        if (!item || item.disabled || locked || (wheel && item.value === draft[part]))
            return;
        emitted.current = wheel ? item.value : null;
        onSelect(item.value);
    }
    function choose(index) {
        interacting.current = false;
        onMoving(false);
        emit(index);
        if (wheel) {
            const list = listRef.current;
            if (list?.contains(document.activeElement))
                list.querySelectorAll("button")[index]?.focus({ preventScroll: true });
            list?.scrollTo({ top: index * rowHeight, behavior: environment.reducedMotion ? "instant" : "smooth" });
        }
    }
    useEffect(() => {
        const list = listRef.current;
        if (!wheel || !list)
            return;
        // scrollend includes CSS snapping and waits for touch/trackpad release; no timeout guesses.
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event
        const finish = () => {
            if (!interacting.current || locked)
                return;
            interacting.current = false;
            onMoving(false);
            const target = resolveTimePickerWheelIndex(items, list.scrollTop);
            if (target !== null)
                choose(target);
        };
        list.addEventListener("scrollend", finish);
        return () => list.removeEventListener("scrollend", finish);
    });
    return _jsxs("div", { className: "hjm-time-picker__column", children: [_jsx("div", { className: "hjm-time-picker__caption", children: label }), _jsxs("div", { className: "hjm-time-picker__viewport", "data-wheel": wheel || undefined, children: [wheel && _jsx("div", { "aria-hidden": "true", className: "hjm-time-picker__center" }), _jsx("div", { ref: listRef, role: "listbox", "aria-label": label, "aria-disabled": locked, className: "hjm-time-picker__list", "data-wheel": wheel || undefined, onWheel: () => { if (wheel && !locked)
                            interacting.current = true; }, onPointerDown: () => { if (wheel && !locked)
                            interacting.current = true; }, onScroll: e => {
                            if (!wheel || !interacting.current || locked)
                                return;
                            onMoving(true);
                            const target = resolveTimePickerWheelIndex(items, e.currentTarget.scrollTop);
                            if (target !== null)
                                emit(target);
                        }, children: items.map((item, itemIndex) => _jsx("button", { ref: part === "hour" && item.value === active ? firstRef : undefined, type: "button", role: "option", "aria-selected": draft[part] === item.value, "aria-label": `${item.value} ${label}`, disabled: locked || item.disabled, tabIndex: item.value === active ? 0 : -1, onClick: () => choose(itemIndex), onFocus: e => {
                                if (wheel)
                                    return;
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
                                const enabled = items.map((entry, index) => ({ ...entry, index })).filter(entry => !entry.disabled);
                                const position = enabled.findIndex(entry => entry.value === item.value);
                                const target = e.key === "Home" ? enabled[0] : e.key === "End" ? enabled.at(-1) : enabled[position + (e.key === "ArrowDown" ? 1 : -1)];
                                if (target) {
                                    listRef.current?.querySelectorAll("button")[target.index]?.focus({ preventScroll: wheel });
                                    choose(target.index);
                                }
                            }, children: item.value }, item.value)) })] })] });
}
//# sourceMappingURL=time-picker.js.map