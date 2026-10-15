import { resolvePasswordRules, type TaskChoice, type PasswordRule, type PriceOption } from "@hjmds/design-contracts/task-controls";
import { type PasswordFieldProps } from "./forms.js";
export type SplitActionProps = Readonly<{
    modes: readonly TaskChoice[];
    modeId: string;
    onModeChange: (id: string) => void;
    onExecute: (modeId: string) => void | Promise<void>;
    executeLabel: (mode: TaskChoice) => string;
    menuLabel: string;
    dismissLabel: string;
    errorLabel: string;
    disabled?: boolean;
}>;
export declare function SplitAction(props: SplitActionProps): import("react").JSX.Element;
export type AccountSwitcherProps = Readonly<{
    accounts: readonly TaskChoice[];
    accountId: string;
    label: string;
    dismissLabel: string;
    errorLabel: string;
    onSwitch: (accountId: string) => void | Promise<void>;
    disabled?: boolean;
}>;
export declare function AccountSwitcher(props: AccountSwitcherProps): import("react").JSX.Element;
export type PasswordRulesFieldProps = Omit<PasswordFieldProps, "value" | "defaultValue" | "onValueChange"> & Readonly<{
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    rules: readonly PasswordRule[];
    progressLabel: string;
    summaryLabel: (satisfied: number, total: number) => string;
    ruleLabel: (rule: ReturnType<typeof resolvePasswordRules>["rules"][number]) => string;
}>;
export declare function PasswordRulesField({ rules, progressLabel, summaryLabel, ruleLabel, ...field }: PasswordRulesFieldProps): import("react").JSX.Element;
export type PricingChoiceProps = Readonly<{
    label: string;
    options: readonly PriceOption[];
    selectedId: string;
    onSelectionChange: (id: string) => void;
    formatPrice: (option: PriceOption) => string;
    continueLabel: string;
    errorLabel: string;
    onContinue: (option: PriceOption) => void | Promise<void>;
    disabled?: boolean;
}>;
export declare function PricingChoice(props: PricingChoiceProps): import("react").JSX.Element;
//# sourceMappingURL=task-controls.d.ts.map