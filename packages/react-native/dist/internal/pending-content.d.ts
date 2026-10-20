import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "../composition-style.js";
export type PendingContentProps = Readonly<{
    pending: boolean;
    label: string;
    children: ReactNode;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Keep form state mounted; a changing pending child must not collapse its enclosing card. */
export declare function PendingContent({ pending, label, children, layoutStyle }: PendingContentProps): import("react").JSX.Element;
//# sourceMappingURL=pending-content.d.ts.map