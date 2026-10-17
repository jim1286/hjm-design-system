export type FieldGroupLayout = "stack" | "inline";
/** Date and duration parts share grouping, spacing and wrapping rather than rebuilding a fieldset. */
export declare const fieldGroupRecipe: {
    readonly defaults: {
        readonly layout: "stack";
    };
    readonly gap: "md";
    readonly headingGap: "sm";
    readonly supportGap: "xs";
    readonly inline: {
        /** @deprecated Renderers read `minWidth` (scaled by text size) so Web and Native wrap at the same width. */
        readonly minCharacters: 10;
        readonly minWidth: number;
    };
};
/** Related-input grouping contract. Values and submit/validation timing remain product-owned. */
export type FieldGroupMember = Readonly<{
    id: string;
    label: string;
    description?: string;
    error?: string;
    disabled?: boolean;
}>;
export type FieldGroupDescriptor = Readonly<{
    label: string;
    description?: string;
    disabled?: boolean;
    /** An empty fieldIds list is a group-only error, not a reason to mark every field invalid. */
    error?: Readonly<{
        message: string;
        fieldIds: readonly string[];
    }>;
    fields: readonly FieldGroupMember[];
}>;
export type ResolvedFieldGroupMember = Readonly<{
    id: string;
    label: string;
    groupLabel: string;
    disabled: boolean;
    invalid: boolean;
    /** Renderers associate these messages without replacing a field's own help or error. */
    support: readonly Readonly<{
        scope: "group" | "field";
        kind: "description" | "error";
        text: string;
    }>[];
}>;
/** Late native events and retained callbacks must use the current committed group policy. */
export declare function createFieldGroupEditSession(fields: readonly ResolvedFieldGroupMember[]): {
    update(next: readonly ResolvedFieldGroupMember[]): void;
    /** Effect cleanup blocks events without treating Strict Mode replay as field removal. */
    suspend(): void;
    guard<Args extends unknown[]>(id: string, callback: (...args: Args) => void): (...args: Args) => void;
};
export declare function resolveFieldGroup(descriptor: FieldGroupDescriptor): Readonly<{
    label: string;
    description: string | undefined;
    error: string | undefined;
    disabled: boolean;
    fields: readonly ResolvedFieldGroupMember[];
}>;
//# sourceMappingURL=field-group.d.ts.map