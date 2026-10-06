import type { ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type NavigationBarProps = Readonly<{
    label: string;
    brand: ReactNode;
    children: ReactNode;
    actions?: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Site navigation composition; Menu/SearchField continue to own their behavior. */
export declare function NavigationBar({ label, brand, children, actions, layoutStyle }: NavigationBarProps): import("react").JSX.Element;
//# sourceMappingURL=navigation-bar.d.ts.map