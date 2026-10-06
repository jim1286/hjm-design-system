/** Experimental direct date entry contract; date calculation remains product-owned. */
export type DateEntryPart = "year" | "month" | "day";
export type DateEntryDraft = Readonly<Record<DateEntryPart, string>>;
export type DateEntryOrder = readonly [DateEntryPart, DateEntryPart, DateEntryPart];
export type DateEntryParseResult =
  | Readonly<{ status: "valid"; value: string }>
  | Readonly<{ status: "incomplete" | "invalid"; code: string; fields: readonly DateEntryPart[] }>;
export type DateEntryIssue =
  | Readonly<{ kind: "missing"; fields: readonly DateEntryPart[] }>
  | Readonly<{ kind: "parse"; code: string; fields: readonly DateEntryPart[] }>;
export type ResolvedDateEntry = Readonly<{
  draft: DateEntryDraft;
  status: "empty" | "incomplete" | "invalid" | "valid";
  /** An optional empty date and any uncommitted draft have no committed value. */
  value: string | null;
  issue: DateEntryIssue | null;
  fields: readonly Readonly<{ part: DateEntryPart; value: string; invalid: boolean }>[];
}>;
const parts: readonly DateEntryPart[] = ["year", "month", "day"];
function assertDraft(draft: DateEntryDraft): void {
  if (!draft || parts.some(part => typeof draft[part] !== "string")) {
    throw new TypeError("Date entry requires string drafts for year, month and day");
  }
}
function assertParts(values: readonly DateEntryPart[], complete = false): void {
  if (!Array.isArray(values) || !values.length || new Set(values).size !== values.length ||
    values.some(part => !parts.includes(part)) || (complete && values.length !== 3)) {
    throw new TypeError("Date entry requires distinct date parts and a complete display order");
  }
}

/** Preserve exact input, including partial years, names, whitespace and composition text. */
export function updateDateEntryDraft(draft: DateEntryDraft, part: DateEntryPart, value: string): DateEntryDraft {
  assertDraft(draft);
  if (!parts.includes(part) || typeof value !== "string") throw new TypeError("Invalid date entry edit");
  return { ...draft, [part]: value };
}

export function resolveDateEntryDraft({ draft, order, required, parse }: {
  draft: DateEntryDraft;
  order: DateEntryOrder;
  required: boolean;
  parse: (draft: DateEntryDraft) => DateEntryParseResult;
}): ResolvedDateEntry {
  assertDraft(draft);
  assertParts(order, true);
  if (typeof required !== "boolean" || typeof parse !== "function") throw new TypeError("Date entry requires required and parse policies");
  // Calendar already leaves locale/calendar/clock policy to products. A second
  // Date-based parser would normalize impossible dates and disagree with it.
  // Freeze a snapshot so an adapter cannot rewrite the user's editing draft.
  const snapshot = Object.freeze({ year: draft.year, month: draft.month, day: draft.day });
  const missing = order.filter(part => !snapshot[part].trim());
  let status: ResolvedDateEntry["status"];
  let value: string | null = null;
  let issue: DateEntryIssue | null = null;
  if (missing.length === 3) {
    status = "empty";
    if (required) issue = { kind: "missing", fields: missing };
  } else if (missing.length) {
    // Missing data takes priority over format/range errors, so filling one part
    // cannot hide which other parts are still needed (GOV.UK date-input guidance).
    status = "incomplete";
    issue = { kind: "missing", fields: missing };
  } else {
    const result = parse(snapshot);
    if (result?.status === "valid") {
      if (typeof result.value !== "string" || !result.value.trim()) throw new TypeError("A valid date entry needs a nonempty value");
      status = "valid";
      value = result.value;
    } else if (result?.status === "incomplete" || result?.status === "invalid") {
      if (typeof result.code !== "string" || !result.code.trim()) throw new TypeError("Date entry issue needs a localization code");
      assertParts(result.fields);
      status = result.status;
      issue = { kind: "parse", code: result.code, fields: order.filter(part => result.fields.includes(part)) };
    } else throw new TypeError("Invalid date entry parse result");
  }
  return { draft: snapshot, status, value, issue,
    fields: order.map(part => ({ part, value: snapshot[part], invalid: issue?.fields.includes(part) ?? false })) };
}

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

export function resolveDateEntryControl(props: DateEntryControlProps) {
  if (["label", ...parts].some(key => !props.labels?.[key as keyof typeof props.labels]?.trim()) ||
    typeof props.onValueChange !== "function" || typeof props.formatIssue !== "function" ||
    (props.purpose !== undefined && !["date", "birthdate"].includes(props.purpose)) ||
    (props.monthInput !== undefined && !["text", "numeric"].includes(props.monthInput))) {
    throw new TypeError("Date entry needs labels, callbacks and valid input policies");
  }
  const resolved = resolveDateEntryDraft({ draft: props.value, order: props.order, required: props.required ?? false, parse: props.parse });
  const error = props.showErrors && resolved.issue ? props.formatIssue(resolved.issue) : undefined;
  if (error !== undefined && (typeof error !== "string" || !error.trim())) throw new TypeError("Date entry issue text must not be empty");
  return { ...resolved, error };
}
