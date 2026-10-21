"use client";
import { resolveTaskChoice, resolvePasswordRules, resolvePriceOption, type TaskChoice, type PasswordRule, type PriceOption } from "@hjmds/design-contracts/task-controls";
import { Button, IconButton } from "./actions.js";
import { glyph } from "@hjmds/design-contracts/foundations";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { DrawnChevron } from "./internal/drawn-glyphs.js";
import { useHjmNativeTheme } from "./provider.js";
import { Menu } from "./navigation.js";
import { PasswordField, type PasswordFieldProps } from "./inputs.js";
import { RadioGroup } from "./inputs.js";
import { Card } from "./data-display.js";
import { Progress } from "./feedback.js";
import { Stack, Text } from "./primitives.js";
import { useCompositionAction } from "./internal/use-composition-action.js";

type ChoiceMenuProps = Readonly<{ choices: readonly TaskChoice[]; selectedId: string; label: string; dismissLabel: string; disabled: boolean; pending?: boolean; onChoose: (id: string) => void;
  /** `icon`: a chevron tool beside the action it modifies (SplitAction); the label stays the accessible name. */
  trigger?: "text" | "icon" }>;
function ChoiceMenu(props: ChoiceMenuProps) {
  const available = props.choices.some(choice => !choice.disabled);
  const { palette } = useHjmNativeTheme();
  const chevron = (disabled: boolean) => <DrawnChevron direction="down" size={glyph.sm} color={resolveIconButtonPresentation("secondary", palette, disabled).content} />;
  if (props.trigger === "icon" && !available) return <IconButton label={props.label} tone="secondary" disabled>{chevron(true)}</IconButton>;
  // The menu trigger is content-width like the Web Menu trigger; a column Stack would otherwise stretch it full width.
  if (!available) return <Button disabled layoutStyle={{ alignSelf: "flex-start" }}>{props.label}</Button>;
  return <Menu presentation="anchored" triggerLabel={props.label} dismissLabel={props.dismissLabel} disabled={props.disabled} busy={props.pending === true}
    renderTrigger={trigger => props.trigger === "icon" ? <IconButton label={props.label} tone="secondary" onPress={trigger.onPress} disabled={props.disabled}>{chevron(props.disabled)}</IconButton>
      : <Button tone="secondary" onPress={trigger.onPress} disabled={props.disabled} loading={props.pending === true} layoutStyle={{ alignSelf: "flex-start" }}>{props.label}</Button>}
    items={props.choices} selection={{ mode: "single", selectedKey: props.selectedId, onSelectionChange: () => undefined }} onSelectionAfterDismiss={id => props.onChoose(id)} />;
}
function Failure({ failed, label }: Readonly<{ failed: boolean; label: string }>) {
  return failed ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" tone="danger" align="center">{label}</Text> : null;
}

export type SplitActionProps = Readonly<{
  modes: readonly TaskChoice[]; modeId: string; onModeChange: (id: string) => void;
  onExecute: (modeId: string) => void | Promise<void>; executeLabel: (mode: TaskChoice) => string;
  menuLabel: string; dismissLabel: string; errorLabel: string; disabled?: boolean;
}>;
export function SplitAction(props: SplitActionProps) {
  const mode = resolveTaskChoice(props.modes, props.modeId), action = useCompositionAction(props.disabled);
  const locked = props.disabled === true || action.pending;
  // The mode menu is a chevron tool at the action's end, shared inline gap 8 (button.md); a second text button read as an unrelated action (2026-10-17 review).
  return <Stack gap="sm"><Stack axis="inline" gap="xs" align="center">
    <Button loading={action.pending} disabled={props.disabled === true || mode.disabled === true} onPress={() => { if (!mode.disabled) void action.run(mode.id, () => props.onExecute(mode.id)); }}>{props.executeLabel(mode)}</Button>
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
    <Button loading={action.pending} disabled={props.disabled === true || option.disabled === true} onPress={() => { if (!option.disabled) void action.run(option.id, () => props.onContinue(Object.freeze({ ...option, benefits: Object.freeze([...option.benefits]) }))); }}>{props.continueLabel}</Button>
    <Failure failed={action.failed} label={props.errorLabel} /></Stack></Card>;
}
