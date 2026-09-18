import { type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
export type TopBarProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> & Readonly<{
    title?: string;
    titleLeading?: ReactNode;
    onTitleClick?: MouseEventHandler<HTMLButtonElement>;
    titleAccessibilityLabel?: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    leading?: ReactNode;
    trailing?: ReactNode;
    actions?: ReactNode;
    centered?: boolean;
    safeAreaTop?: number;
}>;
/** Screen chrome stays composable inside pages and dialogs, without adding a second banner landmark. */
export declare const TopBar: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> & Readonly<{
    title?: string;
    titleLeading?: ReactNode;
    onTitleClick?: MouseEventHandler<HTMLButtonElement>;
    titleAccessibilityLabel?: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    leading?: ReactNode;
    trailing?: ReactNode;
    actions?: ReactNode;
    centered?: boolean;
    safeAreaTop?: number;
}> & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=top-bar.d.ts.map