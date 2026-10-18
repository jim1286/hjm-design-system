import { type InitialFocusMode } from "@hjmds/design-contracts/screen-patterns";
import { type ReactNode, type RefObject } from "react";
import { TextInput } from "react-native";
type Entry = {
    order: number;
    preference: boolean | undefined;
    focusable(): boolean;
    focus(): void;
};
type Registry = {
    nextOrder(): number;
    register(entry: Entry, mounted: boolean): () => void;
};
type LayerRef = {
    readonly current: number | null;
};
/**
 * Keeps an overlay on the open stack while `presented` (from opening until its exit and native dismissal finish, the
 * point where return focus also runs). Closing notifies the scopes below so a pending entry focus can run.
 */
export declare function useOverlayLayer(presented: boolean): LayerRef;
export type InitialFocusScopeHandle = Readonly<{
    registry: Registry;
    layer: LayerRef;
    active: boolean;
    onTouchStart(): void;
}>;
/**
 * Screen/overlay entry focus. The returned `onTouchStart` goes on the scope's root view: a touch there (bubbling from
 * any descendant, scrolls included) ends the entry window unless an overlay is above the scope.
 * `layer` is the overlay's own layer; screens inherit the enclosing one.
 */
export declare function useInitialFocusScope({ mode, active: ownActive, layer: ownLayer }: {
    mode: InitialFocusMode;
    active?: boolean;
    layer?: LayerRef;
}): InitialFocusScopeHandle;
export declare function InitialFocusProvider({ scope, children }: {
    scope: InitialFocusScopeHandle;
    children: ReactNode;
}): import("react").JSX.Element;
/** Registers a text field with the nearest scope. `preference` is the field's public `initialFocusTarget`. */
export declare function useInitialFocusTarget(input: RefObject<TextInput | null>, preference: boolean | undefined, focusable: () => boolean): void;
export {};
//# sourceMappingURL=initial-focus.d.ts.map