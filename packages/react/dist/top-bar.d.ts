import { type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type TopBarProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> & Readonly<{
    title?: string;
    /** Product control in the shared title slot; exclusive with text title affordances. */
    titleContent?: ReactNode;
    /** Secondary product context; the shared title slot owns its placement. */
    subtitle?: string;
    titleLeading?: ReactNode;
    onTitleClick?: MouseEventHandler<HTMLButtonElement>;
    titleAccessibilityLabel?: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    leading?: ReactNode;
    trailing?: ReactNode;
    actions?: ReactNode;
    centered?: boolean;
    safeAreaTop?: number;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Screen chrome stays composable inside pages and dialogs, without adding a second banner landmark. */
export declare const TopBar: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> & Readonly<{
    title?: string;
    /** Product control in the shared title slot; exclusive with text title affordances. */
    titleContent?: ReactNode;
    /** Secondary product context; the shared title slot owns its placement. */
    subtitle?: string;
    titleLeading?: ReactNode;
    onTitleClick?: MouseEventHandler<HTMLButtonElement>;
    titleAccessibilityLabel?: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    leading?: ReactNode;
    trailing?: ReactNode;
    actions?: ReactNode;
    centered?: boolean;
    safeAreaTop?: number;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=top-bar.d.ts.map