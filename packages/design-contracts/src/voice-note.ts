export type VoiceNoteState = "paused" | "playing" | "loading" | "error";
export type VoiceNoteDescriptor = Readonly<{
  title: string;
  state: VoiceNoteState;
  /** null means metadata has not loaded. Zero is a known empty recording. */
  duration: number | null;
  position: number;
  disabled?: boolean;
}>;
/** Normalize host media metadata without inventing playback or loading progress. */
export function resolveVoiceNote(input: VoiceNoteDescriptor) {
  if (!input.title.trim()) throw new TypeError("VoiceNote requires a title");
  if (!["paused", "playing", "loading", "error"].includes(input.state)) throw new TypeError("Unknown VoiceNote state");
  if (input.duration !== null && (!Number.isFinite(input.duration) || input.duration < 0)) throw new RangeError("VoiceNote duration must be finite and nonnegative");
  if (!Number.isFinite(input.position) || input.position < 0) throw new RangeError("VoiceNote position must be finite and nonnegative");
  const hasDuration = input.duration !== null && input.duration > 0;
  return { ...input, position: hasDuration ? Math.min(input.position, input.duration!) : 0,
    canPlay: !input.disabled && input.state !== "loading" && input.state !== "error" && hasDuration,
    canSeek: !input.disabled && input.state !== "loading" && input.state !== "error" && hasDuration };
}
