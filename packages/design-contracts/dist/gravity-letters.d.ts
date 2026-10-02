/** Host-provided graphemes avoid splitting emoji or complex scripts with UTF-16 indexing. */
export declare function resolveGravityLetters(glyphs: readonly string[]): {
    glyph: string;
    delay: number;
    rotation: number;
}[];
export declare const gravityLetterMotion: {
    readonly duration: 640;
    readonly input: readonly [0, 0.55, 0.75, 0.9, 1];
    readonly y: readonly [-36, 0, -10, 0, 0];
};
//# sourceMappingURL=gravity-letters.d.ts.map