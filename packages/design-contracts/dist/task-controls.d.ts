export type TaskChoice = Readonly<{
    id: string;
    label: string;
    description?: string;
    disabled?: boolean;
}>;
export declare function resolveTaskChoice<T extends TaskChoice>(choices: readonly T[], selectedId: string): T;
export type PasswordRule = Readonly<{
    id: string;
    label: string;
    test: (value: string) => boolean;
}>;
/** Counts supplied requirements only; entropy and password security are not inferred. */
export declare function resolvePasswordRules(value: string, rules: readonly PasswordRule[]): {
    rules: {
        id: string;
        label: string;
        satisfied: boolean;
    }[];
    satisfied: number;
    total: number;
};
export type PriceOption = TaskChoice & Readonly<{
    amountMinor: number;
    currency: string;
    interval: "month" | "year";
    intervalCount: number;
    benefits: readonly string[];
}>;
export declare function resolvePriceOption(options: readonly PriceOption[], selectedId: string): PriceOption;
//# sourceMappingURL=task-controls.d.ts.map