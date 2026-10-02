import type { ReactNode } from "react";
export type NavigationBarProps = Readonly<{
    label: string;
    brand: ReactNode;
    children: ReactNode;
    actions?: ReactNode;
}>;
/** Site navigation composition; Menu/SearchField continue to own their behavior. */
export declare function NavigationBar({ label, brand, children, actions }: NavigationBarProps): import("react").JSX.Element;
//# sourceMappingURL=navigation-bar.d.ts.map