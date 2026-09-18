import { type ReactElement, type ReactNode } from "react";
import { type DialogProps } from "./overlays.js";
import { type SheetProps } from "./overlays.js";
type DialogRequest = Omit<DialogProps, "open" | "defaultOpen" | "onOpenChange" | "trigger"> & Readonly<{
    children?: ReactNode;
}>;
type SheetRequest = Omit<SheetProps, "open" | "defaultOpen" | "onOpenChange" | "trigger"> & Readonly<{
    children?: ReactNode;
}>;
export type OverlayHandle = Readonly<{
    /** Resolves once the overlay is gone and focus has been restored. */
    closed: Promise<void>;
    close(): void;
}>;
export type OverlayStackApi = Readonly<{
    openDialog(request: DialogRequest): OverlayHandle;
    openSheet(request: SheetRequest): OverlayHandle;
}>;
export declare function useOverlayStack(): OverlayStackApi;
/** Convenience wrappers so a call site reads as the thing it opens. */
export declare function useDialog(): OverlayStackApi["openDialog"];
export declare function useSheet(): OverlayStackApi["openSheet"];
export type OverlayStackProviderProps = Readonly<{
    children: ReactNode;
}>;
export declare function OverlayStackProvider({ children }: OverlayStackProviderProps): ReactElement;
export {};
//# sourceMappingURL=overlay-stack.d.ts.map