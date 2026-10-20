import { type HTMLAttributes, type ReactNode, type Ref } from "react";
import type { HjmCompositionStyleProp } from "../composition-style.js";
export type PendingContentProps = Readonly<{
    pending: boolean;
    label: string;
    children: ReactNode;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Shared host for the public region and AuthScreen's focus-managed action block. */
export declare function PendingContentHost({ pending, label, children, layoutStyle, className, contentProps, indicatorClassName }: PendingContentProps & {
    className?: string;
    contentProps?: HTMLAttributes<HTMLDivElement> & {
        ref?: Ref<HTMLDivElement>;
    };
    indicatorClassName?: string;
}): import("react").JSX.Element;
/** Keep controls mounted and preserve their last ready height while a single centered spinner replaces them. */
export declare function PendingContent(props: PendingContentProps): import("react").JSX.Element;
//# sourceMappingURL=pending-content.d.ts.map