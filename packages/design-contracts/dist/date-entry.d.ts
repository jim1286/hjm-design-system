/** Experimental direct date entry contract; date calculation remains product-owned. */
export type DateEntryPart = "year" | "month" | "day";
export type DateEntryDraft = Readonly<Record<DateEntryPart, string>>;
export type DateEntryOrder = readonly [DateEntryPart, DateEntryPart, DateEntryPart];
export type DateEntryParseResult = Readonly<{
    status: "valid";
    value: string;
}> | Readonly<{
    status: "incomplete" | "invalid";
    code: string;
    fields: readonly DateEntryPart[];
}>;
export type DateEntryIssue = Readonly<{
    kind: "missing";
    fields: readonly DateEntryPart[];
}> | Readonly<{
    kind: "parse";
    code: string;
    fields: readonly DateEntryPart[];
}>;
export type ResolvedDateEntry = Readonly<{
    draft: DateEntryDraft;
    status: "empty" | "incomplete" | "invalid" | "valid";
    /** An optional empty date and any uncommitted draft have no committed value. */
    value: string | null;
    issue: DateEntryIssue | null;
    fields: readonly Readonly<{
        part: DateEntryPart;
        value: string;
        invalid: boolean;
    }>[];
}>;
/** Preserve exact input, including partial years, names, whitespace and composition text. */
export declare function updateDateEntryDraft(draft: DateEntryDraft, part: DateEntryPart, value: string): DateEntryDraft;
export declare function resolveDateEntryDraft({ draft, order, required, parse }: {
    draft: DateEntryDraft;
    order: DateEntryOrder;
    required: boolean;
    parse: (draft: DateEntryDraft) => DateEntryParseResult;
}): ResolvedDateEntry;
export type DateEntryControlProps = Readonly<{
    value: DateEntryDraft;
    onValueChange: (draft: DateEntryDraft) => void;
    order: DateEntryOrder;
    parse: (draft: DateEntryDraft) => DateEntryParseResult;
    labels: Readonly<Record<DateEntryPart | "label", string>>;
    formatIssue: (issue: DateEntryIssue) => string;
    description?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    /** Products reveal validation on submit/blur; typing never forces errors visible. */
    showErrors?: boolean;
    purpose?: "date" | "birthdate";
    /** Text is the default so localized month names remain enterable. */
    monthInput?: "text" | "numeric";
    onBlur?: (part: DateEntryPart) => void;
}>;
export declare function resolveDateEntryControl(props: DateEntryControlProps): {
    error: string | undefined;
    draft: DateEntryDraft;
    status: "empty" | "incomplete" | "invalid" | "valid";
    value: string | null;
    issue: DateEntryIssue | null;
    fields: readonly Readonly<{
        part: DateEntryPart;
        value: string;
        invalid: boolean;
    }>[];
};
//# sourceMappingURL=date-entry.d.ts.map