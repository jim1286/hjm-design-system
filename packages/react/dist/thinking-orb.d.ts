import { type CSSProperties } from "react";
import { type ThinkingOrbOptions } from "@hjmds/design-contracts/components/thinking-orb";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ThinkingOrbProps = ThinkingOrbOptions & Readonly<{
    className?: string;
    style?: CSSProperties;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Optional AI status presentation; ordinary loading retains Spinner. */
export declare function ThinkingOrb({ state, appearance, size, label, speed, paused, active, className, style, layoutStyle }: ThinkingOrbProps): import("react").JSX.Element;
//# sourceMappingURL=thinking-orb.d.ts.map