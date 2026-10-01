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
