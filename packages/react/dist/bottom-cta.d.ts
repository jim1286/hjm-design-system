import { type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
import { type ButtonSize, type ButtonTone } from "./actions.js";
export type BottomCTAAction = Readonly<{
    label: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
    accessibilityLabel?: string;
    disabled?: boolean;
    loading?: boolean;
    loadingLabel?: string;
    size?: ButtonSize;
    tone?: ButtonTone;
}>;
export type BottomCTAProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    primaryAction: BottomCTAAction;
    secondaryAction?: BottomCTAAction | ReactNode;
    description?: string;
    accessibilityLabel?: string;
    safeAreaBottom?: number;
    /** Sticky remains in document flow; fixed overlays would need a measured content spacer. */
    position?: "flow" | "sticky";
}>;
/** One primary action with optional supporting copy and a secondary action, matching Native's slots. */
export declare const BottomCTA: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    primaryAction: BottomCTAAction;
    secondaryAction?: BottomCTAAction | ReactNode;
    description?: string;
    accessibilityLabel?: string;
    safeAreaBottom?: number;
    /** Sticky remains in document flow; fixed overlays would need a measured content spacer. */
    position?: "flow" | "sticky";
}> & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=bottom-cta.d.ts.map