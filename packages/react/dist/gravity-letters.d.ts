import type { HjmCompositionStyleProp } from "./composition-style.js";
export type GravityLettersProps = Readonly<{
    glyphs: readonly string[];
    active?: boolean;
    replayKey?: string | number; /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Decorative only: provide the meaningful heading outside this hidden presentation. */
export declare function GravityLetters({ glyphs, active, replayKey, layoutStyle }: GravityLettersProps): import("react").JSX.Element;
//# sourceMappingURL=gravity-letters.d.ts.map