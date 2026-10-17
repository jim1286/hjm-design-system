import { type InitialFocusMode } from "@hjmds/design-contracts/screen-patterns";
import { type ReactNode, type RefObject } from "react";
type Entry = {
    order: number;
    preference: boolean | undefined;
    element(): HTMLElement | null;
    focusable(): boolean;
};
type Registry = {
    nextOrder(): number;
    register(entry: Entry): () => void;
    resolve(mode: InitialFocusMode): HTMLElement | null;
};
/**
 * Nearest screen/overlay scope that chooses the field focused on entry (rules: screen-patterns
 * `resolveInitialFocusTarget`, shared with Native). Fields register by context, the same model as Native, instead of
 * the scope querying the DOM; a scope with mode "none" still owns its fields so they never reach an outer scope.
 */
export declare const InitialFocusContext: import("react").Context<Registry | null>;
export declare function useInitialFocusRegistry(): Registry;
/**
 * Screen scope: focuses the chosen field once per mount, right after mount (Web has no enter transition to wait for).
 * It never takes focus from a field the user is already in, and never reaches under an open modal dialog.
 */
export declare function InitialFocusScope({ mode, children }: {
    mode: InitialFocusMode;
    children: ReactNode;
}): import("react").JSX.Element;
/** Registers a text field with the nearest scope. `preference` is the field's public `initialFocusTarget`. */
export declare function useInitialFocusTarget(element: RefObject<HTMLElement | null>, preference: boolean | undefined): void;
export {};
//# sourceMappingURL=initial-focus.d.ts.map