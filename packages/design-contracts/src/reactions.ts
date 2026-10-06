export type ReactionOption = Readonly<{ id: string; emoji: string; label: string; count?: number; disabled?: boolean }>;
export function validateReactions(options: readonly ReactionOption[], value: string | null): void {
  if (!options.length || new Set(options.map(option => option.id)).size !== options.length) throw new TypeError("Reactions require unique options");
  for (const option of options) {
    if (!option.id.trim() || !option.emoji.trim() || !option.label.trim()) throw new TypeError("Reactions require identifiers, artwork and localized names");
    if (option.count !== undefined && (!Number.isSafeInteger(option.count) || option.count < 0)) throw new RangeError("Reaction count must be a nonnegative integer");
  }
  if (value !== null && !options.some(option => option.id === value)) throw new TypeError("Selected reaction is missing");
}
export function nextReaction(options: readonly ReactionOption[], current: string | null, id: string): string | null {
  validateReactions(options, current);
  const option = options.find(item => item.id === id);
  if (!option) throw new TypeError("Unknown reaction");
  return option.disabled ? current : current === id ? null : id;
}

/**
 * The expanded catalog is product-localized; quick and additional IDs stay unique.
 * The + button needs a localized name and something to reveal; the message stays short
 * because this isolated entry has a byte cap (check-bundle-budget.mjs).
 */
export type ReactionMoreOptions = Readonly<{ label: string; options: readonly ReactionOption[] }>;
export function resolveReactionOptions(options: readonly ReactionOption[], more?: ReactionMoreOptions): readonly ReactionOption[] {
  const all = more ? [...options, ...more.options] : options;
  if (more && !(more.label.trim() && more.options.length)) throw new TypeError("More reactions need a label and options");
  validateReactions(all, null);
  return all;
}
