import type { ReactNode } from "react";
export type NavigationBarProps = Readonly<{
    label: string;
    brand: ReactNode;
    children: ReactNode;
    actions?: ReactNode;
}>;
/** Adaptive site header; destination and action children keep their own semantics. */
export declare function NavigationBar({ label, brand, children, actions }: NavigationBarProps): import("react").JSX.Element;
//# sourceMappingURL=navigation-bar.d.ts.map