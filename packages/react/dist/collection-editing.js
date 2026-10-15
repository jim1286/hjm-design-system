"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCompositionAction } from "./internal/use-composition-action.js";
import { assertDistinctIds, changeColumnSettings, collectionEditingRecipe, focusAfterRemoval, recoverableFilters, snapshotSelection } from "@hjmds/design-contracts/collection-editing";
import { Button } from "./actions.js";
import { TextField } from "./forms.js";
import { Checkbox } from "./selection.js";
import { Stack, Text } from "./layout.js";
import { FieldGroup } from "./field-group.js";
function ErrorMessage({ children }) {
    return _jsx("div", { role: "alert", style: { display: "grid", placeItems: "center", textAlign: "center" }, children: _jsx(Text, { tone: "danger", children: children }) });
}
export function InlineEdit(props) { return _jsx(InlineEditBody, { ...props }, props.id); }
function InlineEditBody(props) {
    const [editing, setEditing] = useState(false), [draft, setDraft] = useState(props.value);
    const action = useCompositionAction(props.disabled);
    const input = useRef(null), trigger = useRef(null), group = useRef(null);
    const restore = useRef(false);
    useLayoutEffect(() => {
        if (editing)
            input.current?.focus();
        else if (restore.current) {
            restore.current = false;
            trigger.current?.focus();
        }
    }, [editing]);
    const error = props.validate?.(draft);
    const close = () => {
        restore.current = group.current?.contains(document.activeElement) ?? false;
        setEditing(false);
    };
    const save = async () => {
        if (props.disabled || error || action.pending || action.session.getSnapshot().status === "pending")
            return;
        const result = await action.run("save", () => props.onSave(draft));
        if (result.status === "success")
            close();
    };
    return _jsx("div", { ref: group, role: "group", "aria-label": props.label, children: !editing ? _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", wrap: true, children: [_jsx(Text, { children: props.value }), _jsx(Button, { ref: trigger, disabled: props.disabled ?? false, tone: "ghost", onClick: () => { setDraft(props.value); action.session.reset(null); setEditing(true); }, children: props.editLabel })] })
            : _jsxs(Stack, { gap: collectionEditingRecipe.actionGap, children: [_jsx(TextField, { ref: input, label: props.label, value: draft, disabled: props.disabled ?? false, readOnly: action.pending, ...(error ? { error, "aria-invalid": true } : {}), onValueChange: setDraft, onKeyDown: event => {
                            // Enter during IME composition confirms a character, not the title.
                            if (event.nativeEvent.isComposing || event.keyCode === 229)
                                return;
                            if (event.key === "Enter") {
                                event.preventDefault();
                                void save();
                            }
                            if (event.key === "Escape" && !action.pending) {
                                event.preventDefault();
                                event.stopPropagation();
                                close();
                            }
                        } }), _jsxs(Stack, { axis: "inline", gap: "sm", wrap: true, children: [_jsx(Button, { tone: "ghost", disabled: action.pending, onClick: close, children: props.cancelLabel }), _jsx(Button, { loading: action.pending, disabled: props.disabled === true || !!error, onClick: () => void save(), children: props.saveLabel })] }), action.failed ? _jsx(ErrorMessage, { children: props.errorLabel }) : null] }) });
}
export function RepeatableFieldGroup({ renderField, addLabel, removeLabel, minFields = 0, maxFields = Infinity, onAdd, onRemove, ...props }) {
    const targets = useRef(new Map()), add = useRef(null);
    const focus = useRef(undefined);
    useLayoutEffect(() => {
        if (focus.current === undefined)
            return;
        if (focus.current === null) {
            add.current?.focus();
            focus.current = undefined;
        }
        else if (targets.current.has(focus.current)) {
            targets.current.get(focus.current)?.focus();
            focus.current = undefined;
        }
    });
    const fields = props.descriptor.fields;
    const live = useRef(true), policy = useRef({ fields, minFields, maxFields, onAdd, onRemove, disabled: props.descriptor.disabled });
    policy.current = { fields, minFields, maxFields, onAdd, onRemove, disabled: props.descriptor.disabled };
    useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);
    return _jsxs(Stack, { gap: collectionEditingRecipe.gap, children: [_jsx(FieldGroup, { ...props, renderField: binding => _jsxs(Stack, { gap: "sm", children: [renderField({ ...binding, focusRef: target => { if (target)
                                targets.current.set(binding.id, target);
                            else
                                targets.current.delete(binding.id); } }), _jsx(Button, { tone: "ghost", disabled: binding.controlProps.disabled || fields.length <= minFields, onClick: binding.guardChange(() => {
                                const current = policy.current;
                                if (!live.current || current.disabled || current.fields.length <= current.minFields)
                                    return;
                                focus.current = focusAfterRemoval(current.fields.map(field => field.id), binding.id, current.fields.filter(field => field.disabled).map(field => field.id)) ?? null;
                                current.onRemove(binding.id);
                            }), children: removeLabel(binding.id) })] }) }), _jsx(Button, { ref: add, tone: "secondary", disabled: props.descriptor.disabled === true || fields.length >= maxFields, onClick: () => {
                    const current = policy.current;
                    if (!live.current || current.disabled || current.fields.length >= current.maxFields)
                        return;
                    const id = current.onAdd();
                    if (id !== undefined)
                        focus.current = id;
                }, children: addLabel })] });
}
export function SelectionActionBar(props) {
    const action = useCompositionAction(props.disabled);
    assertDistinctIds(props.actions);
    snapshotSelection(props.selectedIds);
    if (!props.selectedIds.length && !props.recovery && !action.pending && !action.failed)
        return null;
    return _jsx("div", { role: "group", "aria-label": props.selectionLabel(props.selectedIds.length), children: _jsxs(Stack, { gap: "sm", children: [_jsx(Text, { role: "status", children: props.selectionLabel(props.selectedIds.length) }), _jsxs(Stack, { axis: "inline", gap: "sm", wrap: true, children: [props.actions.map(item => _jsx(Button, { tone: item.destructive ? "danger" : "secondary", loading: action.active === `action:${item.id}`, disabled: props.disabled === true || (action.pending && action.active !== `action:${item.id}`) || !props.selectedIds.length, onClick: () => {
                                if (props.disabled)
                                    return;
                                const scope = snapshotSelection(props.selectedIds);
                                if (scope.length)
                                    void action.run(`action:${item.id}`, () => props.onAction(item.id, scope));
                            }, children: item.label }, item.id)), _jsx(Button, { tone: "ghost", disabled: props.disabled === true || action.pending || !props.selectedIds.length, onClick: props.onClear, children: props.clearLabel }), props.recovery ? _jsx(Button, { tone: "ghost", loading: action.active === "undo", disabled: props.disabled === true || (action.pending && action.active !== "undo"), onClick: () => {
                                if (!props.disabled)
                                    void action.run("undo", () => props.recovery.onUndo());
                            }, children: props.recovery.label }) : null] }), action.failed ? _jsx(ErrorMessage, { children: props.errorLabel }) : null] }) });
}
export function FilterRecovery(props) {
    const action = useCompositionAction(props.disabled), options = recoverableFilters(props.options);
    return _jsx("div", { role: "group", "aria-label": props.title, style: { display: "grid", placeItems: "center", textAlign: "center" }, children: _jsxs(Stack, { gap: "sm", align: "center", children: [_jsx(Text, { emphasis: "strong", children: props.title }), props.description ? _jsx(Text, { tone: "muted", children: props.description }) : null, options.map(option => _jsx(Button, { tone: "secondary", loading: action.active === option.id, disabled: props.disabled === true || (action.pending && action.active !== option.id), onClick: () => { if (!props.disabled)
                        void action.run(option.id, () => props.onApply(option.id)); }, children: props.optionLabel(option) }, option.id)), action.failed ? _jsx(ErrorMessage, { children: props.errorLabel }) : null] }) });
}
export function TableColumnSettings(props) {
    assertDistinctIds(props.columns);
    const change = (id, kind) => {
        if (props.disabled)
            return;
        const next = changeColumnSettings(props.columns, id, kind);
        if (next !== props.columns)
            props.onColumnsChange(next);
    };
    return _jsxs("fieldset", { disabled: props.disabled, style: { margin: 0, padding: 0, border: 0, minInlineSize: 0 }, children: [_jsx("legend", { children: props.label }), _jsx(Stack, { gap: "sm", children: props.columns.map(column => _jsxs(Stack, { gap: "sm", children: [_jsx(Checkbox, { label: column.label, checked: column.visible, disabled: column.locked === true || (column.visible && props.columns.filter(item => item.visible).length === 1), onCheckedChange: () => change(column.id, "toggle") }), _jsxs(Stack, { axis: "inline", gap: "sm", wrap: true, children: [_jsx(Button, { tone: "ghost", disabled: changeColumnSettings(props.columns, column.id, "earlier") === props.columns, onClick: () => change(column.id, "earlier"), children: props.earlierLabel(column) }), _jsx(Button, { tone: "ghost", disabled: changeColumnSettings(props.columns, column.id, "later") === props.columns, onClick: () => change(column.id, "later"), children: props.laterLabel(column) })] })] }, column.id)) })] });
}
//# sourceMappingURL=collection-editing.js.map