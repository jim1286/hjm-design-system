import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type AffixProps = Readonly<{
    children: ReactNode;
    offset?: number;
    disabled?: boolean;
    onChange?: (affixed: boolean) => void;
    /** Canonical layout-only placement on the sticky box. `position`/`top` stay Affix-owned. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** CSS keeps natural flow, parent boundaries and focus intact; JS only observes state and oversize content. */
export declare function Affix({ children, offset, disabled, onChange, layoutStyle }: AffixProps): import("react").JSX.Element;
//# sourceMappingURL=affix.d.ts.map