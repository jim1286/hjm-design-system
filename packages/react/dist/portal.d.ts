import { type CSSProperties, type ReactNode, type RefObject } from "react";
export type PortalProps = Readonly<{
    anchorRef: RefObject<HTMLElement | null>;
    children: ReactNode;
    container?: HTMLElement;
    /** Anchored non-modal popups may render inline until hydration moves them. */
    ssrFallback?: "none" | "inline";
}>;
/** Nearest interactive popover, including descendants rendered through another portal. */
export declare function getPopoverOwner(node: Node | null): HTMLElement | null;
export declare function AnchoredPortal({ anchorRef, children, container, ssrFallback, }: PortalProps): ReactNode;
export type AnchoredPopupAlign = "start" | "center" | "end";
export type AnchoredPopupPlacement = "bottom" | "top" | "start" | "end";
type AnchoredPopupPosition = Readonly<{
    align: AnchoredPopupAlign;
    placement: AnchoredPopupPlacement;
    style: CSSProperties;
}>;
type AnchoredPopupOptions = Readonly<{
    align?: AnchoredPopupAlign;
    gap?: number;
    matchAnchorWidth?: boolean;
    placement?: AnchoredPopupPlacement;
    viewportPadding?: number;
    zIndex?: number;
    /** Wide contextual content may switch to the block axis in a narrow viewport. */
    fallbackAxis?: boolean;
}>;
/**
 * Positions a fixed portal popup against its anchor using logical alignment.
 * The popup flips vertically and shifts horizontally to stay inside the visual
 * viewport, then follows every scroll/resize source that can move either node.
 */
export declare function useAnchoredPopup(anchorRef: RefObject<HTMLElement | null>, popup: HTMLElement | null, { align, fallbackAxis, gap, matchAnchorWidth, placement: preferredPlacement, viewportPadding, zIndex, }?: AnchoredPopupOptions): AnchoredPopupPosition;
export {};
//# sourceMappingURL=portal.d.ts.map