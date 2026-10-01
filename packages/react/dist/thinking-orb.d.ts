import { type CSSProperties } from "react";
import { type ThinkingOrbOptions } from "@hjmds/design-contracts/components/thinking-orb";
export type ThinkingOrbProps = ThinkingOrbOptions & Readonly<{
    className?: string;
    style?: CSSProperties;
}>;
/** Optional AI status presentation; ordinary loading retains Spinner. */
export declare function ThinkingOrb({ state, appearance, size, label, speed, paused, active, className, style }: ThinkingOrbProps): import("react").JSX.Element;
//# sourceMappingURL=thinking-orb.d.ts.map