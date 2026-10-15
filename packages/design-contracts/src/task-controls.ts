import { assertDistinctIds } from "./collection-editing.js";
export type TaskChoice = Readonly<{ id: string; label: string; description?: string; disabled?: boolean }>;
export function resolveTaskChoice<T extends TaskChoice>(choices: readonly T[], selectedId: string): T {
  assertDistinctIds(choices);
  const selected = choices.find(choice => choice.id === selectedId);
  if (!selected) throw new TypeError("The selected choice must exist");
  return selected;
}
export type PasswordRule = Readonly<{ id: string; label: string; test: (value: string) => boolean }>;
/** Counts supplied requirements only; entropy and password security are not inferred. */
export function resolvePasswordRules(value: string, rules: readonly PasswordRule[]) {
  assertDistinctIds(rules);
  if (!rules.length) throw new TypeError("Password rules must not be empty");
  const results = rules.map(rule => ({ id: rule.id, label: rule.label, satisfied: rule.test(value) }));
  return { rules: results, satisfied: results.filter(rule => rule.satisfied).length, total: results.length };
}
export type PriceOption = TaskChoice & Readonly<{ amountMinor: number; currency: string; interval: "month" | "year"; intervalCount: number; benefits: readonly string[] }>;
export function resolvePriceOption(options: readonly PriceOption[], selectedId: string) {
  const selected = resolveTaskChoice(options, selectedId);
  for (const option of options) {
    if (!Number.isSafeInteger(option.amountMinor) || option.amountMinor < 0 || !/^[A-Z]{3}$/.test(option.currency) || !Number.isSafeInteger(option.intervalCount) || option.intervalCount < 1 || !["month", "year"].includes(option.interval)) throw new RangeError("Price options require actual minor-unit amounts, currency and billing periods");
  }
  return selected;
}
