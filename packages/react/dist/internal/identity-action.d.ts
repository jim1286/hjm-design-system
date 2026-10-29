import type { HjmCompositionStyleProp } from "../composition-style.js";
import type { ReactNode } from "react";
export declare function IdentityAction({ action, children, layoutStyle }: Readonly<{
    action: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    children: ReactNode;
    layoutStyle?: HjmCompositionStyleProp;
}>): import("react").JSX.Element;
/**
 * The member's name as the same profile action as their picture (2026-10-25 avatar rule extended to names on
 * 2026-10-29: Spint users tapped the nickname and nothing happened). The name keeps its text styling; the button
 * only carries the action and its focus ring.
 */
export declare function IdentityNameAction({ action, children }: Readonly<{
    action: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    children: ReactNode;
}>): import("react").JSX.Element;
//# sourceMappingURL=identity-action.d.ts.map