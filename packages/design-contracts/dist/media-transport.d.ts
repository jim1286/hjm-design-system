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
/** Equal vertex counts allow play→pause interpolation without replacing a glyph or label. */
export declare function mediaTransportPaths(progress: number): readonly [string, string];
//# sourceMappingURL=media-transport.d.ts.map