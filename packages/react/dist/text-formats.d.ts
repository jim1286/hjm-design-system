import type { TextFormatKind } from "@hjmds/design-contracts/components/text-formats";
import { type HTMLAttributes, type ReactNode } from "react";
export type TextFormatProps = HTMLAttributes<HTMLElement> & Readonly<{
    kind: TextFormatKind;
    children: ReactNode;
}>;
/**
 * Each kind emits its own element, which is the entire point: `<kbd>`, `<code>`
 * and `<blockquote>` mean different things to assistive technology, and a
 * styled `<span>` means none of them.
 */
export declare const TextFormat: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLElement> & Readonly<{
    kind: TextFormatKind;
    children: ReactNode;
}> & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=text-formats.d.ts.map