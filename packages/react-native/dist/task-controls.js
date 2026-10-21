"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveTaskChoice, resolvePasswordRules, resolvePriceOption } from "@hjmds/design-contracts/task-controls";
import { Button, IconButton } from "./actions.js";
import { glyph } from "@hjmds/design-contracts/foundations";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { DrawnChevron } from "./internal/drawn-glyphs.js";
import { useHjmNativeTheme } from "./provider.js";
import { Menu } from "./navigation.js";
import { PasswordField } from "./inputs.js";
import { RadioGroup } from "./inputs.js";
import { Card } from "./data-display.js";
import { Progress } from "./feedback.js";
import { Stack, Text } from "./primitives.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
function ChoiceMenu(props) {
    const available = props.choices.some(choice => !choice.disabled);
    const { palette } = useHjmNativeTheme();
    const chevron = (disabled) => _jsx(DrawnChevron, { direction: "down", size: glyph.sm, color: resolveIconButtonPresentation("secondary", palette, disabled).content });
    if (props.trigger === "icon" && !available)
        return _jsx(IconButton, { label: props.label, tone: "secondary", disabled: true, children: chevron(true) });
    // The menu trigger is content-width like the Web Menu trigger; a column Stack would otherwise stretch it full width.
    if (!available)
        return _jsx(Button, { disabled: true, layoutStyle: { alignSelf: "flex-start" }, children: props.label });
    return _jsx(Menu, { presentation: "anchored", triggerLabel: props.label, dismissLabel: props.dismissLabel, disabled: props.disabled, busy: props.pending === true, renderTrigger: trigger => props.trigger === "icon" ? _jsx(IconButton, { label: props.label, tone: "secondary", onPress: trigger.onPress, disabled: props.disabled, children: chevron(props.disabled) })
            : _jsx(Button, { tone: "secondary", onPress: trigger.onPress, disabled: props.disabled, loading: props.pending === true, layoutStyle: { alignSelf: "flex-start" }, children: props.label }), items: props.choices, selection: { mode: "single", selectedKey: props.selectedId, onSelectionChange: () => undefined }, onSelectionAfterDismiss: id => props.onChoose(id) });
}
function Failure({ failed, label }) {
    return failed ? _jsx(Text, { accessibilityRole: "alert", accessibilityLiveRegion: "assertive", tone: "danger", align: "center", children: label }) : null;
}
export function SplitAction(props) {
    const mode = resolveTaskChoice(props.modes, props.modeId), action = useCompositionAction(props.disabled);
    const locked = props.disabled === true || action.pending;
    // The mode menu is a chevron tool at the action's end, shared inline gap 8 (button.md); a second text button read as an unrelated action (2026-10-17 review).
    return _jsxs(Stack, { gap: "sm", children: [_jsxs(Stack, { axis: "inline", gap: "xs", align: "center", children: [_jsx(Button, { loading: action.pending, disabled: props.disabled === true || mode.disabled === true, onPress: () => { if (!mode.disabled)
                            void action.run(mode.id, () => props.onExecute(mode.id)); }, children: props.executeLabel(mode) }), _jsx(ChoiceMenu, { trigger: "icon", choices: props.modes, selectedId: mode.id, label: props.menuLabel, dismissLabel: props.dismissLabel, disabled: locked, onChoose: id => { if (!locked && !resolveTaskChoice(props.modes, id).disabled)
                            props.onModeChange(id); } })] }), _jsx(Failure, { failed: action.failed, label: props.errorLabel })] });
}
export function AccountSwitcher(props) {
    const account = resolveTaskChoice(props.accounts, props.accountId), action = useCompositionAction(props.disabled);
    const locked = props.disabled === true || action.pending;
    // The controlled account stays confirmed until the product completes the session change.
    return _jsxs(Stack, { gap: "sm", children: [_jsx(Text, { emphasis: "strong", children: account.label }), _jsx(ChoiceMenu, { choices: props.accounts, selectedId: account.id, label: props.label, dismissLabel: props.dismissLabel, disabled: locked, pending: action.pending, onChoose: id => { if (id !== account.id && !resolveTaskChoice(props.accounts, id).disabled)
                    void action.run(id, () => props.onSwitch(id)); } }), _jsx(Failure, { failed: action.failed, label: props.errorLabel })] });
}
export function PasswordRulesField({ rules, progressLabel, summaryLabel, ruleLabel, ...field }) {
    const state = resolvePasswordRules(field.value, rules);
    return _jsxs(Stack, { gap: "sm", children: [_jsx(PasswordField, { ...field }), _jsx(Progress, { label: progressLabel, value: state.satisfied, max: state.total, valueText: summaryLabel(state.satisfied, state.total) }), state.rules.map(rule => _jsx(Text, { variant: "caption", tone: rule.satisfied ? "primary" : "muted", children: ruleLabel(rule) }, rule.id))] });
}
export function PricingChoice(props) {
    const option = resolvePriceOption(props.options, props.selectedId), action = useCompositionAction(props.disabled);
    const locked = props.disabled === true || action.pending;
    return _jsx(Card, { title: props.label, children: _jsxs(Stack, { gap: "md", children: [_jsx(RadioGroup, { accessibilityLabel: props.label, presentation: "card", value: option.id, disabled: locked, items: props.options.map(price => ({ value: price.id, label: price.label, description: props.formatPrice(price), disabled: price.disabled === true })), onValueChange: id => { if (id !== null && !locked && !resolveTaskChoice(props.options, id).disabled)
                        props.onSelectionChange(id); } }), _jsx(Text, { emphasis: "strong", children: props.formatPrice(option) }), option.benefits.map((benefit, index) => _jsx(Text, { children: benefit }, index)), _jsx(Button, { loading: action.pending, disabled: props.disabled === true || option.disabled === true, onPress: () => { if (!option.disabled)
                        void action.run(option.id, () => props.onContinue(Object.freeze({ ...option, benefits: Object.freeze([...option.benefits]) }))); }, children: props.continueLabel }), _jsx(Failure, { failed: action.failed, label: props.errorLabel })] }) });
}
//# sourceMappingURL=task-controls.js.map