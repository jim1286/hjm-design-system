import type { TextFormatKind } from "@hjmds/design-contracts/components/text-formats";
import { type HTMLAttributes, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type TextFormatProps = HTMLAttributes<HTMLElement> & Readonly<{
    kind: TextFormatKind;
    children: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Each kind emits its own element, which is the entire point: `<kbd>`, `<code>`
 * and `<blockquote>` mean different things to assistive technology, and a
 * styled `<span>` means none of them.
 */
export declare const TextFormat: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLElement> & Readonly<{
    kind: TextFormatKind;
    children: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=text-formats.d.ts.map