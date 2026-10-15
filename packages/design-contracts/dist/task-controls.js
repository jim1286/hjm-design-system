import { assertDistinctIds } from "./collection-editing.js";
export function resolveTaskChoice(choices, selectedId) {
    assertDistinctIds(choices);
    const selected = choices.find(choice => choice.id === selectedId);
    if (!selected)
        throw new TypeError("The selected choice must exist");
    return selected;
}
/** Counts supplied requirements only; entropy and password security are not inferred. */
export function resolvePasswordRules(value, rules) {
    assertDistinctIds(rules);
    if (!rules.length)
        throw new TypeError("Password rules must not be empty");
    const results = rules.map(rule => ({ id: rule.id, label: rule.label, satisfied: rule.test(value) }));
    return { rules: results, satisfied: results.filter(rule => rule.satisfied).length, total: results.length };
}
export function resolvePriceOption(options, selectedId) {
    const selected = resolveTaskChoice(options, selectedId);
    for (const option of options) {
        if (!Number.isSafeInteger(option.amountMinor) || option.amountMinor < 0 || !/^[A-Z]{3}$/.test(option.currency) || !Number.isSafeInteger(option.intervalCount) || option.intervalCount < 1 || !["month", "year"].includes(option.interval))
            throw new RangeError("Price options require actual minor-unit amounts, currency and billing periods");
    }
    return selected;
}
//# sourceMappingURL=task-controls.js.map