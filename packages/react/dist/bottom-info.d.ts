import { type BottomInfoDescriptor } from "@hjmds/design-contracts/components/bottom-info";
import { type HTMLAttributes, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type BottomInfoProps = Omit<HTMLAttributes<HTMLElement>, "children"> & BottomInfoDescriptor & Readonly<{
    /** Replaces one line with rich copy (a link inside the sentence, for example). */
    renderItem?: (item: string, index: number) => ReactNode;
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const BottomInfo: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    items: readonly string[];
    tone?: import("@hjmds/design-contracts/components/bottom-info").BottomInfoTone;
}> & Readonly<{
    /** Replaces one line with rich copy (a link inside the sentence, for example). */
    renderItem?: (item: string, index: number) => ReactNode;
    className?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=bottom-info.d.ts.map