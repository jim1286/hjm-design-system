import { type ReactNode } from "react";
import { type AffixFill, type AffixLayer } from "@hjmds/design-contracts/components/affix";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type AffixProps = Readonly<{
    children: ReactNode;
    offset?: number;
    disabled?: boolean;
    onChange?: (affixed: boolean) => void;
    /** Stacking step from the shared `layer` scale: `sticky` (default, 100) keeps the pinned box above scrolled content. */
    layer?: AffixLayer;
    /** `canvas` (default) paints the screen background behind the box; `none` leaves it to children with their own surface. */
    fill?: AffixFill;
    /** Canonical layout-only placement on the sticky box. `position`/`top` stay Affix-owned. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** CSS keeps natural flow, parent boundaries and focus intact; JS only observes state and oversize content. */
export declare function Affix({ children, offset, disabled, onChange, layer, fill, layoutStyle }: AffixProps): import("react").JSX.Element;
//# sourceMappingURL=affix.d.ts.map