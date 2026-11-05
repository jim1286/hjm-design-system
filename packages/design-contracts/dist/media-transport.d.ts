export type MediaPlaybackState = Readonly<{
    playing: boolean;
    position: number;
    duration: number | null;
    buffering?: boolean;
}>;
export declare function resolveMediaPlayback(state: MediaPlaybackState): {
    seekable: boolean;
    position: number;
    playing: boolean;
    duration: number | null;
    buffering?: boolean;
};
/**
 * Lucide icons (kebab-case) for the play/pause toggle. HJM no longer draws its own morphing play/pause paths: Lucide is
 * the only icon source (user instruction 2026-11-05), so renderers cross-fade these two icons over the same progress.
 */
export declare const mediaTransportLucideNames: {
    readonly play: "play";
    readonly pause: "pause";
};
/** Cross-fade weights for progress 0 (play) → 1 (pause); out-of-range progress clamps. */
export declare function mediaTransportGlyphOpacity(progress: number): Readonly<{
    play: number;
    pause: number;
}>;
//# sourceMappingURL=media-transport.d.ts.map