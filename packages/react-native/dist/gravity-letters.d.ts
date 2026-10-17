import type { HeadingLevel } from "@hjmds/design-contracts/foundations";
export type GravityLettersProps = Readonly<{
    glyphs: readonly string[];
    active?: boolean;
    replayKey?: string | number;
    /**
     * Heading scale for the glyphs. Web glyphs inherit a surrounding Heading's typography, but RN Text styles do not
     * cross the Animated.View per glyph, so Native takes the level explicitly (2026-10-17 review F N12).
     */
    level?: HeadingLevel;
}>;
/** Decorative only; keep a readable, static heading outside this hidden view. */
export declare function GravityLetters({ glyphs, active, replayKey, level }: GravityLettersProps): import("react").JSX.Element;
//# sourceMappingURL=gravity-letters.d.ts.map