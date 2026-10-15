function count(value) {
    if (!Number.isSafeInteger(value) || value < 0)
        throw new RangeError("Social counts must be nonnegative safe integers");
    return value;
}
export function resolveFollowProposal(state, following) {
    count(state.count);
    if (state.following && state.count === 0)
        throw new RangeError("A followed profile must include this follower in its count");
    return Object.freeze({ following, count: count(state.count + Number(following) - Number(state.following)) });
}
export function resolveAttendanceChoice(choices, id) {
    const ids = new Set();
    for (const choice of choices) {
        if (!choice.id.trim() || ids.has(choice.id))
            throw new TypeError("Attendance choices need distinct nonempty ids");
        ids.add(choice.id);
    }
    if (choices.length === 0)
        throw new TypeError("Attendance choices must not be empty");
    const choice = choices.find(choice => choice.id === id);
    if (id !== null && !choice)
        throw new TypeError("Unknown attendance response");
    return choice;
}
export function resolveAttendanceProposal(state, choices, responseId) {
    count(state.count);
    const previous = resolveAttendanceChoice(choices, state.responseId), next = resolveAttendanceChoice(choices, responseId);
    if (previous?.attending && state.count === 0)
        throw new RangeError("An attending response must include this attendee in its count");
    return Object.freeze({ responseId, count: count(state.count + Number(next?.attending === true) - Number(previous?.attending === true)) });
}
//# sourceMappingURL=social-compositions.js.map