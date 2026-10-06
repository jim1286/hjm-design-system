export function validateReactions(options, value) {
    if (!options.length || new Set(options.map(option => option.id)).size !== options.length)
        throw new TypeError("Reactions require unique options");
    for (const option of options) {
        if (!option.id.trim() || !option.emoji.trim() || !option.label.trim())
            throw new TypeError("Reactions require identifiers, artwork and localized names");
        if (option.count !== undefined && (!Number.isSafeInteger(option.count) || option.count < 0))
            throw new RangeError("Reaction count must be a nonnegative integer");
    }
    if (value !== null && !options.some(option => option.id === value))
        throw new TypeError("Selected reaction is missing");
}
export function nextReaction(options, current, id) {
    validateReactions(options, current);
    const option = options.find(item => item.id === id);
    if (!option)
        throw new TypeError("Unknown reaction");
    return option.disabled ? current : current === id ? null : id;
}
export function resolveReactionOptions(options, more) {
    if (more && (!more.label.trim() || !more.options.length))
        throw new TypeError("More reactions require a localized label and options");
    const all = more ? [...options, ...more.options] : options;
    validateReactions(all, null);
    return all;
}
//# sourceMappingURL=reactions.js.map