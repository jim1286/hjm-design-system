const parts = ["year", "month", "day"];
function assertDraft(draft) {
    if (!draft || parts.some(part => typeof draft[part] !== "string")) {
        throw new TypeError("Date entry requires string drafts for year, month and day");
    }
}
function assertParts(values, complete = false) {
    if (!Array.isArray(values) || !values.length || new Set(values).size !== values.length ||
        values.some(part => !parts.includes(part)) || (complete && values.length !== 3)) {
        throw new TypeError("Date entry requires distinct date parts and a complete display order");
    }
}
/** Preserve exact input, including partial years, names, whitespace and composition text. */
export function updateDateEntryDraft(draft, part, value) {
    assertDraft(draft);
    if (!parts.includes(part) || typeof value !== "string")
        throw new TypeError("Invalid date entry edit");
    return { ...draft, [part]: value };
}
export function resolveDateEntryDraft({ draft, order, required, parse }) {
    assertDraft(draft);
    assertParts(order, true);
    if (typeof required !== "boolean" || typeof parse !== "function")
        throw new TypeError("Date entry requires required and parse policies");
    // Calendar already leaves locale/calendar/clock policy to products. A second
    // Date-based parser would normalize impossible dates and disagree with it.
    // Freeze a snapshot so an adapter cannot rewrite the user's editing draft.
    const snapshot = Object.freeze({ year: draft.year, month: draft.month, day: draft.day });
    const missing = order.filter(part => !snapshot[part].trim());
    let status;
    let value = null;
    let issue = null;
    if (missing.length === 3) {
        status = "empty";
        if (required)
            issue = { kind: "missing", fields: missing };
    }
    else if (missing.length) {
        // Missing data takes priority over format/range errors, so filling one part
        // cannot hide which other parts are still needed (GOV.UK date-input guidance).
        status = "incomplete";
        issue = { kind: "missing", fields: missing };
    }
    else {
        const result = parse(snapshot);
        if (result?.status === "valid") {
            if (typeof result.value !== "string" || !result.value.trim())
                throw new TypeError("A valid date entry needs a nonempty value");
            status = "valid";
            value = result.value;
        }
        else if (result?.status === "incomplete" || result?.status === "invalid") {
            if (typeof result.code !== "string" || !result.code.trim())
                throw new TypeError("Date entry issue needs a localization code");
            assertParts(result.fields);
            status = result.status;
            issue = { kind: "parse", code: result.code, fields: order.filter(part => result.fields.includes(part)) };
        }
        else
            throw new TypeError("Invalid date entry parse result");
    }
    return { draft: snapshot, status, value, issue,
        fields: order.map(part => ({ part, value: snapshot[part], invalid: issue?.fields.includes(part) ?? false })) };
}
//# sourceMappingURL=date-entry.js.map