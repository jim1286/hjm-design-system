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
export declare function resolveVoiceNote(input: VoiceNoteDescriptor): {
    position: number;
    canPlay: boolean;
    canSeek: boolean;
    title: string;
    state: VoiceNoteState;
    duration: number | null;
    disabled?: boolean;
};
//# sourceMappingURL=voice-note.d.ts.map