export type ChoiceRowItem<Value extends string = string> = Readonly<{
    value: Value;
    label: string;
    description?: string;
    disabled?: boolean;
}>;
export type ChoiceRowDescriptor<Value extends string = string> = Readonly<{
    title: string;
    items: readonly ChoiceRowItem<Value>[];
    /** The last value the product confirmed; null before the first load. */
    value: Value | null;
    placeholder?: string;
}>;
/** 2026-10-23: language and theme rows were rebuilt per product (spint Select, utilverse ListRow+Sheet,
 * BurnTok custom sheet). The row always shows the product-confirmed value, so a failed save cannot
 * leave a value on screen that the product never stored. */
export declare function resolveChoiceRow<Value extends string>({ title, items, value, placeholder }: ChoiceRowDescriptor<Value>): {
    selected: Readonly<{
        value: Value;
        label: string;
        description?: string;
        disabled?: boolean;
    }> | null;
    valueLabel: string;
};
//# sourceMappingURL=choice-row.d.ts.map