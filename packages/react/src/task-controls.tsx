"use client";
import { resolveTaskChoice, resolvePasswordRules, resolvePriceOption, type TaskChoice, type PasswordRule, type PriceOption } from "@hjmds/design-contracts/task-controls";
import { Button, IconButton } from "./actions.js";
import { Icon } from "./supplemental-display.js";
import { Menu } from "./overlays.js";
import { PasswordField, type PasswordFieldProps } from "./forms.js";
import { RadioGroup } from "./selection.js";
import { Card } from "./display.js";
import { Progress } from "./feedback.js";
import { Stack, Text } from "./layout.js";
import { useCompositionAction } from "./internal/use-composition-action.js";

type ChoiceMenuProps = Readonly<{ choices: readonly TaskChoice[]; selectedId: string; label: string; dismissLabel: string; disabled: boolean; pending?: boolean; onChoose: (id: string) => void;
  /** `icon`: a chevron tool beside the action it modifies (SplitAction); the label stays the accessible name. */
  trigger?: "text" | "icon" }>;
function ChoiceMenu(props: ChoiceMenuProps) {
  const available = props.choices.some(choice => !choice.disabled);
  if (props.trigger === "icon" && !available) return <IconButton label={props.label} tone="secondary" disabled><Icon name="chevronDown" /></IconButton>;
  if (!available) return <Button disabled>{props.label}</Button>;
  const trigger = props.trigger === "icon" ? <IconButton label={props.label} tone="secondary"><Icon name="chevronDown" /></IconButton> : <Button tone="secondary" loading={props.pending === true}>{props.label}</Button>;
  return <Menu presentation="anchored" label={props.label} trigger={trigger} disabled={props.disabled}
    items={props.choices} selectionMode="single" value={props.selectedId} onValueChange={() => undefined} onActionAfterDismiss={props.onChoose} />;
}
function Failure({ failed, label }: Readonly<{ failed: boolean; label: string }>) {
  return failed ? <Text role="alert" tone="danger" style={{ textAlign: "center" }}>{label}</Text> : null;
}

export type SplitActionProps = Readonly<{
  modes: readonly TaskChoice[]; modeId: string; onModeChange: (id: string) => void;
  onExecute: (modeId: string) => void | Promise<void>; executeLabel: (mode: TaskChoice) => string;
  menuLabel: string; dismissLabel: string; errorLabel: string; disabled?: boolean;
}>;
export function SplitAction(props: SplitActionProps) {
  const mode = resolveTaskChoice(props.modes, props.modeId), action = useCompositionAction(props.disabled);
  const locked = props.disabled === true || action.pending;
  // The mode menu is a chevron tool at the action's end, inline gap 12 (button.md); a second text button read as an unrelated action (2026-10-17 review).
  return <Stack gap="sm"><Stack axis="inline" gap="sm" align="center">
    <Button loading={action.pending} disabled={props.disabled === true || mode.disabled === true} onClick={() => { if (!mode.disabled) void action.run(mode.id, () => props.onExecute(mode.id)); }}>{props.executeLabel(mode)}</Button>
    <ChoiceMenu trigger="icon" choices={props.modes} selectedId={mode.id} label={props.menuLabel} dismissLabel={props.dismissLabel} disabled={locked} onChoose={id => { if (!locked && !resolveTaskChoice(props.modes, id).disabled) props.onModeChange(id); }} />
  </Stack><Failure failed={action.failed} label={props.errorLabel} /></Stack>;
}

export type AccountSwitcherProps = Readonly<{
  accounts: readonly TaskChoice[]; accountId: string; label: string; dismissLabel: string; errorLabel: string;
  onSwitch: (accountId: string) => void | Promise<void>; disabled?: boolean;
}>;
export function AccountSwitcher(props: AccountSwitcherProps) {
  const account = resolveTaskChoice(props.accounts, props.accountId), action = useCompositionAction(props.disabled);
  const locked = props.disabled === true || action.pending;
  // The controlled account stays confirmed until the product completes the session change.
  return <Stack gap="sm"><Text emphasis="strong">{account.label}</Text><ChoiceMenu choices={props.accounts} selectedId={account.id} label={props.label} dismissLabel={props.dismissLabel} disabled={locked} pending={action.pending}
    onChoose={id => { if (id !== account.id && !resolveTaskChoice(props.accounts, id).disabled) void action.run(id, () => props.onSwitch(id)); }} />
    <Failure failed={action.failed} label={props.errorLabel} /></Stack>;
}

export type PasswordRulesFieldProps = Omit<PasswordFieldProps, "value" | "defaultValue" | "onValueChange"> & Readonly<{
  label: string; value: string; onValueChange: (value: string) => void; rules: readonly PasswordRule[];
  progressLabel: string; summaryLabel: (satisfied: number, total: number) => string;
  ruleLabel: (rule: ReturnType<typeof resolvePasswordRules>["rules"][number]) => string;
}>;
export function PasswordRulesField({ rules, progressLabel, summaryLabel, ruleLabel, ...field }: PasswordRulesFieldProps) {
  const state = resolvePasswordRules(field.value, rules);
  return <Stack gap="sm"><PasswordField {...field} />
    <Progress label={progressLabel} value={state.satisfied} max={state.total} valueText={summaryLabel(state.satisfied, state.total)} />
    {state.rules.map(rule => <Text key={rule.id} variant="caption" tone={rule.satisfied ? "primary" : "muted"}>{ruleLabel(rule)}</Text>)}
  </Stack>;
}

export type PricingChoiceProps = Readonly<{
  label: string; options: readonly PriceOption[]; selectedId: string; onSelectionChange: (id: string) => void;
  formatPrice: (option: PriceOption) => string; continueLabel: string; errorLabel: string;
  onContinue: (option: PriceOption) => void | Promise<void>; disabled?: boolean;
}>;
export function PricingChoice(props: PricingChoiceProps) {
  const option = resolvePriceOption(props.options, props.selectedId), action = useCompositionAction(props.disabled);
  const locked = props.disabled === true || action.pending;
  return <Card title={props.label}><Stack gap="md"><RadioGroup accessibilityLabel={props.label} presentation="card" value={option.id} disabled={locked}
    items={props.options.map(price => ({ value: price.id, label: price.label, description: props.formatPrice(price), disabled: price.disabled === true }))}
    onValueChange={id => { if (id !== null && !locked && !resolveTaskChoice(props.options, id).disabled) props.onSelectionChange(id); }} />
    <Text emphasis="strong">{props.formatPrice(option)}</Text>
    {option.benefits.map((benefit, index) => <Text key={index}>{benefit}</Text>)}
    <Button loading={action.pending} disabled={props.disabled === true || option.disabled === true} onClick={() => { if (!option.disabled) void action.run(option.id, () => props.onContinue(Object.freeze({ ...option, benefits: Object.freeze([...option.benefits]) }))); }}>{props.continueLabel}</Button>
    <Failure failed={action.failed} label={props.errorLabel} /></Stack></Card>;
}
