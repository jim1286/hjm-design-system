/** Match the controlled text/maxLength UTF-16 unit; do not silently trim a user's draft. */
export function resolveComposerLimit(value, max, threshold = .8) {
    if (!Number.isSafeInteger(max) || max <= 0 || !Number.isFinite(threshold) || threshold < 0 || threshold > 1)
        throw new RangeError("Composer limit must be positive and threshold in [0,1]");
    return { used: value.length, max, near: value.length / max >= threshold, exceeded: value.length > max };
}
export function validateReplyTarget(target) {
    if (target !== null && !target.id.trim())
        throw new TypeError("Reply target requires the actual message ID");
}
export function filterChatRoomMembers(members, query) {
    const needle = query.trim().toLocaleLowerCase();
    return needle ? members.filter(member => member.name.toLocaleLowerCase().includes(needle)) : members;
}
export function selectedChatRoomMembers(members) {
    return members.filter(member => member.selected === true && member.disabled !== true);
}
export function canSubmitChatRoom(profile, memberIds) {
    return profile.name.trim().length > 0 && (memberIds === undefined || (memberIds.length > 0 && memberIds.every(id => id.trim().length > 0) && new Set(memberIds).size === memberIds.length));
}
//# sourceMappingURL=communication.js.map