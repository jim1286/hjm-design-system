import { type InitialFocusMode } from "@hjmds/design-contracts/screen-patterns";
import { type ReactNode, type RefObject } from "react";
import { type ActiveModal } from "../modal.js";
type Entry = {
    order: number;
    preference: boolean | undefined;
    element(): HTMLElement | null;
    focusable(): boolean;
};
type Registry = {
    nextOrder(): number;
    register(entry: Entry, mounted: boolean): () => void;
};
/** The overlay's own entry on the shared modal stack while it is active (set by `useModalFocus`). */
export type ModalLayerRef = {
    current: ActiveModal | null;
};
export type InitialFocusScopeHandle = Readonly<{
    registry: Registry;
    layer: ModalLayerRef | null;
    enabled: boolean;
    /**
     * Overlays only: runs entry when the modal activates and returns the field for `useModalFocus` to focus. `explicit`
     * means the overlay already has an `initialFocusRef`, so entry settles without choosing a field.
     */
    enter(explicit: boolean): HTMLElement | null;
}>;
/**
 * Screen scopes enter on mount (Web has no enter transition to wait for); overlays pass `layer` and enter through
 * `useModalFocus`. User pointer, key, wheel or touch input while no modal is above the scope ends the entry window.
 */
export declare function useInitialFocusScope({ mode, active, layer: ownLayer, enabled }: {
    mode: InitialFocusMode;
    active?: boolean;
    layer?: ModalLayerRef;
    enabled?: boolean;
}): InitialFocusScopeHandle;
export declare function InitialFocusProvider({ scope, children }: {
    scope: InitialFocusScopeHandle;
    children: ReactNode;
}): import("react").JSX.Element;
/** Screen scope: focuses the chosen field on mount, never over a field the user is in or under an open modal. */
export declare function InitialFocusScope({ mode, children }: {
    mode: InitialFocusMode;
    children: ReactNode;
}): import("react").JSX.Element;
/** Registers a text field with the nearest scope. `preference` is the field's public `initialFocusTarget`. */
export declare function useInitialFocusTarget(element: RefObject<HTMLElement | null>, preference: boolean | undefined): void;
export {};
//# sourceMappingURL=initial-focus.d.ts.map