import { type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
import { type ScreenExit } from "./internal/screen-exit.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type TopBarProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> & Readonly<{
    title?: string;
    /** Product control in the shared title slot; exclusive with text title affordances. */
    titleContent?: ReactNode;
    /** @deprecated Header supporting copy is no longer displayed; retained until the next major API cleanup. */
    subtitle?: string;
    titleLeading?: ReactNode;
    onTitleClick?: MouseEventHandler<HTMLButtonElement>;
    titleAccessibilityLabel?: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Leaving this screen: icon-only back/close fixed at the leading edge (2026-10-17). Exclusive with `leading`. */
    exit?: ScreenExit;
    leading?: ReactNode;
    trailing?: ReactNode;
    actions?: ReactNode;
    centered?: boolean;
    safeAreaTop?: number;
    /** Share a product scene behind the bar without replacing its layout or controls. */
    surface?: "default" | "transparent";
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Screen chrome stays composable inside pages and dialogs, without adding a second banner landmark. */
export declare const TopBar: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & Readonly<{
    title?: string;
    /** Product control in the shared title slot; exclusive with text title affordances. */
    titleContent?: ReactNode;
    /** @deprecated Header supporting copy is no longer displayed; retained until the next major API cleanup. */
    subtitle?: string;
    titleLeading?: ReactNode;
    onTitleClick?: MouseEventHandler<HTMLButtonElement>;
    titleAccessibilityLabel?: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Leaving this screen: icon-only back/close fixed at the leading edge (2026-10-17). Exclusive with `leading`. */
    exit?: ScreenExit;
    leading?: ReactNode;
    trailing?: ReactNode;
    actions?: ReactNode;
    centered?: boolean;
    safeAreaTop?: number;
    /** Share a product scene behind the bar without replacing its layout or controls. */
    surface?: "default" | "transparent";
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=top-bar.d.ts.map