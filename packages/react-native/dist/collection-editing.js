import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AccessibilityInfo, Platform, View } from "react-native";
import { useCompositionAction } from "./internal/use-composition-action.js";
import { assertDistinctIds, changeColumnSettings, collectionEditingRecipe, focusAfterRemoval, recoverableFilters, snapshotSelection } from "@hjmds/design-contracts/collection-editing";
import { Button, IconButton } from "./actions.js";
import { glyph } from "@hjmds/design-contracts/foundations";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { DrawnChevron, DrawnPencil, DrawnTrash } from "./internal/drawn-glyphs.js";
import { useHjmNativeTheme } from "./provider.js";
import { TextField, Checkbox } from "./inputs.js";
import { Stack, Text } from "./primitives.js";
import { FieldGroup } from "./field-group.js";
function ErrorMessage({ children }) {
    useEffect(() => {
        // Native live regions announce updates on Android; iOS needs an explicit announcement.
        if (Platform.OS === "ios")
            AccessibilityInfo.announceForAccessibility(children);
    }, [children]);
    return _jsx(View, { style: { alignItems: "center", justifyContent: "center" }, children: _jsx(Text, { tone: "danger", align: "center", accessibilityRole: "alert", accessibilityLiveRegion: "assertive", children: children }) });
}
export function InlineEdit(props) { return _jsx(InlineEditBody, { ...props }, props.id); }
function InlineEditBody(props) {
    const [editing, setEditing] = useState(false), [draft, setDraft] = useState(props.value);
    const action = useCompositionAction(props.disabled);
    const input = useRef(null), trigger = useRef(null), restore = useRef(false);
    const { palette } = useHjmNativeTheme();
    const toolColor = (disabled) => resolveIconButtonPresentation("ghost", palette, disabled).content;
    useLayoutEffect(() => {
        if (editing)
            input.current?.focus();
        else if (restore.current) {
            restore.current = false;
            trigger.current?.focus();
        }
    }, [editing]);
    const error = props.validate?.(draft);
    const close = (restoreFocus = true) => { restore.current = restoreFocus; setEditing(false); };
    const save = async () => {
        if (props.disabled || error || action.pending || action.session.getSnapshot().status === "pending")
            return;
        const result = await action.run("save", () => props.onSave(draft));
        // An async response must not steal focus after the user moved to another input.
        if (result.status === "success")
            close(input.current?.isFocused() ?? false);
    };
    return _jsx(View, { accessible: false, children: !editing ? _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", children: [_jsxs(Stack, { gap: "xxs", layoutStyle: { flex: 1, minWidth: 0 }, children: [_jsx(Text, { variant: "caption", tone: "muted", children: props.label }), _jsx(Text, { emphasis: "strong", children: props.value })] }), _jsx(IconButton, { ref: trigger, label: props.editLabel, tone: "ghost", edge: "end", disabled: props.disabled ?? false, onPress: () => { setDraft(props.value); action.session.reset(null); setEditing(true); }, children: _jsx(DrawnPencil, { size: glyph.sm, color: toolColor(props.disabled === true) }) })] })
            : _jsxs(Stack, { gap: collectionEditingRecipe.actionGap, children: [_jsx(TextField, { ref: input, label: props.label, value: draft, disabled: props.disabled === true || action.pending, ...(error ? { error, invalid: true } : {}), onValueChange: setDraft, onSubmitEditing: () => void save() }), _jsxs(Stack, { axis: "inline", gap: "sm", wrap: true, children: [_jsx(Button, { tone: "ghost", disabled: action.pending, onPress: () => close(), children: props.cancelLabel }), _jsx(Button, { loading: action.pending, disabled: props.disabled === true || !!error, onPress: () => void save(), children: props.saveLabel })] }), action.failed ? _jsx(ErrorMessage, { children: props.errorLabel }) : null] }) });
}
export function RepeatableFieldGroup({ renderField, addLabel, removeLabel, minFields = 0, maxFields = Infinity, isRemoveDisabled, onAdd, onRemove, ...props }) {
    const targets = useRef(new Map()), add = useRef(null);
    const { palette } = useHjmNativeTheme();
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
    const live = useRef(true), policy = useRef({ fields, minFields, maxFields, isRemoveDisabled, onAdd, onRemove, disabled: props.descriptor.disabled });
    policy.current = { fields, minFields, maxFields, isRemoveDisabled, onAdd, onRemove, disabled: props.descriptor.disabled };
    useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);
    return _jsxs(Stack, { gap: collectionEditingRecipe.gap, children: [_jsx(FieldGroup, { ...props, renderField: binding => _jsxs(Stack, { axis: "inline", gap: "xs", align: "end", children: [_jsx(View, { style: { flex: 1, minWidth: 0 }, children: renderField({ ...binding, focusRef: target => { if (target)
                                    targets.current.set(binding.id, target);
                                else
                                    targets.current.delete(binding.id); } }) }), _jsx(IconButton, { label: removeLabel(binding.id), tone: "ghost", edge: "end", disabled: binding.controlProps.disabled || fields.length <= minFields || isRemoveDisabled?.(binding.id) === true, onPress: binding.guardChange(() => {
                                const current = policy.current;
                                if (!live.current || current.disabled || current.fields.length <= current.minFields || current.isRemoveDisabled?.(binding.id))
                                    return;
                                focus.current = focusAfterRemoval(current.fields.map(field => field.id), binding.id, current.fields.filter(field => field.disabled).map(field => field.id)) ?? null;
                                current.onRemove(binding.id);
                            }), children: _jsx(DrawnTrash, { size: glyph.sm, color: resolveIconButtonPresentation("ghost", palette, binding.controlProps.disabled || fields.length <= minFields || isRemoveDisabled?.(binding.id) === true).content }) })] }) }), _jsx(Button, { ref: add, tone: "secondary", disabled: props.descriptor.disabled === true || fields.length >= maxFields, onPress: () => {
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
    return _jsx(View, { accessible: false, children: _jsxs(Stack, { gap: "sm", children: [_jsx(Text, { accessibilityLiveRegion: "polite", children: props.selectionLabel(props.selectedIds.length) }), _jsxs(Stack, { axis: "inline", gap: "sm", wrap: true, children: [props.actions.map(item => _jsx(Button, { tone: item.destructive ? "danger" : "secondary", loading: action.active === `action:${item.id}`, disabled: props.disabled === true || (action.pending && action.active !== `action:${item.id}`) || !props.selectedIds.length, onPress: () => {
                                if (props.disabled)
                                    return;
                                const scope = snapshotSelection(props.selectedIds);
                                if (scope.length)
                                    void action.run(`action:${item.id}`, () => props.onAction(item.id, scope));
                            }, children: item.label }, item.id)), _jsx(Button, { tone: "ghost", disabled: props.disabled === true || action.pending || !props.selectedIds.length, onPress: props.onClear, children: props.clearLabel }), props.recovery ? _jsx(Button, { tone: "ghost", loading: action.active === "undo", disabled: props.disabled === true || (action.pending && action.active !== "undo"), onPress: () => {
                                if (!props.disabled)
                                    void action.run("undo", () => props.recovery.onUndo());
                            }, children: props.recovery.label }) : null] }), action.failed ? _jsx(ErrorMessage, { children: props.errorLabel }) : null] }) });
}
export function FilterRecovery(props) {
    const action = useCompositionAction(props.disabled), options = recoverableFilters(props.options);
    // Fills the result area its host gives it and centers there; a content-high host keeps it content-high.
    return _jsx(View, { style: { flexGrow: 1, alignItems: "center", justifyContent: "center" }, children: _jsxs(Stack, { gap: "sm", align: "center", children: [_jsx(Text, { emphasis: "strong", align: "center", children: props.title }), props.description ? _jsx(Text, { tone: "muted", align: "center", children: props.description }) : null, options.map(option => _jsx(Button, { tone: "secondary", loading: action.active === option.id, disabled: props.disabled === true || (action.pending && action.active !== option.id), onPress: () => { if (!props.disabled)
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
    const chevronColor = resolveIconButtonPresentation("ghost", useHjmNativeTheme().palette, false).content;
    // One row per column: visibility checkbox, then reorder as icon tools (labels stay the accessible names); the last
    // tool takes edge="end" so its glyph slot ends on the group's edge like the checkbox starts on it (2026-10-17 audit), as on Web.
    return _jsxs(Stack, { gap: "sm", children: [_jsx(Text, { emphasis: "strong", children: props.label }), props.columns.map(column => _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", children: [_jsx(Checkbox, { label: column.label, checked: column.visible, layoutStyle: { flex: 1, minWidth: 0 }, disabled: props.disabled === true || column.locked === true || (column.visible && props.columns.filter(item => item.visible).length === 1), onCheckedChange: () => change(column.id, "toggle") }), _jsx(IconButton, { label: props.earlierLabel(column), tone: "ghost", disabled: props.disabled === true || changeColumnSettings(props.columns, column.id, "earlier") === props.columns, onPress: () => change(column.id, "earlier"), children: _jsx(DrawnChevron, { direction: "up", size: glyph.sm, color: chevronColor }) }), _jsx(IconButton, { label: props.laterLabel(column), tone: "ghost", edge: "end", disabled: props.disabled === true || changeColumnSettings(props.columns, column.id, "later") === props.columns, onPress: () => change(column.id, "later"), children: _jsx(DrawnChevron, { direction: "down", size: glyph.sm, color: chevronColor }) })] }, column.id))] });
}
//# sourceMappingURL=collection-editing.js.map