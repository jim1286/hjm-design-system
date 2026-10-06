/** Internal candidate for direct date entry; not a public package entry yet. */
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
//# sourceMappingURL=date-entry.d.ts.map