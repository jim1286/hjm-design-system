/** 2026-10-23: language and theme rows were rebuilt per product (spint Select, utilverse ListRow+Sheet,
 * BurnTok custom sheet). The row always shows the product-confirmed value, so a failed save cannot
 * leave a value on screen that the product never stored. */
export function resolveChoiceRow({ title, items, value, placeholder }) {
    if (!title.trim())
        throw new TypeError("ChoiceRow requires a title");
    if (items.length < 2)
        throw new RangeError("ChoiceRow requires at least two choices");
    const seen = new Set();
    for (const item of items) {
        if (!item.label.trim())
            throw new TypeError("ChoiceRow choices require a label");
        if (seen.has(item.value))
            throw new TypeError(`ChoiceRow choice values must be unique: ${item.value}`);
        seen.add(item.value);
    }
    const selected = value === null ? null : items.find((item) => item.value === value) ?? null;
    if (value !== null && selected === null)
        throw new RangeError(`ChoiceRow value is not one of its choices: ${value}`);
    if (selected === null && !placeholder?.trim())
        throw new TypeError("ChoiceRow without a value requires a placeholder");
    return { selected, valueLabel: selected?.label ?? placeholder };
}
//# sourceMappingURL=choice-row.js.map