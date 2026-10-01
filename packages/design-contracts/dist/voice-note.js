/** Normalize host media metadata without inventing playback or loading progress. */
export function resolveVoiceNote(input) {
    if (!input.title.trim())
        throw new TypeError("VoiceNote requires a title");
    if (!["paused", "playing", "loading", "error"].includes(input.state))
        throw new TypeError("Unknown VoiceNote state");
    if (input.duration !== null && (!Number.isFinite(input.duration) || input.duration < 0))
        throw new RangeError("VoiceNote duration must be finite and nonnegative");
    if (!Number.isFinite(input.position) || input.position < 0)
        throw new RangeError("VoiceNote position must be finite and nonnegative");
    const hasDuration = input.duration !== null && input.duration > 0;
    return { ...input, position: hasDuration ? Math.min(input.position, input.duration) : 0,
        canPlay: !input.disabled && input.state !== "loading" && input.state !== "error" && hasDuration,
        canSeek: !input.disabled && input.state !== "loading" && input.state !== "error" && hasDuration };
}
//# sourceMappingURL=voice-note.js.map