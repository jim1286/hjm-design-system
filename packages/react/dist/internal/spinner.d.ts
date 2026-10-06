import { type HTMLAttributes } from "react";
import { type SpinnerSize, type SpinnerTone } from "@hjmds/design-contracts/recipes";
import type { HjmCompositionStyleProp } from "../composition-style.js";
export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & Readonly<{
    label: string;
    size?: SpinnerSize;
    tone?: SpinnerTone;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const Spinner: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLSpanElement> & Readonly<{
    label: string;
    size?: SpinnerSize;
    tone?: SpinnerTone;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLSpanElement>>;
//# sourceMappingURL=spinner.d.ts.map