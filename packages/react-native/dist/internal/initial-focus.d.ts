import { type InitialFocusMode } from "@hjmds/design-contracts/screen-patterns";
import { type ReactNode, type RefObject } from "react";
import { TextInput } from "react-native";
export declare function InitialFocusScope({ mode, active, children }: {
    mode: InitialFocusMode;
    active?: boolean;
    children: ReactNode;
}): import("react").JSX.Element;
/** Registers a text field with the nearest scope. `preference` is the field's public `initialFocusTarget`. */
export declare function useInitialFocusTarget(input: RefObject<TextInput | null>, preference: boolean | undefined, focusable: () => boolean): void;
//# sourceMappingURL=initial-focus.d.ts.map