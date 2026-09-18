import { type HTMLAttributes, type MouseEvent } from "react";
import { type AnchorItem } from "@hjmds/design-contracts/components/anchor";
export type AnchorProps = Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    label: string;
    items: readonly AnchorItem[];
    /** undefined observes the document; null waits for a custom scroll ref. */
    container?: HTMLElement | null;
    offset?: number;
    orientation?: "vertical" | "horizontal";
    historyMode?: "push" | "replace" | "none";
    onNavigate?: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
}>;
/** Same-document table of contents; sticky positioning belongs to its host layout. */
export declare const Anchor: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
    label: string;
    items: readonly AnchorItem[];
    /** undefined observes the document; null waits for a custom scroll ref. */
    container?: HTMLElement | null;
    offset?: number;
    orientation?: "vertical" | "horizontal";
    historyMode?: "push" | "replace" | "none";
    onNavigate?: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
}> & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=anchor.d.ts.map